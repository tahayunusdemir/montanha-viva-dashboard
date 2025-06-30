from django.urls import path, include

# The views from the old structure are removed as they are no longer relevant
# or have been moved to their respective apps.

urlpatterns = [
    path("users/", include("users.urls")),
    path("feedback/", include("feedback.urls")),
    path("routes/", include("routes.urls")),
    path("flora/", include("flora.urls")),
    # The public-data and protected-data views are kept as example endpoints
    # If they are not needed, they can be removed.
    # path('public-data/', PublicDataView.as_view(), name='public_data'),
    # path('protected-data/', ProtectedDataView.as_view(), name='protected_data'),
]
