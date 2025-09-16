# menu/views.py
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Q, Avg
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, OpenApiResponse
from auth.models import UserProfile
from .models import Menu
from .serializers import (
    MenuSerializer, 
    MenuListSerializer, 
    MenuCreateUpdateSerializer
)
from .permissions import IsVendorOrReadOnly, IsOwnerOrReadOnly, IsVendorOnly


@extend_schema(
    description="List all available menu items from all vendors",
    summary="List menu items",
    responses={
        200: OpenApiResponse(response=MenuListSerializer, description="List of menu items"),
        400: OpenApiResponse(description="Bad request")
    }
)
class MenuListView(APIView):
    """
    List all available menu items from all vendors.
    Supports filtering, searching, and ordering.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        queryset = Menu.objects.select_related('vendor').all()
        
        # Apply filters
        queryset = self._apply_filters(queryset, request)
        
        # Apply search
        queryset = self._apply_search(queryset, request)
        
        # Apply ordering
        queryset = self._apply_ordering(queryset, request)
        
        # Paginate results
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = MenuListSerializer(page_obj, many=True)
        
        return Response({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'results': serializer.data
        })
    
    def _apply_filters(self, queryset, request):
        """Apply filtering based on query parameters."""
        # Filter by availability
        available = request.GET.get('available')
        if available is not None:
            if available.lower() == 'true':
                queryset = queryset.filter(available=True)
            elif available.lower() == 'false':
                queryset = queryset.filter(available=False)
        else:
            # Default to available items only
            show_unavailable = request.GET.get('show_unavailable', 'false')
            if show_unavailable.lower() != 'true':
                queryset = queryset.filter(available=True)
        
        # Filter by vendor
        vendor_id = request.GET.get('vendor')
        if vendor_id:
            try:
                queryset = queryset.filter(vendor_id=int(vendor_id))
            except ValueError:
                pass
        
        # Filter by vendor role
        vendor_role = request.GET.get('vendor_role')
        if vendor_role == 'vendor':
            queryset = queryset.filter(vendor__role='vendor')
        
        # Filter by price range
        min_price = request.GET.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        
        max_price = request.GET.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        return queryset
    
    def _apply_search(self, queryset, request):
        """Apply search based on query parameters."""
        search = request.GET.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(vendor__vendor_name__icontains=search)
            )
        return queryset
    
    def _apply_ordering(self, queryset, request):
        """Apply ordering based on query parameters."""
        ordering = request.GET.get('ordering', 'name')
        valid_orderings = ['name', '-name', 'price', '-price', 'created_at', '-created_at']
        
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('name')
        
        return queryset


@extend_schema(
    description="Retrieve a specific menu item",
    summary="Get menu item details",
    responses={
        200: OpenApiResponse(response=MenuSerializer, description="Menu item details"),
        404: OpenApiResponse(description="Menu item not found")
    }
)
class MenuDetailView(APIView):
    """
    Retrieve a specific menu item.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        menu = get_object_or_404(Menu.objects.select_related('vendor'), pk=pk)
        serializer = MenuSerializer(menu)
        return Response(serializer.data)

@extend_schema(
    description="Create a new menu item. Only vendors can create menu items.",
    summary="Create menu item",
    request=MenuCreateUpdateSerializer,
    responses={
        201: OpenApiResponse(response=MenuSerializer, description="Menu item created successfully"),
        400: OpenApiResponse(description="Validation error")
    }
)
class MenuCreateView(APIView):
    """
    Create a new menu item. Only vendors can create menu items.
    """
    permission_classes = [IsVendorOnly]
    
    def post(self, request):
        serializer = MenuCreateUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            userprofile = UserProfile.objects.get(id=request.user.id)
            serializer.save(vendor=userprofile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    description="Update a menu item. Only the vendor who owns the menu item can update it.",
    summary="Update menu item",
    request=MenuCreateUpdateSerializer,
    responses={
        200: OpenApiResponse(response=MenuSerializer, description="Menu item updated successfully"),
        404: OpenApiResponse(description="Menu item not found or you do not have permission to modify it"),
        400: OpenApiResponse(description="Validation error")
    }
)
class MenuUpdateView(APIView):
    """
    Update a menu item. Only the vendor who owns the menu item can update it.
    """
    permission_classes = [IsOwnerOrReadOnly]
    
    def get_object(self, pk, user):
        try:
            menu = Menu.objects.get(pk=pk)
            print(menu)
            if menu.vendor.id != user.id:
                return None
            return menu
        except Menu.DoesNotExist:
            return None
    
    def put(self, request, pk):
        menu = self.get_object(pk, request.user)
        if not menu:
            return Response(
                {'error': 'Menu item not found or you do not have permission to modify it.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = MenuCreateUpdateSerializer(menu, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        menu = self.get_object(pk, request.user)
        if not menu:
            return Response(
                {'error': 'Menu item not found or you do not have permission to modify it.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = MenuCreateUpdateSerializer(menu, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    description="Delete a menu item. Only the vendor who owns the menu item can delete it.",
    summary="Delete menu item",
    responses={
        204: OpenApiResponse(description="Menu item deleted successfully"),
        404: OpenApiResponse(description="Menu item not found or you do not have permission to delete it")
    }
)
class MenuDeleteView(APIView):
    """
    Delete a menu item. Only the vendor who owns the menu item can delete it.
    """
    permission_classes = [IsOwnerOrReadOnly]
    
    def get_object(self, pk, user):
        try:
            menu = Menu.objects.get(pk=pk)
            if menu.vendor != user:
                return None
            return menu
        except Menu.DoesNotExist:
            return None
    
    def delete(self, request, pk):
        menu = self.get_object(pk, request.user)
        if not menu:
            return Response(
                {'error': 'Menu item not found or you do not have permission to delete it.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        menu.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@extend_schema(
    description="List all menu items for the authenticated vendor. Supports search and ordering.",
    summary="List vendor's menu items",
    responses={
        200: OpenApiResponse(response=MenuSerializer, description="List of vendor's menu items"),
        400: OpenApiResponse(description="Bad request")
    }
)
class VendorMenuListView(APIView):
    """
    List all menu items for the authenticated vendor.
    """
    permission_classes = [IsVendorOnly]
    
    def get(self, request):
        queryset = Menu.objects.filter(vendor=request.user)
        
        # Apply search
        search = request.GET.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        # Apply ordering
        ordering = request.GET.get('ordering', 'name')
        valid_orderings = ['name', '-name', 'price', '-price', 'created_at', '-created_at', 'available', '-available']
        
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('name')
        
        # Paginate results
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = MenuSerializer(page_obj, many=True)
        
        return Response({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'results': serializer.data
        })

@extend_schema(
    description="Create a new menu item for the authenticated vendor.",
    summary="Create vendor's menu item",
    request=MenuCreateUpdateSerializer,
    responses={
        201: OpenApiResponse(response=MenuSerializer, description="Menu item created successfully"),
        400: OpenApiResponse(description="Validation error")
    }
)
class VendorMenuCreateView(APIView):
    """
    Create a new menu item for the authenticated vendor.
    """
    permission_classes = [IsVendorOnly]
    
    def post(self, request):
        serializer = MenuCreateUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            userprofile = UserProfile.objects.get(id=request.user.id)
            serializer.save(vendor=userprofile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    description="Toggle the availability status of a menu item.",
    summary="Toggle menu item availability",
    responses={
        200: OpenApiResponse(response=MenuSerializer, description="Menu item availability toggled successfully"),
        404: OpenApiResponse(description="Menu item not found or you do not have permission to modify it")
    }
)
class ToggleMenuAvailabilityView(APIView):
    """
    Toggle the availability status of a menu item.
    """
    permission_classes = [IsVendorOnly]
    
    def patch(self, request, pk):
        try:
            menu_item = Menu.objects.get(pk=pk, vendor=request.user)
        except Menu.DoesNotExist:
            return Response(
                {'error': 'Menu item not found or you do not have permission to modify it.'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        menu_item.available = not menu_item.available
        menu_item.save()
        
        serializer = MenuSerializer(menu_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

@extend_schema(
    description="Advanced search for menu items with multiple filters.",
    summary="Search menu items",
    responses={
        200: OpenApiResponse(response=MenuListSerializer, description="Search results"),
        400: OpenApiResponse(description="Bad request")
    }
)
class SearchMenuView(APIView):
    """
    Advanced search for menu items with multiple filters.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        query = request.GET.get('q', '').strip()
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        vendor_name = request.GET.get('vendor_name', '').strip()
        available_only = request.GET.get('available_only', 'true')
        
        queryset = Menu.objects.select_related('vendor').all()
        
        # Text search
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | 
                Q(description__icontains=query) |
                Q(vendor__vendor_name__icontains=query)
            )
        
        # Price range filter
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
        
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        # Vendor filter
        if vendor_name:
            queryset = queryset.filter(vendor__vendor_name__icontains=vendor_name)
        
        # Availability filter
        if available_only.lower() == 'true':
            queryset = queryset.filter(available=True)
        
        # Order by relevance (name match first, then price)
        queryset = queryset.order_by('name', 'price')
        
        # Paginate results
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = MenuListSerializer(page_obj, many=True)
        
        return Response({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'results': serializer.data
        })

@extend_schema(
    description="Get menu statistics. Vendors see their own stats, others see general stats.",
    summary="Get menu statistics",
    responses={
        200: OpenApiResponse(description="Menu statistics"),
        403: OpenApiResponse(description="Forbidden")
    }
)
class MenuStatsView(APIView):
    """
    Get menu statistics. Vendors see their own stats, others see general stats.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.is_vendor:
            # Vendor-specific stats
            vendor_menus = Menu.objects.filter(vendor=request.user)
            stats = {
                'total_items': vendor_menus.count(),
                'available_items': vendor_menus.filter(available=True).count(),
                'unavailable_items': vendor_menus.filter(available=False).count(),
                'avg_price': vendor_menus.aggregate(
                    avg_price=Avg('price')
                )['avg_price'] or 0,
            }
        else:
            # General stats for students/admins
            all_menus = Menu.objects.all()
            stats = {
                'total_items': all_menus.count(),
                'available_items': all_menus.filter(available=True).count(),
                'total_vendors': all_menus.values('vendor').distinct().count(),
                'avg_price': all_menus.aggregate(
                    avg_price=Avg('price')
                )['avg_price'] or 0,
            }
        
        return Response(stats)