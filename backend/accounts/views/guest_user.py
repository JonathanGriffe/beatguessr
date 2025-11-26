from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class GuestUserView(APIView):
    def get(self, request):
        request.session["guest_username"] = request.query_params.get("guest_username")
        return Response(status.HTTP_204_NO_CONTENT)
