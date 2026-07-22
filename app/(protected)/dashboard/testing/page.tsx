// Responsibility: Interactive waste detection testing page – submit an image URL, visualize ML results with bounding boxes.
"use client";

import { useState, useRef, useCallback, useEffect, type FormEvent } from "react";

interface DetectedItem {
  label: string;
  confidence: number;
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

interface PredictionResult {
  status: string;
  detected_items_count: number;
  detected_items: DetectedItem[];
}

// Visually distinct palette — cycles if more items than colors
const BOX_COLORS = [
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#84cc16", // lime
  "#ec4899", // pink
];

function getConfidenceTier(c: number) {
  if (c >= 0.75) return "high";
  if (c >= 0.45) return "medium";
  return "low";
}

const CONFIDENCE_COLORS: Record<string, string> = {
  high: "#059669",
  medium: "#d97706",
  low: "#dc2626",
};

function formatLabel(label: string) {
  return label.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Cross-browser rounded rect (ctx.roundRect not available in all browsers)
function pillRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawBoxes(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  items: DetectedItem[],
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // --- FIX 1: account for device pixel ratio (Retina / HiDPI) ---
  const dpr = window.devicePixelRatio || 1;

  // CSS pixel dimensions of the img element
  const cssW = img.clientWidth;
  const cssH = img.clientHeight;

  if (!cssW || !cssH) return;

  // Set buffer to physical pixel size
  canvas.width  = cssW * dpr;
  canvas.height = cssH * dpr;

  // Scale context so all draw commands use CSS pixel coordinates
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssW, cssH);

  const natW = img.naturalWidth;
  const natH = img.naturalHeight;
  if (!natW || !natH) return;

  // object-fit: contain — actual image rect inside the element (CSS px)
  const scale    = Math.min(cssW / natW, cssH / natH);
  const imgDrawW = natW * scale;
  const imgDrawH = natH * scale;
  const offsetX  = (cssW - imgDrawW) / 2;
  const offsetY  = (cssH - imgDrawH) / 2;

  items.forEach((item, i) => {
    const color = BOX_COLORS[i % BOX_COLORS.length];

    // Map original-image pixel coords → canvas CSS pixel coords
    const x = offsetX + item.xMin * scale;
    const y = offsetY + item.yMin * scale;
    const w = (item.xMax - item.xMin) * scale;
    const h = (item.yMax - item.yMin) * scale;
    const pct  = (item.confidence * 100).toFixed(1);
    const text = `${formatLabel(item.label)}  ${pct}%`;

    // Semi-transparent fill
    ctx.fillStyle = `${color}26`;
    ctx.fillRect(x, y, w, h);

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.strokeRect(x, y, w, h);

    // Corner accent dots
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([cx, cy]) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Label pill
    ctx.font = `bold 12px "Geist Mono", monospace`;
    const textW  = ctx.measureText(text).width;
    const pillPad = 8;
    const pillH  = 22;
    const pillW  = textW + pillPad * 2;
    // Keep pill inside the canvas horizontally; prefer above the box
    const pillX = Math.max(offsetX, Math.min(x, cssW - pillW - 2));
    const pillY = y > pillH + 4 ? y - pillH - 4 : y + 4;

    ctx.fillStyle = color;
    pillRect(ctx, pillX, pillY, pillW, pillH, 5);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, pillX + pillPad, pillY + 15);
  });
}

export default function TestingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw (or redraw) boxes once image is loaded
  const handleImageLoad = useCallback(() => {
    if (!imgRef.current || !canvasRef.current || !result) return;
    drawBoxes(canvasRef.current, imgRef.current, result.detected_items);
  }, [result]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSubmittedUrl(url.trim());

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: url.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.detail ?? errData?.error ?? `Request failed (${res.status})`,
        );
      }

      const data: PredictionResult = await res.json();
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-section">
      {/* Hero header */}
      <section className="dashboard-hero">
        <p className="dashboard-eyebrow">AI Engine · v1.1.0</p>
        <h1>Waste Detection</h1>
        <p>
          Paste any image URL below to run YOLO-based waste detection. The model
          identifies and locates waste items with bounding-box precision.
        </p>
      </section>

      {/* Input card */}
      <section className="testing-grid">
        <article className="testing-card">
          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
            <div className="field-grid">
              <label htmlFor="img-url">Image URL</label>
              <input
                id="img-url"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                disabled={loading}
                style={{ width: "100%" }}
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading || !url.trim()}
              style={{ justifySelf: "start", minWidth: 180 }}
            >
              {loading ? (
                <>
                  <span className="spinner" /> Analyzing…
                </>
              ) : (
                "🔍  Run Detection"
              )}
            </button>
          </form>
        </article>
      </section>

      {/* Error state */}
      {error && (
        <section className="testing-grid">
          <article className="testing-card" style={{ borderColor: "#fca5a5" }}>
            <p className="dashboard-eyebrow" style={{ color: "#dc2626" }}>
              Error
            </p>
            <p style={{ color: "#991b1b", fontWeight: 600 }}>{error}</p>
          </article>
        </section>
      )}

      {/* Results */}
      {result && submittedUrl && (
        <section className="testing-grid" style={{ gap: 16 }}>
          {/* Summary bar */}
          <article
            className="testing-card"
            style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
          >
            <span
              className="inline-pill"
              style={{
                background: result.status === "success" ? "var(--green-50)" : "rgba(220,38,38,0.08)",
                color: result.status === "success" ? "var(--green-900)" : "#991b1b",
              }}
            >
              {result.status === "success" ? "✓" : "✗"} {result.status}
            </span>
            <span className="inline-pill">
              {result.detected_items_count} item
              {result.detected_items_count !== 1 ? "s" : ""} detected
            </span>

            {/* Color legend */}
            {result.detected_items.length > 0 && (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginLeft: "auto" }}>
                {result.detected_items.map((item, i) => (
                  <span
                    key={`${item.label}-${i}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.78rem",
                      fontFamily: "var(--font-mono)",
                      color: "var(--muted)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: BOX_COLORS[i % BOX_COLORS.length],
                        flexShrink: 0,
                      }}
                    />
                    {formatLabel(item.label)}
                  </span>
                ))}
              </div>
            )}
          </article>

          {/* Image with canvas overlay */}
          <article className="testing-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ position: "relative", lineHeight: 0, background: "#f8fafc" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={submittedUrl}
                alt="Submitted waste image"
                onLoad={handleImageLoad}
                style={{
                  width: "100%",
                  maxHeight: 520,
                  objectFit: "contain",
                  display: "block",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Canvas overlay — sits exactly on top of the img element */}
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              />
            </div>
          </article>

          {/* Detection cards */}
          {result.detected_items.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {result.detected_items.map((item, i) => {
                const tier = getConfidenceTier(item.confidence);
                const pct = (item.confidence * 100).toFixed(1);
                const confColor = CONFIDENCE_COLORS[tier];
                const boxColor = BOX_COLORS[i % BOX_COLORS.length];

                return (
                  <article
                    key={`${item.label}-${i}`}
                    className="testing-card"
                    style={{
                      display: "grid",
                      gap: 14,
                      borderLeft: `4px solid ${boxColor}`,
                      transition: "transform 180ms ease, box-shadow 180ms ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 22px 48px rgba(5,150,105,0.14)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "none";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 40px rgba(5,150,105,0.08)";
                    }}
                  >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 12,
                            height: 12,
                            borderRadius: 4,
                            background: boxColor,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                          {formatLabel(item.label)}
                        </span>
                      </div>
                      <span
                        className="inline-pill"
                        style={{
                          background: `${confColor}14`,
                          color: confColor,
                          fontFamily: "var(--font-mono)",
                          fontVariantNumeric: "tabular-nums",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {pct}%
                      </span>
                    </div>

                    {/* Confidence bar */}
                    <div
                      style={{
                        height: 8,
                        borderRadius: 999,
                        background: "rgba(5,150,105,0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${confColor}, ${confColor}cc)`,
                          transition: "width 600ms cubic-bezier(.4,0,.2,1)",
                        }}
                      />
                    </div>

                    {/* Bounding box coords */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        ["xMin", item.xMin],
                        ["yMin", item.yMin],
                        ["xMax", item.xMax],
                        ["yMax", item.yMax],
                      ].map(([k, v]) => (
                        <div
                          key={k as string}
                          style={{
                            padding: "10px 12px",
                            borderRadius: 14,
                            background: "linear-gradient(180deg, #f0fdf4, #ffffff)",
                            border: "1px solid rgba(16,185,129,0.14)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: "var(--muted)",
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                            }}
                          >
                            {k as string}
                          </span>
                          <strong
                            style={{
                              display: "block",
                              fontSize: "1.05rem",
                              fontFamily: "var(--font-mono)",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {Math.round(v as number)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {result.detected_items.length === 0 && (
            <article className="testing-card" style={{ textAlign: "center", padding: 40 }}>
              <p style={{ fontSize: "2rem", margin: 0 }}>🧹</p>
              <h2>All Clear</h2>
              <p className="muted">No waste items were detected in this image.</p>
            </article>
          )}
        </section>
      )}

      {/* Loading skeleton */}
      {loading && (
        <section className="testing-grid">
          <article className="testing-card skeleton-card">
            <div className="skeleton-shimmer" style={{ height: 24, width: "40%", borderRadius: 8 }} />
            <div className="skeleton-shimmer" style={{ height: 200, borderRadius: 16, marginTop: 14 }} />
            <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
              <div className="skeleton-shimmer" style={{ height: 18, flex: 1, borderRadius: 8 }} />
              <div className="skeleton-shimmer" style={{ height: 18, flex: 1, borderRadius: 8 }} />
            </div>
          </article>
        </section>
      )}

      <style>{`
        .spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, rgba(5,150,105,0.06) 25%, rgba(5,150,105,0.12) 50%, rgba(5,150,105,0.06) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </main>
  );
}
