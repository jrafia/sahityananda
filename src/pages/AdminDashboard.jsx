import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sahityananda/admin/login";
  };

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">

        <div className="admin-brand">
          <div className="admin-logo">স</div>

          <div>
            <h2>সাহিত্যনন্দ</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="admin-nav">

          <div className="nav-title">
            প্রধান
          </div>

          <a href="/sahityananda/admin" className="active">
            <span>⌂</span>
            Dashboard
          </a>

          <a href="#">
            <span>✍️</span>
            নতুন লেখা
          </a>

          <a href="#">
            <span>📚</span>
            সব লেখা
          </a>

          <div className="nav-title">
            ব্যবস্থাপনা
          </div>

          <a href="#">
            <span>📂</span>
            Category
          </a>

          <a href="#">
            <span>👤</span>
            Author
          </a>
         <a href="#">
         <span>👥</span>
            Users
          </a>
          <a href="#">
            <span>🖼️</span>
            Media
          </a>

          <a href="#">
            <span>📢</span>
            Advertisement
          </a>

          <div className="nav-title">
            সেটিংস
          </div>

          <a href="#">
            <span>⚙️</span>
            Settings
          </a>

        </nav>

        <div className="sidebar-bottom">

          <div className="admin-user-mini">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>

            <div>
              <strong>Admin</strong>
              <small>
                {user?.email || "Admin"}
              </small>
            </div>
          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            ↪ Logout
          </button>

        </div>

      </aside>


      {/* MAIN AREA */}
      <div className="admin-main">

        {/* TOPBAR */}
        <header className="admin-topbar">

          <div>
            <h1>Dashboard</h1>
            <p>
              সাহিত্যনন্দ পরিচালনা প্যানেলে স্বাগতম
            </p>
          </div>

          <div className="topbar-actions">

            <a
              href="/sahityananda/"
              target="_blank"
              rel="noreferrer"
              className="view-site-btn"
            >
              🌐 Website দেখুন
            </a>

            <div className="top-avatar">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>

          </div>

        </header>


        {/* CONTENT */}
        <main className="admin-content">

          {/* WELCOME */}
          <section className="dashboard-welcome">

            <div>
              <span className="welcome-label">
                আজকের দিন 🌿
              </span>

              <h2>
                স্বাগতম, Admin 👋
              </h2>

              <p>
                আপনার সাহিত্যনন্দ ওয়েবসাইটের সবকিছু এখান থেকে পরিচালনা করুন।
              </p>
            </div>

            <a
              href="#"
              className="new-article-btn"
            >
              ＋ নতুন লেখা
            </a>

          </section>


          {/* STATISTICS */}
          <section className="stats-grid">

            <div className="stat-card">

              <div className="stat-icon article-icon">
                📝
              </div>

              <div>
                <span>মোট লেখা</span>
                <strong>0</strong>
                <small>সকল Article</small>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon publish-icon">
                🚀
              </div>

              <div>
                <span>প্রকাশিত</span>
                <strong>0</strong>
                <small>Published</small>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon draft-icon">
                📄
              </div>

              <div>
                <span>Draft</span>
                <strong>0</strong>
                <small>অসম্পূর্ণ লেখা</small>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-icon category-icon">
                📂
              </div>

              <div>
                <span>Category</span>
                <strong>12</strong>
                <small>সাহিত্য বিভাগ</small>
              </div>

            </div>

          </section>


          {/* MAIN GRID */}
          <section className="dashboard-grid">

            {/* QUICK ACTION */}
            <div className="dashboard-panel">

              <div className="panel-header">
                <div>
                  <h3>Quick Actions</h3>
                  <p>দ্রুত কাজ শুরু করুন</p>
                </div>
              </div>

              <div className="quick-actions">

                <a href="#" className="quick-card">
                  <div>✍️</div>
                  <strong>নতুন লেখা</strong>
                  <span>কবিতা, গল্প বা প্রবন্ধ লিখুন</span>
                </a>

                <a href="#" className="quick-card">
                  <div>📂</div>
                  <strong>Category</strong>
                  <span>বিভাগ পরিচালনা করুন</span>
                </a>

                <a href="#" className="quick-card">
                  <div>👤</div>
                  <strong>Author</strong>
                  <span>লেখক পরিচালনা করুন</span>
                </a>

                <a href="#" className="quick-card">
                  <div>🖼️</div>
                  <strong>Media</strong>
                  <span>ছবি ও মিডিয়া পরিচালনা</span>
                </a>

              </div>

            </div>


            {/* RECENT */}
            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <h3>সাম্প্রতিক লেখা</h3>
                  <p>Latest Articles</p>
                </div>

                <a href="#">
                  সব দেখুন →
                </a>

              </div>

              <div className="empty-state">

                <div className="empty-icon">
                  📝
                </div>

                <h4>এখনও কোনো লেখা নেই</h4>

                <p>
                  আপনার প্রথম লেখাটি প্রকাশ করুন।
                </p>

                <a href="#" className="empty-btn">
                  ＋ নতুন লেখা
                </a>

              </div>

            </div>

          </section>


          {/* LOWER SECTION */}
          <section className="dashboard-grid lower-grid">

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <h3>Website Overview</h3>
                  <p>সাহিত্যনন্দের বর্তমান অবস্থা</p>
                </div>

              </div>

              <div className="overview-list">

                <div>
                  <span>🌐 Website</span>
                  <strong>Live</strong>
                </div>

                <div>
                  <span>🔐 Admin Authentication</span>
                  <strong>Active</strong>
                </div>

                <div>
                  <span>☁️ Database</span>
                  <strong>Supabase</strong>
                </div>

                <div>
                  <span>🚀 Hosting</span>
                  <strong>GitHub Pages</strong>
                </div>

              </div>

            </div>


            <div className="dashboard-panel">

              <div className="panel-header">

                <div>
                  <h3>সাহিত্যনন্দ</h3>
                  <p>বাংলা সাহিত্য ও জ্ঞানভাণ্ডার</p>
                </div>

              </div>

              <div className="quote-box">

                <div className="quote-mark">
                  “
                </div>

                <p>
                  শব্দের মাঝে মানুষ,
                  সাহিত্যের মাঝে জীবন।
                </p>

                <span>
                  — সাহিত্যনন্দ
                </span>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;