import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authApi";

function Register() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerUser(formData);
      setSuccess("Account created successfully! Redirecting you to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration Failed:", err.response?.data);
      setError(err.response?.data?.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-bg-surface border border-border p-8 sm:p-10 rounded-3xl shadow-card">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-primary/10 border border-accent-primary/30 text-accent-primary flex items-center justify-center text-2xl mb-3">
            🎟️
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Create an Account
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Join MovieBooking to reserve cinema tickets in seconds
          </p>
        </div>

        {error && (
          <div className="bg-accent-primary/10 border border-accent-primary/30 text-accent-primary px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reg-username"
              className="block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-1.5"
            >
              Username *
            </label>
            <input
              id="reg-username"
              type="text"
              name="userName"
              placeholder="e.g. johndoe"
              value={formData.userName}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-sm transition"
            />
          </div>

          <div>
            <label
              htmlFor="reg-email"
              className="block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-1.5"
            >
              Email Address *
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-sm transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="reg-password"
                className="block text-xs uppercase tracking-wider font-semibold text-text-secondary"
              >
                Password *
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-text-muted hover:text-text-primary transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="reg-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-sm transition"
            />
          </div>

          <div>
            <label
              htmlFor="reg-phone"
              className="block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-1.5"
            >
              Phone Number *
            </label>
            <input
              id="reg-phone"
              type="tel"
              name="phoneNumber"
              placeholder="e.g. 9876543210"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              autoComplete="tel"
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm shadow-button transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="text-text-muted text-center text-sm mt-8 pt-6 border-t border-border">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-accent-primary hover:text-accent-hover font-semibold transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
