from rest_framework import serializers
from slide_pictures.models import SlidePicture


class SlidePictureSerializer(serializers.ModelSerializer):
    image = serializers.ImageField()

    class Meta:
        model = SlidePicture
        fields = ['id', 'name', 'image', 'order']
