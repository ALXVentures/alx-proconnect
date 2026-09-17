import Image from "next/image";
import Link from "next/link";

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
  const height = size === "large" ? 22 : 18;
  const width = size === "large" ? 155 : 127; // matches the logo's ~7:1 aspect ratio
  const textClass =
    size === "large" ? "font-display text-xl" : "font-display text-lg";
  const textColor = theme === "dark" ? "text-text-hi" : "text-text-ink";

  const content = (
    <span className="inline-flex items-center gap-2">
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
