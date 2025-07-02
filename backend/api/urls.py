from django.urls import path, include

urlpatterns = [
    path("users/", include("users.urls")),
    path("feedback/", include("feedback.urls")),
    path("flora/", include("flora.urls")),
    path("routes/", include("routes.urls")),
    path("admin/routes/", include("routes.admin_urls")),
    path("qr/", include("qr.urls")),
    path("weather/", include("weather.urls")),
    path("", include("stations.urls")),
]
