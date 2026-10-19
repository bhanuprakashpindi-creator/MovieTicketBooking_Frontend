import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginUser({
        userName,
        password,
      });

      const token = response.data.token;
      login(token);
      navigate("/");
    } catch (err) {
      console.error("Login Failed:", err.response?.data);
      setError(err.response?.data?.message || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-bg-primary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-bg-surface border border-border p-8 sm:p-10 rounded-3xl shadow-card">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-primary/10 border border-accent-primary/30 text-accent-primary flex items-center justify-center text-2xl mb-3">
            🎬
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
            Welcome Back
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Sign in to reserve your cinema tickets
          </p>
        </div>

        {error && (
          <div className="bg-accent-primary/10 border border-accent-primary/30 text-accent-primary px-4 py-3 rounded-xl text-sm mb-6 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="login-username"
              className="block text-xs uppercase tracking-wider font-semibold text-text-secondary mb-2"
            >
              Username
            </label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter your username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-sm transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="login-password"
                className="block text-xs uppercase tracking-wider font-semibold text-text-secondary"
              >
                Password
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
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-bg-elevated border border-border text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white py-3.5 rounded-xl font-bold text-sm shadow-button transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <p className="text-text-muted text-center text-sm mt-8 pt-6 border-t border-border">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-accent-primary hover:text-accent-hover font-semibold transition"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
