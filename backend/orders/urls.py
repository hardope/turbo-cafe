# order/urls.py
from django.urls import path
from . import views

app_name = 'order'

urlpatterns = [
    # General order endpoints
    path('', views.OrderListView.as_view(), name='order-list'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('create/', views.OrderCreateView.as_view(), name='order-create'),
    path('search/', views.OrderSearchView.as_view(), name='order-search'),
    path('stats/', views.OrderStatsView.as_view(), name='order-stats'),
    path('recent/', views.RecentOrdersView.as_view(), name='recent-orders'),
    
    # Order management endpoints
    path('<int:pk>/update-status/', views.OrderUpdateStatusView.as_view(), name='order-update-status'),
    path('<int:pk>/cancel/', views.OrderCancelView.as_view(), name='order-cancel'),
    
    # Student-specific endpoints
    path('student/my-orders/', views.StudentOrderListView.as_view(), name='student-order-list'),
    
    # Vendor-specific endpoints
    path('vendor/my-orders/', views.VendorOrderListView.as_view(), name='vendor-order-list'),
]