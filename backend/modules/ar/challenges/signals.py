from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.models import NotificationTypes
from onesignal_client.utils import send_notification
from .models import Challenges, GeoARChallenges, ARUserProfile, ARMemories, ARSitePinCheckIn, GeoARStarPoint
from django.db.models import F
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.base import File
import subprocess
import tempfile
from django.conf import settings
import ffmpeg_downloader as ffdl
import os
from django.db.models.signals import m2m_changed
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

# @receiver(post_save, sender=ARMemories, dispatch_uid="update_points")
# def update_points(sender, instance, **kwargs):
#     if instance.challenges:
#       cBbj = Challenges.objects.get(pk=instance.challenges.id)
#       profileObj , created = ARUserProfile.objects.get_or_create(user=instance.user)
#       if instance.challenge_approval == "DECLINED":
#         profileObj.points =F('points')-cBbj.points
#         # send_notification(NotificationTypes.POINTS_REVOKED, profileObj.user)
#       elif kwargs['created'] and instance.challenge_approval == "UNAPPROVED":
#         profileObj.points =F('points')+cBbj.points
#         profileObj.challenge_completed =F('challenge_completed')+1
#       profileObj.save()
#     if instance.geo_challenge:
#       cBbj = GeoARChallenges.objects.get(pk=instance.geo_challenge.id)
#       profileObj , created = ARUserProfile.objects.get_or_create(user=instance.user)
#       if instance.challenge_approval == "DECLINED":
#         profileObj.points =F('points')-cBbj.points
#         # send_notification(NotificationTypes.POINTS_REVOKED, profileObj.user)
#       elif kwargs['created'] and instance.challenge_approval == "UNAPPROVED":
#         profileObj.points =F('points')+cBbj.points
#         profileObj.challenge_completed =F('challenge_completed')+1
#       profileObj.save()
#
#
# @receiver(post_save, sender=ARSitePinCheckIn, dispatch_uid="update_points")
# def update_points_checkin(sender, instance, **kwargs):
#     if instance.geo_challenge:
#       cBbj = GeoARChallenges.objects.get(pk=instance.geo_challenge.id)
#       profileObj , created = ARUserProfile.objects.get_or_create(user=instance.user)
#       if instance.challenge_approval == "DECLINED":
#         profileObj.points =F('points')-cBbj.points
#         # send_notification(NotificationTypes.POINTS_REVOKED, profileObj.user)
#       elif kwargs['created'] and instance.challenge_approval == "UNAPPROVED":
#         profileObj.points =F('points')+cBbj.points
#         profileObj.challenge_completed =F('challenge_completed')+1
#       profileObj.save()

@receiver(post_save, sender=ARMemories, dispatch_uid="update_thumbnails_updated")
def update_thumbnails(sender, instance, **kwargs):
    if ffdl.ffmpeg_path and not os.path.exists(ffdl.ffmpeg_path):
      subprocess.call(['ffdl','install','-y'])

    if kwargs['created'] and instance.memory_type == 'VIDEO':
      OUTPUT_IMAGE_EXT = 'png'
      OUTPUT_IMAGE_CONTENT_TYPE = 'image/png'
      video_file = ''
      if settings.USE_S3:
        video_file = instance.memory_file.url
      else:
        video_file = instance.memory_file.path
      thumbnail_tmp_out = tempfile.NamedTemporaryFile(suffix=".%s"%OUTPUT_IMAGE_EXT)
      video_file_thumbnail_tmp = thumbnail_tmp_out.name
      ffmpeg_cmd = [ffdl.ffmpeg_path, '-i', video_file, '-ss', '00:00:00.000', '-vframes', '1','-y',video_file_thumbnail_tmp]
      subprocess.call(ffmpeg_cmd)
      suf = SimpleUploadedFile(video_file_thumbnail_tmp,thumbnail_tmp_out.read(),content_type=OUTPUT_IMAGE_CONTENT_TYPE)
      instance.thumbnail_memory_video_file = suf
      instance.save()


@receiver(m2m_changed, sender=GeoARStarPoint.sponsors.through)
def limit_sponsors(sender, instance, action, pk_set, **kwargs):
    if action == 'pre_add':
        total = instance.sponsors.count() + len(pk_set)
        if total > 3:
            raise ValidationError(
                _("No more than 3 sponsor per star."),
            )
