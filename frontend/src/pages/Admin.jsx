import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Admin.css";

function Admin() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  const { logout } = useAuth();

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Access denied.");
        setLoading(false);
        return;
      }

      setUsers(data.users || []);
      setMessage("");
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessage(
        "Server સાથે connection થઈ શક્યું નથી."
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =====================================================
  // ADMIN LOGOUT
  // =====================================================

  const handleAdminLogout = () => {
    const confirmed = window.confirm(
      "શું તમે ખરેખર Logout કરવા માંગો છો?"
    );

    if (!confirmed) {
      return;
    }

    logout();

    navigate("/");
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const deleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `શું તમે "${userName}" ને ખરેખર delete કરવા માંગો છો?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setDeletingId(userId);

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "User delete થઈ શક્યો નથી."
        );

        setDeletingId(null);
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.filter(
          (user) => user._id !== userId
        )
      );

      setDeletingId(null);

      alert(
        "User successfully deleted. ✅"
      );
    } catch (error) {
      console.error(error);

      alert(
        "Server સાથે connection થઈ શક્યું નથી."
      );

      setDeletingId(null);
    }
  };

  // =====================================================
  // SEARCH + ADMIN ALWAYS #1
  // =====================================================

  const filteredUsers = users
    .filter((user) => {
      const searchText =
        search.toLowerCase();

      return (
        (user.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (user.email || "")
          .toLowerCase()
          .includes(searchText) ||
        (user.mobile || "")
          .toLowerCase()
          .includes(searchText) ||
        (user.birthDate || "")
          .toLowerCase()
          .includes(searchText) ||
        (user.role || "")
          .toLowerCase()
          .includes(searchText)
      );
    })
    .sort((a, b) => {
      // Admin always comes first
      if (
        a.role === "admin" &&
        b.role !== "admin"
      ) {
        return -1;
      }

      if (
        a.role !== "admin" &&
        b.role === "admin"
      ) {
        return 1;
      }

      // Keep remaining users in their original order
      return 0;
    });

  return (
    <main className="admin-page">

      <div className="admin-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="admin-header">

          <div>
            <h1>
              Admin Dashboard 🛡️
            </h1>

            <p>
              Bhagavad Gita Website Management
            </p>
          </div>

          {/* ADMIN LOGOUT */}

          <button
            className="admin-logout-btn"
            onClick={handleAdminLogout}
          >
            🚪 Logout
          </button>

        </div>


        {/* =================================================
            ADMIN MANAGEMENT CARDS
        ================================================= */}

        {!loading && !message && (
          <div className="admin-management">

            {/* =================================================
                SHLOK MANAGEMENT
            ================================================= */}

            <Link
              to="/admin/shloks"
              className="management-card shlok-management-card"
            >

              <div className="management-icon">
                📖
              </div>

              <div className="management-content">

                <h2>
                  Manage Shlokas
                </h2>

                <p>
                  Add, edit and delete Bhagavad Gita shlokas
                </p>

              </div>

              <div className="management-arrow">
                →
              </div>

            </Link>


            {/* =================================================
                QUIZ MANAGEMENT
            ================================================= */}

            <Link
              to="/admin/quiz"
              className="management-card quiz-management-card"
            >

              <div className="management-icon">
                🧠
              </div>

              <div className="management-content">

                <h2>
                  Manage Quiz
                </h2>

                <p>
                  Add, edit and delete quiz questions
                </p>

              </div>

              <div className="management-arrow">
                →
              </div>

            </Link>

          </div>
        )}


        {/* =================================================
            STATISTICS
        ================================================= */}

        {!loading && !message && (
          <div className="admin-stats">

            <div className="stat-card">

              <div className="stat-icon">
                👥
              </div>

              <div>
                <h2>
                  {users.length}
                </h2>

                <p>
                  Total Users
                </p>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                📖
              </div>

              <div>
                <h2>
                  18
                </h2>

                <p>
                  Chapters
                </p>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon">
                📜
              </div>

              <div>
                <h2>
                  700
                </h2>

                <p>
                  Shlokas
                </p>
              </div>

            </div>

          </div>
        )}


        {/* =================================================
            USERS
        ================================================= */}

        <div className="users-section">

          <div className="section-header">

            <div>

              <h2>
                Registered Users
              </h2>

              <span>
                {users.length} Users
              </span>

            </div>


            <input
              type="text"
              placeholder="🔍 Search user..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="user-search"
            />

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <p className="status-message">
              Loading users...
            </p>
          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {message && (
            <p className="status-message error">
              {message}
            </p>
          )}


          {/* =================================================
              USERS TABLE
          ================================================= */}

          {!loading &&
            !message &&
            filteredUsers.length > 0 && (

              <div className="users-table-wrapper">

                <table className="users-table">

                  <thead>

                    <tr>

                      <th>#</th>

                      <th>Name</th>

                      <th>Mobile</th>

                      <th>Email</th>

                      <th>Birth Date</th>

                      <th>Role</th>

                      <th>Joined</th>

                      <th>Action</th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredUsers.map(
                      (user, index) => (

                        <tr key={user._id}>

                          <td>
                            {index + 1}
                          </td>


                          <td className="user-name">
                            {user.name}
                          </td>


                          <td>
                            {user.mobile || "-"}
                          </td>


                          <td>
                            {user.email}
                          </td>


                          <td>

                            {user.birthDate
                              ? new Date(
                                  user.birthDate
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}

                          </td>


                          <td>

                            <span
                              className={
                                user.role ===
                                "admin"
                                  ? "role admin-role"
                                  : "role user-role"
                              }
                            >
                              {user.role}
                            </span>

                          </td>


                          <td>

                            {user.createdAt
                              ? new Date(
                                  user.createdAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}

                          </td>


                          <td>

                            {user.role ===
                            "admin" ? (

                              <span className="protected-user">
                                🔒 Protected
                              </span>

                            ) : (

                              <button
                                className="delete-user-btn"
                                onClick={() =>
                                  deleteUser(
                                    user._id,
                                    user.name
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  user._id
                                }
                              >

                                {deletingId ===
                                user._id
                                  ? "Deleting..."
                                  : "🗑️ Delete"}

                              </button>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}


          {/* =================================================
              NO USERS
          ================================================= */}

          {!loading &&
            !message &&
            filteredUsers.length === 0 && (

              <p className="status-message">
                કોઈ user મળ્યો નથી.
              </p>

            )}

        </div>

      </div>

    </main>
  );
}

export default Admin;