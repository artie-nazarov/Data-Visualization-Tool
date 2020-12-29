from django.shortcuts import render 
from rest_framework.views import APIView 
from . models import *
from rest_framework.response import Response 
from . serializer import *
# Create your views here. 
  def home(request):
      return render(request, "index.html")

# class ReactView(APIView): 
    
#     serializer_class = ReactSerializer 
  
#     def get(self, request): 
#         detail = [ {"name": detail.name,"detail": detail.detail}  
#         for detail in React.objects.all()] 
#         return Response(detail) 
  
#     def post(self, request): 
#         if request.method == "POST":
#             print("At least i didnt crash")
#         # serializer = ReactSerializer(data=request.data) 
#         # if serializer.is_valid(raise_exception=True): 
#         #     serializer.save() 
#         #     return  Response(serializer.data)
#         return None