import { SVGProps } from "react";

export const CoinFaceUp = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.79297 10.0271C2.79297 8.31718 6.9151 6.08118 12 6.08118C17.0849 6.08118 21.2071 8.31718 21.2071 10.0271V13.9729C21.2071 15.6828 17.0849 17.9188 12 17.9188C6.9151 17.9188 2.79297 15.6828 2.79297 13.9729V10.0271Z"
        fill="white"
        stroke="currentcolor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 13.9519C17.0849 13.9519 21.2071 11.8395 21.2071 10.0244C21.2071 8.20932 17.0849 6.08118 12 6.08118C6.9151 6.08118 2.79297 8.20801 2.79297 10.0244C2.79297 11.8395 6.9151 13.9519 12 13.9519Z"
        fill="currentcolor"
        stroke="currentcolor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
