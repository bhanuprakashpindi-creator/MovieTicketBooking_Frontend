import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  getSeatsByScreen,
  createSeat,
  updateSeat,
  deleteSeat,
} from "../../api/seatApi";
import { getAllScreens, getScreenById } from "../../api/screenApi";
import { getAllTheaters } from "../../api/theaterApi";

const SEAT_TYPES = ["REGULAR", "PREMIUM", "RECLINER"];

function AdminSeats() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlScreenId = searchParams.get("screenId") || "";

  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [selectedScreenId, setSelectedScreenId] = useState(urlScreenId);
  const [currentScreen, setCurrentScreen] = useState(null);

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form states
  const [singleSeatNumber, setSingleSeatNumber] = useState("");
  const [singleSeatType, setSingleSeatType] = useState("REGULAR");
  const [editingSeat, setEditingSeat] = useState(null);

  // Bulk Generator states
  const [showBulkGenerator, setShowBulkGenerator] = useState(false);
  const [bulkRows, setBulkRows] = useState("A,B,C,D,E");
  const [bulkCols, setBulkCols] = useState(10);
  const [bulkType, setBulkType] = useState("REGULAR");

  const [alert, setAlert] = useState({ type: "", message: "" });

  // Load theaters and screens on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [theatersRes, screensRes] = await Promise.all([
          getAllTheaters(),
          getAllScreens(),
        ]);
        const allTheaters = theatersRes.data || [];
        const allScreens = screensRes.data || [];

        setTheaters(allTheaters);
        setScreens(allScreens);

        if (!selectedScreenId && allScreens.length > 0) {
          const firstId = String(allScreens[0].screenId);
          setSelectedScreenId(firstId);
          setSearchParams({ screenId: firstId });
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };

    fetchMetadata();
  }, [selectedScreenId, setSearchParams]);

  // Load seats whenever selectedScreenId changes
  const fetchScreenSeats = async () => {
    if (!selectedScreenId) return;

    try {
      setLoading(true);
      const [seatsRes, screenRes] = await Promise.all([
        getSeatsByScreen(selectedScreenId),
        getScreenById(selectedScreenId).catch(() => ({ data: null })),
      ]);

      setSeats(seatsRes.data || []);
      if (screenRes.data) {
        setCurrentScreen(screenRes.data);
      } else {
        const found = screens.find((s) => String(s.screenId) === String(selectedScreenId));
        if (found) setCurrentScreen(found);
      }
    } catch (err) {
      console.error("Failed to load screen seats:", err);
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenSeats();
  }, [selectedScreenId]);

  const handleScreenChange = (e) => {
    const id = e.target.value;
    setSelectedScreenId(id);
    setEditingSeat(null);
    setAlert({ type: "", message: "" });
    if (id) {
      setSearchParams({ screenId: id });
    } else {
      setSearchParams({});
    }
  };

  // Add or update single seat
  const handleSingleSeatSubmit = async (e) => {
    e.preventDefault();
    if (!selectedScreenId) {
      setAlert({ type: "error", message: "Please select a screen first." });
      return;
    }

    setSubmitting(true);
    setAlert({ type: "", message: "" });

    const seatPayload = {
      screenId: Number(selectedScreenId),
      seatNumber: singleSeatNumber.toUpperCase().trim(),
      seatType: singleSeatType,
    };

    try {
      if (editingSeat) {
        await updateSeat(editingSeat.seatId, seatPayload);
        setAlert({
          type: "success",
          message: `Seat "${seatPayload.seatNumber}" updated successfully!`,
        });
        setEditingSeat(null);
      } else {
        await createSeat(seatPayload);
        setAlert({
          type: "success",
          message: `Seat "${seatPayload.seatNumber}" added successfully!`,
        });
      }
      setSingleSeatNumber("");
      await fetchScreenSeats();
    } catch (err) {
      console.error("Failed to save seat:", err);
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Failed to save seat.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Generator
  const handleBulkGenerate = async (e) => {
    e.preventDefault();
    if (!selectedScreenId) {
      setAlert({ type: "error", message: "Please select a screen first." });
      return;
    }

    const rowLetters = bulkRows
      .split(",")
      .map((r) => r.trim().toUpperCase())
      .filter(Boolean);

    if (rowLetters.length === 0) {
      setAlert({ type: "error", message: "Please provide valid row letters." });
      return;
    }

    const numCols = Number(bulkCols) || 10;
    const confirmGen = window.confirm(
      `This will generate ${rowLetters.length * numCols} seats (${rowLetters.join(", ")} with ${numCols} seats each) for this screen. Proceed?`,
    );
    if (!confirmGen) return;

    setGenerating(true);
    setAlert({ type: "", message: "" });

    let createdCount = 0;
    try {
      for (const row of rowLetters) {
        for (let col = 1; col <= numCols; col++) {
          const seatNum = `${row}${col}`;
          // Check if seat already exists to prevent duplicate
          const alreadyExists = seats.some((s) => s.seatNumber === seatNum);
          if (!alreadyExists) {
            await createSeat({
              screenId: Number(selectedScreenId),
              seatNumber: seatNum,
              seatType: bulkType,
            });
            createdCount++;
          }
        }
      }
      setAlert({
        type: "success",
        message: `Successfully generated ${createdCount} seats for the screen!`,
      });
      setShowBulkGenerator(false);
      await fetchScreenSeats();
    } catch (err) {
      console.error("Bulk generation error:", err);
      setAlert({
        type: "error",
        message: err.response?.data?.message || "Error during bulk seat generation.",
      });
    } finally {
      setGenerating(false);
    }
  };

  // Delete seat
  const handleDeleteSeat = async (seat) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete seat ${seat.seatNumber}?`,
    );
    if (!confirmed) return;

    try {
      setDeletingId(seat.seatId);
      setAlert({ type: "", message: "" });
      await deleteSeat(seat.seatId);
      setAlert({
        type: "success",
        message: `Seat ${seat.seatNumber} deleted successfully.`,
      });
      if (editingSeat?.seatId === seat.seatId) {
        setEditingSeat(null);
      }
      await fetchScreenSeats();
    } catch (err) {
      console.error("Failed to delete seat:", err);
      setAlert({
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to delete seat. It may be part of an active show booking.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (seat) => {
    setEditingSeat(seat);
    setSingleSeatNumber(seat.seatNumber);
    setSingleSeatType(seat.seatType || "REGULAR");
    setAlert({ type: "", message: "" });
  };

  // Group seats by row
  const seatRows = seats.reduce((acc, seat) => {
    const row = seat.seatNumber ? seat.seatNumber.charAt(0).toUpperCase() : "OTHER";
    if (!acc[row]) acc[row] = [];
    acc[row].push(seat);
    return acc;
  }, {});

  // Sort seats within each row numerically
  Object.keys(seatRows).forEach((row) => {
    seatRows[row].sort((a, b) => {
      const numA = parseInt(a.seatNumber.slice(1), 10) || 0;
      const numB = parseInt(b.seatNumber.slice(1), 10) || 0;
      return numA - numB;
    });
  });

  const getSeatColor = (type) => {
    switch (type) {
      case "PREMIUM":
        return "bg-purple-600 border-purple-400 text-white hover:bg-purple-500";
      case "RECLINER":
        return "bg-amber-600 border-amber-400 text-white hover:bg-amber-500";
      default:
        return "bg-slate-700 border-slate-600 text-gray-200 hover:bg-slate-600";
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-900 text-white px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link
                to="/admin"
                className="text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition">
                ← Admin Dashboard
              </Link>
              <span className="text-gray-600">|</span>
              <Link
                to="/admin/screens"
                className="text-sm font-semibold text-gray-400 hover:text-white transition">
                🎞️ Screens
              </Link>
            </div>
            <h1 className="text-4xl font-bold">Seat Management</h1>
            <p className="text-gray-400 mt-1">
              Configure and preview physical seating layouts for each screen.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkGenerator(!showBulkGenerator)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-5 py-3 rounded-xl text-sm transition shadow-lg">
              {showBulkGenerator ? "✕ Close Generator" : "⚡ Rapid Seat Generator"}
            </button>
            <div className="bg-slate-800 border border-slate-700 rounded-xl px-5 py-3 text-center">
              <span className="text-xs uppercase tracking-wider text-gray-400">
                Seats on Screen
              </span>
              <p className="text-2xl font-bold text-yellow-400">{seats.length}</p>
            </div>
          </div>
        </div>

        {/* Global Alert */}
        {alert.message && (
          <div
            className={`mb-8 p-4 rounded-xl border flex items-center justify-between gap-4 ${
              alert.type === "success"
                ? "bg-green-500/10 border-green-500 text-green-400"
                : "bg-red-500/10 border-red-500 text-red-400"
            }`}>
            <span>{alert.message}</span>
            <button
              onClick={() => setAlert({ type: "", message: "" })}
              className="text-sm font-bold opacity-75 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Screen Selector Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="w-full sm:w-96">
            <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
              Select Screen to Manage
            </label>
            <select
              value={selectedScreenId}
              onChange={handleScreenChange}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-400 font-medium">
              <option value="">-- Choose a Screen --</option>
              {screens.map((s) => {
                const t = theaters.find(
                  (th) => String(th.theaterId) === String(s.theaterId || s.theater?.theaterId),
                );
                return (
                  <option key={s.screenId} value={s.screenId}>
                    {s.screenName} {t ? `(${t.theaterName})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {currentScreen && (
            <div className="flex items-center gap-6 text-sm text-gray-300">
              <div>
                <span className="text-gray-400 block text-xs uppercase">Target Capacity</span>
                <span className="font-bold text-white text-base">
                  {currentScreen.totalSeats || 60} seats
                </span>
              </div>
              <div>
                <span className="text-gray-400 block text-xs uppercase">Configured</span>
                <span className="font-bold text-yellow-400 text-base">
                  {seats.length} seats
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Generator Card (Collapsible) */}
        {showBulkGenerator && (
          <div className="bg-slate-800 border border-yellow-500/40 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl">
            <div className="border-b border-slate-700 pb-4 mb-6">
              <h2 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
                ⚡ Rapid Seating Grid Generator
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Quickly batch-create whole rows of seats instead of entering them one-by-one.
              </p>
            </div>

            <form onSubmit={handleBulkGenerate} className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Row Letters (comma-separated)
                </label>
                <input
                  type="text"
                  value={bulkRows}
                  onChange={(e) => setBulkRows(e.target.value)}
                  placeholder="e.g. A,B,C,D,E,F"
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Seats per Row
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={bulkCols}
                  onChange={(e) => setBulkCols(e.target.value)}
                  placeholder="e.g. 10"
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Seat Category / Tier
                </label>
                <select
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white outline-none focus:border-yellow-400">
                  {SEAT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={generating}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-lg disabled:opacity-50 transition">
                  {generating ? "Generating..." : "Generate Seats Layout"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkGenerator(false)}
                  className="bg-slate-700 text-gray-300 px-5 py-2.5 rounded-lg text-sm hover:bg-slate-600 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add / Edit Individual Seat Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-10 shadow-lg">
          <form
            onSubmit={handleSingleSeatSubmit}
            className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                {editingSeat ? "Edit Seat Number" : "New Seat Number"}
              </label>
              <input
                type="text"
                value={singleSeatNumber}
                onChange={(e) => setSingleSeatNumber(e.target.value)}
                placeholder="e.g. A1, B5"
                required
                className="w-36 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-yellow-400 font-bold uppercase"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Seat Tier
              </label>
              <select
                value={singleSeatType}
                onChange={(e) => setSingleSeatType(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white outline-none focus:border-yellow-400">
                {SEAT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2 rounded-lg text-sm disabled:opacity-50 transition">
              {submitting
                ? "Saving..."
                : editingSeat
                  ? "Update Seat"
                  : "+ Add Seat"}
            </button>

            {editingSeat && (
              <button
                type="button"
                onClick={() => {
                  setEditingSeat(null);
                  setSingleSeatNumber("");
                }}
                className="bg-slate-700 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-slate-600 transition">
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Visual Seating Map Layout */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold">Physical Seating Layout</h2>
            <p className="text-sm text-gray-400 mt-1">
              Click any seat below to edit its tier or remove it from the screen.
            </p>
          </div>

          {/* Screen Curve Representation */}
          <div className="mb-14">
            <div className="w-full max-w-2xl mx-auto">
              <div className="h-3 bg-gradient-to-r from-slate-600 via-white to-slate-600 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]"></div>
              <p className="text-center text-gray-400 text-xs mt-3 tracking-widest uppercase">
                SCREEN
              </p>
            </div>
          </div>

          {/* Seating Grid */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Loading seats layout...</p>
            </div>
          ) : Object.keys(seatRows).length === 0 ? (
            <div className="text-center py-16 bg-slate-900/60 border border-slate-700 rounded-2xl max-w-xl mx-auto">
              <p className="text-gray-400 text-lg mb-4">
                No seats configured for this screen yet.
              </p>
              <button
                onClick={() => setShowBulkGenerator(true)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-2.5 rounded-lg text-sm transition">
                ⚡ Launch Rapid Seat Generator
              </button>
            </div>
          ) : (
            <div className="space-y-4 overflow-x-auto pb-6">
              {Object.entries(seatRows).map(([rowLabel, rowSeatList]) => (
                <div key={rowLabel} className="flex justify-center items-center gap-3">
                  <span className="w-8 text-center text-sm font-bold text-gray-400">
                    {rowLabel}
                  </span>

                  <div className="flex gap-2 flex-wrap justify-center">
                    {rowSeatList.map((seat) => (
                      <div
                        key={seat.seatId}
                        className="group relative">
                        <button
                          type="button"
                          onClick={() => handleEditClick(seat)}
                          className={`w-10 h-10 rounded-lg text-xs font-bold border transition duration-150 flex items-center justify-center shadow-md ${getSeatColor(
                            seat.seatType,
                          )} ${
                            editingSeat?.seatId === seat.seatId
                              ? "ring-2 ring-yellow-400 scale-110"
                              : ""
                          }`}>
                          {seat.seatNumber}
                        </button>

                        {/* Quick Delete button on hover */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSeat(seat);
                          }}
                          disabled={deletingId === seat.seatId}
                          title={`Delete ${seat.seatNumber}`}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 hover:bg-red-500 text-white rounded-full text-[10px] items-center justify-center hidden group-hover:flex shadow">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <span className="w-8 text-center text-sm font-bold text-gray-400">
                    {rowLabel}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Seat Tiers Legend */}
          <div className="flex justify-center flex-wrap gap-8 mt-12 pt-6 border-t border-slate-700/80 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-slate-700 border border-slate-600 rounded"></span>
              <span className="text-gray-300">Regular</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-purple-600 border border-purple-400 rounded"></span>
              <span className="text-gray-300">Premium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-amber-600 border border-amber-400 rounded"></span>
              <span className="text-gray-300">Recliner</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSeats;
