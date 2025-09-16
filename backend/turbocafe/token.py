from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['role'] = user.role
        token['matric_number'] = user.matric_number
        token['first_name'] = user.first_name
        token['last_name']= user.last_name
        token['vendor_name'] = user.vendor_name
        
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        # Add user info to response
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'phone_number': user.phone_number,
            'address': user.address,
            'matric_number': user.matric_number,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'vendor_name': user.vendor_name,
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
