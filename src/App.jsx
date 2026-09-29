import { useEffect, useState } from "react";
import "./index.css";

import { supabase } from "./lib/supabase";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import UserLogin from "./pages/UserLogin";
import Register from "./pages/Register";
import NewPost from "./pages/NewPost";

const categories = [
  "কবিতা",
  "গল্প",
  "ধারাবাহিক উপন্যাস",
  "মুক্ত গদ্য",
  "বই পরিচিতি",
  "কবি/লেখক পরিচিতি",
  "বিজ্ঞানীদের জীবনী",
  "শব্দার্থ",
  "বাগধারা",
  "ব্যাকরণ",
  "ব্যাকরণের রস",
  "সাক্ষাৎকার",
];

const articles = [
  {
    category: "কবিতা",
    title: "বৃষ্টির দিনে মনে পড়ে",
    author: "সাহিত্যনন্দ",
    text: "শব্দের ভেতর যে অনুভূতি লুকিয়ে থাকে, কবিতা তাকে স্পর্শ করে।",
  },
  {
    category: "গল্প",
    title: "শেষ বিকেলের চিঠি",
    author: "রাফিয়া",
    text: "একটি পুরোনো চিঠি বদলে দিল একটি পরিবারের বহু বছরের গল্প।",
  },
  {
    category: "ধারাবাহিক উপন্যাস",
    title: "অচেনা শহর — প্রথম পর্ব",
    author: "সাহিত্যনন্দ",
    text: "নতুন শহরে এসে তার সামনে খুলে গেল এক অদ্ভুত রহস্যের দরজা।",
  },
  {
    category: "বই পরিচিতি",
    title: "একটি বই, অনেক ভাবনা",
    author: "সম্পাদক",
    text: "বইটি নিয়ে আলোচনা, পাঠ-অনুভূতি এবং লেখকের ভাবনার সঙ্গে পরিচয়।",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  /*
   * ========================================
   * CURRENT LOGGED-IN USER
   * ========================================
   */

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /*
   * ========================================
   * LOGOUT
   * ========================================
   */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUser(null);

    window.location.href = "/sahityananda/";
  };

  /*
   * ========================================
   * ADMIN ROUTES
   * ========================================
   */

  const currentPath = window.location.pathname;

  if (currentPath === "/sahityananda/admin/login") {
    return <AdminLogin />;
  }

  if (currentPath === "/sahityananda/admin/users") {
    return <AdminUsers />;
  }

  if (currentPath === "/sahityananda/login") {
    return <UserLogin />;
  }

  if (currentPath === "/sahityananda/register") {
    return <Register />;
  }
if (path === "/sahityananda/new-post") {
  return <NewPost />;
}
  if (currentPath === "/sahityananda/admin") {
    return <AdminDashboard />;
  }

  /*
   * ========================================
   * USER DISPLAY INFORMATION
   * ========================================
   */

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  /*
   * ========================================
   * PUBLIC WEBSITE
   * ========================================
   */

  return (
    <div className="site">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="topbar">

          <span>
            সাহিত্য • জ্ঞান • সংস্কৃতি
          </span>

          <span>
            আজকের তারিখ
          </span>

        </div>

        <div className="brand">

          <button
            className="menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            ☰
          </button>

          <div className="brand-title">

            <h1>
              সাহিত্যনন্দ
            </h1>

            <p>
              বাংলা সাহিত্য ও জ্ঞানভাণ্ডার
            </p>

          </div>

          <div className="header-user-area">

            {user ? (
              <div className="logged-user">

                <div className="user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>

                <div className="user-info">

                  <strong>
                    {userName}
                  </strong>

                  <small>
                    {user.email}
                  </small>

                </div>

                <button
                  className="logout-button"
                  onClick={handleLogout}
                >
                  Logout
                </button>

              </div>
            ) : (
              <a
                href="/sahityananda/login"
                className="header-login-button"
              >
                Login
              </a>
            )}

          </div>

        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className={menuOpen ? "nav open" : "nav"}>

          {categories.map((category) => (
            <a
              href={"#" + category}
              key={category}
              onClick={() => setMenuOpen(false)}
            >
              {category}
            </a>
          ))}

        </nav>

      </header>

      {/* ================= MAIN ================= */}

      <main>

        {/* ================= NOTICE ================= */}

        <div className="notice">

          <strong>
            সাহিত্যনন্দ
          </strong>

          <span>
            বাংলা ভাষা, সাহিত্য ও জ্ঞানচর্চার একটি স্বাধীন প্ল্যাটফর্ম
          </span>

        </div>

        {/* ================= HERO ================= */}

        <section className="hero">

          <div className="hero-content">

            <span className="tag">
              বিশেষ লেখা
            </span>

            <h2>
              বাংলা সাহিত্যের নতুন ঠিকানা
            </h2>

            <p>
              কবিতা, গল্প, ধারাবাহিক উপন্যাস, মুক্ত গদ্য,
              বই পরিচিতি, লেখক পরিচিতি এবং জ্ঞানচর্চার
              নানা বিষয় নিয়ে সাহিত্যনন্দ।
            </p>

            <button className="read-button">
              বিস্তারিত পড়ুন →
            </button>

          </div>

          <div className="hero-image">

            <div className="image-placeholder">
              সাহিত্যনন্দ
            </div>

          </div>

        </section>

        {/* ================= LATEST ARTICLES ================= */}

        <section className="section">

          <div className="section-title">

            <h2>
              সর্বশেষ প্রকাশনা
            </h2>

            <a href="#all">
              সব লেখা →
            </a>

          </div>

          <div className="article-grid">

            {articles.map((article, index) => (

              <article
                className={
                  index === 0
                    ? "article featured"
                    : "article"
                }
                key={index}
              >

                <div className="article-image">
                  {article.category}
                </div>

                <div className="article-body">

                  <span className="category">
                    {article.category}
                  </span>

                  <h3>
                    {article.title}
                  </h3>

                  <p>
                    {article.text}
                  </p>

                  <small>
                    লেখক: {article.author}
                  </small>

                </div>

              </article>

            ))}

          </div>

        </section>

        {/* ================= POETRY ================= */}

        <section className="section category-section">

          <div className="section-title">

            <h2>
              কবিতা
            </h2>

            <a href="#poem">
              সব কবিতা →
            </a>

          </div>

          <div className="simple-grid">

            <div className="text-card">

              <span>
                কবিতা
              </span>

              <h3>
                নদীর কাছে ফিরে আসা
              </h3>

              <p>
                নতুন কবিতা এবং সমকালীন অনুভূতির প্রকাশ।
              </p>

            </div>

            <div className="text-card">

              <span>
                কবিতা
              </span>

              <h3>
                শহরের রাত
              </h3>

              <p>
                শহর, মানুষ ও স্মৃতির এক কবিতাময় গল্প।
              </p>

            </div>

            <div className="text-card">

              <span>
                কবিতা
              </span>

              <h3>
                অপেক্ষার দিন
              </h3>

              <p>
                অপেক্ষা এবং ভালোবাসার অনুভূতি নিয়ে কবিতা।
              </p>

            </div>

          </div>

        </section>

        {/* ================= SERIAL NOVEL ================= */}

        <section className="section category-section">

          <div className="section-title">

            <h2>
              ধারাবাহিক উপন্যাস
            </h2>

            <a href="#novel">
              সব পর্ব →
            </a>

          </div>

          <div className="novel-card">

            <span>
              ধারাবাহিক উপন্যাস
            </span>

            <h3>
              অচেনা শহর
            </h3>

            <p>
              একটি নতুন শহর, কিছু অচেনা মানুষ এবং পুরোনো
              একটি রহস্যকে ঘিরে এগিয়ে চলেছে গল্প।
            </p>

            <button>
              প্রথম পর্ব পড়ুন →
            </button>

          </div>

        </section>

        {/* ================= KNOWLEDGE ================= */}

        <section className="section">

          <div className="section-title">

            <h2>
              জ্ঞান ও ভাষা
            </h2>

          </div>

          <div className="knowledge-grid">

            {[
              ["শব্দার্থ", "শব্দের অর্থ ও ব্যবহার"],
              ["বাগধারা", "বাংলা বাগধারা ও অর্থ"],
              ["ব্যাকরণ", "সহজভাবে বাংলা ব্যাকরণ"],
              ["ব্যাকরণের রস", "ভাষার মজার বিষয়গুলো"],
              [
                "বিজ্ঞানীদের জীবনী",
                "বিশ্বের বিখ্যাত বিজ্ঞানীদের জীবন",
              ],
              [
                "বই পরিচিতি",
                "নতুন ও গুরুত্বপূর্ণ বই",
              ],
            ].map(([title, description]) => (

              <div
                className="knowledge-card"
                key={title}
              >

                <h3>
                  {title}
                </h3>

                <p>
                  {description}
                </p>

                <a href={"#" + title}>
                  আরও পড়ুন →
                </a>

              </div>

            ))}

          </div>

        </section>

        {/* ================= INTERVIEW ================= */}

        <section className="interview">

          <div>

            <span>
              সাক্ষাৎকার
            </span>

            <h2>
              কথা হলো একজন লেখকের সঙ্গে
            </h2>

            <p>
              সাহিত্য, জীবন ও লেখালেখি নিয়ে বিশেষ আলাপ।
            </p>

            <button>
              সাক্ষাৎকার পড়ুন →
            </button>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}

      <footer>

        <h2>
          সাহিত্যনন্দ
        </h2>

        <p>
          বাংলা সাহিত্য ও জ্ঞানভাণ্ডার
        </p>

        <div className="footer-links">

          {categories.map((category) => (

            <a
              href={"#" + category}
              key={category}
            >
              {category}
            </a>

          ))}

        </div>

        <div className="copyright">

          © 2026 সাহিত্যনন্দ — সর্বস্বত্ব সংরক্ষিত

        </div>

      </footer>

    </div>
  );
}

export default App;

