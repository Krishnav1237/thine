"use client";

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({
  className = "",
}: SkeletonProps): React.JSX.Element {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}
