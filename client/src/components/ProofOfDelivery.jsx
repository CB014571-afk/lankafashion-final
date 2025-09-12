import React, { useState } from "react";

export default function ProofOfDelivery({ deliveryId, onUpload }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null); // data URL preview
  const [message, setMessage] = useState("");
  const [submittedProof, setSubmittedProof] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function readAsDataURL(f) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
  }

  const handleFileChange = async (e) => {
    setError("");
    setMessage("");
    const selected = e.target.files?.[0] || null;
    setFile(selected);

    if (selected) {
      // Create a *data URL* preview (works offline and matches backend format)
      const dataUrl = await readAsDataURL(selected);
      setPreview(dataUrl);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !preview) {
      setMessage("");
      setError("Please select an image first.");
      return;
    }
    try {
      setBusy(true);
      // Pass the base64 data URL upward; parent will call the API.
      const savedUrl = await onUpload(deliveryId, preview);
      setMessage("Proof of delivery submitted! ✅");
      // Prefer server URL if it returns one; otherwise fall back to local preview
      setSubmittedProof(savedUrl || preview);
      setFile(null);
      setPreview(null);
    } catch (e) {
      console.error(e);
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Proof of Delivery</h3>

      <input
        type="file"
        accept="image/*,.jpg,.jpeg,.png,.webp"
        // ⛔ Do NOT add `capture` — that’s what forces the camera.
        onChange={handleFileChange}
        style={{ marginBottom: "0.5rem" }}
      />

      {preview && (
        <div style={{ marginBottom: "0.5rem" }}>
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: 220, maxHeight: 220, display: "block", borderRadius: 6 }}
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        style={{ padding: "0.5rem 1rem" }}
        disabled={busy || !preview}
      >
        {busy ? "Uploading..." : "Upload"}
      </button>

      {error && <div style={{ marginTop: 8, color: "#b00020" }}>{error}</div>}
      {message && <div style={{ marginTop: 8, color: "green" }}>{message}</div>}

      {submittedProof && (
        <div style={{ marginTop: "1rem" }}>
          <h4>Submitted Proof</h4>
          <a href={submittedProof} target="_blank" rel="noreferrer" title="Open full image">
            <img
              src={submittedProof}
              alt="Submitted Proof"
              style={{ maxWidth: 220, maxHeight: 220, display: "block", borderRadius: 6 }}
            />
          </a>
        </div>
      )}
    </div>
  );
}
