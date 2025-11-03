from django.db import models


# -------------------- Product --------------------
class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)              # URL friendly name
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    image = models.CharField(max_length=512, blank=True, null=True)  # optional image path
    featured = models.BooleanField(default=False)
    in_stock = models.BooleanField(default=True)

    def __str__(self):
        return self.name


# -------------------- Order --------------------
class Order(models.Model):
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    shipping_address = models.CharField(max_length=100, default="Standard")
    shipping_method = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


# -------------------- Order Item --------------------
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name="items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    qty = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.qty} × {self.product.name}"


# -------------------- Review --------------------
class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(default=5)  # 1 to 5 stars
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # Agar user model ka link chahiye to uncomment:
    # user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Review {self.id} for {self.product.name} ({self.rating})"