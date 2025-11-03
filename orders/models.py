# backend/orders/models.py
from django.db import models

class Order(models.Model):
    # existing fields you already have — keep them as-is
    id = models.CharField(max_length=100, primary_key=True)  # example — agar aapka alag hai, keep that
    created_at = models.DateTimeField(auto_now_add=True)
    customer_name = models.CharField(max_length=255, blank=True, null=True)
    customer_email = models.EmailField(blank=True, null=True)
    shipping_address = models.TextField(blank=True, null=True)
    shipping_city = models.CharField(max_length=100, blank=True, null=True)
    shipping_province = models.CharField(max_length=50, blank=True, null=True)
    shipping_postal = models.CharField(max_length=50, blank=True, null=True)
    shipping_country = models.CharField(max_length=100, blank=True, null=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_summary = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)

    # <- Replace or add this line for items: give a default so DB migration works
    items = models.JSONField(default=list, blank=True, null=True)

    def __str__(self):
        return f"Order {self.id}"