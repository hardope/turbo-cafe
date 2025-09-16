# menu/permissions.py
from rest_framework import permissions


class IsVendorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow vendors to create/edit their own menu items.
    Students and admins can only read.
    """
    
    def has_permission(self, request, view):
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        
        # Write permissions only for vendors
        return request.user.is_authenticated and request.user.role == 'vendor'
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for vendor who owns the menu item
        return obj.vendor == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions only for the owner
        return obj.vendor == request.user


class IsVendorOnly(permissions.BasePermission):
    """
    Permission that only allows vendors to access the view.
    """
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'vendor'