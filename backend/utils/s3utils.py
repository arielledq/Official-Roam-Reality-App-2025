
import pathlib
import time
import random
from rest_framework import serializers

def s3file_random_name_url(s3file):
    new_name = f'{time.time()}{random.random()}{pathlib.Path(s3file.name).suffix}'
    return s3file.storage.url(
        s3file.name,
        parameters={f'ResponseContentDisposition': f'attachment; filename="{new_name}"'}
    )

class RandomDownloadNameS3FileField(serializers.FileField):

    def to_representation(self, value):
        if not value:
            return None

        return s3file_random_name_url(value)