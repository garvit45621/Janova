import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

gmail_user = "garvit.sarna2001@gmail.com"
gmail_pass = "vpzfbiuxvzbutaag"
recipient = "garvitsar21@gmail.com"

html_body = """
<div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #fff; border-radius: 10px;">
    <h2 style="color: #38bdf8;">Janova Welcome Email Live Test</h2>
    <p>This is a live test welcome email sent via Gmail Free SMTP to garvitsar21@gmail.com!</p>
</div>
"""

try:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Welcome to Janova Portal! 🎉"
    msg["From"] = f"Janova Portal <{gmail_user}>"
    msg["To"] = recipient
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
        server.set_debuglevel(1)
        server.login(gmail_user, gmail_pass)
        result = server.sendmail(gmail_user, [recipient], msg.as_string())
        print("SMTP Send Result:", result)
    print("SUCCESS: Email handed off to Google SMTP servers!")
except Exception as e:
    print("FAILED:", e)
