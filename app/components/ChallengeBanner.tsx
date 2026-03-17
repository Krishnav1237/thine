"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { readChallenge, storeChallenge, type ChallengeData } from "../lib/challenge";

function parseScore(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ChallengeBanner() {
  const searchParams = useSearchParams();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);

  useEffect(() => {
    const challengeFlag = searchParams.get("challenge");
    const scoreParam = parseScore(searchParams.get("score"));
    const nameParam = searchParams.get("name");
    const refParam = searchParams.get("ref");

    if (challengeFlag === "true" && scoreParam !== null) {
      const nextChallenge: ChallengeData = {
        challengerScore: scoreParam,
        challengerName: nameParam ? nameParam.trim().slice(0, 32) : undefined,
        ref: refParam ? refParam.trim() : undefined,
      };

      storeChallenge(nextChallenge);
      setChallenge(nextChallenge);
      return;
    }

    setChallenge(readChallenge());
  }, [searchParams]);

  if (!challenge) {
    return null;
  }

  const challengerName = challenge.challengerName ?? "Someone";

  return (
    <div className="challenge-banner">
      <div className="challenge-banner-copy">
        <strong>{challengerName}</strong> scored {challenge.challengerScore}. Can you beat them?
      </div>
      <Link href="/quiz" className="btn-primary">
        Take the Challenge
      </Link>
    </div>
  );
}
