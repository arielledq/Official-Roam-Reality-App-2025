from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Challenges, Sponsor, Resource3dModel, ARUserProfile, ARMemories
from django.db.models import F

@receiver(post_save, sender=ARMemories, dispatch_uid="update_points")
def update_points(sender, instance, **kwargs):
    if instance.challenges:
      cBbj = Challenges.objects.get(pk=instance.challenges.id)
      profileObj , created = ARUserProfile.objects.get_or_create(user=instance.user)
      if instance.challenge_approval == "DECLINED":
        profileObj.points =F('points')-cBbj.points
      elif instance.challenge_approval == "UNAPPROVED":
        profileObj.points =F('points')+cBbj.points
      profileObj.save()
