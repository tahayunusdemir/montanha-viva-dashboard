# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

# The UserRegistrationView has been moved to the 'users' app.


# These views are kept as examples but are currently not used in any URL configuration.
class PublicDataView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({"message": "This is public data."})


class ProtectedDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {"message": f"Hello, {request.user.email}! This is protected data."}
        )
