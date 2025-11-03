# backend/orders/serializers.py
from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    # accept nested dicts
    customer = serializers.DictField(required=False, write_only=True)
    shipping = serializers.DictField(required=False, write_only=True)
    payment = serializers.DictField(required=False, write_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        customer = validated_data.pop('customer', {}) or {}
        shipping = validated_data.pop('shipping', {}) or {}
        payment = validated_data.pop('payment', {}) or {}

        # customer mapping
        if customer:
            first = customer.get('firstName') or customer.get('first_name') or customer.get('name')
            last = customer.get('lastName') or customer.get('last_name') or ''
            validated_data['customer_name'] = (first + ' ' + last).strip()
            validated_data['customer_email'] = customer.get('email')

        # shipping mapping
        if shipping:
            validated_data['shipping_address'] = shipping.get('address')
            validated_data['shipping_city'] = shipping.get('city')
            validated_data['shipping_province'] = shipping.get('province')
            validated_data['shipping_postal'] = shipping.get('postal')
            validated_data['shipping_country'] = shipping.get('country')
            if 'price' in shipping:
                validated_data['shipping_cost'] = shipping.get('price', 0)

        # payment mapping
        if payment:
            validated_data['payment_method'] = payment.get('method')
            validated_data['payment_summary'] = payment.get('summary')

        return Order.objects.create(**validated_data)