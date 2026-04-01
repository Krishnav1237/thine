"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { readChallenge, storeChallenge, type ChallengeData } from "../lib/challenge";

function parseScore(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function ChallengeBanner(): React.JSX.Element | null {
  const searchParams = useSearchParams();
  const challengeFlag = searchParams.get("challenge");
  const scoreParam = parseScore(searchParams.get("score"));
  const nameParam = searchParams.get("name");
  const refParam = searchParams.get("ref");

  const challengeFromQuery = useMemo(() => {
    if (challengeFlag === "true" && scoreParam !== null) {
      return {
        challengerScore: scoreParam,
        challengerName: nameParam ? nameParam.trim().slice(0, 32) : undefined,
        ref: refParam ? refParam.trim() : undefined,
      } as ChallengeData;
    }
    return null;
  }, [challengeFlag, scoreParam, nameParam, refParam]);

  const [storedChallenge] = useState<ChallengeData | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return readChallenge();
  });

  const challenge = challengeFromQuery ?? storedChallenge;

  useEffect(() => {
    if (challengeFromQuery) {
      storeChallenge(challengeFromQuery);
    }
  }, [challengeFromQuery]);

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
