from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from auth.models import UserProfile


class AuthAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # Existing user for login/profile
        self.student = UserProfile.objects.create_user(
            username="stud01",
            email="stud01@example.com",
            password="Str0ng!Passw0rd",
            role="student",
            first_name="Stu",
            last_name="Dent",
        )

    def test_register_success_and_uniqueness(self):
        url = reverse("register")
        payload = {
            "username": "vend01",
            "email": "vend01@example.com",
            "password": "Str0ng!Passw0rd",
            "first_name": "Ven",
            "last_name": "Dor",
            "role": "vendor",
            "vendor_name": "Vendor One",
        }
        response = self.client.post(url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("user", response.data)
        self.assertEqual(response.data["user"]["username"], "vend01")

        # Duplicate email rejected
        dup_payload = dict(payload)
        dup_payload["username"] = "vend02"
        response = self.client.post(url, dup_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_with_email_and_password(self):
        url = reverse("login")
        # Wrong password
        response = self.client.post(url, {"email": self.student.email, "password": "wrong"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Correct
        response = self.client.post(url, {"email": self.student.email, "password": "Str0ng!Passw0rd"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_profile_retrieve_update_and_logout(self):
        # Login to get tokens
        login_url = reverse("login")
        response = self.client.post(login_url, {"email": self.student.email, "password": "Str0ng!Passw0rd"}, format="json")
        access = response.data["access"]
        refresh = response.data["refresh"]

        # Retrieve profile
        profile_url = reverse("profile")
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.student.username)

        # Update profile
        response = self.client.patch(profile_url, {"phone_number": "12345"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["phone_number"], "12345")

        # Refresh token
        refresh_url = reverse("refresh-token")
        response = self.client.post(refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        # Use rotated refresh if provided
        rotated_refresh = response.data.get("refresh", refresh)

        # Logout (blacklist refresh)
        logout_url = reverse("logout")
        response = self.client.post(logout_url, {"refresh": rotated_refresh}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

