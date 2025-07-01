from django.contrib.auth.tokens import PasswordResetTokenGenerator


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    """
    Custom token generator that does not use the `last_login` timestamp.
    This ensures that a password reset token remains valid even if the
    user logs in between requesting the reset and using the token.
    """

    def _make_hash_value(self, user, timestamp):
        # We don't include last_login here to prevent token invalidation on login.
        # The original implementation includes:
        # login_timestamp = '' if user.last_login is None else user.last_login.replace(microsecond=0, tzinfo=None)
        # return f"{user.pk}{user.password}{login_timestamp}{timestamp}"
        return f"{user.pk}{user.password}{timestamp}"


account_activation_token_generator = AccountActivationTokenGenerator()
