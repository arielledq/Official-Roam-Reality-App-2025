import random
from django.core.mail import EmailMessage
from users.models import User,UserOtp
from django.template.loader import render_to_string
from django.utils.html import strip_tags

class SendgridClient(object):

    def send(self, request):
        email = request.data.get('email', None)
        user = User.objects.filter(email=email)
        if email and user:
            mail_subject = 'One Time Password'
            otp = format(random.randint(0000, 9999), '04d')
            email_obj = EmailMessage(
                subject=mail_subject, body=otp, to=[email]
            )
            email_obj.send()
            user_otp = UserOtp.objects.filter(email=email)
            if user_otp:
                user_otp.update(otp=otp)
            else:
                UserOtp.objects.create(email=email, otp=otp)
        else:
            raise Exception("UserDoesNotExist")

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
