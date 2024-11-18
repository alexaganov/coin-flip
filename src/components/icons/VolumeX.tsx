import { SVGProps } from "react";

export const VolumeX = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M11 5L6 9H2V15H6L11 19V5Z"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19.07 4.93005C20.9447 6.80533 21.9979 9.34841 21.9979 12.0001C21.9979 14.6517 20.9447 17.1948 19.07 19.0701M15.54 8.46005C16.4774 9.39769 17.0039 10.6692 17.0039 11.9951C17.0039 13.3209 16.4774 14.5924 15.54 15.5301"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
