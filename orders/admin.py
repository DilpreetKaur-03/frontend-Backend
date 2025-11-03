# backend/orders/admin.py
from django.contrib import admin
from .models import Order

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    # जो columns list view में दिखाने हैं
    list_display = ("id", "created_at", "status", "total")
    list_filter = ("status", "created_at")
    search_fields = ("id", "customer_name", "customer_email")

    # readonly_fields: सिर्फ वही नाम डालो जो model में सचमुच हैं
    readonly_fields = (
        "id",
        "created_at",
        "customer_name",
        "customer_email",
        "shipping_address",
        "shipping_city",
        "shipping_province",
        "shipping_postal",
        "shipping_country",
        "shipping_cost",
        "payment_method",
        "payment_summary",
        "subtotal",
        "tax",
        "total",
        "status",
        "items",
    )

    # fieldsets: हर field यहाँ सिर्फ एक बार होना चाहिए (duplicate ना करो)
    fieldsets = (
        ("Order info", {
            "fields": ("id", "created_at", "status", "total"),
        }),
        ("Customer", {
            "fields": ("customer_name", "customer_email"),
        }),
        ("Shipping", {
            "fields": (
                "shipping_address",
                "shipping_city",
                "shipping_province",
                "shipping_postal",
                "shipping_country",
                "shipping_cost",
            ),
        }),
        ("Payment", {
            "fields": ("payment_method", "payment_summary"),
        }),
        ("Amounts", {
            "fields": ("subtotal", "tax"),
        }),
        ("Items (JSON)", {
            "fields": ("items",),
        }),
    )

    # optional: pretty print JSON items (अगर चाहो)
    def pretty_items(self, obj):
        import json
        try:
            return "<pre style='white-space:pre-wrap'>{}</pre>".format(json.dumps(obj.items or [], indent=2))
        except Exception:
            return str(obj.items)
    pretty_items.allow_tags = True
    pretty_items.short_description = "Items (pretty)"

    # अगर आप pretty_items दिखाना चाहो तो:
    # readonly_fields = readonly_fields + ("pretty_items",)
    # और fieldsets में "items" की जगह "pretty_items" रख सकते हो