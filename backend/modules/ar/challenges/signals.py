from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Challenges, Sponsor, Resource3dModel, ARUserProfile, ARMemories
from django.db.models import F
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.base import File
import subprocess
import tempfile
from django.conf import settings

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

@receiver(post_save, sender=ARMemories, dispatch_uid="update_thumbnails_updated")
def update_thumbnails(sender, instance, **kwargs):
    if kwargs['created'] and instance.memory_type == 'VIDEO':
      OUTPUT_IMAGE_EXT = 'png'
      OUTPUT_IMAGE_CONTENT_TYPE = 'image/png'
      video_file = ''
      if settings.USE_S3:
        video_file = instance.memory_file.url
      else:
        video_file = instance.memory_file.path
         
      thumbnail_tmp_out = tempfile.NamedTemporaryFile(suffix="_thumbnails.%s"%OUTPUT_IMAGE_EXT,dir='mediafiles',delete=True)
      video_file_thumbnail_tmp = thumbnail_tmp_out.name
      ffmpeg_cmd = ["ffmpeg", '-i', video_file, '-ss', '00:00:01.000', '-vframes', '1','-y',video_file_thumbnail_tmp]
      subprocess.call(ffmpeg_cmd)
      suf = SimpleUploadedFile(video_file_thumbnail_tmp,thumbnail_tmp_out.read(),content_type=OUTPUT_IMAGE_CONTENT_TYPE)
      instance.thumbnail_memory_video_file = suf
      instance.save()