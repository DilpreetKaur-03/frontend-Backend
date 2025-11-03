# backend/orders/urls.py
from rest_framework import routers
from .views import OrderViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r"orders", OrderViewSet, basename="order")

urlpatterns = [
    path("", include(router.urls)),
]