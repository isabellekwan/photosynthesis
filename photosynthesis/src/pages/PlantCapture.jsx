import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LeafyHome.css";
import "./PlantCapture.css";
import leaf from "../assets/camera/leaf.svg";
import minus from "../assets/camera/minus.svg";
import check from "../assets/camera/check.svg";

// Placeholder: use your key via .env (recommended: `VITE_GEMINI_KEY`)
const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_KEY || "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_MODEL = "gemini-2.5-flash-lite";

const VISION_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const THUMB_SVG = (
  <svg
    className="plant-capture__thumb-icon"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      stroke="rgba(255,255,255,0.9)"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

function PlantCapture() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const analysisAbortRef = useRef(null);
  const [thumbUrl, setThumbUrl] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [popup, setPopup] = useState(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const connectCamera = useCallback(
    async (signal) => {
      stopStream();
      await Promise.resolve();
      if (signal?.aborted) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError(
          "Camera is not available in this browser or context (try HTTPS or a modern browser).",
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (signal?.aborted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setCameraError(null);
        const el = videoRef.current;
        if (el) {
          el.srcObject = stream;
          await el.play().catch(() => {});
        }
      } catch (e) {
        if (signal?.aborted) return;
        const message =
          e?.name === "NotAllowedError"
            ? "Camera access was denied. Allow the camera to use live preview."
            : e?.message || "Could not start the camera.";
        setCameraError(message);
      }
    },
    [stopStream],
  );

  useEffect(() => {
    const ac = new AbortController();
    void connectCamera(ac.signal);
    return () => {
      ac.abort();
      stopStream();
      analysisAbortRef.current?.abort();
    };
  }, [connectCamera, stopStream]);

  const readFileAsDataUrl = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });
  }, []);

  const downscaleJpegDataUrl = useCallback(async (dataUrl, maxDim = 1024) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = dataUrl;

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image."));
    });

    const w = img.naturalWidth || 1;
    const h = img.naturalHeight || 1;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const targetW = Math.max(1, Math.round(w * scale));
    const targetH = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context.");
    ctx.drawImage(img, 0, 0, targetW, targetH);
    return canvas.toDataURL("image/jpeg", 0.88);
  }, []);

  const getFrameDataUrl = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    // Downscale to keep Gemini requests responsive.
    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const targetW = Math.max(1, Math.round(w * scale));
    const targetH = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, targetW, targetH);
    return canvas.toDataURL("image/jpeg", 0.88);
  }, []);

  const analyzePlantFromImage = useCallback(
    async (dataUrl, signal) => {
      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_")) {
        throw new Error(
          "Gemini API key is not set. Put it into `VITE_GEMINI_KEY` in .env.",
        );
      }
      if (!dataUrl) throw new Error("No image captured.");

      const base64 = dataUrl.split(",")[1] || "";

      const prompt = `You are Leafy, a helpful plant assistant.
Analyze the provided image.
Return ONLY valid JSON in this exact format:
{
  "isPlant": boolean,
  "suggestionTitle": string
}
Rules:
- isPlant must be true only if the image shows a living plant/leaf.
- suggestionTitle must be the most likely common name of the plant (e.g., "Sweet Basil", "Tomato") when isPlant is true.
- If isPlant is false, suggestionTitle must be an empty string.
- Do not include any extra text outside the JSON.`;

      const res = await fetch(
        `${VISION_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 256,
            },
          }),
          signal,
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Gemini request failed (${res.status}). ${text}`);
      }

      const data = await res.json();
      const geminiText =
        data?.candidates?.[0]?.content?.parts
          ?.map((p) => p?.text || "")
          .join("") || "";

      const parsed = extractJson(geminiText);
      if (!parsed || typeof parsed.isPlant !== "boolean") {
        throw new Error("Gemini returned an unexpected response.");
      }

      return {
        isPlant: parsed.isPlant,
        suggestionTitle: parsed.suggestionTitle || "",
      };
    },
    [],
  );

  const onPickFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file?.type?.startsWith("image/")) return;
    // Kick off async analysis; keep UI responsive.
    void (async () => {
      if (isAnalyzing) return;

      analysisAbortRef.current?.abort();
      const ac = new AbortController();
      analysisAbortRef.current = ac;

      setCameraError(null);
      setPopup(null);
      setIsAnalyzing(true);

      try {
        const rawDataUrl = await readFileAsDataUrl(file);
        if (ac.signal.aborted) return;

        const jpegDataUrl = await downscaleJpegDataUrl(String(rawDataUrl));
        if (ac.signal.aborted) return;

        setThumbUrl(jpegDataUrl);

        const result = await analyzePlantFromImage(jpegDataUrl, ac.signal);
        if (result.isPlant) {
          setPopup({
            type: "plant",
            suggestionTitle: result.suggestionTitle || "Plant",
          });
        } else {
          setPopup({ type: "notPlant" });
        }
      } catch (err) {
        if (err?.name !== "AbortError") {
          setPopup({ type: "notPlant" });
        }
      } finally {
        if (analysisAbortRef.current === ac) analysisAbortRef.current = null;
        setIsAnalyzing(false);
      }
    })();

    e.target.value = "";
  }, [analyzePlantFromImage, downscaleJpegDataUrl, isAnalyzing, readFileAsDataUrl]);

  useEffect(() => {
    return () => {
      if (thumbUrl.startsWith("blob:")) URL.revokeObjectURL(thumbUrl);
    };
  }, [thumbUrl]);

  const onShutter = useCallback(async () => {
    if (isAnalyzing) return;
    const dataUrl = getFrameDataUrl();
    if (!dataUrl) return;

    setThumbUrl((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return dataUrl;
    });
    setCameraError(null);
    setPopup(null);
    setIsAnalyzing(true);

    analysisAbortRef.current?.abort();
    const ac = new AbortController();
    analysisAbortRef.current = ac;
    try {
      const result = await analyzePlantFromImage(dataUrl, ac.signal);
      if (result.isPlant) {
        setPopup({
          type: "plant",
          suggestionTitle: result.suggestionTitle || "Plant",
        });
      } else {
        setPopup({ type: "notPlant" });
      }
    } catch (e) {
      if (e?.name !== "AbortError") {
        setPopup({ type: "notPlant" });
      }
    } finally {
      if (analysisAbortRef.current === ac) analysisAbortRef.current = null;
      setIsAnalyzing(false);
    }
  }, [analyzePlantFromImage, getFrameDataUrl, isAnalyzing]);

  return (
    <div className="leafy-shell">
      <div className="phone leafy-v2-phone" aria-label="Plant capture">
        <div className="plant-capture">
          <video
            ref={videoRef}
            className="plant-capture__video"
            autoPlay
            playsInline
            muted
            aria-hidden
          />

          <div className="plant-capture__gradient-falloff" aria-hidden />

          <div className="plant-capture__ui">
            <header className="plant-capture__top">
              <Link to="/" className="plant-capture__back" aria-label="Back">
                <span aria-hidden>&lt;</span>
              </Link>
            </header>

            <div className="plant-capture__center">
              <div className="plant-capture__scan" aria-hidden>
                <span className="plant-capture__corner plant-capture__corner--tl" />
                <span className="plant-capture__corner plant-capture__corner--tr" />
                <span className="plant-capture__corner plant-capture__corner--bl" />
                <span className="plant-capture__corner plant-capture__corner--br" />
                <span className="plant-capture__frost plant-capture__frost--top" />
                <span className="plant-capture__frost plant-capture__frost--bottom" />
                <span className="plant-capture__scan-line" />
              </div>
            </div>

            <footer className="plant-capture__bottom">
              <div className="plant-capture__thumb-wrap">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="plant-capture__hidden-file"
                  tabIndex={-1}
                  aria-hidden
                  onChange={onPickFile}
                />
                {thumbUrl ? (
                  <button
                    type="button"
                    className="plant-capture__thumb plant-capture__thumb--empty plant-capture__thumb--preview"
                    aria-label="Choose another photo from library"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <img src={thumbUrl} alt="" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="plant-capture__thumb plant-capture__thumb--empty"
                    aria-label="Open photo library"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {THUMB_SVG}
                  </button>
                )}
              </div>

              <button
                type="button"
                className="plant-capture__shutter"
                aria-label="Capture photo"
                onClick={() => void onShutter()}
                disabled={isAnalyzing}
              >
                <span className="plant-capture__shutter-ring" aria-hidden />
                <span className="plant-capture__shutter-inner" aria-hidden />
              </button>

              <button
                type="button"
                className="plant-capture__info"
                aria-label="Scanning tips"
                title="Center your plant in the frame for best results."
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 16v-4m0-4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </footer>
          </div>

          {cameraError ? (
            <div className="plant-capture__error" role="alert">
              <div className="plant-capture__error-inner">
                <p>{cameraError}</p>
                <button type="button" onClick={() => void connectCamera()}>
                  Try <br />again
                </button>
              </div>
            </div>
          ) : null}

          {isAnalyzing ? (
            <div className="plant-capture__analyzing" aria-live="polite">
              Analyzing image…
            </div>
          ) : null}

          {popup ? (
            <div
              className="plant-capture__popup-overlay"
              role="dialog"
              aria-modal="true"
              onClick={() => setPopup(null)}  // 👈 close on outside click
            >
              {popup.type === "plant" ? (
                <div
                  className="plant-capture__popup-sheet"
                  onClick={(e) => e.stopPropagation()}  // 👈 prevents closing
                >
                  <div className="plant-capture__popup-title">
                    <span className="plant-capture__popup-title--bold">
                      {popup.suggestionTitle}
                    </span>{" "}
                    detected!
                  </div>

                  <div className="plant-capture__popup-subtitle">
                    Is that correct?
                  </div>

                  <div className="plant-capture__popup-buttons">
                    <button
                      type="button"
                      className="plant-capture__popup-tryagain"
                      onClick={() => setPopup(null)}
                    >
                      <span className="plant-capture__popup-tryagain-text">
                        Try<br />again
                      </span>
                      <img
                        className="plant-capture__popup-tryagain-icon"
                        src={minus}
                        alt=""
                      />
                    </button>

                    <button
                      type="button"
                      className="plant-capture__popup-continue"
                      onClick={() => {
                        setPopup(null);
                        navigate("/chat", {
                          state: { detectedPlantTitle: popup.suggestionTitle },
                        });
                      }}
                    >
                      <span className="plant-capture__popup-continue-text">
                        Yes,<br />continue
                      </span>
                      <img
                        className="plant-capture__popup-continue-icon"
                        src={check}
                        alt=""
                      />
                    </button>
                  </div>

                  <div className="plant-capture__popup-bottom-row">
                    <div className="plant-capture__popup-unsure">Unsure?</div>

                    <button
                      type="button"
                      className="plant-capture__popup-ask"
                      onClick={() => {
                        setPopup(null);
                        navigate("/chat", {
                          state: { detectedPlantTitle: popup.suggestionTitle },
                        });
                      }}
                    >
                      <span className="plant-capture__popup-ask-text">Ask Leafy</span>
                      <img
                        className="plant-capture__popup-ask-icon"
                        src={leaf}
                        alt=""
                      />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="plant-capture__popup-sheet">
                  <div className="plant-capture__popup-title plant-capture__popup-title--not-plant">
                    This is not a plant, try again
                  </div>

                  <button
                    type="button"
                    className="plant-capture__popup-tryagain plant-capture__popup-tryagain--not-plant"
                    onClick={() => setPopup(null)}
                  >
                    <span className="plant-capture__popup-tryagain-text">
                      Try<br />again
                    </span>
                    <img
                      className="plant-capture__popup-tryagain-icon"
                      src={minus}
                      alt=""
                    />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PlantCapture;
