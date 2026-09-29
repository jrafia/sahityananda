import { useState } from "react";
import { supabase } from "../lib/supabase";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Password দুটো একই নয়।");
      return;
    }

    if (password.length < 6) {
      setError("Password কমপক্ষে ৬ অক্ষরের হতে হবে।");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        "Account তৈরি হয়েছে। Email verification প্রয়োজন হলে আপনার email inbox দেখুন।"
      );

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    }

    setLoading(false);
  };

  return (
    <div className="user-login-page">

      <div className="user-login-box">

        <div className="user-login-logo">
          সাহিত্যনন্দ
        </div>

        <h1>Create Account</h1>

        <p>
          নতুন User Account তৈরি করুন
        </p>

        <form onSubmit={handleRegister}>

          <label>
            Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="আপনার নাম"
            required
          />

          <label>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="আপনার Email"
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="কমপক্ষে ৬ অক্ষর"
            required
          />

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Password আবার লিখুন"
            required
          />

          {error && (
            <div className="user-login-error">
              {error}
            </div>
          )}

          {message && (
            <div className="register-success">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Account তৈরি হচ্ছে..." : "Create Account"}
          </button>

        </form>

        <div className="user-login-footer">
          <span>আগেই Account আছে?</span>

          <a href="/sahityananda/login">
            Login
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

export default Register;