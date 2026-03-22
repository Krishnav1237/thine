"use client";

import type { RankTier } from "../../lib/supabase/types";
import RankBadge from "./RankBadge";

type QuizDimension = {
  key: string;
  title: string;
  percent: number;
};

type QuizShareCardProps = {
  variant: "quiz";
  name?: string;
  score: number;
  bandName: string;
  dimensions: QuizDimension[];
  streak?: number;
  tier?: RankTier;
};

type ArenaShareCardProps = {
  variant: "arena";
  name?: string;
  role?: string;
  thinkingProfile: string;
  agree: number;
  disagree: number;
  depends: number;
  streak?: number;
  tier?: RankTier;
};

type ShareCardProps = React.PropsWithChildren<
  (QuizShareCardProps | ArenaShareCardProps) & {
    cardRef: React.RefObject<HTMLDivElement | null>;
  }
>;

const wrapperStyle: React.CSSProperties = {
  position: "fixed",
  left: "-99999px",
  top: 0,
  pointerEvents: "none",
  opacity: 0,
};

const baseCardStyle: React.CSSProperties = {
  width: "1080px",
  height: "1080px",
  padding: "56px",
  borderRadius: "40px",
  color: "#f9f7f2",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  boxSizing: "border-box",
};

export default function ShareCard(props: ShareCardProps): React.JSX.Element {
  const { cardRef, ...card } = props;
  const sharedHead = (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "24px" }}>
      <div style={{ display: "grid", gap: "10px" }}>
        <span
          style={{
            fontSize: "22px",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#f49752",
          }}
        >
          Thine
        </span>
        {card.name ? (
          <span style={{ fontSize: "28px", color: "rgba(249,247,242,0.74)" }}>
            {card.name}
          </span>
        ) : null}
      </div>
      {card.tier ? <RankBadge tier={card.tier} /> : null}
    </div>
  );

  return (
    <div style={wrapperStyle} aria-hidden="true">
      <div
        ref={cardRef}
        style={{
          ...baseCardStyle,
          background:
            card.variant === "quiz"
              ? "linear-gradient(160deg, rgba(244,151,82,0.28), rgba(5,5,5,0.96) 55%)"
              : "linear-gradient(160deg, rgba(255,98,98,0.24), rgba(5,5,5,0.96) 55%)",
        }}
      >
        {sharedHead}

        {card.variant === "quiz" ? (
          <div style={{ display: "grid", gap: "30px" }}>
            <div style={{ display: "grid", gap: "12px" }}>
              <div
                style={{
                  fontSize: "180px",
                  lineHeight: 0.9,
                  fontFamily: "IM Fell Great Primer",
                }}
              >
                {card.score}
              </div>
              <div style={{ fontSize: "38px", color: "#f49752" }}>{card.bandName}</div>
            </div>
            <div style={{ display: "grid", gap: "18px" }}>
              {card.dimensions.slice(0, 4).map((dimension) => (
                <div key={dimension.key} style={{ display: "grid", gap: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "28px",
                    }}
                  >
                    <span>{dimension.title}</span>
                    <strong>{dimension.percent}%</strong>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "12px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.12)",
                    }}
                  >
                    <div
                      style={{
                        width: `${dimension.percent}%`,
                        height: "100%",
                        borderRadius: "999px",
                        background: "#f49752",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "28px" }}>
            <div style={{ display: "grid", gap: "12px" }}>
              <div
                style={{
                  fontSize: "120px",
                  lineHeight: 0.92,
                  fontFamily: "IM Fell Great Primer",
                  maxWidth: "760px",
                }}
              >
                {card.thinkingProfile}
              </div>
              {card.role ? (
                <div style={{ fontSize: "28px", color: "rgba(249,247,242,0.7)" }}>
                  {card.role}
                </div>
              ) : null}
            </div>
            {[
              { label: "Agree", value: card.agree },
              { label: "Depends", value: card.depends },
              { label: "Disagree", value: card.disagree },
            ].map((item) => (
              <div key={item.label} style={{ display: "grid", gap: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "28px",
                  }}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}%</strong>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "12px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.12)",
                  }}
                >
                  <div
                    style={{
                      width: `${item.value}%`,
                      height: "100%",
                      borderRadius: "999px",
                      background: "#f49752",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", gap: "24px" }}>
          <div style={{ display: "grid", gap: "10px" }}>
            {card.streak && card.streak > 1 ? (
              <span style={{ fontSize: "28px", color: "#f49752" }}>
                {card.streak}-day streak
              </span>
            ) : null}
            <span style={{ fontSize: "26px", color: "rgba(249,247,242,0.74)" }}>
              {card.variant === "quiz" ? "Can you beat this?" : "What's your thinking style?"}
            </span>
          </div>
          <span style={{ fontSize: "28px", color: "rgba(249,247,242,0.58)" }}>
            thine.app
          </span>
        </div>
      </div>
    </div>
  );
}
