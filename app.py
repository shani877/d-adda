from __future__ import annotations

import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv
from flask import Flask, flash, redirect, render_template, request, url_for
from flask_wtf import CSRFProtect, FlaskForm
from wtforms import EmailField, StringField, TextAreaField
from wtforms.validators import DataRequired, Email, Length

load_dotenv()


class ContactForm(FlaskForm):
    """Contact form with basic validation and CSRF protection."""

    name = StringField("Name", validators=[DataRequired(), Length(min=2, max=80)])
    email = EmailField("Email", validators=[DataRequired(), Email(), Length(max=120)])
    message = TextAreaField(
        "Message",
        validators=[DataRequired(), Length(min=10, max=2000)],
    )


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "change-me-in-production")

    csrf = CSRFProtect(app)
    _ = csrf

    @app.route("/")
    def index():
        return render_template("index.html", page_title="D-Adda | DevOps Adda")

    @app.route("/services")
    def services():
        return render_template("services.html", page_title="Services | D-Adda")

    @app.route("/about")
    def about():
        return render_template("about.html", page_title="About | D-Adda")

    @app.route("/contact", methods=["GET", "POST"])
    def contact():
        form = ContactForm()

        if form.validate_on_submit():
            sender = os.getenv("MAIL_USERNAME")
            admin_email = os.getenv("ADMIN_EMAIL")
            if not sender or not admin_email:
                flash(
                    "Message received, but email delivery is not configured yet."
                    " Add MAIL_USERNAME and ADMIN_EMAIL in .env.",
                    "warning",
                )
                return redirect(url_for("contact"))

            msg = EmailMessage()
            msg["Subject"] = f"New D-Adda contact from {form.name.data}"
            msg["From"] = sender
            msg["To"] = admin_email
            msg["Reply-To"] = form.email.data
            msg.set_content(
                "\n".join(
                    [
                        "You received a new message from the D-Adda website.",
                        "",
                        f"Name: {form.name.data}",
                        f"Email: {form.email.data}",
                        "",
                        "Message:",
                        form.message.data,
                    ]
                )
            )

            try:
                smtp_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
                smtp_port = int(os.getenv("MAIL_PORT", "587"))
                use_tls = os.getenv("MAIL_USE_TLS", "True").lower() == "true"
                password = os.getenv("MAIL_PASSWORD", "")

                with smtplib.SMTP(smtp_server, smtp_port, timeout=15) as server:
                    if use_tls:
                        server.starttls()
                    if sender and password:
                        server.login(sender, password)
                    server.send_message(msg)

                flash("Message sent. We will get back to you soon.", "success")
            except Exception:
                app.logger.exception("Failed to send contact email")
                flash(
                    "Message saved in spirit, but email sending failed."
                    " Please verify SMTP env settings.",
                    "danger",
                )
            return redirect(url_for("contact"))

        if request.method == "POST":
            flash("Please fix the form errors and try again.", "danger")

        return render_template(
            "contact.html",
            page_title="Contact | D-Adda",
            form=form,
        )

    @app.errorhandler(404)
    def not_found(_error):
        return render_template("404.html", page_title="404 | D-Adda"), 404

    @app.errorhandler(500)
    def server_error(_error):
        return render_template("500.html", page_title="500 | D-Adda"), 500

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True)
