import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Movies", path: "/admin/movies", icon: "🎬" },
    { name: "Theaters", path: "/admin/theaters", icon: "🏢" },
    { name: "Screens", path: "/admin/screens", icon: "🎞️" },
    { name: "Seats", path: "/admin/seats", icon: "💺" },
    { name: "Shows", path: "/admin/shows", icon: "🎭" },
    { name: "Bookings", path: "/admin/bookings", icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      {/* Top Admin Header */}
      <header className="h-16 bg-bg-surface/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
        {/* Left: Mobile hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-bg-elevated text-text-secondary hover:text-text-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-gold to-yellow-500 flex items-center justify-center text-lg shadow-sm">
              👑
            </div>
            <div>
              <h1 className="font-black text-base text-text-primary leading-tight">
                MovieBooking
              </h1>
              <span className="text-[10px] text-accent-gold font-bold uppercase tracking-wider block">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: User info + Logout */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:inline-flex items-center gap-2 text-xs text-text-muted bg-bg-elevated border border-border px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-accent-emerald" />
              <span>{user.sub || user.userName || "Admin"}</span>
            </span>
          )}

          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-bg-elevated hover:bg-bg-surface border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition"
          >
            <span>🏠</span>
            <span>View Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-accent-primary/10 hover:bg-accent-primary border border-accent-primary/30 text-xs font-bold text-accent-primary hover:text-white transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Admin Area */}
      <div className="flex flex-1 min-h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <aside className="w-64 bg-bg-surface border-r border-border hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-bold text-text-muted px-3 mb-2">
              Management
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/admin"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                      isActive
                        ? "bg-accent-gold text-bg-primary shadow-sm font-bold"
                        : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                    }`
                  }
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Sidebar Footer Link */}
          <div className="pt-4 border-t border-border">
            <Link
              to="/"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-text-muted hover:bg-bg-elevated hover:text-text-primary transition"
            >
              <span>🌐</span>
              <span>Back to Customer Portal</span>
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="w-64 bg-bg-surface border-r border-border h-full p-4 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                  <span className="text-xs uppercase font-bold tracking-wider text-accent-gold">
                    Admin Navigation
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-text-muted hover:text-text-primary p-1"
                  >
                    ✕
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/admin"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                          isActive
                            ? "bg-accent-gold text-bg-primary shadow-sm font-bold"
                            : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                        }`
                      }
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-bg-elevated hover:text-text-primary transition"
                >
                  <span>🏠</span>
                  <span>Customer Portal</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 min-w-0 bg-bg-primary overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;