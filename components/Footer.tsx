import Link from "next/link";

const PRIVACY_POLICY_URL =
  "https://docs.google.com/document/d/e/2PACX-1vRkRPbmkQdPFbG1zdJmla6qmbv5gMGedE7ke4TEuNrgvz2PzRY52KJDVpjZeVEF6w/pub";
const TERMS_OF_USE_URL =
  "https://docs.google.com/document/d/e/2PACX-1vRjoxyKdVot0pOQ-A-fw-ycXVQUhJlkDJOkLvDkPrjWNN417ORDw8AgCpqtmjJaLg/pub";

export function Footer({
  theme = "dark",
  showRemoveMeLink = false,
}: {
  theme?: "dark" | "light";
  showRemoveMeLink?: boolean;
}) {
  const isDark = theme === "dark";
  const borderClass = isDark ? "border-ink-line" : "border-paper-line";
  const textClass = isDark ? "text-text-lo" : "text-text-ink-lo";
  const hoverClass = isDark ? "hover:text-brass-hi" : "hover:text-brass";

  return (
    <footer className={`border-t ${borderClass}`}>
      <div
        className={`max-w-6xl mx-auto px-6 md:px-10 py-8 flex flex-col sm:flex-row gap-3 justify-between font-mono text-[11px] ${textClass}`}
      >
        <span>ALX ProConnect — built by the FLA program team</span>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noreferrer"
            className={`${hoverClass} transition-colors`}
          >
            Privacy Policy
          </a>
          <a
            href={TERMS_OF_USE_URL}
            target="_blank"
            rel="noreferrer"
            className={`${hoverClass} transition-colors`}
          >
            Terms of Use
          </a>
          {showRemoveMeLink && (
            <Link href="/remove-me" className={`${hoverClass} transition-colors`}>
              Request profile removal
            </Link>
          )}
          <Link href="/admin" className={`${hoverClass} transition-colors`}>
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

export { PRIVACY_POLICY_URL, TERMS_OF_USE_URL };
