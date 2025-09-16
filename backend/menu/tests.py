from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from auth.models import UserProfile
from menu.models import Menu


class MenuAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.vendor = UserProfile.objects.create_user(
            username="vendor1", password="pass1234", role="vendor", vendor_name="Vendor One"
        )
        self.student = UserProfile.objects.create_user(
            username="student1", password="pass1234", role="student"
        )
        self.admin = UserProfile.objects.create_superuser(
            username="admin1", password="pass1234", email="admin@example.com"
        )

        # Seed menu items
        self.menu1 = Menu.objects.create(
            name="Burger",
            description="Tasty",
            price=10.50,
            available=True,
            wait_time_low=5,
            wait_time_high=10,
            vendor=self.vendor,
        )
        self.menu2 = Menu.objects.create(
            name="Fries",
            description="Crispy",
            price=4.00,
            available=False,
            wait_time_low=3,
            wait_time_high=6,
            vendor=self.vendor,
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_menu_list_requires_auth_and_filters_available_by_default(self):
        # unauthenticated
        url = reverse("menu:menu-list")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # student sees only available by default
        self.authenticate(self.student)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data["results"]]
        self.assertIn(self.menu1.name, names)
        self.assertNotIn(self.menu2.name, names)

        # can include unavailable with query
        response = self.client.get(url + "?show_unavailable=true")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        names = [item["name"] for item in response.data["results"]]
        self.assertIn(self.menu2.name, names)

    def test_menu_detail_requires_auth(self):
        url = reverse("menu:menu-detail", args=[self.menu1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.authenticate(self.student)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.menu1.id)

    def test_vendor_can_create_menu(self):
        url = reverse("menu:menu-create")

        # student forbidden
        self.authenticate(self.student)
        payload = {
            "name": "Pizza",
            "description": "Cheesy",
            "price": 12.0,
            "available": True,
            "wait_time_low": 8,
            "wait_time_high": 15,
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # vendor allowed
        self.authenticate(self.vendor)
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Pizza")

    def test_only_owner_can_update_menu(self):
        url = reverse("menu:menu-update", args=[self.menu1.id])

        # other vendor cannot update
        other_vendor = UserProfile.objects.create_user(
            username="vendor2", password="pass1234", role="vendor", vendor_name="Vendor Two"
        )
        self.authenticate(other_vendor)
        response = self.client.patch(url, {"price": 11.0}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # owner can update
        self.authenticate(self.vendor)
        response = self.client.patch(url, {"price": 11.0}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(str(response.data["price"]), "11.00")

    def test_toggle_availability_vendor_only(self):
        url = reverse("menu:menu-toggle-availability", args=[self.menu2.id])

        # student forbidden
        self.authenticate(self.student)
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # owner toggles
        self.authenticate(self.vendor)
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["available"])  # was False

    def test_menu_stats_role_awareness(self):
        url = reverse("menu:menu-stats")

        # student gets general stats
        self.authenticate(self.student)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_items", response.data)

        # vendor gets vendor-specific stats
        self.authenticate(self.vendor)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("total_items", response.data)


