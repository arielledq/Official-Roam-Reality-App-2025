import random
from django.core.mail import EmailMessage
from users.models import User,UserOtp
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import status
from rest_framework.response import Response

class SendgridClient(object):

    def send(self, request):
        email = request.data.get('email', None)
        user = User.objects.filter(email=email)
        if email and user:
            mail_subject = 'One Time Password'
            otp = format(random.randint(0000, 9999), '04d')
            html_content = render_to_string(
                'email.html',
                {
                    'email': email,
                    'code': otp,
                },
            )
            message = strip_tags(html_content)
            email_obj = EmailMessage(
                subject=mail_subject, body=message, to=[email]
            )
            email_obj.send()
            user_otp = UserOtp.objects.filter(email=email)
            if user_otp:
                user_otp.update(otp=otp)
            else:
                UserOtp.objects.create(email=email, otp=otp)
        else:
            raise Exception("User not found")

    def confirm(self, request):
        email = request.data.get('email', None)
        otp = request.data.get('otp', None)
        user_otp = UserOtp.objects.filter(email=email, otp=otp)
        if user_otp:
            user_otp.update(otp=0)
            return {'response': 'OTP Verified', 'status':True}
        else:
            return {'response': 'OTP Expired', 'status':False}
        
    def send_to_new_user(self, email=None):
        if email:
            mail_subject = 'One Time Password'
            otp = format(random.randint(0000, 9999), '04d')
            html_content = render_to_string(
                'email.html',
                {
                    'email': email,
                    'code': otp,
                },
            )
            message = strip_tags(html_content)
            email_obj = EmailMessage(
                subject=mail_subject, body=message, to=[email]
            )
            email_obj.send()
            user_otp = UserOtp.objects.filter(email=email)
            if user_otp:
                user_otp.update(otp=otp)
            else:
                UserOtp.objects.create(email=email, otp=otp)
        else:
            raise Exception("Email not provided")

    def send_reset_link(self, request):
        email = request.get('email', None)
        if email:
            mail_subject = request.get('subject', None)
            mail_message = request.get('message', None)
            link = request.get('link', None)
            html_content = render_to_string(
                'reset_password.html',
                {
                    'mail_message': mail_message,
                    'link': link
                },
            )
            message = strip_tags(html_content)
            email_obj = EmailMessage(
                subject=mail_subject, body=message, to=[email]
            )
            email_obj.send()


    def send_email(self, email, message, subject):
        if email:
            subject = subject
            email_obj = EmailMessage(
                subject=subject, body=message, to=[email]
            )
            email_obj.send()
        else:
            raise Exception("Email not provided")


class EmailOTP:
    
    @classmethod
    def send(cls, *args):
        SendgridClient().send(*args)

    @classmethod
    def confirm(cls, *args):
        return SendgridClient().confirm(*args)
    
    @classmethod
    def send_to_new_user(cls, *args):
        SendgridClient().send_to_new_user(*args)

    @classmethod
    def send_reset_link(cls, *args):
        SendgridClient().send_reset_link(*args)

    @classmethod
    def send_email(cls, *args):
        SendgridClient().send_email(*args)


def handle_validation_error(e):
    if hasattr(e, "detail") and isinstance(e.detail, dict):
        error_messages = []
        for field, field_errors in e.detail.items():
            if isinstance(field_errors, list) and len(field_errors) > 0:
                if "This field is required." in field_errors[0]:
                    error_messages.append(f"{field.capitalize()} field is required.")
                else:
                    error_messages.extend([str(error) for error in field_errors])
        if error_messages:
            error_message = ", ".join(error_messages)
            return Response({"error": error_message}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
    return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)