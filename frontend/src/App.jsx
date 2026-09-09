
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

import Navbar from "./components/Navbar.jsx";

import Home from "./pages/Home.jsx";
import Chapters from "./pages/Chapters.jsx";
import ChapterReader from "./pages/ChapterReader.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";
import ShlokManagement from "./pages/ShlokManagement.jsx";

import ForgotPassword from "./pages/ForgotPassword";

import FavouriteShlokas from "./pages/FavouriteShlokas.jsx";

import QuizManagement from "./pages/QuizManagement.jsx";

import Quiz from "./pages/Quiz.jsx";

import QuizCategory from "./pages/QuizCategory.jsx";

import History from "./pages/History.jsx";

import QuizResult from "./pages/QuizResult";

// =====================================================
// PROTECTED ROUTE COMPONENT
// =====================================================

function ProtectedRoute({ children, message }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const targetPath = location.pathname + location.search;
    const redirectMessage =
      message || "આ પેજનો ઉપયોગ કરવા માટે Login કરવું જરૂરી છે.";

    try {
      sessionStorage.setItem(
        "authRedirect",
        JSON.stringify({
          from: targetPath,
          message: redirectMessage,
        })
      );
    } catch (e) {}

    return (
      <Navigate
        to="/login"
        state={{
          from: targetPath,
          message: redirectMessage,
        }}
        replace
      />
    );
  }

  return children;
}

// =====================================================
// ADMIN ROUTE COMPONENT
// =====================================================

function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const targetPath = location.pathname + location.search;
    const redirectMessage = "Admin પેનલનો ઉપયોગ કરવા માટે Login કરવું જરૂરી છે.";

    try {
      sessionStorage.setItem(
        "authRedirect",
        JSON.stringify({
          from: targetPath,
          message: redirectMessage,
        })
      );
    } catch (e) {}

    return (
      <Navigate
        to="/login"
        state={{
          from: targetPath,
          message: redirectMessage,
        }}
        replace
      />
    );
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>

            {/* =================================================
                HOME
            ================================================= */}

            <Route
              path="/"
              element={<Home />}
            />


            {/* =================================================
                18 CHAPTERS
            ================================================= */}

            <Route
              path="/chapters"
              element={<Chapters />}
            />


            {/* =================================================
                CHAPTER READER
            ================================================= */}

            <Route
              path="/chapter/:chapterNumber"
              element={<ChapterReader />}
            />


            {/* =================================================
                AUTHENTICATION
            ================================================= */}

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />


            {/* =================================================
                PROFILE (PROTECTED)
            ================================================= */}

            <Route
              path="/profile"
              element={
                <ProtectedRoute message="તમારી Profile જોવા માટે Login કરવું જરૂરી છે.">
                  <Profile />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                FAVOURITE SHLOKAS (PROTECTED)
            ================================================= */}

            <Route
              path="/favorites"
              element={
                <ProtectedRoute message="મનપસંદ શ્લોક જોવા માટે Login કરવું જરૂરી છે.">
                  <FavouriteShlokas />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                ADMIN DASHBOARD (ADMIN PROTECTED)
            ================================================= */}

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />


            {/* =================================================
                ADMIN → SHLOK MANAGEMENT (ADMIN PROTECTED)
            ================================================= */}

            <Route
              path="/admin/shloks"
              element={
                <AdminRoute>
                  <ShlokManagement />
                </AdminRoute>
              }
            />


            {/* =================================================
                ADMIN → QUIZ MANAGEMENT (ADMIN PROTECTED)
            ================================================= */}

            <Route
              path="/admin/quiz"
              element={
                <AdminRoute>
                  <QuizManagement />
                </AdminRoute>
              }
            />


            {/* =================================================
                QUIZ CATEGORY SELECTION (PROTECTED)
            ================================================= */}

            <Route
              path="/quiz"
              element={
                <ProtectedRoute message="Quiz રમવા માટે Login કરવું જરૂરી છે.">
                  <QuizCategory />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                QUIZ PLAY (PROTECTED)
            ================================================= */}

            <Route
              path="/quiz/play"
              element={
                <ProtectedRoute message="Quiz રમવા માટે Login કરવું જરૂરી છે.">
                  <Quiz />
                </ProtectedRoute>
              }
            />


            {/* =================================================
                QUIZ CATEGORY (PROTECTED)
            ================================================= */}

            <Route
              path="/quiz-category"
              element={
                <ProtectedRoute message="Quiz રમવા માટે Login કરવું જરૂરી છે.">
                  <QuizCategory />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                QUIZ HISTORY (PROTECTED)
            ================================================= */}

            <Route
              path="/history"
              element={
                <ProtectedRoute message="તમારી History જોવા માટે Login કરવું જરૂરી છે.">
                  <History />
                </ProtectedRoute>
              }
            />

            {/* =================================================
                QUIZ RESULTS (PROTECTED)
            ================================================= */}

            <Route
              path="/quiz-results"
              element={
                <ProtectedRoute message="Quiz Results જોવા માટે Login કરવું જરૂરી છે.">
                  <QuizResult />
                </ProtectedRoute>
              }
            />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

