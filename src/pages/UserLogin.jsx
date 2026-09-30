import { useState } from "react";
import { supabase } from "../lib/supabase";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      window.location.href = "/sahityananda/";
    }

    setLoading(false);
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

          <label>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="আপনার Email লিখুন"
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="আপনার Password লিখুন"
            required
          />

          {error && (
            <div className="user-login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Login হচ্ছে..." : "Login"}
          </button>

        </form>

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