from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Challenges, Sponsor, Resource3dModel, ARUserProfile, ARMemories
from django.db.models import F

@receiver(post_save, sender=ARMemories, dispatch_uid="update_points")
def update_points(sender, instance, **kwargs):
    
    cBbj = Challenges.objects.get(pk=instance.challenges)
    if instance.challenge_approval == "DECLINED":
      ARUserProfile.objects.filter(user=instance.user).update(points=F('points')-cBbj.points)
    else:
      ARUserProfile.objects.filter(user=instance.user).update(points=F('points')+cBbj.points)
