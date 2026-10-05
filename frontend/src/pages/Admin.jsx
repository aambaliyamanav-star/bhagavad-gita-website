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
  UserPlus,
  UserCheck,
  Bell,
  Star,
  MessageSquare,
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
  const [sendingNotification, setSendingNotification] = useState(false);

  // User feedback and ratings state
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [refreshingFeedbacks, setRefreshingFeedbacks] = useState(false);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState("all");
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState("all");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [deletingFeedbackId, setDeletingFeedbackId] = useState(null);

  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleSendDailyNotification = async () => {
    if (sendingNotification) return;
    const confirmed = window.confirm(
      "શું તમે તમામ ભક્તો/યુઝર્સના મોબાઈલ પર અત્યારે દૈનિક શ્લોક નોટિફિકેશન મોકલવા માંગો છો?"
    );
    if (!confirmed) return;

    setSendingNotification(true);
    try {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      const url = isLocal
        ? "http://localhost:5000/api/notifications/trigger-daily-reminder"
        : "https://bhagavad-gita-website.onrender.com/api/notifications/trigger-daily-reminder";

      let response;
      try {
        response = await fetch(url);
      } catch {
        // Fallback to prod if localhost backend isn't up
        response = await fetch(
          "https://bhagavad-gita-website.onrender.com/api/notifications/trigger-daily-reminder"
        );
      }

      const data = await response.json();
      if (data.success) {
        alert(
          `નોટિફિકેશન સફળતાપૂર્વક મોકલાઈ ગયું!\nકુલ મુલાકાતીઓ: ${data.total || 0}\nસફળ: ${data.sent || 0}`
        );
      } else {
        alert("નોટિફિકેશન મોકલવામાં સમસ્યા આવી: " + (data.error || ""));
      }
    } catch (err) {
      console.error(err);
      alert("સર્વર સાથે જોડાણ થઈ શક્યું નથી.");
    } finally {
      setSendingNotification(false);
    }
  };

  const fetchVisitorStats = async (isManual = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (isManual) setRefreshingVisitors(true);
    else setLoadingVisitors(true);

    try {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      const urls = isLocal
        ? [
            "http://localhost:5000/api/visitors/stats",
            "https://bhagavad-gita-website.onrender.com/api/visitors/stats",
          ]
        : ["https://bhagavad-gita-website.onrender.com/api/visitors/stats"];

      let fetchedData = null;
      for (const url of urls) {
        try {
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.stats) {
              fetchedData = data.stats;
              break;
            }
          }
        } catch {
          // try next url
        }
      }

      if (fetchedData) {
        setVisitorStats(fetchedData);
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

  const fetchFeedbacks = async (isRefresh = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (isRefresh) setRefreshingFeedbacks(true);
    else setLoadingFeedbacks(true);

    try {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      const urls = isLocal
        ? [
            "http://localhost:5000/api/feedback/admin?limit=150",
            "https://bhagavad-gita-website.onrender.com/api/feedback/admin?limit=150",
          ]
        : ["https://bhagavad-gita-website.onrender.com/api/feedback/admin?limit=150"];

      let fetched = null;
      for (const url of urls) {
        try {
          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.data) {
              fetched = data.data;
              break;
            }
          }
        } catch {
          // try next
        }
      }

      if (fetched) {
        setFeedbacks(fetched.feedbacks || []);
        setFeedbackSummary(fetched.summary || null);
      }
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
    } finally {
      setLoadingFeedbacks(false);
      setRefreshingFeedbacks(false);
    }
  };

  const handleDeleteFeedback = async (id, userName) => {
    const confirmed = window.confirm(
      `શું તમે ${userName || "આ"} ભક્ત/યુઝરનો પ્રતિસાદ ડિલીટ કરવા માંગો છો?`
    );
    if (!confirmed) return;

    setDeletingFeedbackId(id);
    const token = localStorage.getItem("token");

    try {
      const isLocal =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      const urls = isLocal
        ? [
            `http://localhost:5000/api/feedback/${id}`,
            `https://bhagavad-gita-website.onrender.com/api/feedback/${id}`,
          ]
        : [`https://bhagavad-gita-website.onrender.com/api/feedback/${id}`];

      for (const url of urls) {
        try {
          const res = await fetch(url, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setFeedbacks((prev) => prev.filter((f) => f._id !== id));
            break;
          }
        } catch {
          // try next
        }
      }
    } catch (err) {
      console.error("Error deleting feedback:", err);
    } finally {
      setDeletingFeedbackId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchVisitorStats();
    fetchFeedbacks();
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
        "User successfully deleted."
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

          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-notify-btn"
              onClick={handleSendDailyNotification}
              disabled={sendingNotification}
              title="બધા યુઝર્સને દૈનિક શ્લોક નોટિફિકેશન મોકલો"
            >
              <Bell className="btn-icon" size={18} />
              <span>{sendingNotification ? "મોકલાઈ રહ્યું છે..." : "નોટિફિકેશન મોકલો"}</span>
            </button>

            <button
              className="admin-logout-btn"
              onClick={handleAdminLogout}
            >
              <LogOut className="btn-icon" size={18} /> Logout
            </button>
          </div>
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


            <div className="stat-card">

              <div className="stat-icon">
                <Star size={32} color="#f59e0b" fill="#f59e0b" strokeWidth={1.5} />
              </div>

              <div>
                <h2>
                  {feedbackSummary?.averageRating ? `${feedbackSummary.averageRating} ★` : "5.0 ★"}
                </h2>

                <p>
                  Avg Rating ({feedbackSummary?.totalFeedbacks ?? feedbacks.length})
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
              {/* 5 VISITOR STAT CARDS */}
              <div className="visitor-stats-grid">
                {/* CARD 1: NEW / UNREGISTERED UNIQUE VISITORS (COUNTED ONLY ONCE) */}
                <div className="v-stat-card new-guest-card">
                  <div className="v-stat-icon-box amber-glow">
                    <UserPlus size={26} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {visitorStats?.uniqueUnregisteredVisitors !== undefined
                        ? visitorStats.uniqueUnregisteredVisitors.toLocaleString()
                        : "0"}
                    </h3>
                    <p className="v-stat-label">નવા મુલાકાતીઓ (ગેસ્ટ)</p>
                  </div>
                </div>

                {/* CARD 2: TOTAL ALL VISITS (EVERY HIT COUNTED) */}
                <div className="v-stat-card total-visits-card">
                  <div className="v-stat-icon-box blue-glow">
                    <Eye size={26} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {visitorStats?.totalVisits !== undefined
                        ? visitorStats.totalVisits.toLocaleString()
                        : "0"}
                    </h3>
                    <p className="v-stat-label">કુલ તમામ મુલાકાતો</p>
                  </div>
                </div>

                {/* CARD 3: TODAY'S UNIQUE GUEST VISITORS */}
                <div className="v-stat-card today-guest-card">
                  <div className="v-stat-icon-box gold-glow">
                    <TrendingUp size={26} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {visitorStats?.todayUniqueUnregisteredVisitors !== undefined
                        ? visitorStats.todayUniqueUnregisteredVisitors.toLocaleString()
                        : "0"}
                    </h3>
                    <p className="v-stat-label">આજના નવા મુલાકાતીઓ</p>
                  </div>
                </div>

                {/* CARD 4: TODAY'S TOTAL VISITS */}
                <div className="v-stat-card today-visits-card">
                  <div className="v-stat-icon-box green-glow">
                    <Calendar size={26} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {visitorStats?.todayVisits !== undefined
                        ? visitorStats.todayVisits.toLocaleString()
                        : "0"}
                    </h3>
                    <p className="v-stat-label">આજની કુલ મુલાકાતો</p>
                  </div>
                </div>

                {/* CARD 5: REGISTERED ACTIVE VISITORS */}
                <div className="v-stat-card registered-visitors-card">
                  <div className="v-stat-icon-box purple-glow">
                    <UserCheck size={26} />
                  </div>
                  <div className="v-stat-content">
                    <h3>
                      {(visitorStats?.registeredVisits !== undefined
                        ? visitorStats.registeredVisits
                        : visitorStats?.uniqueRegisteredVisitors !== undefined
                        ? visitorStats.uniqueRegisteredVisitors
                        : 0
                      ).toLocaleString()}
                    </h3>
                    <p className="v-stat-label">નોંધાયેલા મુલાકાતીઓ</p>
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
                          <th>યુઝર પ્રકાર (User)</th>
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
                              {v.isRegistered ? (
                                <span className="v-user-type-badge registered">
                                  <UserCheck size={13} /> રજીસ્ટર્ડ
                                </span>
                              ) : (
                                <span className="v-user-type-badge guest">
                                  <UserPlus size={13} /> નવો / ગેસ્ટ
                                </span>
                              )}
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
            USER FEEDBACKS & STAR RATINGS SECTION
        ================================================= */}
        <section className="feedback-section-box" aria-label="User Feedbacks">
          <div className="section-header feedback-section-header">
            <div className="visitor-title-wrap">
              <div className="visitor-header-icon-box" style={{ background: "rgba(245, 158, 11, 0.12)", color: "#d97706" }}>
                <Star size={24} fill="#f59e0b" color="#f59e0b" />
              </div>
              <div>
                <h2>પ્રતિસાદ અને સ્ટાર રેટિંગ્સ</h2>
                <span className="v-header-sub">
                  કુલ {feedbackSummary?.totalFeedbacks ?? feedbacks.length} ભક્તો દ્વારા પ્રતિસાદ નોંધાયા છે
                </span>
              </div>
            </div>

            <button
              type="button"
              className="visitor-refresh-btn"
              onClick={() => fetchFeedbacks(true)}
              disabled={refreshingFeedbacks || loadingFeedbacks}
              title="ફીડબેક રિફ્રેશ કરો"
            >
              <RefreshCw
                size={16}
                className={refreshingFeedbacks ? "spinning-icon" : ""}
              />
              <span>{refreshingFeedbacks ? "રિફ્રેશિંગ..." : "રિફ્રેશ"}</span>
            </button>
          </div>

          {loadingFeedbacks ? (
            <div className="v-loading-state">
              <RefreshCw size={28} className="spinning-icon" />
              <p>ફીડબેક અને રેટિંગ્સ લોડ થઈ રહ્યા છે...</p>
            </div>
          ) : (
            <>
              {/* FILTER CONTROLS */}
              <div className="admin-feedback-filter-bar">
                <div className="admin-feedback-filter-group">
                  <span className="admin-feedback-filter-label">રેટિંગ:</span>
                  <div className="admin-feedback-pills">
                    {["all", "5", "4", "3", "2", "1"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`admin-feedback-pill ${feedbackRatingFilter === r ? "active" : ""}`}
                        onClick={() => setFeedbackRatingFilter(r)}
                      >
                        {r === "all" ? "બધા" : `${r} ★`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-feedback-filter-group">
                  <span className="admin-feedback-filter-label">કેટેગરી:</span>
                  <div className="admin-feedback-pills">
                    {[
                      { id: "all", label: "બધા" },
                      { id: "suggestion", label: "સૂચન" },
                      { id: "feedback", label: "પ્રતિસાદ" },
                      { id: "appreciation", label: "પ્રશંસા" },
                      { id: "bug", label: "બગ" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`admin-feedback-pill ${feedbackCategoryFilter === cat.id ? "active" : ""}`}
                        onClick={() => setFeedbackCategoryFilter(cat.id)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-feedback-search-wrap">
                  <input
                    type="text"
                    placeholder="નામ કે મેસેજ શોધો..."
                    value={feedbackSearch}
                    onChange={(e) => setFeedbackSearch(e.target.value)}
                    className="user-search admin-feedback-search-input"
                  />
                </div>
              </div>

              {/* FEEDBACK LIST */}
              {(() => {
                const filtered = feedbacks.filter((fb) => {
                  if (feedbackRatingFilter !== "all" && fb.rating !== Number(feedbackRatingFilter)) {
                    return false;
                  }
                  if (feedbackCategoryFilter !== "all" && fb.category !== feedbackCategoryFilter) {
                    return false;
                  }
                  if (feedbackSearch.trim()) {
                    const q = feedbackSearch.toLowerCase().trim();
                    const matchName = fb.name?.toLowerCase().includes(q);
                    const matchMsg = fb.message?.toLowerCase().includes(q);
                    const matchEmail = fb.email?.toLowerCase().includes(q);
                    if (!matchName && !matchMsg && !matchEmail) return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="v-empty-card" style={{ padding: "40px 20px", textAlign: "center" }}>
                      <MessageSquare size={36} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                      <p style={{ color: "#64748b", margin: 0, fontWeight: 600 }}>
                        પસંદ કરેલ ફિલ્ટર મુજબ કોઈ પ્રતિસાદ મળ્યો નથી.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="admin-feedbacks-grid">
                    {filtered.map((fb) => (
                      <div key={fb._id} className="admin-feedback-card">
                        <div className="admin-fb-header">
                          <div className="admin-fb-user-info">
                            <div className="admin-fb-avatar">
                              {(fb.name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="admin-fb-user-name">
                                {fb.name}
                                {fb.userId ? (
                                  <span className="admin-fb-badge registered">રજીસ્ટર્ડ યુઝર</span>
                                ) : (
                                  <span className="admin-fb-badge guest">અતિથિ</span>
                                )}
                              </h4>
                              {fb.email && <span className="admin-fb-user-email">{fb.email}</span>}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="admin-fb-delete-btn"
                            onClick={() => handleDeleteFeedback(fb._id, fb.name)}
                            disabled={deletingFeedbackId === fb._id}
                            title="આ પ્રતિસાદ ડિલીટ કરો"
                          >
                            <Trash2 size={16} />
                            <span>{deletingFeedbackId === fb._id ? "..." : "ડિલીટ"}</span>
                          </button>
                        </div>

                        <div className="admin-fb-meta-row">
                          <div className="admin-fb-stars">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                size={16}
                                fill={i <= fb.rating ? "#f59e0b" : "none"}
                                color="#f59e0b"
                              />
                            ))}
                            <span className="admin-fb-rating-num">{fb.rating}.0</span>
                          </div>

                          <span className={`admin-fb-category-tag ${fb.category}`}>
                            {fb.category === "suggestion"
                              ? "સૂચન"
                              : fb.category === "bug"
                              ? "બગ / સમસ્યા"
                              : fb.category === "appreciation"
                              ? "પ્રશંસા"
                              : "પ્રતિસાદ"}
                          </span>

                          <span className="admin-fb-date">
                            {formatTimeAgo(fb.createdAt)}
                          </span>
                        </div>

                        <div className="admin-fb-message-box">
                          <p>{fb.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
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

                      <th>મુલાકાતો</th>

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

                            <span className="user-visits-badge" title={`આ યુઝરે રજીસ્ટર કર્યા પછી કુલ ${user.visitCount || 0} વખત મુલાકાત લીધી છે`}>
                              <Eye size={13} className="user-visits-icon" />
                              {user.visitCount || 0}
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