import Image from "next/image";
import Link from "next/link";

// The full "alx / Ventures" lockup is ~1.41:1 (width:height)
const LOCKUP_RATIO = 691 / 491;

export function BrandMark({
  theme = "dark",
  href = "/",
  size = "default",
}: {
  theme?: "dark" | "light";
  href?: string | null;
  size?: "default" | "large";
}) {
  const logoSrc =
    theme === "dark" ? "/alx-ventures-logo-light.png" : "/alx-ventures-logo.png";
  // Tall enough that the "VENTURES" sub-line stays legible, not just the
  // "alx" glyph — this is a two-line stacked lockup, not a flat wordmark.
  const height = size === "large" ? 60 : 48;
  const width = Math.round(height * LOCKUP_RATIO);
  const textClass =
    size === "large" ? "font-display text-2xl" : "font-display text-xl";
  const textColor = theme === "dark" ? "text-text-hi" : "text-text-ink";

  const content = (
    <span className="inline-flex items-center gap-3">
      <Image
        src={logoSrc}
        alt="ALX Ventures"
        width={width}
        height={height}
        priority
        style={{ height, width: "auto" }}
      />
      <span className={`${textClass} ${textColor} tracking-tight`}>ProConnect</span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  );
}
