import { SVGProps } from "react";

export const ChevronLeft = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M15.9293 6.06763L9.92934 12.0676L15.9293 18.0676"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
