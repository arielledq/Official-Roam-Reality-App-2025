from django.db import models
from django.conf import settings
from ckeditor.fields import RichTextField


# Create your models here.

class UserAgreement(models.Model):

	body = RichTextField()
	author = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.PROTECT,
		related_name="user_agreement"
		)
	is_active = models.BooleanField(
		default=True
		)
	created_at = models.DateTimeField(
		auto_now_add=True,
		)
	updated_at = models.DateTimeField(
		auto_now=True,
		)
