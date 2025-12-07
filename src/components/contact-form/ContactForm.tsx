import { useState } from "preact/hooks";
import { PaperPlane } from "@icons/PaperPlane";
import "./contact-form.scss";

const PAGECLIP_FORM_NAME = import.meta.env.PUBLIC_PAGECLIP_FORM_NAME;
const PAGECLIP_SITE_KEY = import.meta.env.PUBLIC_PAGECLIP_SITE_KEY;

declare global {
  interface Window {
    Pageclip: any;
  }
}

export function ContactForm() {
  const isBrowser = typeof window !== "undefined";
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formResponse, setFormResponse] = useState("");

  const contactFormSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    if (!event.target) {
      return;
    }
    const formData = new FormData(event.target as HTMLFormElement);
    const contactForm: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      contactForm[key] = value;
    }

    if (isBrowser && window.hasOwnProperty("Pageclip")) {
      setIsFormSubmitting(true);
      window.Pageclip.send(
        PAGECLIP_SITE_KEY,
        PAGECLIP_FORM_NAME,
        contactForm,
        (error: any, response: any) => {
          if (error) {
            setFormResponse("Sorry! Please try again after sometime.");
          } else if (response && response.data === "ok") {
            setFormResponse("Great! I will get back to you soon!");
          }
          setIsFormSubmitting(false);
        },
      );
    } else if (isBrowser && !window.hasOwnProperty("Pageclip")) {
      setFormResponse(
        "Sorry! Your content blocker has probably blocked Pageclip (pageclip.js).",
      );
      setIsFormSubmitting(false);
    }
    setTimeout(() => {
      setFormResponse("");
    }, 15000);
  };

  return (
    <section class="contact">
      <div class="container">
        <h2 class="header-2">Get in touch</h2>
        <form class="contact-form" onSubmit={contactFormSubmit}>
          <div class="form-item input-field">
            <label for="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              required
              placeholder="Your name"
              autoComplete="name"
            />
          </div>
          <div class="form-item input-field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="Your email"
              autoComplete="email"
            />
          </div>
          <div class="form-item input-field message">
            <label for="message">Message</label>
            <textarea
              id="message"
              name="message"
              required
              placeholder="Your message..."
            ></textarea>
          </div>
          <div className="form-item submit">
            <button
              className="accent-button submit"
              type="submit"
              disabled={isFormSubmitting === true}
            >
              {isFormSubmitting ? (
                <span className="loader"></span>
              ) : (
                <PaperPlane className="icon" />
              )}
              <span>Send</span>
            </button>
          </div>
          <div>{formResponse}</div>
        </form>
      </div>
    </section>
  );
}
