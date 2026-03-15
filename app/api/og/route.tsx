import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

import { MAX_SCORE, getTier, parseScoreParam, tiers } from "../../data/questions";

export const runtime = "edge";

const serifFont = fetch(
  new URL("../../../public/fonts/IMFeGPrm28P.ttf", import.meta.url)
).then((response) => response.arrayBuffer());

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const score = parseScoreParam(searchParams.get("score"));
  const tier = getTier(score);
  const serifData = await serifFont;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#050505",
          color: "#ffffff",
          padding: "48px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-20% 45% 35% -10%",
            background: "rgba(244, 151, 82, 0.16)",
            borderRadius: "999px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "55% -12% -18% 55%",
            background: "rgba(255, 255, 255, 0.06)",
            borderRadius: "999px",
          }}
        />

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            gap: "32px",
            position: "relative",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "12px 0",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "16px",
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                  color: "#f49752",
                  display: "flex",
                }}
              >
                THINE PERSONAL INTELLIGENCE
              </div>

              <div
                style={{
                  fontFamily: "IM Fell Great Primer",
                  fontSize: "94px",
                  lineHeight: 0.92,
                  letterSpacing: "-0.03em",
                  display: "flex",
                  maxWidth: "560px",
                }}
              >
                {tier.name}
              </div>

              <div
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "28px",
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.72)",
                  maxWidth: "620px",
                  display: "flex",
                }}
              >
                {tier.tagline}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {tiers.map((item) => {
                const isActive = item.name === tier.name;

                return (
                  <div
                    key={item.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "18px 22px",
                      borderRadius: "28px",
                      border: isActive
                        ? "1px solid #f49752"
                        : "1px solid rgba(255,255,255,0.12)",
                      background: isActive
                        ? "#f49752"
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        maxWidth: "420px",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: "22px",
                          fontWeight: 700,
                          color: isActive ? "#050505" : "#ffffff",
                          display: "flex",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: "15px",
                          lineHeight: 1.4,
                          color: isActive
                            ? "rgba(5,5,5,0.78)"
                            : "rgba(255,255,255,0.58)",
                          display: "flex",
                        }}
                      >
                        {item.focus}
                      </div>
                    </div>

                    <div
                      style={{
                        fontFamily: "sans-serif",
                        fontSize: "15px",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: isActive ? "rgba(5,5,5,0.8)" : "#f49752",
                        display: "flex",
                      }}
                    >
                      {item.min}-{item.max}
                    </div>
                  </div>
                );
              })}
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
                padding: "32px",
                borderRadius: "36px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 28px 60px rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "15px",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    display: "flex",
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
                      fontFamily: "IM Fell Great Primer",
                      fontSize: "180px",
                      lineHeight: 0.84,
                      display: "flex",
                    }}
                  >
                    {score}
                  </div>
                  <div
                    style={{
                      fontFamily: "sans-serif",
                      fontSize: "28px",
                      color: "rgba(255,255,255,0.52)",
                      display: "flex",
                    }}
                  >
                    / {MAX_SCORE}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignSelf: "flex-start",
                    padding: "12px 18px",
                    borderRadius: "999px",
                    background: "rgba(244, 151, 82, 0.18)",
                    color: "#f8ba88",
                    fontFamily: "sans-serif",
                    fontSize: "15px",
                  }}
                >
                  {tier.name}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "18px",
                    lineHeight: 1.5,
                    color: "rgba(255,255,255,0.7)",
                    display: "flex",
                  }}
                >
                  10 questions on recall, commitments, and relationship
                  context.
                </div>

                <div
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "16px",
                    letterSpacing: "0.24em",
                    textTransform: "uppercase",
                    color: "#f49752",
                    display: "flex",
                  }}
                >
                  thine.com
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
          weight: 400,
        },
      ],
    }
  );
}
