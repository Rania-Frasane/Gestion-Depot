from django.urls import path
from . import views

app_name = 'ai_assistant'

urlpatterns = [
    # Module 1 – Chatbot
    path('', views.chatbot_page, name='chatbot'),
    path('session/new/', views.new_session, name='new_session'),
    path('session/<int:session_id>/', views.load_session, name='load_session'),
    path('session/<int:session_id>/delete/', views.delete_session, name='delete_session'),
    path('ask/', views.AskChatbotAPIView.as_view(), name='ask'),
    # Module 2 – Forecasting
    path('forecast/', views.forecast_dashboard, name='forecast'),
    path('forecast/<int:produit_id>/data/', views.forecast_detail, name='forecast_detail'),
    # Module 3 - Smart Reorders
    path('reorders/', views.smart_reorder_dashboard, name='smart_reorders'),
    path('reorders/create-draft/', views.create_draft_order, name='create_draft_order'),
    # Module 4 - Advanced Analytics
    path('analytics/', views.analytics_dashboard, name='analytics'),
    path('analytics/export/', views.export_analytics_csv, name='analytics_export'),
    # Module 6 - Smart Alerts Config
    path('alert-rules/', views.alert_rules_config, name='alert_rules'),
    path('api/alert-rules/', views.AlertRuleAPIView.as_view(), name='api_alert_rules'),
    path('api/analytics/', views.AnalyticsAPIView.as_view(), name='api_analytics'),
    path('api/reorders/', views.SmartReorderAPIView.as_view(), name='api_reorders'),
]
