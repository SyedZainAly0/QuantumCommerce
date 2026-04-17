import aiosmtplib
import os
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("MAIL_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("MAIL_PORT", 587))
SMTP_USER = os.getenv("MAIL_USERNAME")
SMTP_PASS = os.getenv("MAIL_PASSWORD")


async def send_order_email(to_email: str, order_id: int, total_price: float):
    subject = f"Order Confirmation #{order_id}"

    body = f"""
    Thank you for your order!

    Order ID: {order_id}
    Total: ${total_price}
    """

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    await aiosmtplib.send(
        msg,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        start_tls=True,
        username=SMTP_USER,
        password=SMTP_PASS,
    )