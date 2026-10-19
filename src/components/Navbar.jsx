import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const closeMobile = () => setMobileOpen(false);

  const linkBase =
    "text-sm font-medium transition-colors duration-200";
  const linkInactive = `${linkBase} text-gray-400 hover:text-white`;
  const linkActiveClass = `${linkBase} text-white`;

  const navLinkClass = ({ isActive }) =>
    isActive ? linkActiveClass : linkInactive;

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            onClick={closeMobile}
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-black text-sm">
              M
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Movie<span className="text-accent">Booking</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <span className="px-3 py-2 rounded-lg hover:bg-white/5">Home</span>
            </NavLink>

            <NavLink to="/movies" className={navLinkClass}>
              <span className="px-3 py-2 rounded-lg hover:bg-white/5">Movies</span>
            </NavLink>

            {isAuthenticated && (
              <NavLink to="/my-bookings" className={navLinkClass}>
                <span className="px-3 py-2 rounded-lg hover:bg-white/5">My Bookings</span>
              </NavLink>
            )}

            {isAuthenticated && user?.role === "ROLE_ADMIN" && (
              <NavLink to="/admin" className={({ isActive }) =>
                isActive
                  ? `${linkBase} text-accent-gold`
                  : `${linkBase} text-accent-gold/70 hover:text-accent-gold`
              }>
                <span className="px-3 py-2 rounded-lg hover:bg-white/5">Admin</span>
              </NavLink>
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-400 hover:text-white px-3 py-2 rounded-lg transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-accent hover:bg-accent-hover text-white px-5 py-2 rounded-lg transition shadow-lg shadow-accent/20"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <NavLink to="/profile" className={navLinkClass}>
                  <span className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5">
                    <span className="w-7 h-7 rounded-full bg-bg-elevated border border-border-light flex items-center justify-center text-xs font-bold text-accent">
                      {user?.sub?.charAt(0).toUpperCase() || "U"}
                    </span>
                    <span className="hidden lg:inline">Profile</span>
                  </span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-400 hover:text-accent border border-border hover:border-accent/40 px-4 py-2 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border animate-slideDown pb-4">
            <div className="flex flex-col gap-1 pt-3">
              <NavLink to="/" end className={navLinkClass} onClick={closeMobile}>
                <span className="block px-3 py-2.5 rounded-lg hover:bg-white/5">Home</span>
              </NavLink>

              <NavLink to="/movies" className={navLinkClass} onClick={closeMobile}>
                <span className="block px-3 py-2.5 rounded-lg hover:bg-white/5">Movies</span>
              </NavLink>

              {isAuthenticated && (
                <>
                  <NavLink to="/my-bookings" className={navLinkClass} onClick={closeMobile}>
                    <span className="block px-3 py-2.5 rounded-lg hover:bg-white/5">My Bookings</span>
                  </NavLink>
                  <NavLink to="/profile" className={navLinkClass} onClick={closeMobile}>
                    <span className="block px-3 py-2.5 rounded-lg hover:bg-white/5">Profile</span>
                  </NavLink>
                </>
              )}

              {isAuthenticated && user?.role === "ROLE_ADMIN" && (
                <NavLink to="/admin" className={navLinkClass} onClick={closeMobile}>
                  <span className="block px-3 py-2.5 rounded-lg hover:bg-white/5 text-accent-gold">Admin Dashboard</span>
                </NavLink>
              )}

              <div className="border-t border-border mt-2 pt-3 px-3">
                {!isAuthenticated ? (
                  <div className="flex gap-3">
                    <Link
                      to="/login"
                      className="flex-1 text-center text-sm font-medium text-gray-300 border border-border py-2.5 rounded-lg hover:bg-white/5 transition"
                      onClick={closeMobile}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="flex-1 text-center text-sm font-semibold bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg transition"
                      onClick={closeMobile}
                    >
                      Register
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full text-sm font-medium text-gray-400 hover:text-accent border border-border hover:border-accent/40 py-2.5 rounded-lg transition"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
