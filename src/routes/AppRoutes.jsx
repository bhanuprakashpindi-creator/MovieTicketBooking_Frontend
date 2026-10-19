import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Profile from "../pages/user/Profile";

import AdminDashboard from "../pages/admin/AdminDashboard";

import Movies from "../pages/movie/Movies";
import MovieDetails from "../pages/movie/MovieDetails";

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import Theaters from "../pages/theater/Theaters";
import Shows from "../pages/show/Shows";
import TheaterShows from "../pages/theater/TheaterShows";
import Seats from "../pages/seat/Seats";

import BookingConfirmation from "../pages/booking/BookingConfirmation";
import BookingSuccess from "../pages/booking/BookingSuccess";
import MyBookings from "../pages/booking/MyBookings";

import AdminMovies from "../pages/admin/AdminMovies";
import AdminTheaters from "../pages/admin/AdminTheaters";
import AdminScreens from "../pages/admin/AdminScreens";
import AdminSeats from "../pages/admin/AdminSeats";
import AdminShows from "../pages/admin/AdminShows";
import AdminBookings from "../pages/admin/AdminBookings";

import AdminLayout from "../components/admin/AdminLayout";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>

      {/* ================= HOME ================= */}
      <Route path="/" element={<Home />} />


      {/* ================= AUTHENTICATION ================= */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />


      {/* ================= USER MOVIES ================= */}
      <Route
        path="/movies"
        element={
          <ProtectedRoute>
            <Movies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/movies/:movieId"
        element={
          <ProtectedRoute>
            <MovieDetails />
          </ProtectedRoute>
        }
      />


      {/* ================= USER PROFILE ================= */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />


      {/* ================= USER THEATERS ================= */}
      <Route
        path="/movies/:movieId/theaters"
        element={
          <ProtectedRoute>
            <Theaters />
          </ProtectedRoute>
        }
      />


      {/* ================= USER SHOWS ================= */}
      <Route
        path="/movies/:movieId/shows"
        element={
          <ProtectedRoute>
            <Shows />
          </ProtectedRoute>
        }
      />

      <Route
        path="/movies/:movieId/theaters/:theaterId"
        element={
          <ProtectedRoute>
            <TheaterShows />
          </ProtectedRoute>
        }
      />


      {/* ================= USER SEATS ================= */}
      <Route
        path="/shows/:showId"
        element={
          <ProtectedRoute>
            <Seats />
          </ProtectedRoute>
        }
      />


      {/* ================= BOOKING ================= */}
      <Route
        path="/booking/:showId"
        element={
          <ProtectedRoute>
            <BookingConfirmation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking/success/:bookingId"
        element={
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />


      {/* ================================================= */}
      {/* ================= ADMIN SECTION ================= */}
      {/* ================================================= */}


      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />


      {/* Admin Movies */}
      <Route
        path="/admin/movies"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminMovies />
            </AdminLayout>
          </AdminRoute>
        }
      />


      {/* Admin Theaters */}
      <Route
        path="/admin/theaters"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminTheaters />
            </AdminLayout>
          </AdminRoute>
        }
      />


      {/* Admin Screens */}
      <Route
        path="/admin/screens"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminScreens />
            </AdminLayout>
          </AdminRoute>
        }
      />


      {/* Admin Seats */}
      <Route
        path="/admin/seats"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminSeats />
            </AdminLayout>
          </AdminRoute>
        }
      />


      {/* Admin Shows */}
      <Route
        path="/admin/shows"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminShows />
            </AdminLayout>
          </AdminRoute>
        }
      />


      {/* Admin Bookings */}
      <Route
        path="/admin/bookings"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminBookings />
            </AdminLayout>
          </AdminRoute>
        }
      />

      {/* ================= 404 NOT FOUND ================= */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default AppRoutes;