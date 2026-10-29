import type { CSSProperties, ReactNode } from "react";
import type { CardStyle } from "../../types/dashboard";

export interface CardProps extends CardStyle {
  title?: string;
  description?: string;
  children: ReactNode;
  /** Fixed card height. Leave undefined to size to the content. */
  height?: number | string;
}

/**
 * Generic card container. It has neutral fallbacks only; each dashboard
 * supplies its own look through props (usually spread from its config).
 */
export default function Card({
  title,
  description,
  children,
  height,
  background = "#ffffff",
  borderColor = "#e5e7eb",
  borderWidth = 1,
  borderRadius = 12,
  padding = 16,
  shadow = "none",
  titleColor = "#111827",
  descriptionColor = "#6b7280",
  className = "",
}: CardProps) {
  const style: CSSProperties = {
    background,
    borderColor,
    borderWidth,
    borderStyle: "solid",
    borderRadius,
    padding,
    boxShadow: shadow,
    height,
  };

  return (
    <section
      className={`flex min-w-0 flex-col ${className}`}
      style={style}
    >
      {(title || description) && (
        <header className="mb-3">
          {title && (
            <h2 className="text-base font-semibold" style={{ color: titleColor }}>
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-0.5 text-sm" style={{ color: descriptionColor }}>
              {description}
            </p>
          )}
        </header>
      )}
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </section>
  );
}
