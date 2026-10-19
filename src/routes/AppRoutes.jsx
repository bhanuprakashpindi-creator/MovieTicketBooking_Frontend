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
function AppRoutes() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* Movies */}
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
      {/* User */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      {/* {Theaters} */}
      <Route
        path="/movies/:movieId/theaters"
        element={
          <ProtectedRoute>
            <Theaters />
          </ProtectedRoute>
        }
      />
      {/* {Shows} */}
      <Route
        path="/movies/:movieId/shows"
        element={
          <ProtectedRoute>
            <Shows />
          </ProtectedRoute>
        }
      />
      {/* {TheaterShows} */}
      <Route
        path="/movies/:movieId/theaters/:theaterId"
        element={
          <ProtectedRoute>
            <TheaterShows />
          </ProtectedRoute>
        }
      />
      {/* {Seats} */}
      <Route
        path="/shows/:showId"
        element={
          <ProtectedRoute>
            <Seats />
          </ProtectedRoute>
        }
      />
      {/* {BookingConfirmation} */}
      <Route
        path="/booking/:showId"
        element={
          <ProtectedRoute>
            <BookingConfirmation />
          </ProtectedRoute>
        }
      />
      {/* {BookingSuccess} */}
      <Route
        path="/booking/success/:bookingId"
        element={
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        }
      />
      {/* MyBookings */}
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }></Route>
      <Route
        path="/admin/movies"
        element={
          <AdminRoute>
            <AdminMovies />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/theaters"
        element={
          <AdminRoute>
            <AdminTheaters />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/screens"
        element={
          <AdminRoute>
            <AdminScreens />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/seats"
        element={
          <AdminRoute>
            <AdminSeats />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/shows"
        element={
          <AdminRoute>
            <AdminShows />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <AdminRoute>
            <AdminBookings />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
