from rest_framework import serializers
from .models import ContactUs, ReportedContent

class ContactUsSerializer(serializers.ModelSerializer):
  sender = serializers.PrimaryKeyRelatedField(read_only=True)

  class Meta:
    model = ContactUs
    fields = '__all__'

  def create(self, validated_data):
    validated_data['sender'] = self.context['request'].user
    return super().create(validated_data)


class ReportedContentSerializer(serializers.ModelSerializer):
  class Meta:
    model = ReportedContent
    fields = '__all__'