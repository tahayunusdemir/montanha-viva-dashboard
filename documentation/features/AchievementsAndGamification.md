# Achievements & Gamification Feature

This document describes the system for awarding achievements to users based on their interactions within the platform. This is a key feature for driving long-term user engagement.

## 1. Core Functionality

The achievement system is designed to reward users for engaging with key features of the application. Achievements are awarded for specific milestones.

- **As an Admin,** I want to define a set of achievements based on key user actions.
- **As a User,** I want to be automatically awarded an achievement when I meet its requirements.
- **As a User,** I want to receive a notification when I unlock a new achievement.
- **As a User,** I want to view all my unlocked achievements and my progress towards locked ones.

The following achievements will be implemented:

- **Welcome Aboard:** Awarded for the first login.
- **Trail Explorer:** Awarded for scanning 10 QR codes.
- **Budding Botanist:** Awarded for identifying 10 plants via AI.
- **Helpful Contributor:** Awarded for submitting 5 feedback forms.
- **Flora Expert:** Awarded for viewing every plant in the flora encyclopedia.
- **Route Master:** Awarded for viewing every route available.
- **Data Analyst:** Awarded for viewing sensor data for the first time.

---

## 2. Backend Implementation (Django REST Framework)

### 2.1. New Models (`achievements/models.py`)

A new Django app, `achievements`, will house the related models.

```python
from django.db import models
from django.conf import settings

class Achievement(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.URLField(help_text="URL to the achievement icon/badge.")

    # Simplified criteria system based on user request
    CRITERIA_CHOICES = [
        ('FIRST_LOGIN', 'First Login'),
        ('QR_SCANS', 'Total QR Scans'),
        ('FEEDBACK_SUBMISSIONS', 'Total Feedback Submissions'),
        ('PLANTS_DISCOVERED', 'Unique Plants Discovered'),
        ('ALL_PLANTS_VIEWED', 'All Plants Viewed'),
        ('ALL_ROUTES_VIEWED', 'All Routes Viewed'),
        ('SENSOR_DATA_VIEWED', 'Sensor Data Viewed'),
    ]
    criteria_type = models.CharField(max_length=50, choices=CRITERIA_CHOICES)
    criteria_value = models.PositiveIntegerField(help_text="The value needed to unlock (e.g., 10 for 10 scans). Not used for 'view all' achievements.")

    def __str__(self):
        return self.name

class UserAchievement(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'achievement') # A user can only get an achievement once
```

### 2.2. Core Logic (`achievements/services.py`)

A service function will be responsible for checking and awarding achievements. This function must be called after any relevant user action.

```python
# achievements/services.py

def check_and_award_achievements(user):
    """
    Checks if a user qualifies for any new achievements based on their activity log.
    This service should be triggered by signals or direct calls from other apps.
    """
    from core.models import UserActivity
    from flora.models import Plant
    from routes.models import Route

    unlocked_achievements_ids = UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True)
    possible_achievements = Achievement.objects.exclude(id__in=unlocked_achievements_ids)

    # Check criteria for each potential new achievement
    for achievement in possible_achievements:
        unlocked = False
        if achievement.criteria_type == 'FIRST_LOGIN':
            # This is awarded on the first login event. The service is called upon login.
            unlocked = True

        elif achievement.criteria_type == 'QR_SCANS':
            scan_count = UserActivity.objects.filter(user=user, activity_type=UserActivity.ActivityType.QR_CODE_SCANNED).count()
            if scan_count >= achievement.criteria_value:
                unlocked = True

        elif achievement.criteria_type == 'FEEDBACK_SUBMISSIONS':
            feedback_count = UserActivity.objects.filter(user=user, activity_type=UserActivity.ActivityType.FEEDBACK_SUBMITTED).count()
            if feedback_count >= achievement.criteria_value:
                unlocked = True

        elif achievement.criteria_type == 'PLANTS_DISCOVERED':
            # Check for unique plants discovered via AI or QR scans.
            discovered_plants_count = UserActivity.objects.filter(
                user=user,
                activity_type=UserActivity.ActivityType.PLANT_DISCOVERED
            ).values('details__plant_id').distinct().count()
            if discovered_plants_count >= achievement.criteria_value:
                unlocked = True

        elif achievement.criteria_type == 'ALL_PLANTS_VIEWED':
            # Check if the user has viewed every active plant.
            total_plants = Plant.objects.filter(is_active=True).count()
            viewed_plants_count = UserActivity.objects.filter(
                user=user,
                activity_type=UserActivity.ActivityType.PLANT_VIEWED
            ).values('details__plant_id').distinct().count()
            if viewed_plants_count >= total_plants and total_plants > 0:
                unlocked = True

        elif achievement.criteria_type == 'ALL_ROUTES_VIEWED':
            # Check if the user has viewed every active route.
            total_routes = Route.objects.filter(is_active=True).count()
            viewed_routes_count = UserActivity.objects.filter(
                user=user,
                activity_type=UserActivity.ActivityType.ROUTE_VIEWED
            ).values('details__route_id').distinct().count()
            if viewed_routes_count >= total_routes and total_routes > 0:
                unlocked = True

        elif achievement.criteria_type == 'SENSOR_DATA_VIEWED':
            # Awarded for viewing sensor data for the first time.
            if UserActivity.objects.filter(user=user, activity_type=UserActivity.ActivityType.SENSOR_DATA_VIEWED).exists():
                unlocked = True

        if unlocked:
            UserAchievement.objects.create(user=user, achievement=achievement)
            # Log the achievement unlocking event for notifications and history
            create_activity(user=user, activity_type=UserActivity.ActivityType.ACHIEVEMENT_UNLOCKED, details={'achievement_name': achievement.name})
```

### 2.3. Example Achievement Definitions

These achievements will be created in the database (e.g., via a data migration or the Django admin).

| name                    | description                               | icon_url                | criteria_type        | criteria_value |
| ----------------------- | ----------------------------------------- | ----------------------- | -------------------- | -------------- |
| **Welcome Aboard**      | Log in for the first time.                | /icons/welcome.png      | FIRST_LOGIN          | 1              |
| **Trail Explorer**      | Scan 10 QR codes on the trails.           | /icons/explorer.png     | QR_SCANS             | 10             |
| **Helpful Contributor** | Provide feedback 5 times.                 | /icons/feedback.png     | FEEDBACK_SUBMISSIONS | 5              |
| **Curious Observer**    | Discover your first unique plant.         | /icons/observer.png     | PLANTS_DISCOVERED    | 1              |
| **Budding Botanist**    | Discover 10 unique plants.                | /icons/botanist.png     | PLANTS_DISCOVERED    | 10             |
| **Flora Expert**        | View every plant in the encyclopedia.     | /icons/flora-expert.png | ALL_PLANTS_VIEWED    | 0 (not used)   |
| **Route Master**        | View every route available in the app.    | /icons/route-master.png | ALL_ROUTES_VIEWED    | 0 (not used)   |
| **Data Analyst**        | Check the sensor data for the first time. | /icons/analyst.png      | SENSOR_DATA_VIEWED   | 1              |

### 2.4. API Endpoint (`achievements/urls.py`)

| Method | Endpoint             | View                  | Name                | Description                                            |
| :----- | :------------------- | :-------------------- | :------------------ | :----------------------------------------------------- |
| `GET`  | `/api/achievements/` | `AchievementListView` | `list-achievements` | Lists all achievements and the user's status for each. |

The view will return a list of all defined achievements, annotated with whether the current user has unlocked them and their current progress toward those that are still locked.

---

## 3. Frontend Implementation (React, MUI, Zustand)

### 3.1. New Component (`ProfilePage/components/AchievementsSection.tsx`)

This component will be placed on the user's profile page.

- **Functionality:**
  - Fetches data from the `/api/achievements/` endpoint.
  - Separates the returned list into "Unlocked" and "Locked" achievements.
  - For unlocked achievements, it displays the icon in full color with the name and description.
  - For locked achievements, it displays the icon in grayscale. It also shows a progress bar indicating how close the user is to unlocking it (e.g., "7 / 10 Scans" or "12 / 15 Plants Viewed").

### 3.2. UI/UX

- **Achievement Card:** Each achievement will be a `Card` or a styled `Box` containing:
  - An `Avatar` or `img` for the `icon`.
  - `Typography` for the `name` and `description`.
  - A `LinearProgress` bar (from MUI) for locked achievements to show progress.
- **Notification:** When an achievement is unlocked, a prominent notification should appear. `react-hot-toast` can be used with a custom icon and message:
  `toast.success('Achievement Unlocked: Budding Botanist!', { duration: 4000 })`

### 3.3. State Management

The list of achievements and user progress will be fetched from the API and managed within the local state of the `AchievementsSection` component. Caching the response with a library like `react-query` or `SWR` is recommended for performance.

---

## 4. Admin Management Interface

To allow administrators to define and manage achievements, an admin interface will be built using the reusable **Admin Toolkit**. For more details on the toolkit, see `AdminPanelArchitecture.md`.

- **Functionality:** A page at `/admin/achievements` will use the `ResourceTable.tsx` to list all `Achievement` instances.
- **Forms:** The `ResourceFormModal.tsx` will be configured to allow admins to create and edit achievements, setting their `name`, `description`, `icon`, `criteria_type`, and `criteria_value`.
- **API:** A new `/api/admin/achievements/` endpoint using a `ModelViewSet` will provide the necessary CRUD functionality.
