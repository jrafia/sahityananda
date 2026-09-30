import { useState } from "react";
import { supabase } from "../lib/supabase";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password.length < 6) {
      setError("Password কমপক্ষে 6 characters হতে হবে।");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password দুটো একই নয়।");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Password successfully updated.");

      setTimeout(() => {
        window.location.href = "/sahityananda/login";
      }, 1500);
    }

    setLoading(false);
  };

  return (
    <div className="user-login-page">
      <div className="user-login-box">

        <div className="user-login-logo">
          সাহিত্যানন্দ
        </div>

        <h1>Reset Password</h1>

        <p>নতুন Password সেট করুন</p>

        <form onSubmit={handleUpdatePassword}>

          <label>New Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            required
          />

          <label>Confirm Password</label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />

          {error && (
            <div className="user-login-error">
              {error}
            </div>
          )}

          {message && (
            <div className="login-success">
              {message}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default ResetPassword;
