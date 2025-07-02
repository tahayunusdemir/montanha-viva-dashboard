from django.contrib import admin
from .models import Station, Measurement

# Register your models here.
admin.site.register(Station)
admin.site.register(Measurement)
