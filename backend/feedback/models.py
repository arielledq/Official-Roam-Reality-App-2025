from django.db import models
from home.common import CommonModel

from home.utils import EmailOTP, SendgridClient
from users.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

class ContactUs(CommonModel):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    message = models.TextField()

    def __str__(self):
        return self.sender.email
    
    class Meta:
        verbose_name = "Contact Us"
        verbose_name_plural = "Contact Us"
   
@receiver(post_save, sender=ContactUs)
def send_feedback_email_to_admin(sender, instance, created, **kwargs):
    if created:
        sender_email = instance.sender.email
        subject = "New Feedback Received"
        message = (
            f"Dear Admin,\n\n"
            f"A new feedback has been submitted by {sender_email}:\n\n"
            f"{instance.message}\n\n"
            f"Best regards,\n"
            f"Travel AR\n"
        )
        EmailOTP.send_email(settings.DEFAULT_FROM_EMAIL, message, subject)
