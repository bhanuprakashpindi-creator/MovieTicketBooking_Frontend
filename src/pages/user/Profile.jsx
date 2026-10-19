import { useEffect, useState } from "react";
import { getProfile } from "../../api/authApi";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getProfile();
        console.log("User Profile Info:", response.data);
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-slate-900 text-white">
        <p className="text-gray-400 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-slate-900 text-white">
        <p className="text-red-400 text-lg">{error || "Profile not found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-red-500 font-semibold uppercase tracking-wider">Account</p>
          <h1 className="text-4xl font-bold mt-1">My Profile</h1>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-slate-950/70 p-8 text-center border-b border-slate-700">
            <div className="w-24 h-24 mx-auto rounded-full bg-red-600 text-white flex items-center justify-center text-4xl font-bold mb-4 shadow-lg">
              {profile.userName?.charAt(0).toUpperCase()}
            </div>

            <h2 className="text-2xl font-bold">{profile.userName}</h2>

            <span className="inline-block mt-2 bg-green-500/20 border border-green-500/40 text-green-400 px-4 py-1 rounded-full text-sm font-semibold">
              {profile.role}
            </span>
          </div>

          {/* Profile Information */}
          <div className="p-8">
            <h3 className="text-lg font-semibold text-gray-200 mb-6 border-b border-slate-700/60 pb-3">
              Account Information
            </h3>

            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Username</p>
                <p className="text-lg font-medium text-white mt-1">
                  {profile.userName}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Email Address</p>
                <p className="text-lg font-medium text-white mt-1">
                  {profile.email}
                </p>
              </div>

              {profile.phoneNumber && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Phone Number</p>
                  <p className="text-lg font-medium text-white mt-1">
                    {profile.phoneNumber}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400">Account Type</p>
                <p className="text-lg font-medium text-white mt-1">
                  {profile.role}
                </p>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-slate-700/80 mt-8 pt-6 text-center">
              <p className="text-gray-400 text-sm">Movie Ticket Booking System Account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
