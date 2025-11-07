from django.core.mail.backends.smtp import EmailBackend as SMTPEmailBackend
import smtplib


class SendGridEmailBackend(SMTPEmailBackend):
    def open(self):
        if self.connection is not None:
            try:
                if hasattr(self.connection, 'quit'):
                    self.connection.quit()
            except (smtplib.SMTPServerDisconnected, AttributeError, OSError):
                try:
                    if hasattr(self.connection, 'close'):
                        self.connection.close()
                except Exception:
                    pass
            except Exception:
                # Any other error, just try to close
                try:
                    if hasattr(self.connection, 'close'):
                        self.connection.close()
                except Exception:
                    pass
            finally:
                # Always clear the connection reference
                self.connection = None
        
        # Now call parent to open fresh connection
        return super().open()
    
    def send_messages(self, email_messages):
        if not email_messages:
            return 0
        try:
            result = super().send_messages(email_messages)
            return result
        except (smtplib.SMTPServerDisconnected, smtplib.SMTPException, Exception) as e:
            # On any error, clear connection
            if self.connection is not None:
                try:
                    self.close()
                except Exception:
                    pass
                finally:
                    self.connection = None
            raise
        finally:
            if self.connection is not None:
                try:
                    self.close()
                except Exception:
                    pass
                finally:
                    self.connection = None

