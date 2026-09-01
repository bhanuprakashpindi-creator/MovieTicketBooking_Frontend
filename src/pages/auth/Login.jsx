import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const response = await loginUser({
        userName,
        password,
      });

      const token = response.data.token;

      login(token);

      console.log("Login Successful");

      navigate("/");
    } catch (error) {
      console.error("Login Failed:", error.response?.data);

      setError(error.response?.data?.message || "Invalid username or password");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white text-center">
          Welcome Back
        </h1>

        <p className="text-gray-400 text-center mt-2 mb-8">
          Login to continue booking movies
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-2">Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition">
            Login
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-500 hover:text-red-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
