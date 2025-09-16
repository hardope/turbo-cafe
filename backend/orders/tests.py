from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from auth.models import UserProfile
from menu.models import Menu
from orders.models import Order


class OrderAPITests(APITestCase):
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

        # Menu item owned by vendor
        self.menu_item = Menu.objects.create(
            name="Burger",
            description="Tasty",
            price=10.50,
            available=True,
            wait_time_low=5,
            wait_time_high=10,
            vendor=self.vendor,
        )

        # Existing order (pending)
        self.order = Order.objects.create(
            user=self.student,
            menu_item=self.menu_item,
            vendor=self.vendor,
            quantity=2,
            total_price=self.menu_item.price * 2,
            status="pending",
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def test_student_can_create_order_for_available_menu(self):
        url = reverse("order:order-create")

        # vendor cannot create
        self.authenticate(self.vendor)
        response = self.client.post(url, {"menu_item": self.menu_item.id, "quantity": 1}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # student can create
        self.authenticate(self.student)
        response = self.client.post(url, {"menu_item": self.menu_item.id, "quantity": 3}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["quantity"], 3)
        self.assertEqual(str(response.data["total_price"]), "31.50")

    def test_list_orders_scope_by_role(self):
        url = reverse("order:order-list")

        # student sees only theirs
        self.authenticate(self.student)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [o["id"] for o in response.data["results"]]
        self.assertIn(self.order.id, ids)

        # vendor (not admin) sees only theirs when using vendor list endpoint
        vendor_list = reverse("order:vendor-order-list")
        self.authenticate(self.vendor)
        response = self.client.get(vendor_list)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [o["id"] for o in response.data["results"]]
        self.assertIn(self.order.id, ids)

        # admin can list all
        self.authenticate(self.admin)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [o["id"] for o in response.data["results"]]
        self.assertIn(self.order.id, ids)

    def test_retrieve_order_permissions(self):
        url = reverse("order:order-detail", args=[self.order.id])

        # random other student cannot access
        other_student = UserProfile.objects.create_user(
            username="student2", password="pass1234", role="student"
        )
        self.authenticate(other_student)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # owner can access
        self.authenticate(self.student)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # vendor of order can access
        self.authenticate(self.vendor)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_vendor_can_update_status_valid_transitions(self):
        url = reverse("order:order-update-status", args=[self.order.id])

        # student cannot update
        self.authenticate(self.student)
        response = self.client.patch(url, {"status": "preparing"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # vendor updates pending -> preparing -> ready -> completed
        self.authenticate(self.vendor)
        response = self.client.patch(url, {"status": "preparing"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "preparing")

        response = self.client.patch(url, {"status": "ready"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "ready")

        response = self.client.patch(url, {"status": "completed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "completed")

        # cannot transition from completed
        response = self.client.patch(url, {"status": "cancelled"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_recent_orders_and_search_endpoints(self):
        # recent for student
        self.authenticate(self.student)
        response = self.client.get(reverse("order:recent-orders"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

        # vendor search
        self.authenticate(self.vendor)
        response = self.client.get(reverse("order:order-search") + "?q=burg")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # paginated list payload
        self.assertIn("results", response.data)

