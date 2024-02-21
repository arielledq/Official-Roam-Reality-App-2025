from django.db import models
from home.common import CommonModel

from users.models import User

class ContactUs(CommonModel):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    message = models.TextField()

    def __str__(self):
        return self.sender.name
    
    class Meta:
        verbose_name = "Contact Us"
        verbose_name_plural = "Contact Us"
