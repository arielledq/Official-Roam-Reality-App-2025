from django.db import models
from home.common import CommonModel

from home.utils import EmailOTP, SendgridClient
from modules.ar.challenges.models import Challenges
from users.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

class ReportedContentConstant:
    SPAM = 1
    PORNOGRAPHY = 2
    HATRED_BULLYING = 3
    SELF_HARM = 4
    VIOLENT_GORY = 5
    CHILD_PORN = 6
    ILLEGAL_ACTIVITIES = 7
    DECEPTIVE_CONTENT = 8
    COPYRIGHT_INFRINGEMENT = 9
    OTHER = 10

    REASON_CHOICES = (
        (SPAM, 'Spam'),
        (PORNOGRAPHY, 'Pornography'),
        (HATRED_BULLYING, 'Hatred and Bullying'),
        (SELF_HARM, 'Self-harm'),
        (VIOLENT_GORY, 'Violent, Gory, and Harmful Content'),
        (CHILD_PORN, 'Child Pornography'),
        (ILLEGAL_ACTIVITIES, 'Illegal Activities'),
        (DECEPTIVE_CONTENT, 'Deceptive Content'),
        (COPYRIGHT_INFRINGEMENT, 'Copyright and Trademark Infringement'),
        (OTHER, 'Other'),
    )

class ContactUs(CommonModel):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    message = models.TextField()
    title = models.CharField(max_length=255, null=True, blank=True)

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
            f"{instance.title}\n\n"
            f"{instance.message}\n\n"
            f"Best regards,\n"
            f"Travel AR\n"
        )
        EmailOTP.send_email(settings.DEFAULT_FROM_EMAIL, message, subject)


class ReportedContent(models.Model):
    post = models.ForeignKey(Challenges, on_delete=models.CASCADE,null=True, blank=True)
    reported_user = models.ForeignKey(User, on_delete=models.CASCADE,null=True, blank=True)
    reason = models.PositiveIntegerField(max_length=50, choices=ReportedContentConstant.REASON_CHOICES,default=ReportedContentConstant.OTHER,null=True, blank=True) 
    custom_reason = models.TextField(null=True, blank=True)
    is_reviewed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reported Content/User"
        verbose_name_plural = "Reported Content/Users"
