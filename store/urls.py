from django.urls import path
from . import views

urlpatterns = [
    # Products
    path("products/", views.products_list, name="products_list"),
    path("products/<int:pk>/", views.product_detail, name="product_detail"),

    # Orders
    path("checkout/", views.create_order, name="create_order"),

    # Reviews
    path("products/<int:product_id>/reviews/", views.add_review, name="add_review"),
]