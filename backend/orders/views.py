# order/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.db.models import Q, Sum, Avg, Count
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
from django.utils import timezone
from datetime import timedelta
from drf_spectacular.utils import extend_schema, OpenApiResponse
from .models import Order
from .serializers import (
    OrderSerializer, OrderListSerializer, OrderCreateSerializer,
    OrderUpdateSerializer, OrderCancelSerializer, OrderStatsSerializer,
    VendorOrderSerializer, StudentOrderSerializer
)
from .permissions import (
    IsStudentOrReadOnly, IsOrderOwnerOrVendor, IsOrderOwner, IsVendorOfOrder,
    CanCancelOrder, CanUpdateOrderStatus, IsStudentOnly, IsVendorOnly, IsAdminOnly
)


@extend_schema(
    description="List all orders (admin only) or user's own orders. Supports filtering, searching, and ordering.",
    summary="List orders",
    responses={
        200: OpenApiResponse(response=OrderListSerializer, description="List of orders"),
        403: OpenApiResponse(description="Forbidden")
    }
)
class OrderListView(APIView):
    """
    List all orders (admin only) or user's own orders.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.is_admin:
            queryset = Order.objects.select_related('user', 'menu_item', 'vendor').all()
        else:
            # Regular users can only see their own orders
            queryset = Order.objects.select_related('user', 'menu_item', 'vendor').filter(user=request.user)
        
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
        
        serializer = OrderListSerializer(page_obj, many=True)
        
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
        # Filter by status
        status_filter = request.GET.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by vendor
        vendor_id = request.GET.get('vendor')
        if vendor_id:
            try:
                queryset = queryset.filter(vendor_id=int(vendor_id))
            except ValueError:
                pass
        
        # Filter by date range
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        
        if start_date:
            try:
                queryset = queryset.filter(created_at__date__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                queryset = queryset.filter(created_at__date__lte=end_date)
            except ValueError:
                pass
        
        return queryset
    
    def _apply_search(self, queryset, request):
        """Apply search based on query parameters."""
        search = request.GET.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(menu_item__name__icontains=search) |
                Q(vendor__vendor_name__icontains=search)
            )
        return queryset
    
    def _apply_ordering(self, queryset, request):
        """Apply ordering based on query parameters."""
        ordering = request.GET.get('ordering', '-created_at')
        valid_orderings = [
            'created_at', '-created_at', 'total_price', '-total_price',
            'status', '-status', 'quantity', '-quantity'
        ]
        
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        return queryset

@extend_schema(
    description="Retrieve a specific order. Users can only view their own orders or orders for their menu items.",
    summary="Retrieve order details",
    responses={
        200: OpenApiResponse(response=OrderSerializer, description="Order details"),
        403: OpenApiResponse(description="Forbidden"),
        404: OpenApiResponse(description="Order not found")
    }
)
class OrderDetailView(APIView):
    """
    Retrieve a specific order. Users can only view their own orders or orders for their menu items.
    """
    permission_classes = [IsOrderOwnerOrVendor]
    
    def get(self, request, pk):
        order = get_object_or_404(Order.objects.select_related('user', 'menu_item', 'vendor'), pk=pk)
        
        # Check permissions
        self.check_object_permissions(request, order)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)


@extend_schema(
    description="Create a new order. Only students can create orders.",
    summary="Create new order",
    request=OrderCreateSerializer,
    responses={
        201: OpenApiResponse(response=OrderSerializer, description="Order created successfully"),
        400: OpenApiResponse(description="Validation error")
    }
)
class OrderCreateView(APIView):
    """
    Create a new order. Only students can create orders.
    """
    permission_classes = [IsStudentOnly]
    
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save()
            response_serializer = OrderSerializer(order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    description="Update order status. Only vendors can update status of their orders.",
    summary="Update order status",
    request=OrderUpdateSerializer,
    responses={
        200: OpenApiResponse(response=OrderSerializer, description="Order status updated successfully"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Order not found or you do not have permission to modify it")
    }
)
class OrderUpdateStatusView(APIView):
    """
    Update order status. Only vendors can update status of their orders.
    """
    permission_classes = [CanUpdateOrderStatus]
    
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        # Check permissions
        self.check_object_permissions(request, order)
        
        serializer = OrderUpdateSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = OrderSerializer(order)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    description="Cancel an order. Only order owners can cancel their orders.",
    summary="Cancel order",
    request=OrderCancelSerializer,
    responses={
        200: OpenApiResponse(response=OrderSerializer, description="Order cancelled successfully"),
        400: OpenApiResponse(description="Validation error"),
        404: OpenApiResponse(description="Order not found or you do not have permission to modify it")
    }
)
class OrderCancelView(APIView):
    """
    Cancel an order. Only order owners can cancel their orders.
    """
    permission_classes = [CanCancelOrder]
    
    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        
        # Check permissions
        self.check_object_permissions(request, order)
        
        serializer = OrderCancelSerializer(order, data={'status': 'cancelled'}, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = OrderSerializer(order)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    description="List orders for the authenticated student. Supports filtering, searching, and ordering.",
    summary="List student orders",
    responses={
        200: OpenApiResponse(response=StudentOrderSerializer, description="List of student orders"),
        403: OpenApiResponse(description="Forbidden")
    }
)
class StudentOrderListView(APIView):
    """
    List orders for the authenticated student.
    """
    permission_classes = [IsStudentOnly]
    
    def get(self, request):
        queryset = Order.objects.select_related('menu_item', 'vendor').filter(user=request.user)
        
        # Apply filters
        status_filter = request.GET.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Apply search
        search = request.GET.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(menu_item__name__icontains=search) |
                Q(vendor__vendor_name__icontains=search)
            )
        
        # Apply ordering
        ordering = request.GET.get('ordering', '-created_at')
        valid_orderings = [
            'created_at', '-created_at', 'total_price', '-total_price',
            'status', '-status'
        ]
        
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        # Paginate results
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = StudentOrderSerializer(page_obj, many=True)
        
        return Response({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'results': serializer.data
        })

@extend_schema(
    description="List orders for the authenticated vendor. Supports filtering, searching, and ordering.",
    summary="List vendor orders",
    responses={
        200: OpenApiResponse(response=VendorOrderSerializer, description="List of vendor orders"),
        403: OpenApiResponse(description="Forbidden")
    }
)
class VendorOrderListView(APIView):
    """
    List orders for the authenticated vendor.
    """
    permission_classes = [IsVendorOnly]
    
    def get(self, request):
        queryset = Order.objects.select_related('user', 'menu_item').filter(vendor=request.user)
        
        # Apply filters
        status_filter = request.GET.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Apply search
        search = request.GET.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(user__username__icontains=search) |
                Q(menu_item__name__icontains=search) |
                Q(user__matric_number__icontains=search)
            )
        
        # Apply ordering
        ordering = request.GET.get('ordering', '-created_at')
        valid_orderings = [
            'created_at', '-created_at', 'total_price', '-total_price',
            'status', '-status', 'quantity', '-quantity'
        ]
        
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')
        
        # Paginate results
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = VendorOrderSerializer(page_obj, many=True)
        
        return Response({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'results': serializer.data
        })

@extend_schema(
    description="Get order statistics based on user role.",
    summary="Order statistics",
    responses={
        200: OpenApiResponse(response=OrderStatsSerializer, description="Order statistics"),
        403: OpenApiResponse(description="Forbidden")
    }
)
class OrderStatsView(APIView):
    """
    Get order statistics based on user role.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role == 'vendor':
            # Vendor-specific stats
            queryset = Order.objects.filter(vendor=request.user)
        elif request.user.role == 'student':
            # Student-specific stats
            queryset = Order.objects.filter(user=request.user)
        elif request.user.role == 'admin':
            # Admin can see all stats
            queryset = Order.objects.all()
        else:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Calculate stats
        total_orders = queryset.count()
        pending_orders = queryset.filter(status='pending').count()
        ready_orders = queryset.filter(status='ready').count()
        completed_orders = queryset.filter(status='completed').count()
        cancelled_orders = queryset.filter(status='cancelled').count()
        
        revenue_query = queryset.filter(status__in=['ready', 'completed'])
        total_revenue = revenue_query.aggregate(total=Sum('total_price'))['total'] or 0
        avg_order_value = revenue_query.aggregate(avg=Avg('total_price'))['avg'] or 0
        
        stats = {
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'ready_orders': ready_orders,
            'completed_orders': completed_orders,
            'cancelled_orders': cancelled_orders,
            'total_revenue': total_revenue,
            'avg_order_value': avg_order_value
        }
        
        serializer = OrderStatsSerializer(stats)
        return Response(serializer.data)

@extend_schema(
    description="Advanced search for orders.",
    summary="Search orders",
    responses={
        200: OpenApiResponse(response=OrderListSerializer, description="Search results"),
        403: OpenApiResponse(description="Forbidden")
    }
)
class OrderSearchView(APIView):
    """
    Advanced search for orders.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Base queryset based on user role
        if request.user.is_admin:
            queryset = Order.objects.select_related('user', 'menu_item', 'vendor').all()
        elif request.user.is_vendor:
            queryset = Order.objects.select_related('user', 'menu_item').filter(vendor=request.user)
        else:
            queryset = Order.objects.select_related('menu_item', 'vendor').filter(user=request.user)
        
        # Apply filters
        query = request.GET.get('q', '').strip()
        status_filter = request.GET.get('status')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        vendor_name = request.GET.get('vendor_name', '').strip()
        
        # Text search
        if query:
            queryset = queryset.filter(
                Q(user__username__icontains=query) |
                Q(menu_item__name__icontains=query) |
                Q(vendor__vendor_name__icontains=query) |
                Q(user__matric_number__icontains=query)
            )
        
        # Status filter
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Price range filter
        if min_price:
            try:
                queryset = queryset.filter(total_price__gte=float(min_price))
            except ValueError:
                pass
        
        if max_price:
            try:
                queryset = queryset.filter(total_price__lte=float(max_price))
            except ValueError:
                pass
        
        # Vendor filter
        if vendor_name:
            queryset = queryset.filter(vendor__vendor_name__icontains=vendor_name)
        
        # Order by relevance
        queryset = queryset.order_by('-created_at')
        
        # Paginate results
        page_size = int(request.GET.get('page_size', 20))
        page = int(request.GET.get('page', 1))
        
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        serializer = OrderListSerializer(page_obj, many=True)
        
        return Response({
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'current_page': page,
            'has_next': page_obj.has_next(),
            'has_previous': page_obj.has_previous(),
            'results': serializer.data
        })

@extend_schema(
    description="Get recent orders for the authenticated user.",
    summary="Recent orders",
    responses={
        200: OpenApiResponse(response=OrderListSerializer, description="Recent orders"),
        403: OpenApiResponse(description="Forbidden")
    }
)
class RecentOrdersView(APIView):
    """
    Get recent orders for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get orders from last 7 days
        last_week = timezone.now() - timedelta(days=7)
        
        if request.user.is_vendor:
            queryset = Order.objects.select_related('user', 'menu_item').filter(
                vendor=request.user,
                created_at__gte=last_week
            )
            serializer_class = VendorOrderSerializer
        elif request.user.is_student:
            queryset = Order.objects.select_related('menu_item', 'vendor').filter(
                user=request.user,
                created_at__gte=last_week
            )
            serializer_class = StudentOrderSerializer
        else:
            queryset = Order.objects.select_related('user', 'menu_item', 'vendor').filter(
                created_at__gte=last_week
            )
            serializer_class = OrderListSerializer
        
        # Limit to 10 most recent orders
        queryset = queryset.order_by('-created_at')[:10]
        
        serializer = serializer_class(queryset, many=True)
        return Response(serializer.data)