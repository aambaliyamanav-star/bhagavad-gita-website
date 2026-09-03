
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
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
                PROFILE
            ================================================= */}

            <Route
              path="/profile"
              element={<Profile />}
            />


            {/* =================================================
                FAVOURITE SHLOKAS
            ================================================= */}

            <Route
              path="/favorites"
              element={<FavouriteShlokas />}
            />


            {/* =================================================
                ADMIN DASHBOARD
            ================================================= */}

            <Route
              path="/admin"
              element={<Admin />}
            />


            {/* =================================================
                ADMIN → SHLOK MANAGEMENT
            ================================================= */}

            <Route
              path="/admin/shloks"
              element={<ShlokManagement />}
            />


            {/* =================================================
                ADMIN → QUIZ MANAGEMENT
            ================================================= */}

            <Route
              path="/admin/quiz"
              element={<QuizManagement />}
            />


            {/* =================================================
                QUIZ CATEGORY SELECTION
                Navbar Quiz → અહીં આવશે
            ================================================= */}

            <Route
              path="/quiz"
              element={<QuizCategory />}
            />


            {/* =================================================
                QUIZ QUESTIONS
                Category પસંદ કર્યા પછી આ route ઉપયોગ થશે.

                Example:
                /quiz/play?category=chapter&chapterNumber=1
                /quiz/play?category=all
                /quiz/play?category=mahabharat
            ================================================= */}

            <Route
              path="/quiz/play"
              element={<Quiz />}
            />


            {/* =================================================
                QUIZ CATEGORY
                Existing direct category route પણ રાખ્યો છે.
            ================================================= */}

            <Route
              path="/quiz-category"
              element={<QuizCategory />}
            />

            <Route
              path="/history"
              element={<History />}
            />

            <Route
              path="/quiz-results"
              element={<QuizResult />}
            />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

