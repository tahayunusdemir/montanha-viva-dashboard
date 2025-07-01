# API Endpoint Reference

This document provides a centralized reference for all API endpoints in the Montanha Viva Dashboard project.

---

## 1. User Authentication & Profile

| Method             | Endpoint                             | ViewSet/View                | Name                     | Description                                                      |
| :----------------- | :----------------------------------- | :-------------------------- | :----------------------- | :--------------------------------------------------------------- |
| `POST`             | `/api/users/register/`               | `RegisterView`              | `register`               | Creates a new user.                                              |
| `POST`             | `/api/users/token/`                  | `CustomTokenObtainPairView` | `token_obtain_pair`      | Logs a user in, returns JWT access token.                        |
| `POST`             | `/api/users/token/refresh/`          | `TokenRefreshView`          | `token_refresh`          | Refreshes an expired access token.                               |
| `POST`             | `/api/users/logout/`                 | `LogoutView`                | `logout`                 | Logs a user out by blacklisting their refresh token.             |
| `GET/PATCH/DELETE` | `/api/users/me/`                     | `UserProfileView`           | `current-user-profile`   | Retrieves, updates, or deletes the authenticated user's profile. |
| `GET`              | `/api/users/me/activity/`            | `UserActivityHistoryView`   | `user-activity`          | Lists the logged-in user's activity history.                     |
| `POST`             | `/api/users/password-reset/`         | `PasswordResetRequestView`  | `password-reset-request` | User requests a password reset link.                             |
| `POST`             | `/api/users/password-reset/confirm/` | `PasswordResetConfirmView`  | `password-reset-confirm` | User provides token and new password to reset it.                |
| `POST`             | `/api/users/change-password/`        | `ChangePasswordView`        | `change-password`        | Authenticated user changes their own password.                   |

---

## 2. Public Content APIs

These endpoints provide read-only access to public data.

| Method | Endpoint                   | ViewSet/View          | Name                | Description                                            |
| :----- | :------------------------- | :-------------------- | :------------------ | :----------------------------------------------------- |
| `GET`  | `/api/flora/`              | `PlantListView`       | `list-plants`       | Lists all active plants for the public catalog.        |
| `GET`  | `/api/flora/<uuid:id>/`    | `PlantDetailView`     | `detail-plant`      | Retrieves all details for a single plant.              |
| `GET`  | `/api/routes/`             | `RouteListView`       | `list-routes`       | Lists all active routes for public display.            |
| `GET`  | `/api/routes/<uuid:id>/`   | `RouteDetailView`     | `detail-route`      | Retrieves all details for a single route.              |
| `GET`  | `/api/achievements/`       | `AchievementListView` | `list-achievements` | Lists all achievements and the user's status for each. |
| `GET`  | `/api/rewards/my-coupons/` | `UserCouponListView`  | `list-user-coupons` | Lists all coupons for the logged-in user.              |

---

## 3. Authenticated User Interactions

| Method | Endpoint                        | ViewSet/View            | Name               | Description                                      |
| :----- | :------------------------------ | :---------------------- | :----------------- | :----------------------------------------------- |
| `POST` | `/api/feedback/submit/`         | `SubmitFeedbackView`    | `submit-feedback`  | Authenticated user submits a feedback form.      |
| `POST` | `/api/interactions/scan-qr/`    | `ScanQRCodeView`        | `scan-qr-code`     | User submits a scanned QR code ID to get points. |
| `POST` | `/api/rewards/generate-coupon/` | `GenerateCouponView`    | `generate-coupon`  | User spends points to create a new coupon.       |
| `POST` | `/api/ai/submit-image/`         | `SubmitImageView`       | `submit-image`     | User uploads an image for plant identification.  |
| `GET`  | `/api/ai/submissions/`          | `SubmissionHistoryView` | `list-submissions` | Lists the current user's past submissions.       |

---

## 4. Sensor Data APIs

| Method | Endpoint                     | ViewSet/View          | Name               | Description                                        |
| :----- | :--------------------------- | :-------------------- | :----------------- | :------------------------------------------------- |
| `POST` | `/api/sensors/ingest/`       | `IngestDataView`      | `ingest-data`      | **Secured Endpoint** for IoT devices to post data. |
| `GET`  | `/api/sensors/stations/`     | `StationListView`     | `list-stations`    | Lists all `active` stations for user selection.    |
| `GET`  | `/api/sensors/measurements/` | `MeasurementDataView` | `get-measurements` | Fetches measurement data based on filter criteria. |

---

## 5. Admin APIs

All admin endpoints are protected by `IsAdminUser` permissions and are grouped under the `/api/admin/` prefix. They should be implemented using `ModelViewSet` where applicable.

| Resource           | Endpoint                            | Supported Methods                | Description                                 |
| :----------------- | :---------------------------------- | :------------------------------- | :------------------------------------------ |
| **Users**          | `/api/admin/users/`                 | `GET`, `POST`, `PATCH`, `DELETE` | Manage all user accounts.                   |
| **Feedback**       | `/api/admin/feedback/`              | `GET`, `PATCH`, `DELETE`         | Manage user feedback submissions.           |
| **Flora (Plants)** | `/api/admin/flora/`                 | `GET`, `POST`, `PATCH`, `DELETE` | Manage the plant encyclopedia.              |
| **Routes**         | `/api/admin/routes/`                | `GET`, `POST`, `PATCH`, `DELETE` | Manage routes and their points of interest. |
| **QR Codes**       | `/api/admin/qrcodes/`               | `GET`, `POST`, `PATCH`, `DELETE` | Manage QR codes for interactions.           |
| **Achievements**   | `/api/admin/achievements/`          | `GET`, `POST`, `PATCH`, `DELETE` | Manage the gamification achievements.       |
| **Stations**       | `/api/admin/stations/`              | `GET`, `POST`, `PATCH`, `DELETE` | Manage IoT weather stations.                |
| **AI Submissions** | `/api/admin/ai-submissions/`        | `GET`                            | Review user image submissions (read-only).  |
| **Coupons**        | `/api/admin/coupons/{code}/`        | `GET`                            | Looks up a coupon by its code.              |
| **Coupons**        | `/api/admin/coupons/{code}/redeem/` | `POST`                           | Marks a coupon as redeemed.                 |
