import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./LeafyHome.css";
import "./PlantCapture.css";

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

function PlantCapture() {
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const [thumbUrl, setThumbUrl] = useState("");
  const [cameraError, setCameraError] = useState(null);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- MediaDevices: setState runs after await inside connectCamera
    void connectCamera(ac.signal);
    return () => {
      ac.abort();
      stopStream();
    };
  }, [connectCamera, stopStream]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    setThumbUrl((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return canvas.toDataURL("image/jpeg", 0.88);
    });
  }, []);

  const onPickFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file?.type?.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setThumbUrl((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return url;
    });
    e.target.value = "";
  }, []);

  useEffect(() => {
    return () => {
      if (thumbUrl.startsWith("blob:")) URL.revokeObjectURL(thumbUrl);
    };
  }, [thumbUrl]);

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
                onClick={capturePhoto}
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
                  Try again
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default PlantCapture;
