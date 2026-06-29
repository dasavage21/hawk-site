import { useState, type FormEvent } from "react";

export interface ContactFormProps {
  /** The business ID this form should submit to */
  businessId: string;
  /** Optional CSS class name for styling the container */
  className?: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

/**
 * Reusable contact form component for local business websites.
 *
 * Collects name, email, phone, and message, then posts them to the
 * /api/leads endpoint. Displays a success message after submission.
 * The hidden business_id field ensures the lead is attributed correctly.
 */
export function ContactForm({ businessId, className = "" }: ContactFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId,
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
          source: "contact-form",
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit");
      }

      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  };

  if (status === "success") {
    return (
      <div className={`rounded-lg bg-green-50 p-8 text-center ${className}`}>
        <div className="mb-3 text-4xl">✅</div>
        <h3 className="mb-2 text-xl font-semibold text-green-800">
          Thank You!
        </h3>
        <p className="text-green-700">
          Your message has been received. We'll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>

      <div>
        <label
          htmlFor="contact-name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Name *
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Email *
        </label>
        <input
          id="contact-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="contact-phone"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Phone
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          rows={4}
          value={form.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="How can we help you?"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending..." : "Send Message"}
      </button>

      {status === "error" && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage || "Failed to send. Please try again."}
        </p>
      )}
    </form>
  );
}