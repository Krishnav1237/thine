"use client";

import type { ImprovementPlan } from "../lib/generatePlaybook";

interface PlaybookCardProps {
  plan: ImprovementPlan;
  improvementLevel: string;
}

export default function PlaybookCard({ plan, improvementLevel }: PlaybookCardProps) {
  return (
    <section className="report-card playbook-card">
      <div className="section-heading">
        <span className="section-eyebrow">3-day improvement plan</span>
        <h2 className="conversion-title">Your next 72 hours.</h2>
        <p className="section-copy">
          Level: {improvementLevel}. Follow this sequence and retake in 3 days.
        </p>
      </div>

      <div className="playbook-grid">
        {plan.days.map((day) => (
          <div key={day.title} className="playbook-day">
            <div className="playbook-day-title">{day.title}</div>
            <ul className="playbook-list">
              {day.tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="playbook-gain">{plan.expectedGain}</div>
    </section>
  );
}
