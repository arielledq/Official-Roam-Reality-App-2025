from django.db import models


class Mode(models.Model):
    """Model to store different modes like Geo-tag, Band, Hunt, Scans"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Mode'
        verbose_name_plural = 'Modes'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.status})"
