from os import read
from django.db import models

from auth.models import UserProfile
from menu.models import Menu

# Create your models here.
class Order(models.Model):
    """
    Represents an order in the food vendor application.
    """
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='orders')
    menu_item = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='orders')
    vendor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='vendor_orders')
    quantity = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

    class Meta:
        verbose_name_plural = "Orders"
        ordering = ['-created_at']