from django.db import models

from auth.models import UserProfile

# Create your models here.
class Menu(models.Model):
    """
    Represents a menu item in the food vendor application.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField( blank=True, null=True)
    available = models.BooleanField(default=True)
    wait_time_low = models.PositiveIntegerField(default=0, help_text="Waiting time in minutes")
    wait_time_high = models.PositiveIntegerField(default=0, help_text="Maximum waiting time in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    vendor = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='menus')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Menus"
        ordering = ['name']