import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white">
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-red-500 font-semibold uppercase tracking-widest mb-4">
          Your Cinema Experience
        </p>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Book Your Next
          <span className="text-red-500"> Movie</span>
        </h1>

        <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-10">
          Discover movies, explore shows, choose your seats and book your
          tickets — all in one place.
        </p>

        <div className="flex justify-center gap-4">
          <Link
            to="/movies"
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition">
            Explore Movies
          </Link>

          <Link
            to="/register"
            className="border border-gray-600 hover:border-white px-6 py-3 rounded-lg transition">
            Create Account
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-800 p-8 rounded-2xl">
            <div className="text-4xl mb-4">🎬</div>

            <h2 className="text-xl font-semibold mb-2">Discover Movies</h2>

            <p className="text-gray-400">
              Browse movies and find your favorite ones.
            </p>
          </div>

          <div className="bg-slate-800 p-8 rounded-2xl">
            <div className="text-4xl mb-4">💺</div>

            <h2 className="text-xl font-semibold mb-2">Choose Your Seat</h2>

            <p className="text-gray-400">
              Select your preferred seats for every show.
            </p>
          </div>

          <div className="bg-slate-800 p-8 rounded-2xl">
            <div className="text-4xl mb-4">🎟️</div>

            <h2 className="text-xl font-semibold mb-2">Easy Booking</h2>

            <p className="text-gray-400">
              Book your tickets quickly and easily.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
