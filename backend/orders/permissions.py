# order/permissions.py
from rest_framework import permissions


class IsStudentOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow students to create orders.
    """
    
    def has_permission(self, request, view):
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only for students
        return request.user.is_authenticated and request.user.role == 'student'


class IsOrderOwnerOrVendor(permissions.BasePermission):
    """
    Custom permission to allow order owner (student) or vendor to access order.
    """
    
    def has_object_permission(self, request, view, obj):
        # Order owner can access their orders
        if obj.user.id == request.user.id:
            return True
        
        # Vendor can access orders for their menu items
        if obj.vendor.id == request.user.id:
            return True
        
        # Admins can access all orders
        if request.user.is_admin:
            return True
        
        return False


class IsOrderOwner(permissions.BasePermission):
    """
    Custom permission to only allow order owners to access their orders.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.user.id == request.user.id


class IsVendorOfOrder(permissions.BasePermission):
    """
    Custom permission to only allow vendors to access their orders.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.vendor.id == request.user.id


class CanCancelOrder(permissions.BasePermission):
    """
    Custom permission to check if order can be cancelled.
    """
    
    def has_object_permission(self, request, view, obj):
        # Only order owner can cancel
        if obj.user.id != request.user.id:
            return False
        
        # Cannot cancel completed or already cancelled orders
        if obj.status in ['completed', 'cancelled']:
            return False
        
        return True


class CanUpdateOrderStatus(permissions.BasePermission):
    """
    Custom permission for vendors to update order status.
    """
    
    def has_permission(self, request, view):
        print(f"Checking permission for user {request.user.is_authenticated} and role {request.user.role == 'vendor'}")
        return request.user.is_authenticated and request.user.role == 'vendor'
    
    def has_object_permission(self, request, view, obj):
        print(f"Checking object permission for order {obj.vendor.id == request.user.id}")
        # Only vendor of the order can update status
        return obj.vendor.id == request.user.id


class IsStudentOnly(permissions.BasePermission):
    """
    Permission that only allows students to access the view.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsVendorOnly(permissions.BasePermission):
    """
    Permission that only allows vendors to access the view.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'vendor'


class IsAdminOnly(permissions.BasePermission):
    """
    Permission that only allows admins to access the view.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin