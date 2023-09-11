import { ComponentProps } from "react";

export function CategoriesIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* First Box */}
      <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="2" />
      {/* Second Box */}
      <rect x="10" y="1" width="5" height="5" stroke="currentColor" strokeWidth="2" />
      {/* Third Box */}
      <rect x="1" y="10" width="5" height="5" stroke="currentColor" strokeWidth="2" />
      {/* Fourth Box (Replaces Plus Sign) */}
      <rect x="10" y="10" width="5" height="5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
