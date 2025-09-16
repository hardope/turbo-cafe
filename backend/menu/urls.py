# menu/urls.py
from django.urls import path
from . import views

app_name = 'menu'

urlpatterns = [
    # Public menu endpoints (all authenticated users)
    path('', views.MenuListView.as_view(), name='menu-list'),
    path('<int:pk>/', views.MenuDetailView.as_view(), name='menu-detail'),
    path('search/', views.SearchMenuView.as_view(), name='menu-search'),
    path('stats/', views.MenuStatsView.as_view(), name='menu-stats'),

    # Menu management endpoints (vendors only)
    path('create/', views.MenuCreateView.as_view(), name='menu-create'),
    path('<int:pk>/update', views.MenuUpdateView.as_view(), name='menu-update'),
    path('<int:pk>/delete', views.MenuDeleteView.as_view(), name='menu-delete'),
    path('<int:pk>/toggle-availability', views.ToggleMenuAvailabilityView.as_view(), name='menu-toggle-availability'),
    
    # Vendor-specific endpoints
    path('vendor/my-menus/', views.VendorMenuListView.as_view(), name='vendor-menu-list'),
    path('vendor/create', views.VendorMenuCreateView.as_view(), name='vendor-menu-create'),
]