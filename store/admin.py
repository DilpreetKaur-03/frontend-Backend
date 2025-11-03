from django.contrib import admin
from .models import Product, Review

# Product admin
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "price", "in_stock")
    search_fields = ("name",)
    list_filter = ("in_stock",)

# Review admin
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "rating", "text", "created_at")
    list_filter = ("rating", "created_at")
    search_fields = ("text",)