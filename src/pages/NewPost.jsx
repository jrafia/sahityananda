import { useState } from "react";
import { supabase } from "../lib/supabase";

function NewPost() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("আপনাকে আগে Login করতে হবে।");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("posts").insert([
      {
        author_id: user.id,
        title: title,
        category: category,
        content: content,
        image_url: imageUrl || null,
        status: "published",
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setMessage("আপনার লেখা সফলভাবে প্রকাশিত হয়েছে।");

      setTitle("");
      setCategory("");
      setContent("");
      setImageUrl("");
    }

    setLoading(false);
  };

  return (
    <div className="new-post-page">
      <div className="new-post-box">
        <div className="new-post-header">
          <h1>নতুন লেখা</h1>
          <p>আপনার লেখা সাহিত্যনন্দে প্রকাশ করুন</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>শিরোনাম</label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="লেখার শিরোনাম লিখুন"
            required
          />

          <label>ক্যাটাগরি</label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">ক্যাটাগরি নির্বাচন করুন</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label>ছবির URL</label>

          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />

          <label>লেখা</label>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="আপনার লেখা এখানে লিখুন..."
            rows="15"
            required
          />

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

          <button
            type="submit"
            disabled={loading}
            className="new-post-submit"
          >
            {loading ? "প্রকাশ হচ্ছে..." : "লেখা প্রকাশ করুন"}
          </button>
        </form>

        <a
          href="/sahityananda/"
          className="new-post-back"
        >
          ← Home এ ফিরে যান
        </a>
      </div>
    </div>
  );
}

export default NewPost;