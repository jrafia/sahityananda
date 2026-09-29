import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

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

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ==========================================
  // EDIT STATES
  // ==========================================

  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editStatus, setEditStatus] = useState("published");

  // IMAGE EDIT
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  // ==========================================
  // CHECK ADMIN + LOAD POSTS
  // ==========================================

  async function checkAdminAndLoad() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href =
          "/sahityananda/admin/login";
        return;
      }

      setUser(user);

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profile || profile.role !== "admin") {
        setError("আপনার Admin permission নেই।");
        setLoading(false);
        return;
      }

      const {
        data,
        error: postsError,
      } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (postsError) {
        throw postsError;
      }

      setPosts(data || []);
    } catch (err) {
      setError(
        err.message ||
          "Dashboard load করা যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href =
      "/sahityananda/admin/login";
  }

  // ==========================================
  // START EDIT
  // ==========================================

  function startEdit(post) {
    setEditingPost(post);

    setEditTitle(post.title || "");
    setEditAuthor(post.author_name || "");
    setEditCategory(
      post.category || categories[0]
    );
    setEditContent(post.content || "");
    setEditStatus(
      post.status || "published"
    );

    // Existing image
    setEditImageFile(null);
    setEditImagePreview(
      post.image_url || ""
    );
    setRemoveImage(false);

    setError("");
    setMessage("");
  }

  // ==========================================
  // CHANGE IMAGE
  // ==========================================

  function handleEditImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Basic image validation
    if (!file.type.startsWith("image/")) {
      alert("শুধু Image file নির্বাচন করুন।");
      return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      alert("ছবির size সর্বোচ্চ 5 MB হতে হবে।");
      return;
    }

    setEditImageFile(file);
    setEditImagePreview(
      URL.createObjectURL(file)
    );
    setRemoveImage(false);
  }

  // ==========================================
  // REMOVE IMAGE
  // ==========================================

  function handleRemoveImage() {
    setEditImageFile(null);
    setEditImagePreview("");
    setRemoveImage(true);
  }

  // ==========================================
  // CANCEL EDIT
  // ==========================================

  function cancelEdit() {
    setEditingPost(null);

    setEditTitle("");
    setEditAuthor("");
    setEditCategory("");
    setEditContent("");
    setEditStatus("published");

    setEditImageFile(null);
    setEditImagePreview("");
    setRemoveImage(false);
  }

  // ==========================================
  // SAVE EDIT
  // ==========================================

  async function saveEdit() {
    if (!editingPost) return;

    if (!editTitle.trim()) {
      alert("Title দিন।");
      return;
    }

    if (!editAuthor.trim()) {
      alert("Author দিন।");
      return;
    }

    if (!editContent.trim()) {
      alert("Content দিন।");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      // ======================================
      // IMAGE URL
      // ======================================

      let imageUrl =
        editingPost.image_url || null;

      // Remove image
      if (removeImage) {
        imageUrl = null;
      }

      // ======================================
      // UPLOAD NEW IMAGE
      // ======================================

      if (editImageFile) {
        const fileExt =
          editImageFile.name
            .split(".")
            .pop()
            .toLowerCase();

        const filePath =
          `admin-edit/${editingPost.id}-${Date.now()}.${fileExt}`;

        const {
          error: uploadError,
        } = await supabase.storage
          .from("post-images")
          .upload(
            filePath,
            editImageFile,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: publicUrlData,
        } = supabase.storage
          .from("post-images")
          .getPublicUrl(filePath);

        imageUrl =
          publicUrlData.publicUrl;
      }

      // ======================================
      // UPDATE POST
      // ======================================

      const {
        data,
        error: updateError,
      } = await supabase
        .from("posts")
        .update({
          title: editTitle.trim(),
          author_name:
            editAuthor.trim(),
          category: editCategory,
          content: editContent.trim(),
          status: editStatus,
          image_url: imageUrl,
        })
        .eq("id", editingPost.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // ======================================
      // UPDATE LOCAL STATE
      // ======================================

      setPosts((previousPosts) =>
        previousPosts.map((post) =>
          post.id === editingPost.id
            ? data
            : post
        )
      );

      setEditingPost(null);

      setEditImageFile(null);
      setEditImagePreview("");
      setRemoveImage(false);

      setMessage(
        "লেখাটি সফলভাবে Update হয়েছে।"
      );
    } catch (err) {
      setError(
        "Update করা যায়নি: " +
          (err.message ||
            "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // DELETE POST
  // ==========================================

  async function deletePost(post) {
    const confirmed = window.confirm(
      `"${post.title}" লেখাটি কি Delete করতে চান?\n\nএই কাজটি Undo করা যাবে না।`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const {
        error: deleteError,
      } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);

      if (deleteError) {
        throw deleteError;
      }

      setPosts((previousPosts) =>
        previousPosts.filter(
          (item) => item.id !== post.id
        )
      );

      setMessage(
        "লেখাটি সফলভাবে Delete হয়েছে।"
      );
    } catch (err) {
      setError(
        "Delete করা যায়নি: " +
          (err.message ||
            "Unknown error")
      );
    }
  }

  // ==========================================
  // DATE
  // ==========================================

  function formatDate(date) {
    if (!date) return "-";

    return new Date(
      date
    ).toLocaleDateString(
      "bn-BD",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalPosts =
    posts.length;

  const publishedPosts =
    posts.filter(
      (post) =>
        post.status === "published"
    ).length;

  const draftPosts =
    posts.filter(
      (post) =>
        post.status === "draft"
    ).length;

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-layout">

      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="admin-logo">
            স
          </div>

          <div>
            <h2>সাহিত্যনন্দ</h2>
            <span>Admin Panel</span>
          </div>

        </div>

        <nav className="admin-nav">

          <div className="nav-title">
            প্রধান
          </div>

          <a
            href="/sahityananda/admin"
            className="active"
          >
            <span>⌂</span>
            Dashboard
          </a>

          <a href="/sahityananda/new-post">
            <span>✍️</span>
            নতুন লেখা
          </a>

          <a href="#recent-posts">
            <span>📚</span>
            সব লেখা
          </a>

          <div className="nav-title">
            ব্যবস্থাপনা
          </div>

          <a href="#categories">
            <span>📂</span>
            Category
          </a>

          <a href="#recent-posts">
            <span>👤</span>
            Author / লেখা
          </a>

          <a href="/sahityananda/admin/users">
            <span>👥</span>
            Users
          </a>

          <a href="/sahityananda/new-post">
            <span>🖼️</span>
            Media / ছবি যোগ
          </a>

          <a href="#advertisement">
            <span>📢</span>
            Advertisement
          </a>

          <div className="nav-title">
            সেটিংস
          </div>

          <a href="#settings">
            <span>⚙️</span>
            Settings
          </a>

        </nav>

        <div className="sidebar-bottom">

          <div className="admin-user-mini">

            <div className="user-avatar">
              {user?.email
                ?.charAt(0)
                .toUpperCase() ||
                "A"}
            </div>

            <div>
              <strong>Admin</strong>

              <small>
                {user?.email ||
                  "Admin"}
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

      {/* =====================================
          MAIN
      ====================================== */}

      <div className="admin-main">

        <header className="admin-topbar">

          <div>

            <h1>Dashboard</h1>

            <p>
              সাহিত্যনন্দ পরিচালনা
              প্যানেলে স্বাগতম
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

            <button
              onClick={checkAdminAndLoad}
              className="view-site-btn"
              disabled={loading}
            >
              ↻ Refresh
            </button>

            <div className="top-avatar">
              {user?.email
                ?.charAt(0)
                .toUpperCase() ||
                "A"}
            </div>

          </div>

        </header>

        <main className="admin-content">

          {error && (
            <div className="new-post-error">
              {error}
            </div>
          )}

          {message && (
            <div className="new-post-success">
              {message}
            </div>
          )}

          {loading && (
            <div className="dashboard-panel">
              <p>
                Dashboard loading...
              </p>
            </div>
          )}

          {!loading && !error && (
            <>

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
                    আপনার সাহিত্যনন্দ
                    ওয়েবসাইটের সবকিছু
                    এখান থেকে পরিচালনা
                    করুন।
                  </p>

                </div>

                <a
                  href="/sahityananda/new-post"
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
                    <span>
                      মোট লেখা
                    </span>

                    <strong>
                      {totalPosts}
                    </strong>

                    <small>
                      সকল Article
                    </small>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon publish-icon">
                    🚀
                  </div>

                  <div>
                    <span>
                      প্রকাশিত
                    </span>

                    <strong>
                      {publishedPosts}
                    </strong>

                    <small>
                      Published
                    </small>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon draft-icon">
                    📄
                  </div>

                  <div>
                    <span>
                      Draft
                    </span>

                    <strong>
                      {draftPosts}
                    </strong>

                    <small>
                      অসম্পূর্ণ লেখা
                    </small>
                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-icon category-icon">
                    📂
                  </div>

                  <div>
                    <span>
                      Category
                    </span>

                    <strong>
                      {categories.length}
                    </strong>

                    <small>
                      সাহিত্য বিভাগ
                    </small>
                  </div>

                </div>

              </section>


              {/* QUICK ACTIONS */}

              <section className="dashboard-grid">

                <div className="dashboard-panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        Quick Actions
                      </h3>

                      <p>
                        দ্রুত কাজ শুরু করুন
                      </p>

                    </div>

                  </div>

                  <div className="quick-actions">

                    <a
                      href="/sahityananda/new-post"
                      className="quick-card"
                    >
                      <div>✍️</div>

                      <strong>
                        নতুন লেখা
                      </strong>

                      <span>
                        কবিতা, গল্প বা
                        প্রবন্ধ লিখুন
                      </span>
                    </a>

                    <a
                      href="#recent-posts"
                      className="quick-card"
                    >
                      <div>📚</div>

                      <strong>
                        সব লেখা
                      </strong>

                      <span>
                        লেখা Manage করুন
                      </span>
                    </a>

                    <a
                      href="/sahityananda/admin/users"
                      className="quick-card"
                    >
                      <div>👥</div>

                      <strong>
                        Users
                      </strong>

                      <span>
                        User ও Role
                        পরিচালনা করুন
                      </span>
                    </a>

                    <a
                      href="/sahityananda/new-post"
                      className="quick-card"
                    >
                      <div>🖼️</div>

                      <strong>
                        Media
                      </strong>

                      <span>
                        লেখায় ছবি যোগ করুন
                      </span>
                    </a>

                  </div>

                </div>


                {/* RECENT POSTS */}

                <div
                  className="dashboard-panel"
                  id="recent-posts"
                >

                  <div className="panel-header">

                    <div>

                      <h3>
                        সাম্প্রতিক লেখা
                      </h3>

                      <p>
                        Latest Articles
                      </p>

                    </div>

                    <a href="/sahityananda/new-post">
                      + নতুন লেখা
                    </a>

                  </div>


                  {posts.length === 0 ? (

                    <div className="empty-state">

                      <div className="empty-icon">
                        📝
                      </div>

                      <h4>
                        এখনও কোনো লেখা নেই
                      </h4>

                      <p>
                        আপনার প্রথম
                        লেখাটি প্রকাশ করুন।
                      </p>

                      <a
                        href="/sahityananda/new-post"
                        className="empty-btn"
                      >
                        ＋ নতুন লেখা
                      </a>

                    </div>

                  ) : (

                    <div
                      style={{
                        overflowX:
                          "auto",
                      }}
                    >

                      <table className="users-table">

                        <thead>

                          <tr>

                            <th>
                              শিরোনাম
                            </th>

                            <th>
                              লেখক
                            </th>

                            <th>
                              বিভাগ
                            </th>

                            <th>
                              Status
                            </th>

                            <th>
                              তারিখ
                            </th>

                            <th>
                              Manage
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {posts
                            .slice(0, 10)
                            .map(
                              (post) => (

                                <tr
                                  key={
                                    post.id
                                  }
                                >

                                  <td>
                                    <strong>
                                      {
                                        post.title
                                      }
                                    </strong>
                                  </td>

                                  <td>
                                    {post.author_name ||
                                      "অজানা"}
                                  </td>

                                  <td>
                                    {
                                      post.category
                                    }
                                  </td>

                                  <td>

                                    <span
                                      className="role-badge"
                                      style={{
                                        background:
                                          post.status ===
                                          "published"
                                            ? "#dcfce7"
                                            : "#fef3c7",

                                        color:
                                          post.status ===
                                          "published"
                                            ? "#166534"
                                            : "#92400e",
                                      }}
                                    >
                                      {post.status ===
                                      "published"
                                        ? "Published"
                                        : "Draft"}
                                    </span>

                                  </td>

                                  <td>
                                    {formatDate(
                                      post.created_at
                                    )}
                                  </td>

                                  <td>

                                    <div
                                      style={{
                                        display:
                                          "flex",
                                        gap:
                                          "6px",
                                        flexWrap:
                                          "wrap",
                                      }}
                                    >

                                      <button
                                        type="button"
                                        onClick={() =>
                                          startEdit(
                                            post
                                          )
                                        }
                                        style={{
                                          padding:
                                            "7px 11px",
                                          border:
                                            "1px solid #ddd",
                                          borderRadius:
                                            "6px",
                                          background:
                                            "#fff",
                                          cursor:
                                            "pointer",
                                        }}
                                      >
                                        ✏️ Edit
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          deletePost(
                                            post
                                          )
                                        }
                                        style={{
                                          padding:
                                            "7px 11px",
                                          border:
                                            "1px solid #fecaca",
                                          borderRadius:
                                            "6px",
                                          background:
                                            "#fff",
                                          color:
                                            "#dc2626",
                                          cursor:
                                            "pointer",
                                        }}
                                      >
                                        🗑️ Delete
                                      </button>

                                    </div>

                                  </td>

                                </tr>

                              )
                            )}

                        </tbody>

                      </table>

                    </div>

                  )}

                </div>

              </section>


              {/* WEBSITE OVERVIEW */}

              <section className="dashboard-grid lower-grid">

                <div
                  className="dashboard-panel"
                  id="categories"
                >

                  <div className="panel-header">

                    <div>

                      <h3>
                        Website Overview
                      </h3>

                      <p>
                        সাহিত্যনন্দের
                        বর্তমান অবস্থা
                      </p>

                    </div>

                  </div>

                  <div className="overview-list">

                    <div>
                      <span>
                        🌐 Website
                      </span>

                      <strong>
                        Live
                      </strong>
                    </div>

                    <div>
                      <span>
                        🔐 Admin Authentication
                      </span>

                      <strong>
                        Active
                      </strong>
                    </div>

                    <div>
                      <span>
                        ☁️ Database
                      </span>

                      <strong>
                        Supabase
                      </strong>
                    </div>

                    <div>
                      <span>
                        🚀 Hosting
                      </span>

                      <strong>
                        GitHub Pages
                      </strong>
                    </div>

                  </div>

                </div>


                <div className="dashboard-panel">

                  <div className="panel-header">

                    <div>

                      <h3>
                        সাহিত্যনন্দ
                      </h3>

                      <p>
                        বাংলা সাহিত্য ও
                        জ্ঞানভাণ্ডার
                      </p>

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

            </>
          )}

        </main>

      </div>


      {/* =========================================
          EDIT MODAL
      ========================================== */}

      {editingPost && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >

          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "850px",
              maxHeight: "94vh",
              overflowY: "auto",
              borderRadius: "16px",
              padding: "30px",
              boxShadow:
                "0 25px 60px rgba(0,0,0,0.30)",
              boxSizing:
                "border-box",
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "25px",
                borderBottom:
                  "1px solid #eee",
                paddingBottom:
                  "18px",
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "25px",
                  }}
                >
                  ✍️ লেখা Edit করুন
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color:
                      "#777",
                  }}
                >
                  New Post-এর মতো করে
                  লেখাটি সম্পাদনা করুন
                </p>

              </div>

              <button
                type="button"
                onClick={
                  cancelEdit
                }
                style={{
                  width: "38px",
                  height: "38px",
                  border: "none",
                  borderRadius:
                    "50%",
                  background:
                    "#f3f4f6",
                  fontSize:
                    "20px",
                  cursor:
                    "pointer",
                }}
              >
                ✕
              </button>

            </div>


            {/* =================================
                IMAGE
            ================================== */}

            <div
              style={{
                marginBottom:
                  "22px",
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "600",
                  marginBottom:
                    "8px",
                }}
              >
                🖼️ লেখার ছবি
              </label>


              {/* CURRENT / NEW IMAGE */}

              {editImagePreview ? (

                <div
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >

                  <img
                    src={
                      editImagePreview
                    }
                    alt="Post preview"
                    style={{
                      width:
                        "100%",
                      maxHeight:
                        "320px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "12px",
                      border:
                        "1px solid #ddd",
                      display:
                        "block",
                    }}
                  />

                  <button
                    type="button"
                    onClick={
                      handleRemoveImage
                    }
                    style={{
                      marginTop:
                        "10px",
                      padding:
                        "9px 15px",
                      border:
                        "1px solid #fecaca",
                      borderRadius:
                        "7px",
                      background:
                        "#fff",
                      color:
                        "#dc2626",
                      cursor:
                        "pointer",
                    }}
                  >
                    🗑️ ছবি Remove করুন
                  </button>

                </div>

              ) : (

                <div
                  style={{
                    border:
                      "2px dashed #d1d5db",
                    borderRadius:
                      "12px",
                    padding:
                      "35px",
                    textAlign:
                      "center",
                    color:
                      "#777",
                    marginBottom:
                      "12px",
                  }}
                >
                  🖼️ কোনো ছবি নেই
                </div>

              )}


              {/* FILE INPUT */}

              <label
                style={{
                  display:
                    "block",
                  padding:
                    "13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  cursor:
                    "pointer",
                  background:
                    "#f9fafb",
                  textAlign:
                    "center",
                  fontWeight:
                    "600",
                }}
              >

                📷
                {" "}
                {editImageFile
                  ? "অন্য ছবি নির্বাচন করুন"
                  : "ছবি Change করুন"}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleEditImageChange
                  }
                  style={{
                    display:
                      "none",
                  }}
                />

              </label>

              {editImageFile && (

                <p
                  style={{
                    marginTop:
                      "8px",
                    color:
                      "#166534",
                    fontSize:
                      "14px",
                  }}
                >
                  ✅ নতুন ছবি
                  নির্বাচন করা হয়েছে:
                  {" "}
                  {
                    editImageFile.name
                  }
                </p>

              )}

              <small
                style={{
                  display:
                    "block",
                  marginTop:
                    "7px",
                  color:
                    "#777",
                }}
              >
                JPG, PNG, WEBP ইত্যাদি
                Image ব্যবহার করতে পারবেন।
                Maximum 5 MB.
              </small>

            </div>


            {/* =================================
                TITLE
            ================================== */}

            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "600",
                  marginBottom:
                    "7px",
                }}
              >
                লেখার শিরোনাম
              </label>

              <input
                type="text"
                value={
                  editTitle
                }
                onChange={(e) =>
                  setEditTitle(
                    e.target.value
                  )
                }
                placeholder="লেখার শিরোনাম লিখুন"
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  boxSizing:
                    "border-box",
                  fontSize:
                    "16px",
                }}
              />

            </div>


            {/* =================================
                AUTHOR
            ================================== */}

            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "600",
                  marginBottom:
                    "7px",
                }}
              >
                লেখকের নাম
              </label>

              <input
                type="text"
                value={
                  editAuthor
                }
                onChange={(e) =>
                  setEditAuthor(
                    e.target.value
                  )
                }
                placeholder="লেখকের নাম"
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  boxSizing:
                    "border-box",
                  fontSize:
                    "16px",
                }}
              />

            </div>


            {/* =================================
                CATEGORY
            ================================== */}

            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "600",
                  marginBottom:
                    "7px",
                }}
              >
                বিভাগ / Category
              </label>

              <select
                value={
                  editCategory
                }
                onChange={(e) =>
                  setEditCategory(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  boxSizing:
                    "border-box",
                  fontSize:
                    "16px",
                  background:
                    "#fff",
                }}
              >

                {categories.map(
                  (category) => (

                    <option
                      key={
                        category
                      }
                      value={
                        category
                      }
                    >
                      {
                        category
                      }
                    </option>

                  )
                )}

              </select>

            </div>


            {/* =================================
                CONTENT
            ================================== */}

            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "600",
                  marginBottom:
                    "7px",
                }}
              >
                লেখা / Content
              </label>

              <textarea
                value={
                  editContent
                }
                onChange={(e) =>
                  setEditContent(
                    e.target.value
                  )
                }
                placeholder="আপনার লেখা লিখুন..."
                rows={18}
                style={{
                  width:
                    "100%",
                  padding:
                    "14px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  resize:
                    "vertical",
                  boxSizing:
                    "border-box",
                  fontSize:
                    "16px",
                  lineHeight:
                    "1.8",
                  fontFamily:
                    "inherit",
                }}
              />

            </div>


            {/* =================================
                STATUS
            ================================== */}

            <div
              style={{
                marginBottom:
                  "28px",
              }}
            >

              <label
                style={{
                  display:
                    "block",
                  fontWeight:
                    "600",
                  marginBottom:
                    "7px",
                }}
              >
                প্রকাশনার অবস্থা
              </label>

              <select
                value={
                  editStatus
                }
                onChange={(e) =>
                  setEditStatus(
                    e.target.value
                  )
                }
                style={{
                  width:
                    "100%",
                  padding:
                    "13px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  background:
                    "#fff",
                  fontSize:
                    "16px",
                }}
              >

                <option value="published">
                  Published — প্রকাশিত
                </option>

                <option value="draft">
                  Draft — খসড়া
                </option>

              </select>

            </div>


            {/* =================================
                BUTTONS
            ================================== */}

            <div
              style={{
                display:
                  "flex",
                gap:
                  "12px",
                justifyContent:
                  "flex-end",
                borderTop:
                  "1px solid #eee",
                paddingTop:
                  "20px",
              }}
            >

              <button
                type="button"
                onClick={
                  cancelEdit
                }
                disabled={
                  saving
                }
                style={{
                  padding:
                    "12px 22px",
                  border:
                    "1px solid #d1d5db",
                  borderRadius:
                    "8px",
                  background:
                    "#fff",
                  cursor:
                    "pointer",
                  fontSize:
                    "15px",
                }}
              >
                বাতিল
              </button>

              <button
                type="button"
                onClick={
                  saveEdit
                }
                disabled={
                  saving
                }
                style={{
                  padding:
                    "12px 25px",
                  border:
                    "none",
                  borderRadius:
                    "8px",
                  background:
                    "#111827",
                  color:
                    "#fff",
                  cursor:
                    saving
                      ? "not-allowed"
                      : "pointer",
                  fontSize:
                    "15px",
                  fontWeight:
                    "600",
                }}
              >
                {saving
                  ? "⏳ Saving..."
                  : "💾 Update লেখা"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default AdminDashboard;

