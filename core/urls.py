from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    
    # Custom Admin Interface
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/users/', views.admin_users, name='admin_users'),
    path('admin/settings/', views.admin_settings, name='admin_settings'),
    path('admin/activity/', views.admin_activity, name='admin_activity'),
]
