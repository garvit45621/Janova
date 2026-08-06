import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

gmail_user = "garvit.sarna2001@gmail.com"
gmail_pass = "vpzfbiuxvzbutaag"
recipient = "garvit.sarna2001@gmail.com"

html_body = """
<div style="font-family: Arial, sans-serif; padding: 20px; background: #0f172a; color: #fff; border-radius: 10px;">
    <h2 style="color: #38bdf8;">Janova Gmail SMTP Test Passed! 🎉</h2>
    <p>Gmail Free SMTP is now active. Welcome emails will be delivered to EVERY citizen email inbox!</p>
</div>
"""

try:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Janova Gmail Free SMTP Verified! 🎉"
    msg["From"] = f"Janova Portal <{gmail_user}>"
    msg["To"] = recipient
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
        server.login(gmail_user, gmail_pass)
        server.sendmail(gmail_user, [recipient], msg.as_string())
    print("SUCCESS: Gmail SMTP email sent cleanly!")
except Exception as e:
    print("FAILED:", e)
