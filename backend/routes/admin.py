from django.contrib import admin
from .models import Route, PointOfInterest

# Register your models here.
admin.site.register(Route)
admin.site.register(PointOfInterest)
