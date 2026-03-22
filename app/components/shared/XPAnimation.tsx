"use client";

export default function XPAnimation({
  xpAmount,
  bonusText,
  visible,
}: {
  xpAmount: number;
  bonusText?: string;
  visible: boolean;
}): React.JSX.Element | null {
  if (!visible || xpAmount <= 0) {
    return null;
  }

  return (
    <div className="xp-animation" aria-live="polite">
      <strong>+{xpAmount} XP</strong>
      {bonusText ? <span>{bonusText}</span> : null}
    </div>
  );
}
