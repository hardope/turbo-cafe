# order/serializers.py
from rest_framework import serializers
from .models import Order
from menu.models import Menu
from auth.models import UserProfile


class OrderSerializer(serializers.ModelSerializer):
    """
    Full serializer for Order model with all related information.
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_phone = serializers.CharField(source='user.phone_number', read_only=True)
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=10, decimal_places=2, read_only=True)
    menu_item_image = serializers.ImageField(source='menu_item.image', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_phone = serializers.CharField(source='vendor.phone_number', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'menu_item', 'vendor', 'quantity', 'total_price', 
            'status', 'created_at', 'updated_at', 'user_name', 'user_email', 
            'user_phone', 'menu_item_name', 'menu_item_price', 'menu_item_image',
            'vendor_name', 'vendor_phone'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'vendor', 'total_price']


class OrderListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for order list views.
    """
    user_name = serializers.CharField(source='user.username', read_only=True)
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'quantity', 'total_price', 'status', 'created_at',
            'user_name', 'menu_item_name', 'vendor_name'
        ]


class OrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new orders.
    """
    menu_item = serializers.PrimaryKeyRelatedField(queryset=Menu.objects.filter(available=True))
    
    class Meta:
        model = Order
        fields = ['menu_item', 'quantity']
    
    def validate_quantity(self, value):
        """
        Validate that quantity is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0.")
        if value > 50:  # Set maximum order quantity
            raise serializers.ValidationError("Maximum quantity per order is 50.")
        return value
    
    def validate_menu_item(self, value):
        """
        Validate that menu item is available.
        """
        if not value.available:
            raise serializers.ValidationError("This menu item is currently unavailable.")
        return value
    
    def create(self, validated_data):
        """
        Create order with calculated total price.
        """
        menu_item = validated_data['menu_item']
        quantity = validated_data['quantity']
        user = self.context['request'].user
        
        # Calculate total price
        total_price = menu_item.price * quantity
        
        # Create order
        user_profile = UserProfile.objects.get(id=user.id)
        vendor_profile = UserProfile.objects.get(id=menu_item.vendor.id)
        order = Order.objects.create(
            user=user_profile,
            menu_item=menu_item,
            vendor=vendor_profile,
            quantity=quantity,
            total_price=total_price
        )
        
        return order


class OrderUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating order status (vendors only).
    """
    class Meta:
        model = Order
        fields = ['status']
    
    def validate_status(self, value):
        """
        Validate status transitions.
        """
        if self.instance:
            current_status = self.instance.status
            
            # Define valid status transitions
            valid_transitions = {
                'pending': ['preparing', 'cancelled'],
                'preparing': ['ready', 'cancelled'],
                'ready': ['completed', 'cancelled'],
                'completed': [],  # No transitions from completed
                'cancelled': []   # No transitions from cancelled
            }
            
            if value not in valid_transitions.get(current_status, []):
                raise serializers.ValidationError(
                    f"Cannot change status from {current_status} to {value}."
                )
        
        return value


class OrderCancelSerializer(serializers.ModelSerializer):
    """
    Serializer for cancelling orders (students only).
    """
    class Meta:
        model = Order
        fields = ['status']
    
    def validate_status(self, value):
        """
        Validate that status is cancelled and order can be cancelled.
        """
        if value != 'cancelled':
            raise serializers.ValidationError("Only cancellation is allowed.")
        
        if self.instance:
            current_status = self.instance.status
            if current_status in ['completed', 'cancelled']:
                raise serializers.ValidationError(
                    f"Cannot cancel order with status: {current_status}."
                )
        
        return value


class OrderStatsSerializer(serializers.Serializer):
    """
    Serializer for order statistics.
    """
    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    ready_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=10, decimal_places=2)
    avg_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)


class VendorOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for vendor's order view with customer information.
    """
    customer_name = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    customer_phone = serializers.CharField(source='user.phone_number', read_only=True)
    customer_matric = serializers.CharField(source='user.matric_number', read_only=True)
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'quantity', 'total_price', 'status', 'created_at', 'updated_at',
            'customer_name', 'customer_email', 'customer_phone', 'customer_matric',
            'menu_item_name', 'menu_item_price'
        ]
        read_only_fields = ['id', 'quantity', 'total_price', 'created_at', 'updated_at']


class StudentOrderSerializer(serializers.ModelSerializer):
    """
    Serializer for student's order view with vendor information.
    """
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=10, decimal_places=2, read_only=True)
    menu_item_image = serializers.ImageField(source='menu_item.image', read_only=True)
    vendor_name = serializers.CharField(source='vendor.vendor_name', read_only=True)
    vendor_phone = serializers.CharField(source='vendor.phone_number', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'quantity', 'total_price', 'status', 'created_at', 'updated_at',
            'menu_item_name', 'menu_item_price', 'menu_item_image',
            'vendor_name', 'vendor_phone'
        ]
        read_only_fields = ['id', 'quantity', 'total_price', 'created_at', 'updated_at']