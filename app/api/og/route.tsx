import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

import { MAX_SCORE, parseScoreParam } from "../../data/questions";
import { getScoreBand } from "../../lib/analyzeUser";

export const runtime = "edge";

async function loadFont(request: NextRequest): Promise<ArrayBuffer> {
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/fonts/IMFeGPrm28P.ttf`);
  return res.arrayBuffer();
}

function cleanText(value: string | null, max = 42) {
  return value?.trim().slice(0, max) || undefined;
}

export async function GET(request: NextRequest) {
  try {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "arena" ? "arena" : "quiz";
  const serifData = await loadFont(request);

  if (type === "arena") {
    const profile = cleanText(searchParams.get("profile")) ?? "Nuanced Thinker";
    const name = cleanText(searchParams.get("name"));

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "radial-gradient(circle at top left, rgba(255,98,98,0.26), transparent 34%), linear-gradient(180deg, #090909, #020202)",
            color: "#ffffff",
            padding: "64px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "58% -8% -12% 52%",
              background: "rgba(244,151,82,0.12)",
              borderRadius: "999px",
            }}
          />

          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#f49752",
                }}
              >
                Hot Takes Arena
              </div>
              {name ? (
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  {name}
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  maxWidth: "860px",
                  fontFamily: "IM Fell Great Primer",
                  fontSize: "122px",
                  lineHeight: 0.9,
                }}
              >
                {profile}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "32px",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                What&apos;s your thinking style?
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "26px",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                thine.app/arena
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "14px 22px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "#f49752",
                  fontSize: "18px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Shareable profile
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "IM Fell Great Primer",
            data: serifData,
            style: "normal",
          },
        ],
      }
    );
  }

  const score = parseScoreParam(searchParams.get("score"));
  const band = getScoreBand(score);
  const name = cleanText(searchParams.get("name"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "radial-gradient(circle at top left, rgba(244,151,82,0.24), transparent 34%), linear-gradient(180deg, #070707, #030303)",
          color: "#ffffff",
          padding: "56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "58% -8% -12% 52%",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "999px",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "space-between",
            gap: "42px",
            position: "relative",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "18px",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "#f49752",
                }}
              >
                Thine
              </div>
              {name ? (
                <div
                  style={{
                    display: "flex",
                    fontSize: "28px",
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  {name}
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  maxWidth: "580px",
                  fontFamily: "IM Fell Great Primer",
                  fontSize: "108px",
                  lineHeight: 0.9,
                }}
              >
                {band.name}
              </div>
              <div
                style={{
                  display: "flex",
                  maxWidth: "620px",
                  fontSize: "28px",
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {band.tagline}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              {band.highlights.map((highlight) => (
                <div
                  key={highlight}
                  style={{
                    display: "flex",
                    padding: "14px 20px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.05)",
                    fontSize: "18px",
                    color: "rgba(255,255,255,0.76)",
                  }}
                >
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: "360px",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "30px",
                borderRadius: "36px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: "15px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.58)",
                  }}
                >
                  Score
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontFamily: "IM Fell Great Primer",
                      fontSize: "180px",
                      lineHeight: 0.84,
                    }}
                  >
                    {score}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: "28px",
                      color: "rgba(255,255,255,0.52)",
                    }}
                  >
                    / {MAX_SCORE}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    display: "flex",
                    fontSize: "16px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "#f49752",
                  }}
                >
                  Can you beat this?
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "24px",
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  thine.app
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "IM Fell Great Primer",
          data: serifData,
          style: "normal",
        },
      ],
    }
  );
  } catch (error) {
    console.error("OG image generation failed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate image" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
