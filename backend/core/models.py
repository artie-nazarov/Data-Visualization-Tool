from django.db import models 
  
# Create your models here. 
class FileUpload(models.Model):
    file = models.FileField(upload_to="files")

  
# class React(models.Model): 
#     name = models.CharField(max_length=30) 
#     detail = models.CharField(max_length=500)