import { useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../config";

const Contact = () => {
  const [formData, setFormData] = useState({
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/contact`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }
      toast.success(result.message);
      setFormData({ email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <section>
      <div className="px-4 mx-auto max-w-screen-md">
        <h2 className="heading text-center">Contact Us</h2>
        <p className="mb-8 lg:mb-16 font-light text-center text__para">
          Got a techincal issue? Want to send feedback about a beta feature? Let
          us know.
        </p>
        <form className="space-y-8" onSubmit={submitHandler}>
          <div>
            <label htmlFor="email" className="form__label">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "example@gmail.com")}
              placeholder="example@gmail.com"
              className="form__input mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="subject" className="form__label">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "Let us know how we can help you")}
              placeholder="Let us know how we can help you"
              className="form__input mt-1"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="message" className="form__label">
              Your Message
            </label>
            <textarea
              rows='6'
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) => (e.target.placeholder = "Leave a comment....")}
              placeholder="Leave a comment...."
              className="form__input mt-1"
              required
            />
          </div>
          <button disabled={loading} type="submit" className="btn rounded sm:w-fit">
            {loading ? "Sending..." : "Submit"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
