# users/views.py
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .serializers import UserSerializer, RegisterSerializer


# ---------- Signup ----------
class RegisterView(generics.CreateAPIView):
    """
    POST /api/users/  -> create user (returns serialized user)
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


# ---------- Login (username OR email) ----------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer:
    - Allows login with username OR email (if 'username' contains '@', resolve by email)
    - Returns {refresh, access, user}
    NOTE: settings.SIMPLE_JWT['UPDATE_LAST_LOGIN'] = True  -> will update last_login automatically.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        return token

    def validate(self, attrs):
        # If email provided in 'username' field, map it to actual username
        username_val = attrs.get("username")
        if username_val and "@" in username_val:
            try:
                user_obj = User.objects.get(email__iexact=username_val)
                attrs["username"] = user_obj.username
            except User.DoesNotExist:
                # leave attrs as-is so parent will raise the proper auth error
                pass

        data = super().validate(attrs)
        data["user"] = UserSerializer(self.user).data
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = MyTokenObtainPairSerializer