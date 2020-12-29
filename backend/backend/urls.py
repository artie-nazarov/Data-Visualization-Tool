from django.contrib import admin 
from django.urls import path, include 
from django.conf.urls import url 
from core.views import *
from core.views import home, upload
  
urlpatterns = [ 
    path('admin/', admin.site.urls), 
    path('api/', ReactView.as_view(), name="something"), 
    path('upload', upload)
]