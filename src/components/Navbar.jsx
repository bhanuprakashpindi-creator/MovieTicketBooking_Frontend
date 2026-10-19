import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-slate-950 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}

        <Link to="/" className="text-2xl font-bold text-red-500">
          Movie<span className="text-white">Booking</span>
        </Link>

        {/* Navigation */}

        <div className="flex items-center gap-6">
          <Link to="/" className="text-gray-300 hover:text-white transition">
            Home
          </Link>

          {isAuthenticated && (
            <Link
              to="/movies"
              className="text-gray-300 hover:text-white transition">
              Movies
            </Link>
          )}

          {!isAuthenticated && (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition">
                Login
              </Link>

              <Link
                to="/register"
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
                Register
              </Link>
            </>
          )}
          {isAuthenticated && (
            <>
              <Link
                to="/my-bookings"
                className="text-gray-300 hover:text-white transition">
                My Bookings
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link
                to="/profile"
                className="text-gray-300 hover:text-white transition">
                Profile
              </Link>

              {user?.role === "ROLE_ADMIN" && (
                <Link
                  to="/admin"
                  className="text-yellow-400 hover:text-yellow-300 transition">
                  Admin
                </Link>
              )}

              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
