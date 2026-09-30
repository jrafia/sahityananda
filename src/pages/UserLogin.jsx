import { useState } from "react";
import { supabase } from "../lib/supabase";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/sahityananda/";
  };

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("প্রথমে আপনার Email লিখুন।");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo:
          "https://jrafia.github.io/sahityananda/reset-password",
      }
    );

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Password reset link আপনার email-এ পাঠানো হয়েছে। Inbox এবং Spam folder চেক করুন।"
      );
    }

    setResetLoading(false);
  };

  return (
    <div className="user-login-page">

      <div className="user-login-box">

        <div className="user-login-logo">
          সাহিত্যানন্দ
        </div>

        <h1>User Login</h1>

        <p>
          আপনার অ্যাকাউন্টে লগইন করুন
        </p>

        <form onSubmit={handleLogin}>

          <label htmlFor="login-email">
            Email
          </label>

          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="আপনার Email লিখুন"
            autoComplete="email"
            required
          />

          <label htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="আপনার Password লিখুন"
            autoComplete="current-password"
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

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? "Login হচ্ছে..." : "Login"}
          </button>

        </form>

        {/* FORGOT PASSWORD */}
        <button
          type="button"
          className="forgot-password-button"
          onClick={handleForgotPassword}
          disabled={resetLoading}
        >
          {resetLoading
            ? "Sending..."
            : "Forgot Password?"}
        </button>

        <div className="user-login-footer">
          <span>অ্যাকাউন্ট নেই?</span>

          <a href="/sahityananda/register">
            Create Account
          </a>
        </div>

        <a
          href="/sahityananda/"
          className="back-home"
        >
          ← Home এ ফিরে যান
        </a>

      </div>

    </div>
  );
}

export default UserLogin;