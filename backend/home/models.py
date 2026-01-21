from django.db import models


class Mode(models.Model):
    """Model to store different modes like Geo-tag, Band, Hunt, Scans"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    description = models.TextField(blank=True, help_text="Description of what this mode does")
    sort_order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Mode'
        verbose_name_plural = 'Modes'
        ordering = ['sort_order', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.status})"
