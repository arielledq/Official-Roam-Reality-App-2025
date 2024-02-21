from django.db import models

class ContactUs(models.Model):
    full_name = models.CharField(max_length=255)
    email_address = models.EmailField()
    message = models.TextField()

    def __str__(self):
        return self.full_name
    
    class Meta:
        verbose_name = "Contact Us"
        verbose_name_plural = "Contact Us"
