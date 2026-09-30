import { useEffect, useState } from "react";
import "./index.css";

import { supabase } from "./lib/supabase";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import UserLogin from "./pages/UserLogin";
import Register from "./pages/Register";
import NewPost from "./pages/NewPost";

/* =========================================================
   BASE PATH
   ========================================================= */

const BASE_PATH = "/sahityananda";

/* =========================================================
   CATEGORIES
   ========================================================= */

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

/* =========================================================
   KNOWLEDGE CATEGORIES
   ========================================================= */

const knowledgeCategories = [
  "শব্দার্থ",
  "বাগধারা",
  "ব্যাকরণ",
  "ব্যাকরণের রস",
  "বিজ্ঞানীদের জীবনী",
  "বই পরিচিতি",
];

/* =========================================================
   CATEGORY DESCRIPTIONS
   ========================================================= */

const categoryDescriptions = {
  কবিতা: "কবিতা ও সমকালীন অনুভূতির প্রকাশ।",

  গল্প: "ছোট গল্প ও কথাসাহিত্যের নানা আয়োজন।",

  "ধারাবাহিক উপন্যাস":
    "ধারাবাহিকভাবে প্রকাশিত উপন্যাসের বিভিন্ন পর্ব।",

  "মুক্ত গদ্য":
    "ভাবনা, অনুভূতি ও স্বাধীন গদ্যের লেখা।",

  "বই পরিচিতি":
    "নতুন ও গুরুত্বপূর্ণ বই সম্পর্কে আলোচনা।",

  "কবি/লেখক পরিচিতি":
    "কবি ও লেখকদের জীবন ও সাহিত্যকর্ম।",

  "বিজ্ঞানীদের জীবনী":
    "বিশ্বের বিখ্যাত বিজ্ঞানীদের জীবন ও অবদান।",

  শব্দার্থ:
    "বাংলা শব্দের অর্থ, ব্যবহার ও ব্যাখ্যা।",

  বাগধারা:
    "বাংলা বাগধারা এবং তাদের অর্থ ও ব্যবহার।",

  ব্যাকরণ:
    "সহজভাবে বাংলা ব্যাকরণ শেখার আয়োজন।",

  "ব্যাকরণের রস":
    "বাংলা ভাষা ও ব্যাকরণের মজার বিষয়গুলো।",

  সাক্ষাৎকার:
    "লেখক ও সাহিত্যিকদের সঙ্গে বিশেষ আলাপ।",
};

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);

  const [postsLoading, setPostsLoading] = useState(true);

  /* =========================================================
     CURRENT LOGGED-IN USER
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const getCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error(
          "Get current user error:",
          error
        );
      }

      if (mounted) {
        setUser(user || null);
      }
    };

    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(
            session?.user || null
          );
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =========================================================
     LOAD PUBLISHED POSTS
     ========================================================= */

  useEffect(() => {
    const loadPosts = async () => {
      setPostsLoading(true);

      const {
        data,
        error,
      } = await supabase
        .from("posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Posts load error:",
          error
        );

        setPosts([]);
      } else {
        console.log(
          "Published posts:",
          data
        );

        setPosts(data || []);
      }

      setPostsLoading(false);
    };

    loadPosts();
  }, []);

  /* =========================================================
     LOGOUT
     ========================================================= */

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );
    }

    setUser(null);

    window.location.href =
      `${BASE_PATH}/`;
  };

  /* =========================================================
     GITHUB PAGES ROUTING
     ========================================================= */

  const currentPath =
    window.location.pathname
      .replace(/\/+$/, "");

  let routePath = currentPath;

  if (
    currentPath === BASE_PATH
  ) {
    routePath = "/";
  } else if (
    currentPath.startsWith(
      `${BASE_PATH}/`
    )
  ) {
    routePath =
      currentPath.slice(
        BASE_PATH.length
      );
  }

  /* =========================================================
     ROUTES
     ========================================================= */

  if (
    routePath ===
    "/admin/login"
  ) {
    return <AdminLogin />;
  }

  if (
    routePath ===
    "/admin/users"
  ) {
    return <AdminUsers />;
  }

  if (
    routePath ===
    "/login"
  ) {
    return <UserLogin />;
  }

  if (
    routePath ===
    "/register"
  ) {
    return <Register />;
  }

  if (
    routePath ===
    "/new-post"
  ) {
    return <NewPost />;
  }

  if (
    routePath ===
    "/admin"
  ) {
    return <AdminDashboard />;
  }

  /* =========================================================
     USER DISPLAY INFORMATION
     ========================================================= */

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";

  /* =========================================================
     CATEGORY POSTS
     ========================================================= */

  const getCategoryPosts = (
    category
  ) => {
    return posts.filter(
      (post) =>
        post.category ===
        category
    );
  };

  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formatDate = (
    date
  ) => {
    if (!date) return "";

    return new Date(
      date
    ).toLocaleDateString(
      "bn-BD"
    );
  };

  /* =========================================================
     POST CARD
     ========================================================= */

  const PostCard = ({
    post,
    featured = false,
  }) => {
    return (
      <article
        className={
          featured
            ? "article featured"
            : "article"
        }
        key={post.id}
      >
        {/* IMAGE */}

        <div className="article-image">
          {post.image_url ? (
            <img
              src={post.image_url}
              alt={
                post.title ||
                post.category
              }
              style={{
                width: "100%",
                height: "100%",
                objectFit:
                  "cover",
              }}
            />
          ) : (
            <span>
              {post.category}
            </span>
          )}
        </div>

        {/* BODY */}

        <div className="article-body">
          <span className="category">
            {post.category}
          </span>

          <h3>
            {post.title}
          </h3>

          <p>
            {post.content}
          </p>

          <small>
            লেখক:{" "}
            <strong>
              {post.author_name ||
                "অজ্ঞাত লেখক"}
            </strong>
          </small>

          {post.created_at && (
            <small
              style={{
                display:
                  "block",
                marginTop:
                  "5px",
              }}
            >
              প্রকাশিত:{" "}
              {formatDate(
                post.created_at
              )}
            </small>
          )}
        </div>
      </article>
    );
  };

  /* =========================================================
     CATEGORY SECTION
     ========================================================= */

  const CategorySection = ({
    category,
    limit = 6,
  }) => {
    const categoryPosts =
      getCategoryPosts(
        category
      );

    return (
      <section
        className="section category-section"
        id={category}
      >
        <div className="section-title">
          <h2>
            {category}
          </h2>

          <a
            href={
              "#" +
              category
            }
          >
            সব লেখা →
          </a>
        </div>

        {categoryPosts.length >
        0 ? (
          <div className="article-grid">
            {categoryPosts
              .slice(0, limit)
              .map(
                (
                  post,
                  index
                ) => (
                  <PostCard
                    key={
                      post.id
                    }
                    post={
                      post
                    }
                    featured={
                      index ===
                      0
                    }
                  />
                )
              )}
          </div>
        ) : (
          <div className="simple-grid">
            <div className="text-card">
              <span>
                {category}
              </span>

              <h3>
                এখনো কোনো লেখা প্রকাশিত হয়নি
              </h3>

              <p>
                এই বিভাগে নতুন লেখা
                প্রকাশিত হলে এখানে
                দেখা যাবে।
              </p>
            </div>
          </div>
        )}
      </section>
    );
  };

  /* =========================================================
     PUBLIC WEBSITE
     ========================================================= */

  return (
    <div className="site">

      {/* =====================================================
          HEADER
          ===================================================== */}

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
            onClick={() =>
              setMenuOpen(
                !menuOpen
              )
            }
            aria-label="Menu"
          >
            ☰
          </button>

          {/* CENTER BRAND */}

          <div
            className="brand-title"
            style={{
              position:
                "absolute",
              left: "50%",
              transform:
                "translateX(-50%)",
              textAlign:
                "center",
              whiteSpace:
                "nowrap",
            }}
          >

            <h1>
              সাহিত্যানন্দ
            </h1>

            <p>
              বাংলা সাহিত্য ও জ্ঞানভাণ্ডার
            </p>

          </div>

          {/* USER AREA */}

          <div className="header-user-area">

            {user ? (

              <div className="logged-user">

                {/* NEW POST */}

                <a
                  href={`${BASE_PATH}/new-post`}
                  className="new-post-header-button"
                >
                  ✍️ নতুন লেখা
                </a>

                {/* AVATAR */}

                <div className="user-avatar">

                  {userName
                    .charAt(0)
                    .toUpperCase()}

                </div>

                {/* USER INFO */}

                <div className="user-info">

                  <strong>
                    {userName}
                  </strong>

                  <small>
                    {user.email}
                  </small>

                </div>

                {/* LOGOUT */}

                <button
                  className="logout-button"
                  onClick={
                    handleLogout
                  }
                >
                  Logout
                </button>

              </div>

            ) : (

              <a
                href={`${BASE_PATH}/login`}
                className="header-login-button"
              >
                Login
              </a>

            )}

          </div>

        </div>

        {/* ===================================================
            NAVIGATION
            =================================================== */}

        <nav
          className={
            menuOpen
              ? "nav open"
              : "nav"
          }
        >

          {categories.map(
            (category) => (

              <a
                href={
                  "#" +
                  category
                }
                key={
                  category
                }
                onClick={() =>
                  setMenuOpen(
                    false
                  )
                }
              >
                {category}
              </a>

            )
          )}

        </nav>

      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main>

        {/* NOTICE */}

        <div className="notice">

          <strong>
            সাহিত্যনন্দ
          </strong>

          <span>
            বাংলা ভাষা, সাহিত্য ও জ্ঞানচর্চার একটি স্বাধীন প্ল্যাটফর্ম
          </span>

        </div>

        {/* ===================================================
            HERO
            =================================================== */}

        <section className="hero">

          <div className="hero-content">

            <span className="tag">
              বিশেষ লেখা
            </span>

            <h2>
              বাংলা সাহিত্যের নতুন ঠিকানা
            </h2>

            <p>
              কবিতা, গল্প, ধারাবাহিক
              উপন্যাস, মুক্ত গদ্য,
              বই পরিচিতি, লেখক
              পরিচিতি এবং জ্ঞানচর্চার
              নানা বিষয় নিয়ে
              সাহিত্যনন্দ।
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

        {/* ===================================================
            LATEST PUBLICATIONS
            =================================================== */}

        <section
          className="section"
          id="all"
        >

          <div className="section-title">

            <h2>
              সর্বশেষ প্রকাশনা
            </h2>

            <a href="#all">
              সব লেখা →
            </a>

          </div>

          {postsLoading ? (

            <div className="article-grid">

              <div className="article">

                <div className="article-body">

                  <p>
                    লেখা লোড হচ্ছে...
                  </p>

                </div>

              </div>

            </div>

          ) : posts.length > 0 ? (

            <div className="article-grid">

              {posts
                .slice(0, 12)
                .map(
                  (
                    post,
                    index
                  ) => (

                    <PostCard
                      key={
                        post.id
                      }
                      post={
                        post
                      }
                      featured={
                        index ===
                        0
                      }
                    />

                  )
                )}

            </div>

          ) : (

            <div className="simple-grid">

              <div className="text-card">

                <span>
                  সাহিত্যনন্দ
                </span>

                <h3>
                  এখনো কোনো লেখা প্রকাশিত হয়নি
                </h3>

                <p>
                  Login করে নতুন লেখা
                  প্রকাশ করুন।
                </p>

              </div>

            </div>

          )}

        </section>

        {/* ===================================================
            CATEGORY SECTIONS
            =================================================== */}

        <CategorySection
          category="কবিতা"
        />

        <CategorySection
          category="গল্প"
        />

        <CategorySection
          category="ধারাবাহিক উপন্যাস"
        />

        <CategorySection
          category="মুক্ত গদ্য"
        />

        <CategorySection
          category="কবি/লেখক পরিচিতি"
        />

        {/* ===================================================
            KNOWLEDGE
            =================================================== */}

        <section
          className="section"
          id="জ্ঞান ও ভাষা"
        >

          <div className="section-title">

            <h2>
              জ্ঞান ও ভাষা
            </h2>

          </div>

          <div className="knowledge-grid">

            {knowledgeCategories.map(
              (category) => {

                const categoryPosts =
                  getCategoryPosts(
                    category
                  );

                return (

                  <div
                    className="knowledge-card"
                    key={
                      category
                    }
                  >

                    <h3>
                      {category}
                    </h3>

                    <p>
                      {
                        categoryDescriptions[
                          category
                        ]
                      }
                    </p>

                    {categoryPosts.length >
                    0 ? (

                      <div
                        style={{
                          marginTop:
                            "12px",
                        }}
                      >

                        <strong>
                          {
                            categoryPosts.length
                          }{" "}
                          টি লেখা
                        </strong>

                        <br />

                        <a
                          href={
                            "#" +
                            category
                          }
                        >
                          লেখা দেখুন →
                        </a>

                      </div>

                    ) : (

                      <span
                        style={{
                          display:
                            "inline-block",
                          marginTop:
                            "12px",
                          color:
                            "#888",
                        }}
                      >
                        এখনো লেখা নেই
                      </span>

                    )}

                  </div>

                );
              }
            )}

          </div>

        </section>

        {/* ===================================================
            KNOWLEDGE CATEGORY POSTS
            =================================================== */}

        <CategorySection
          category="শব্দার্থ"
        />

        <CategorySection
          category="বাগধারা"
        />

        <CategorySection
          category="ব্যাকরণ"
        />

        <CategorySection
          category="ব্যাকরণের রস"
        />

        <CategorySection
          category="বিজ্ঞানীদের জীবনী"
        />

        <CategorySection
          category="বই পরিচিতি"
        />

        {/* ===================================================
            INTERVIEW
            =================================================== */}

        <CategorySection
          category="সাক্ষাৎকার"
        />

      </main>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer>

        <h2>
          সাহিত্যনন্দ
        </h2>

        <p>
          বাংলা সাহিত্য ও জ্ঞানভাণ্ডার
        </p>

        <div className="footer-links">

          {categories.map(
            (category) => (

              <a
                href={
                  "#" +
                  category
                }
                key={
                  category
                }
              >
                {category}
              </a>

            )
          )}

        </div>

        <div className="copyright">

          © 2026 সাহিত্যনন্দ —
          সর্বস্বত্ব সংরক্ষিত

        </div>

      </footer>

    </div>
  );
}

export default App;

