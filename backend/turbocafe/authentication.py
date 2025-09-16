from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import UntypedToken

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        
        # Add custom attributes to user object
        user.role = validated_token.get('role', None)
        user.matric_number = validated_token.get('matric_number', None)
        user.first_name = validated_token.get('first_name', None)
        user.last_name = validated_token.get('last_name', None)
        user.permissions = validated_token.get('permissions', [])
        user.vendor_name = validated_token.get('vendor_name', None)

        return user
