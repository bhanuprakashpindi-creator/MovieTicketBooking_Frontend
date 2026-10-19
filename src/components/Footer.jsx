import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center text-white font-black text-xs">
              M
            </div>
            <span className="text-sm font-semibold text-gray-400">
              Movie<span className="text-gray-300">Booking</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-xs text-text-muted">
            <Link to="/movies" className="hover:text-gray-300 transition">
              Movies
            </Link>
            <Link to="/my-bookings" className="hover:text-gray-300 transition">
              My Bookings
            </Link>
            <Link to="/profile" className="hover:text-gray-300 transition">
              Profile
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} MovieBooking
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
