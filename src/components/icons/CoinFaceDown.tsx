import { SVGProps } from "react";

export const CoinFaceDown = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.40234 10.0752C2.40234 8.36527 6.52447 6.12927 11.6094 6.12927C16.6943 6.12927 20.8164 8.36527 20.8164 10.0752V14.021C20.8164 15.7309 16.6943 17.9669 11.6094 17.9669C6.52447 17.9669 2.40234 15.7309 2.40234 14.021V10.0752Z"
        fill="currentcolor"
        stroke="currentcolor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.6094 14C16.6943 14 20.8164 11.8876 20.8164 10.0725C20.8164 8.25742 16.6943 6.12927 11.6094 6.12927C6.52447 6.12927 2.40234 8.2561 2.40234 10.0725C2.40234 11.8876 6.52447 14 11.6094 14Z"
        fill="white"
        stroke="currentcolor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
