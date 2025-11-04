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
import logging
import requests
from django.db.models.signals import m2m_changed
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError

logger = logging.getLogger(__name__)

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
    try:
        # Ensure ffmpeg is available
        if not ffdl.ffmpeg_path:
            # Try to install ffmpeg if path is not set
            subprocess.call(['ffdl','install','-y'])
        elif not os.path.exists(ffdl.ffmpeg_path):
            # Try to install ffmpeg if path doesn't exist
            subprocess.call(['ffdl','install','-y'])

        if kwargs['created'] and instance.memory_type == 'VIDEO':
            # Check if ffmpeg_path is available before proceeding
            if not ffdl.ffmpeg_path:
                logger.warning(f"FFmpeg not available, skipping thumbnail generation for memory {instance.id}")
                return

            if not instance.memory_file:
                logger.warning(f"No video file found for memory {instance.id}")
                return

            OUTPUT_IMAGE_EXT = 'png'
            OUTPUT_IMAGE_CONTENT_TYPE = 'image/png'
            video_file_path = None
            video_tmp_file = None
            
            try:
                # Handle S3 vs local file storage
                if settings.USE_S3:
                    # Download S3 file to temporary location for ffmpeg
                    video_url = instance.memory_file.url
                    logger.info(f"Downloading video from S3 for memory {instance.id}")
                    
                    video_tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
                    video_file_path = video_tmp_file.name
                    
                    try:
                        response = requests.get(video_url, stream=True, timeout=60)
                        response.raise_for_status()
                        for chunk in response.iter_content(chunk_size=8192):
                            if chunk:
                                video_tmp_file.write(chunk)
                        video_tmp_file.close()
                        logger.info(f"Successfully downloaded video for memory {instance.id}")
                    except Exception as e:
                        logger.error(f"Failed to download video from S3 for memory {instance.id}: {str(e)}")
                        video_tmp_file.close()
                        if video_file_path and os.path.exists(video_file_path):
                            os.unlink(video_file_path)
                        return
                else:
                    # Use local file path directly
                    video_file_path = instance.memory_file.path
                    if not os.path.exists(video_file_path):
                        logger.error(f"Video file not found at path: {video_file_path}")
                        return
                
                # Generate thumbnail
                thumbnail_tmp_out = tempfile.NamedTemporaryFile(suffix=".%s"%OUTPUT_IMAGE_EXT, delete=False)
                video_file_thumbnail_tmp = thumbnail_tmp_out.name
                thumbnail_tmp_out.close()
                
                ffmpeg_cmd = [
                    ffdl.ffmpeg_path, 
                    '-i', video_file_path, 
                    '-ss', '00:00:01.000',  # Use 1 second instead of 0 to avoid potential issues with some videos
                    '-vframes', '1',
                    '-f', 'image2',
                    '-y',
                    video_file_thumbnail_tmp
                ]
                
                logger.info(f"Running ffmpeg for memory {instance.id}")
                # Execute ffmpeg command and capture output for debugging
                process = subprocess.Popen(
                    ffmpeg_cmd,
                    stderr=subprocess.PIPE,
                    stdout=subprocess.PIPE
                )
                stdout, stderr = process.communicate()
                result = process.returncode
                
                if result != 0:
                    error_msg = stderr.decode('utf-8', errors='ignore') if stderr else 'Unknown error'
                    logger.error(f"FFmpeg failed to generate thumbnail for memory {instance.id}, exit code: {result}, error: {error_msg[:500]}")
                    if os.path.exists(video_file_thumbnail_tmp):
                        os.unlink(video_file_thumbnail_tmp)
                    return
                
                # Read the generated thumbnail
                if not os.path.exists(video_file_thumbnail_tmp) or os.path.getsize(video_file_thumbnail_tmp) == 0:
                    logger.error(f"Thumbnail file was not created or is empty for memory {instance.id}")
                    if os.path.exists(video_file_thumbnail_tmp):
                        os.unlink(video_file_thumbnail_tmp)
                    return
                
                with open(video_file_thumbnail_tmp, 'rb') as f:
                    thumbnail_data = f.read()
                
                suf = SimpleUploadedFile(
                    os.path.basename(video_file_thumbnail_tmp),
                    thumbnail_data,
                    content_type=OUTPUT_IMAGE_CONTENT_TYPE
                )
                instance.thumbnail_memory_video_file = suf
                instance.save(update_fields=['thumbnail_memory_video_file'])
                logger.info(f"Successfully generated thumbnail for memory {instance.id}")
                
                # Clean up thumbnail temp file
                if os.path.exists(video_file_thumbnail_tmp):
                    os.unlink(video_file_thumbnail_tmp)
                    
            finally:
                # Clean up downloaded video temp file if it exists (S3 case)
                if video_tmp_file and video_file_path and settings.USE_S3 and os.path.exists(video_file_path):
                    try:
                        os.unlink(video_file_path)
                    except Exception as e:
                        logger.warning(f"Failed to clean up temp video file {video_file_path}: {str(e)}")
    except Exception as e:
        logger.error(f"Error generating thumbnail for memory {instance.id}: {str(e)}")
        # Don't raise the exception to avoid breaking the save operation


@receiver(m2m_changed, sender=GeoARStarPoint.sponsors.through)
def limit_sponsors(sender, instance, action, pk_set, **kwargs):
    if action == 'pre_add':
        total = instance.sponsors.count() + len(pk_set)
        if total > 3:
            raise ValidationError(
                _("No more than 3 sponsor per star."),
            )
