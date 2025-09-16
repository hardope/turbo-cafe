# menu/serializers.py
from rest_framework import serializers
from .models import Menu
from auth.models import UserProfile


class MenuSerializer(serializers.ModelSerializer):
    """
    Serializer for Menu model with vendor information.
    """
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_id = serializers.IntegerField(source='vendor.id', read_only=True)
    
    class Meta:
        model = Menu
        fields = [
            'id', 'name', 'description', 'price', 'image', 
            'available', 'created_at', 'wait_time_low', 'wait_time_high',
            'updated_at', 'vendor', 'vendor_name', 'vendor_id'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'vendor']
    
    def validate_price(self, value):
        """
        Validate that price is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value
    
    def validate_name(self, value):
        """
        Validate menu name uniqueness for the vendor.
        """
        # request = self.context.get('request')
        # if request and hasattr(request, 'user'):
        #     # For updates, exclude current instance
        #     userprofile = UserProfile.objects.get(id=request.user.id)
        #     queryset = Menu.objects.filter(
        #         name__iexact=value,
        #         vendor=userprofile
        #     )
        #     if self.instance:
        #         queryset = queryset.exclude(id=self.instance.id)
            
        #     if queryset.exists():
        #         raise serializers.ValidationError(
        #             "You already have a menu item with this name."
        #         )
        return value


class MenuListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for menu list views.
    """
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    
    class Meta:
        model = Menu
        fields = [
            'id', 'name', 'price', 'image', 'available',
            'vendor_name', 'wait_time_low', 'wait_time_high'
        ]


class MenuCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating menu items.
    """
    class Meta:
        model = Menu
        fields = [
            'name', 'description', 'price', 'image', 
            'available', 'wait_time_low', 'wait_time_high'
        ]
    
    def validate_price(self, value):
        """
        Validate that price is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value