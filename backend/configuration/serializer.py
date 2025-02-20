import json

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from configuration.models import Configuration


class ConfigurationListSerializer(serializers.ModelSerializer):
    key = serializers.CharField(read_only=True)
    value = serializers.SerializerMethodField()

    class Meta:
        model = Configuration
        fields = ['key', 'value']

    def get_value(self, obj):
        if obj.image_value:
            return self.context['request'].build_absolute_uri(obj.image_value.url)
        return obj.value


class ConfigurationUpdateSerializer(serializers.ModelSerializer):
    value = serializers.JSONField(required=True, allow_null=True)

    class Meta:
        model = Configuration
        fields = ['value']

    def to_internal_value(self, data):
        # try:
        #     if 'value' in data:
        #         json.loads(data['value'])
        # except json.JSONDecodeError:
        #     data._mutable = True
        #     data['value'] = f'"{data["value"]}"'
        #     data._mutable = False
        return super().to_internal_value(data)

    def validate(self, attrs):
        Configuration.validate_new_value(self.instance.key, attrs['value'])
        return attrs

    def update(self, instance, validated_data):
        if validated_data['value']:
            validated_data['image_value'] = None
        if validated_data['value'] is None and validated_data['image_value'] is None and not instance.nullable:
            raise ValidationError('Configuration is not nullable')
        return super().update(instance, validated_data)

class ConfigurationFileUpdateSerializer(ConfigurationUpdateSerializer):
    value = serializers.FileField(required=True, allow_null=True, source='image_value')

    def validate(self, attrs):
        Configuration.validate_new_value(self.instance.key, attrs['image_value'])
        return attrs

    def update(self, instance, validated_data):
        validated_data['value'] = None
        return super().update(instance, validated_data)