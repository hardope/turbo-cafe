import uuid
from django.db import models
from django.contrib.auth.models import User

class UserProfile(User):
    """
    Extends the User model to include additional fields for the food vendor application.
    """
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    matric_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    vendor_name = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=20, choices=[
            ('admin', 'Admin'),
            ('vendor', 'Vendor'),
            ('student', 'Student')
        ],
        default='student'
    )

    def __str__(self):
        return f"{self.username} - {self.role}"

    @property
    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    @property
    def is_vendor(self):
        return self.role == 'vendor'

    @property
    def is_student(self):
        return self.role == 'student'
