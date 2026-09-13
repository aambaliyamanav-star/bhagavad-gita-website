import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  Shield,
  LogOut,
  BookOpen,
  BrainCircuit,
  Users,
  FileText,
  Search,
  Lock,
  Trash2,
  ArrowRight,
  Eye,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  RefreshCw,
  Calendar,
  TrendingUp,
} from "lucide-react";
import "./Admin.css";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "હમણાં જ";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} મિ. પહેલાં`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} કલાક પહેલાં`;
  const days = Math.floor(hours / 24);
  return `${days} દિવસ પહેલાં`;
}

function Admin() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Visitor tracking stats state
  const [visitorStats, setVisitorStats] = useState(null);
  const [loadingVisitors, setLoadingVisitors] = useState(true);
  const [refreshingVisitors, setRefreshingVisitors] = useState(false);

  const navigate = useNavigate();

  const { logout } = useAuth();

  const fetchVisitorStats = async (isManual = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (isManual) setRefreshingVisitors(true);
    else setLoadingVisitors(true);

    try {
      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/visitors/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        setVisitorStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching visitor stats:", error);
    } finally {
      setLoadingVisitors(false);
      setRefreshingVisitors(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        "https://bhagavad-gita-website.onrender.com/api/admin/users",
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
    fetchVisitorStats();
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
        `https://bhagavad-gita-website.onrender.com/api/admin/users/${userId}`,
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
              <Shield className="btn-icon" size={28} /> Admin Dashboard
            </h1>
          </div>

          {/* ADMIN LOGOUT */}

          <button
            className="admin-logout-btn"
            onClick={handleAdminLogout}
          >
            <LogOut className="btn-icon" size={18} /> Logout
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
                <BookOpen size={48} color="#175bb5" strokeWidth={1.5} />
              </div>

              <div className="management-content">

                <h2>
                  Manage Shlokas
                </h2>

              </div>

              <div className="management-arrow"><ArrowRight size={22} className="management-arrow-icon" /></div>

            </Link>


            {/* =================================================
                QUIZ MANAGEMENT
            ================================================= */}

            <Link
              to="/admin/quiz"
              className="management-card quiz-management-card"
            >

              <div className="management-icon">
                <BrainCircuit size={48} color="#175bb5" strokeWidth={1.5} />
              </div>

              <div className="management-content">

                <h2>
                  Manage Quiz
                </h2>

              </div>

              <div className="management-arrow"><ArrowRight size={22} className="management-arrow-icon" /></div>

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
                <Users size={32} color="#175bb5" strokeWidth={1.5} />
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
                <BookOpen size={32} color="#175bb5" strokeWidth={1.5} />
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
                <FileText size={32} color="#175bb5" strokeWidth={1.5} />
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
            WEBSITE VISITOR ANALYTICS SECTION
        ================================================= */}
        <section className="visitor-analytics-section" aria-label="Website Visitors">
          <div className="visitor-section-header">
            <div className="visitor-title-wrap">
              <div className="visitor-header-icon-box">
                <Activity size={24} className="visitor-activity-icon" />
              </div>
              <div>
                <h2>વેબસાઇટ મુલાકાતીઓ (Website Visitors)</h2>
                <p>રીઅલ-ટાઇમ વેબસાઇટ ટ્રાફિક અને મુલાકાતીઓની માહિતી</p>
              </div>
            </div>

            <button
              type="button"
              className="visitor-refresh-btn"
              onClick={() => fetchVisitorStats(true)}
              disabled={refreshingVisitors || loadingVisitors}
              title="વિઝિટર ડેટા રિફ્રેશ કરો"
            >
              <RefreshCw
                size={16}
                className={refreshingVisitors ? "spinning-icon" : ""}
              />
              <span>{refreshingVisitors ? "રિફ્રેશિંગ..." : "રિફ્રેશ"}</span>
            </button>
          </div>

          {loadingVisitors ? (
            <div className="visitor-loading-state">
              <p>મુલાકાતીઓની માહિતી લોડ થઈ રહી છે...</p>
            </div>
          ) : (
            <>
              {/* 4 PRIMARY VISITOR STAT CARDS */}
              <div className="visitor-stats-grid">
                <div className="v-stat-card total-visits-card">
                  <div className="v-stat-icon-box blue-glow">
                    <Eye size={28} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {visitorStats?.totalVisits !== undefined
                        ? visitorStats.totalVisits.toLocaleString()
                        : "0"}
                    </h3>
                    <p className="v-stat-label">કુલ મુલાકાતો</p>
                    <span className="v-stat-sub">Total Pageviews</span>
                  </div>
                </div>

                <div className="v-stat-card unique-visitors-card">
                  <div className="v-stat-icon-box purple-glow">
                    <Users size={28} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {visitorStats?.uniqueVisitors !== undefined
                        ? visitorStats.uniqueVisitors.toLocaleString()
                        : "0"}
                    </h3>
                    <p className="v-stat-label">અનન્ય મુલાકાતીઓ</p>
                    <span className="v-stat-sub">Unique Visitors</span>
                  </div>
                </div>

                <div className="v-stat-card today-visits-card">
                  <div className="v-stat-icon-box green-glow">
                    <Calendar size={28} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {visitorStats?.todayVisits !== undefined
                        ? visitorStats.todayVisits.toLocaleString()
                        : "0"}
                    </h3>
                    <p className="v-stat-label">આજની મુલાકાતો</p>
                    <span className="v-stat-sub">Today's Visits</span>
                  </div>
                </div>

                <div className="v-stat-card today-unique-card">
                  <div className="v-stat-icon-box gold-glow">
                    <TrendingUp size={28} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {visitorStats?.todayUniqueVisitors !== undefined
                        ? visitorStats.todayUniqueVisitors.toLocaleString()
                        : "0"}
                    </h3>
                    <p className="v-stat-label">આજના અનન્ય યુઝર્સ</p>
                    <span className="v-stat-sub">Today's Unique</span>
                  </div>
                </div>
              </div>

              {/* DETAILED ANALYTICS GRID */}
              <div className="visitor-details-grid">
                {/* DEVICE BREAKDOWN */}
                <div className="v-detail-card device-card">
                  <div className="v-card-header">
                    <h4>
                      <Smartphone size={20} /> ડિવાઇસ વિતરણ (Devices)
                    </h4>
                  </div>
                  <div className="v-device-bars">
                    {(() => {
                      const total =
                        (visitorStats?.deviceStats?.Mobile || 0) +
                        (visitorStats?.deviceStats?.Desktop || 0) +
                        (visitorStats?.deviceStats?.Tablet || 0) || 1;
                      const mobPct = Math.round(
                        ((visitorStats?.deviceStats?.Mobile || 0) / total) * 100
                      );
                      const deskPct = Math.round(
                        ((visitorStats?.deviceStats?.Desktop || 0) / total) * 100
                      );
                      const tabPct = Math.round(
                        ((visitorStats?.deviceStats?.Tablet || 0) / total) * 100
                      );

                      return (
                        <>
                          <div className="device-bar-row">
                            <div className="device-bar-label">
                              <span className="device-label-text">
                                <Smartphone size={16} /> મોબાઈલ (Mobile)
                              </span>
                              <strong>
                                {visitorStats?.deviceStats?.Mobile || 0} ({mobPct}%)
                              </strong>
                            </div>
                            <div className="device-progress-track">
                              <div
                                className="device-progress-fill mobile-fill"
                                style={{ width: `${mobPct}%` }}
                              />
                            </div>
                          </div>

                          <div className="device-bar-row">
                            <div className="device-bar-label">
                              <span className="device-label-text">
                                <Monitor size={16} /> ડેસ્કટોપ (Desktop)
                              </span>
                              <strong>
                                {visitorStats?.deviceStats?.Desktop || 0} ({deskPct}%)
                              </strong>
                            </div>
                            <div className="device-progress-track">
                              <div
                                className="device-progress-fill desktop-fill"
                                style={{ width: `${deskPct}%` }}
                              />
                            </div>
                          </div>

                          <div className="device-bar-row">
                            <div className="device-bar-label">
                              <span className="device-label-text">
                                <Tablet size={16} /> ટેબલેટ (Tablet)
                              </span>
                              <strong>
                                {visitorStats?.deviceStats?.Tablet || 0} ({tabPct}%)
                              </strong>
                            </div>
                            <div className="device-progress-track">
                              <div
                                className="device-progress-fill tablet-fill"
                                style={{ width: `${tabPct}%` }}
                              />
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* TOP VISITED PAGES */}
                <div className="v-detail-card pages-card">
                  <div className="v-card-header">
                    <h4>
                      <Globe size={20} /> મુખ્ય જોવાયેલા પેજ (Top Pages)
                    </h4>
                  </div>
                  <div className="v-pages-list">
                    {visitorStats?.topPages && visitorStats.topPages.length > 0 ? (
                      visitorStats.topPages.slice(0, 5).map((page, idx) => (
                        <div key={idx} className="v-page-row">
                          <span className="v-page-rank">{idx + 1}</span>
                          <span className="v-page-path" title={page._id}>
                            {page._id === "/" ? "Home (મુખ્ય પેજ)" : page._id}
                          </span>
                          <span className="v-page-count">{page.count} વિઝિટ</span>
                        </div>
                      ))
                    ) : (
                      <p className="v-empty-hint">હજી કોઈ ડેટા ઉપલબ્ધ નથી.</p>
                    )}
                  </div>
                </div>

                {/* BROWSERS & OS */}
                <div className="v-detail-card tech-card">
                  <div className="v-card-header">
                    <h4>
                      <Activity size={20} /> બ્રાઉઝર અને OS (Platforms)
                    </h4>
                  </div>
                  <div className="v-tech-group">
                    <p className="v-tech-label">બ્રાઉઝર્સ:</p>
                    <div className="v-pills-wrap">
                      {visitorStats?.browserStats && visitorStats.browserStats.length > 0 ? (
                        visitorStats.browserStats.map((b, idx) => (
                          <span key={idx} className="v-pill">
                            {b._id}: <strong>{b.count}</strong>
                          </span>
                        ))
                      ) : (
                        <span className="v-pill">કોઈ ડેટા નથી</span>
                      )}
                    </div>

                    <p className="v-tech-label" style={{ marginTop: "14px" }}>
                      ઓપરેટિંગ સિસ્ટમ:
                    </p>
                    <div className="v-pills-wrap">
                      {visitorStats?.osStats && visitorStats.osStats.length > 0 ? (
                        visitorStats.osStats.map((o, idx) => (
                          <span key={idx} className="v-pill os-pill">
                            {o._id}: <strong>{o.count}</strong>
                          </span>
                        ))
                      ) : (
                        <span className="v-pill">કોઈ ડેટા નથી</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT VISITOR ACTIVITY TABLE */}
              {visitorStats?.recentVisitors && visitorStats.recentVisitors.length > 0 && (
                <div className="v-recent-card">
                  <div className="v-card-header">
                    <h4>
                      <Eye size={20} /> તાજેતરની મુલાકાતી પ્રવૃત્તિ (Recent Activity)
                    </h4>
                    <span className="v-card-subhead">છેલ્લી {visitorStats.recentVisitors.length} વિઝિટ્સ</span>
                  </div>

                  <div className="v-table-wrapper">
                    <table className="v-table">
                      <thead>
                        <tr>
                          <th>પેજ (Page Path)</th>
                          <th>ડિવાઇસ (Device)</th>
                          <th>બ્રાઉઝર / OS</th>
                          <th>સમય (Time)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visitorStats.recentVisitors.map((v, i) => (
                          <tr key={i}>
                            <td className="v-table-path">
                              <code>{v.path}</code>
                            </td>
                            <td>
                              <span className={`v-device-badge ${v.device?.toLowerCase()}`}>
                                {v.device === "Mobile" ? (
                                  <Smartphone size={14} />
                                ) : v.device === "Tablet" ? (
                                  <Tablet size={14} />
                                ) : (
                                  <Monitor size={14} />
                                )}
                                {v.device || "Desktop"}
                              </span>
                            </td>
                            <td className="v-table-browser">
                              {v.browser} • {v.os}
                            </td>
                            <td className="v-table-time">
                              {formatTimeAgo(v.visitedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

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
              placeholder="Search user..."
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
                                <Lock className="btn-icon" size={16} /> Protected
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
                                  : <span><Trash2 className="btn-icon" size={16} /> Delete</span>}

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