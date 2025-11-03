from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Product, Order, OrderItem, Review
from .serializers import ProductSerializer, OrderSerializer, ReviewSerializer

# ------------------ Products List ------------------
@api_view(["GET"])
def products_list(request):
    prods = Product.objects.all()
    serializer = ProductSerializer(prods, many=True)
    return Response(serializer.data)

# ------------------ Product Detail ------------------
@api_view(["GET"])
def product_detail(request, pk):
    try:
        p = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(ProductSerializer(p).data)

# ------------------ Create Order ------------------
@api_view(["POST"])
def create_order(request):
    data = request.data
    items = data.get("items", [])
    subtotal = 0

    for it in items:
        p = Product.objects.get(pk=it["product_id"])
        subtotal += float(p.price) * int(it.get("qty", 1))

    tax = round(subtotal * 0.13, 2)  # example 13%
    shipping_cost = float(data.get("shipping_cost", 0))
    total = subtotal + tax + shipping_cost

    order = Order.objects.create(
        full_name=data.get("full_name"),
        email=data.get("email"),
        shipping_address=data.get("shipping_address"),
        shipping_method=data.get("shipping_method", "Standard"),
        shipping_cost=shipping_cost,
        subtotal=subtotal,
        tax=tax,
        total=total,
    )

    for it in items:
        p = Product.objects.get(pk=it["product_id"])
        OrderItem.objects.create(order=order, product=p, qty=it.get("qty", 1), price=p.price)

    return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

# ------------------ Add Review ------------------
@api_view(["POST"])
def add_review(request, product_id):
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)