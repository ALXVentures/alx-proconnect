"use client";

import { useEffect, useRef, useState } from "react";

export function MultiSelectDropdown({
  label,
  options,
  selected,
  onChange,
  theme = "dark",
  placeholder = "Select…",
}: {
  label?: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  theme?: "dark" | "light";
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function toggle(option: string) {
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option]
    );
  }

  const isDark = theme === "dark";
  const triggerClass = isDark
    ? "bg-ink-2 border-ink-line text-text-hi hover:border-teal-hi"
    : "bg-paper border-paper-line text-text-ink hover:border-brass";
  const panelClass = isDark
    ? "bg-ink-2 border-ink-line"
    : "bg-paper border-paper-line";
  const optionHoverClass = isDark ? "hover:bg-ink-3" : "hover:bg-paper-2";
  const mutedClass = isDark ? "text-text-lo" : "text-text-ink-lo";

  return (
    <div ref={ref} className="relative">
      {label && (
        <label
          className={`block font-mono text-[11px] tracking-wide uppercase mb-1.5 ${mutedClass}`}
        >
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 rounded-md border px-4 py-2.5 text-sm text-left transition-colors ${triggerClass}`}
      >
        <span className={selected.length === 0 ? mutedClass : ""}>
          {selected.length === 0
            ? placeholder
            : selected.length <= 2
            ? selected.join(", ")
            : `${selected.length} selected`}
        </span>
        <span aria-hidden className={`text-xs ${mutedClass}`}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div
          className={`absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto rounded-md border shadow-xl ${panelClass}`}
        >
          {options.map((option) => {
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className={`flex items-center gap-2.5 px-4 py-2 text-sm cursor-pointer ${optionHoverClass}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(option)}
                  className="accent-teal"
                />
                {option}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
