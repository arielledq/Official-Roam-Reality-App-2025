from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.contrib.auth import get_user_model
from users.models import UserOtp, UserProfile

from users.forms import UserChangeForm, UserCreationForm

User = get_user_model()


@admin.register(User)
class UserAdmin(auth_admin.UserAdmin):

    form = UserChangeForm
    add_form = UserCreationForm
    fieldsets = (("User", {"fields": ("name",)}),) + auth_admin.UserAdmin.fieldsets
    list_display = ["username", "name", "is_superuser"]
    search_fields = ["name"]

admin.site.register(UserOtp)
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user_id", "user_name", "user_email", "is_verified"]
    search_fields = ["user__id", "user__name", "user__email"]


    def user_name(self, obj):
        return obj.user.name

    def user_email(self, obj):
        return obj.user.email
