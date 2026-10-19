import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        setProfile(response.data);
      } catch (err) {
        console.error("Failed To Fetch User Info:", err);
        setError("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-bg-primary text-text-primary px-4">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-20 h-20 bg-bg-surface rounded-full mx-auto" />
          <div className="h-6 bg-bg-surface rounded-lg w-40 mx-auto" />
          <div className="h-4 bg-bg-surface rounded-lg w-28 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-bg-primary text-text-primary px-4">
        <div className="text-center p-8 bg-bg-surface border border-border rounded-2xl max-w-md shadow-card">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-accent-primary font-semibold mb-4">{error || "Profile not found."}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-accent-primary hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = profile.role === "ROLE_ADMIN" || profile.role === "ADMIN" || user?.role === "ROLE_ADMIN";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-bg-primary text-text-primary px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3.5 py-1 rounded-full text-xs font-bold text-accent-primary uppercase tracking-widest mb-3">
            Account Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
            My Profile
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1">
            Manage your account credentials, security, and movie reservations.
          </p>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-bg-surface border border-border rounded-3xl shadow-card overflow-hidden">
          {/* Card Banner & Avatar */}
          <div className="bg-gradient-to-r from-bg-elevated via-bg-surface to-bg-elevated p-8 text-center border-b border-border relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-accent-primary to-accent-hover text-white flex items-center justify-center text-4xl font-black mb-4 shadow-glow-red ring-4 ring-bg-surface">
              {profile.userName?.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-2xl font-black text-text-primary">
              {profile.userName}
            </h2>
            <p className="text-xs text-text-muted mt-1">{profile.email}</p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-emerald/15 text-accent-emerald border border-accent-emerald/30">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald" />
                {profile.role || "MEMBER"}
              </span>

              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-accent-gold/15 text-accent-gold border border-accent-gold/30">
                  ★ ADMIN PRIVILEGES
                </span>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              Personal Information
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-bg-elevated border border-border p-4 rounded-2xl">
                <p className="text-xs text-text-muted font-medium">Username</p>
                <p className="text-base font-bold text-text-primary mt-1">
                  {profile.userName}
                </p>
              </div>

              <div className="bg-bg-elevated border border-border p-4 rounded-2xl">
                <p className="text-xs text-text-muted font-medium">Email Address</p>
                <p className="text-base font-bold text-text-primary mt-1 truncate">
                  {profile.email}
                </p>
              </div>

              {profile.phoneNumber && (
                <div className="bg-bg-elevated border border-border p-4 rounded-2xl">
                  <p className="text-xs text-text-muted font-medium">Phone Number</p>
                  <p className="text-base font-bold text-text-primary mt-1">
                    {profile.phoneNumber}
                  </p>
                </div>
              )}

              <div className="bg-bg-elevated border border-border p-4 rounded-2xl">
                <p className="text-xs text-text-muted font-medium">Role Access</p>
                <p className="text-base font-bold text-accent-gold mt-1">
                  {profile.role}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
                Quick Shortcuts
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                <Link
                  to="/my-bookings"
                  className="p-4 rounded-2xl bg-bg-elevated hover:bg-bg-surface border border-border hover:border-accent-primary/40 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎟️</span>
                    <div>
                      <p className="font-bold text-sm text-text-primary group-hover:text-accent-primary transition">
                        My Bookings
                      </p>
                      <p className="text-xs text-text-muted">View past and active tickets</p>
                    </div>
                  </div>
                  <span className="text-text-muted group-hover:text-accent-primary transition">→</span>
                </Link>

                <Link
                  to="/movies"
                  className="p-4 rounded-2xl bg-bg-elevated hover:bg-bg-surface border border-border hover:border-accent-primary/40 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🎬</span>
                    <div>
                      <p className="font-bold text-sm text-text-primary group-hover:text-accent-primary transition">
                        Browse Movies
                      </p>
                      <p className="text-xs text-text-muted">Explore new releases</p>
                    </div>
                  </div>
                  <span className="text-text-muted group-hover:text-accent-primary transition">→</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="sm:col-span-2 p-4 rounded-2xl bg-accent-gold/10 hover:bg-accent-gold/20 border border-accent-gold/30 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚙️</span>
                      <div>
                        <p className="font-bold text-sm text-accent-gold">
                          Admin Management Portal
                        </p>
                        <p className="text-xs text-text-muted">
                          Manage movies, theaters, screens, and shows
                        </p>
                      </div>
                    </div>
                    <span className="text-accent-gold">→</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Logout Action */}
            <div className="pt-4 border-t border-border flex justify-end">
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-white border border-accent-primary/30 rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
