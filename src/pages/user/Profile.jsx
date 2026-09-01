import { useAuth } from "../../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="bg-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold">
              {user?.sub?.charAt(0)?.toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-semibold">{user?.sub}</h2>

              <p className="text-gray-400">{user?.role}</p>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-6">
            <p className="text-gray-400">Username</p>

            <p className="text-lg mt-1">{user?.sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
