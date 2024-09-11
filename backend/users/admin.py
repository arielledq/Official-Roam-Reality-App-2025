from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.contrib.auth import get_user_model
from users.models import FriendshipRequest, UserOtp, UserProfile

from users.forms import UserChangeForm, UserCreationForm

User = get_user_model()


@admin.register(User)
class UserAdmin(auth_admin.UserAdmin):

    form = UserChangeForm
    add_form = UserCreationForm
    fieldsets = (("User", {"fields": ("name",)}),) + auth_admin.UserAdmin.fieldsets
    list_display = ["id", "system_generated_user_name", "name", "is_superuser"]
    search_fields = ["name", "email"]
    list_display_links = ("id", "system_generated_user_name", "name",)

    def system_generated_user_name(self, obj):
        return obj.username

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user_id", "user_name", "user_email", "is_verified"]
    search_fields = ["user__id", "user__name", "user__email"]
    list_display_links = ("user_id", "user_name",)
    list_filter = ("is_verified",)
    ordering = ("user__name",)

    def user_name(self, obj):
        return obj.user.name

    def user_email(self, obj):
        return obj.user.email

@admin.register(UserOtp)
class UserOTP(admin.ModelAdmin):
    list_display = ["email", "otp"]
    search_fields = ["email", "otp"]
    list_display_links = ["email", "otp"]


@admin.register(FriendshipRequest)
class FriendshipRequestAdmin(admin.ModelAdmin):
    list_display = ["id", "from_user", "to_user"]
    search_fields = ["from_user__name", "to_user__name"]
    list_display_links = ["id", "from_user", "to_user"]