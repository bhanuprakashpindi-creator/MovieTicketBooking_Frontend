function AdminDashboard() {
  const cards = [
    {
      title: "Movies",
      icon: "🎬",
      description: "Add, update and delete movies.",
    },
    {
      title: "Theaters",
      icon: "🏢",
      description: "Manage theaters.",
    },
    {
      title: "Screens",
      icon: "🎞️",
      description: "Manage theater screens.",
    },
    {
      title: "Seats",
      icon: "💺",
      description: "Manage screen seats.",
    },
    {
      title: "Shows",
      icon: "🎭",
      description: "Schedule movie shows.",
    },
    {
      title: "Bookings",
      icon: "📊",
      description: "View bookings.",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <p className="text-yellow-400 font-semibold uppercase tracking-wider">
          Administration
        </p>

        <h1 className="text-4xl font-bold mt-2">Admin Dashboard</h1>

        <p className="text-gray-400 mt-2 mb-10">
          Manage your movie booking system.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.title} className="bg-slate-800 p-6 rounded-2xl">
              <div className="text-4xl mb-4">{card.icon}</div>

              <h2 className="text-xl font-semibold mb-2">{card.title}</h2>

              <p className="text-gray-400">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
