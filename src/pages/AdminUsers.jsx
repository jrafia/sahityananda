import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminUsers() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  // ==============================
  // LOAD USERS
  // ==============================
  async function loadUsers() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.href = "/sahityananda/admin/login";
        return;
      }

      setCurrentUserId(user.id);

      // Check admin
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

      if (
        profileError ||
        !profile ||
        profile.role !== "admin"
      ) {
        setError("আপনার Admin permission নেই।");
        setLoading(false);
        return;
      }

      // Load users
      const { data, error: usersError } =
        await supabase
          .from("profiles")
          .select(
            "id, full_name, email, role, is_locked"
          )
          .order("full_name", {
            ascending: true,
          });

      if (usersError) {
        throw usersError;
      }

      setUsers(data || []);
    } catch (err) {
      setError(
        err.message || "User load করা যায়নি।"
      );
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // CHANGE ROLE
  // ==============================
  async function changeRole(userId, newRole) {
    if (userId === currentUserId) {
      setError(
        "নিজের Role পরিবর্তন করা যাবে না।"
      );
      return;
    }

    const targetUser = users.find(
      (user) => user.id === userId
    );

    if (!targetUser) return;

    if (targetUser.role === newRole) {
      return;
    }

    const confirmed = window.confirm(
      `আপনি কি ${
        targetUser.full_name ||
        targetUser.email ||
        "এই User"
      }-এর Role ${newRole.toUpperCase()} করতে চান?`
    );

    if (!confirmed) return;

    setSavingId(userId);
    setError("");
    setMessage("");

    try {
      const { error: updateError } =
        await supabase
          .from("profiles")
          .update({
            role: newRole,
          })
          .eq("id", userId)
          .neq("id", currentUserId);

      if (updateError) {
        throw updateError;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                role: newRole,
              }
            : user
        )
      );

      setMessage(
        "User Role সফলভাবে পরিবর্তন হয়েছে।"
      );
    } catch (err) {
      setError(
        err.message ||
          "Role পরিবর্তন করা যায়নি।"
      );
    } finally {
      setSavingId(null);
    }
  }

  // ==============================
  // LOCK / UNLOCK USER
  // ==============================
  async function toggleLock(userId) {
    if (userId === currentUserId) {
      setError(
        "নিজের account Lock করা যাবে না।"
      );
      return;
    }

    const targetUser = users.find(
      (user) => user.id === userId
    );

    if (!targetUser) return;

    const willLock = !targetUser.is_locked;

    const confirmed = window.confirm(
      willLock
        ? `${
            targetUser.full_name ||
            targetUser.email
          }-কে Lock করতে চান?`
        : `${
            targetUser.full_name ||
            targetUser.email
          }-কে Unlock করতে চান?`
    );

    if (!confirmed) return;

    setSavingId(userId);
    setError("");
    setMessage("");

    try {
      const { error: updateError } =
        await supabase
          .from("profiles")
          .update({
            is_locked: willLock,
          })
          .eq("id", userId)
          .neq("id", currentUserId);

      if (updateError) {
        throw updateError;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                is_locked: willLock,
              }
            : user
        )
      );

      setMessage(
        willLock
          ? "User সফলভাবে Lock করা হয়েছে।"
          : "User সফলভাবে Unlock করা হয়েছে।"
      );
    } catch (err) {
      setError(
        err.message ||
          "User Lock/Unlock করা যায়নি।"
      );
    } finally {
      setSavingId(null);
    }
  }

  // ==============================
  // DELETE USER
  // ==============================
  async function deleteUser(userId) {
    if (userId === currentUserId) {
      setError(
        "নিজের account Delete করা যাবে না।"
      );
      return;
    }

    const targetUser = users.find(
      (user) => user.id === userId
    );

    if (!targetUser) return;

    const confirmed = window.confirm(
      `আপনি কি ${
        targetUser.full_name ||
        targetUser.email
      }-কে Delete করতে চান?\n\nএই কাজটি পরে Undo করা যাবে না।`
    );

    if (!confirmed) return;

    setDeletingId(userId);
    setError("");
    setMessage("");

    try {
      /*
       * IMPORTANT:
       * Supabase Auth user frontend থেকে সরাসরি
       * delete করা নিরাপদ নয়।
       *
       * এখানে Edge Function ব্যবহার করতে হবে।
       *
       * Edge Function তৈরি হওয়ার পরে এই অংশটি হবে:
       *
       * const { data, error } =
       *   await supabase.functions.invoke(
       *     "delete-user",
       *     {
       *       body: {
       *         user_id: userId
       *       }
       *     }
       *   );
       */

      throw new Error(
        "Delete User-এর জন্য secure Supabase Edge Function এখনো সেটআপ করা হয়নি।"
      );
    } catch (err) {
      setError(
        err.message ||
          "User Delete করা যায়নি।"
      );
    } finally {
      setDeletingId(null);
    }
  }

  // ==============================
  // ADD USER
  // ==============================
  function addNewUser() {
    /*
     * এখানে পরে Add User modal খুলবে।
     *
     * Form:
     * Full Name
     * Email
     * Password
     * Role = User / Admin
     *
     * Secure Auth user creation-এর জন্য
     * Edge Function ব্যবহার করা হবে।
     */

    setError("");
    setMessage(
      "Add User form পরবর্তী ধাপে যুক্ত করা হবে।"
    );
  }

  // ==============================
  // SEARCH
  // ==============================
  const filteredUsers = users.filter(
    (user) =>
      `${user.full_name || ""} ${
        user.email || ""
      } ${user.role || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="users-page">
      {/* =========================
          HEADER
      ========================== */}
      <div className="users-page-header">
        <div>
          <h1>Users</h1>

          <p>
            User, Role এবং Account Status
            পরিচালনা করুন
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            className="create-user-btn"
            onClick={addNewUser}
          >
            + Add New User
          </button>

          <button
            className="create-user-btn"
            onClick={loadUsers}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* =========================
          MESSAGES
      ========================== */}
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

      {/* =========================
          TOOLBAR
      ========================== */}
      <div className="users-toolbar">
        <div className="user-search">
          <span>🔍</span>

          <input
            type="text"
            placeholder="নাম, Email অথবা Role দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="user-count">
          মোট User: {filteredUsers.length}
        </div>
      </div>

      {/* =========================
          USERS TABLE
      ========================== */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                  }}
                >
                  User list loading...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  {/* USER */}
                  <td>
                    <div className="table-user">
                      <div className="table-avatar">
                        {(
                          user.full_name ||
                          user.email ||
                          "U"
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <strong>
                        {user.full_name ||
                          "নাম দেওয়া হয়নি"}
                      </strong>
                    </div>
                  </td>

                  {/* EMAIL */}
                  <td className="user-email">
                    {user.email ||
                      "Email নেই"}
                  </td>

                  {/* ROLE BADGE */}
                  <td>
                    <span
                      className="role-badge"
                      style={{
                        background:
                          user.role === "admin"
                            ? "#ede9fe"
                            : "#e0f2fe",

                        color:
                          user.role === "admin"
                            ? "#6d28d9"
                            : "#0369a1",
                      }}
                    >
                      {user.role === "admin"
                        ? "👑 Admin"
                        : "👤 User"}
                    </span>
                  </td>

                  {/* STATUS */}
                  <td>
                    {user.is_locked ? (
                      <span
                        className="status-badge"
                        style={{
                          background:
                            "#fee2e2",
                          color:
                            "#b91c1c",
                        }}
                      >
                        🔒 Locked
                      </span>
                    ) : (
                      <span
                        className="status-badge"
                        style={{
                          background:
                            "#dcfce7",
                          color:
                            "#15803d",
                        }}
                      >
                        ● Active
                      </span>
                    )}
                  </td>

                  {/* ROLE CHANGE */}
                  <td>
                    {user.id ===
                    currentUserId ? (
                      <span
                        className="role-badge"
                        title="নিজের Role পরিবর্তন করা যাবে না"
                      >
                        Current Admin
                      </span>
                    ) : (
                      <select
                        value={
                          user.role || "user"
                        }
                        disabled={
                          savingId === user.id ||
                          deletingId ===
                            user.id
                        }
                        onChange={(e) =>
                          changeRole(
                            user.id,
                            e.target.value
                          )
                        }
                        style={{
                          padding: "7px",
                          borderRadius:
                            "6px",
                          border:
                            "1px solid #ddd",
                          cursor:
                            "pointer",
                        }}
                      >
                        <option value="user">
                          User
                        </option>

                        <option value="admin">
                          Admin
                        </option>
                      </select>
                    )}
                  </td>

                  {/* ACTION */}
                  <td>
                    {user.id ===
                    currentUserId ? (
                      <span
                        style={{
                          color: "#777",
                        }}
                      >
                        নিজের Account
                      </span>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          gap: "7px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        {/* LOCK / UNLOCK */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleLock(
                              user.id
                            )
                          }
                          disabled={
                            savingId ===
                              user.id ||
                            deletingId ===
                              user.id
                          }
                          style={{
                            padding:
                              "7px 10px",
                            borderRadius:
                              "6px",
                            border:
                              "1px solid #ddd",
                            background:
                              user.is_locked
                                ? "#dcfce7"
                                : "#fef3c7",
                            color:
                              user.is_locked
                                ? "#15803d"
                                : "#92400e",
                            cursor:
                              "pointer",
                          }}
                        >
                          {user.is_locked
                            ? "🔓 Unlock"
                            : "🔒 Lock"}
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() =>
                            deleteUser(
                              user.id
                            )
                          }
                          disabled={
                            savingId ===
                              user.id ||
                            deletingId ===
                              user.id
                          }
                          style={{
                            padding:
                              "7px 10px",
                            borderRadius:
                              "6px",
                            border:
                              "1px solid #fecaca",
                            background:
                              "#fee2e2",
                            color:
                              "#b91c1c",
                            cursor:
                              "pointer",
                          }}
                        >
                          {deletingId ===
                          user.id
                            ? "Deleting..."
                            : "🗑️ Delete"}
                        </button>
                      </div>
                    )}

                    {savingId ===
                      user.id && (
                      <span
                        style={{
                          marginLeft:
                            "8px",
                          fontSize:
                            "12px",
                        }}
                      >
                        Saving...
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    color: "#888",
                  }}
                >
                  কোনো User পাওয়া যায়নি।
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;