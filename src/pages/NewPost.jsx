import { useState } from "react";
import { supabase } from "../lib/supabase";

function NewPost() {
  const [authorName, setAuthorName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("আপনাকে আগে Login করতে হবে।");
        setLoading(false);
        return;
      }

      if (!authorName.trim()) {
        setError("লেখকের নাম লিখুন।");
        setLoading(false);
        return;
      }

      if (!title.trim()) {
        setError("শিরোনাম লিখুন।");
        setLoading(false);
        return;
      }

      if (!category) {
        setError("ক্যাটাগরি নির্বাচন করুন।");
        setLoading(false);
        return;
      }

      if (!content.trim()) {
        setError("লেখা লিখুন।");
        setLoading(false);
        return;
      }

      /* ================= IMAGE UPLOAD ================= */

      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();

        const fileName =
          `${user.id}-${Date.now()}.${fileExt}`;

        const filePath =
          `${user.id}/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("post-images")
            .upload(
              filePath,
              imageFile,
              {
                cacheControl: "3600",
                upsert: false,
              }
            );

        if (uploadError) {
          console.error(uploadError);

          setError(
            "ছবি Upload করা যায়নি: " +
              uploadError.message
          );

          setLoading(false);
          return;
        }

        const { data } =
          supabase.storage
            .from("post-images")
            .getPublicUrl(filePath);

        imageUrl = data.publicUrl;
      }

      /* ================= INSERT POST ================= */

      const { error: insertError } =
        await supabase
          .from("posts")
          .insert([
            {
              author_id: user.id,
              author_name: authorName.trim(),
              title: title.trim(),
              category: category,
              content: content.trim(),
              image_url: imageUrl,
              status: "published",
            },
          ]);

      if (insertError) {
        console.error(insertError);

        setError(
          "লেখা প্রকাশ করা যায়নি: " +
            insertError.message
        );

        setLoading(false);
        return;
      }

      /* ================= SUCCESS ================= */

      setMessage(
        "আপনার লেখা সফলভাবে প্রকাশিত হয়েছে।"
      );

      setAuthorName("");
      setTitle("");
      setCategory("");
      setContent("");
      setImageFile(null);
      setImagePreview("");

      const fileInput =
        document.getElementById("post-image");

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (err) {
      console.error(err);

      setError(
        "একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।"
      );
    }

    setLoading(false);
  };

  return (
    <div className="new-post-page">

      <div className="new-post-box">

        <div className="new-post-header">

          <h1>
            নতুন লেখা
          </h1>

          <p>
            আপনার লেখা সাহিত্যনন্দে প্রকাশ করুন
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          {/* ================= AUTHOR ================= */}

          <label>
            লেখক
          </label>

          <input
            type="text"
            value={authorName}
            onChange={(e) =>
              setAuthorName(e.target.value)
            }
            placeholder="লেখকের নাম লিখুন"
            required
          />

          {/* ================= TITLE ================= */}

          <label>
            শিরোনাম
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            placeholder="লেখার শিরোনাম লিখুন"
            required
          />

          {/* ================= CATEGORY ================= */}

          <label>
            ক্যাটাগরি
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            required
          >

            <option value="">
              ক্যাটাগরি নির্বাচন করুন
            </option>

            {categories.map((item) => (

              <option
                key={item}
                value={item}
              >
                {item}
              </option>

            ))}

          </select>

          {/* ================= IMAGE ================= */}

          <label>
            ছবি
          </label>

          <input
            id="post-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {/* ================= IMAGE PREVIEW ================= */}

          {imagePreview && (

            <div
              style={{
                marginTop: "15px",
                marginBottom: "10px",
              }}
            >

              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: "100%",
                  maxHeight: "300px",
                  objectFit: "cover",
                  borderRadius: "10px",
                }}
              />

            </div>

          )}

          {/* ================= CONTENT ================= */}

          <label>
            লেখা
          </label>

          <textarea
            value={content}
            onChange={(e) =>
              setContent(e.target.value)
            }
            placeholder="আপনার লেখা এখানে লিখুন..."
            rows="25"
            required
          />

          {/* ================= ERROR ================= */}

          {error && (

            <div className="new-post-error">
              {error}
            </div>

          )}

          {/* ================= SUCCESS ================= */}

          {message && (

            <div className="new-post-success">
              {message}
            </div>

          )}

          {/* ================= SUBMIT ================= */}

          <button
            type="submit"
            disabled={loading}
            className="new-post-submit"
          >

            {loading
              ? "প্রকাশ হচ্ছে..."
              : "লেখা প্রকাশ করুন"}

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