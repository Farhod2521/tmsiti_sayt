import React, { useId } from "react";

// Operator (odam) rasmi — naushnikli yordamchi
export const OperatorAvatar = ({ className }) => {
  const uid = useId().replace(/:/g, "");
  return (
  <svg viewBox={"0 0 64 64"} className={className} aria-hidden={"true"}>
    <defs>
      <linearGradient id={`${uid}bg`} x1={"0"} y1={"0"} x2={"0"} y2={"1"}>
        <stop offset={"0"} stopColor={"#E8F0FE"} />
        <stop offset={"1"} stopColor={"#C9DAFB"} />
      </linearGradient>
      <clipPath id={`${uid}clip`}>
        <circle cx={"32"} cy={"32"} r={"32"} />
      </clipPath>
    </defs>
    <circle cx={"32"} cy={"32"} r={"32"} fill={`url(#${uid}bg)`} />
    <g clipPath={`url(#${uid}clip)`}>
      {/* kiyim */}
      <path d={"M10 64c0-12 9.5-19 22-19s22 7 22 19z"} fill={"#1D5BE8"} />
      <path d={"M25.5 45.5 32 53l6.5-7.5c-2-.6-4.2-.9-6.5-.9s-4.5.3-6.5.9z"} fill={"#FFFFFF"} />
      {/* bo'yin va bosh */}
      <rect x={"28"} y={"35"} width={"8"} height={"10"} rx={"3"} fill={"#E9B48F"} />
      <ellipse cx={"32"} cy={"27"} rx={"11"} ry={"12.5"} fill={"#F4C7A4"} />
      {/* soch */}
      <path
        d={"M20.6 26.5c-.8-8.6 4.3-14.5 11.6-14.5 7.6 0 12.2 5.6 11.2 14.2-1.4-4.6-4.4-7.1-8.3-7.6-3.3 2.6-8.6 3.6-13.3 3.4-.6 1.3-1 2.8-1.2 4.5z"}
        fill={"#3B2A20"}
      />
      {/* ko'z va tabassum */}
      <circle cx={"27.8"} cy={"27.5"} r={"1.3"} fill={"#2A1E17"} />
      <circle cx={"36.2"} cy={"27.5"} r={"1.3"} fill={"#2A1E17"} />
      <path d={"M28.3 32.6c2.2 2 5.2 2 7.4 0"} stroke={"#B5654A"} strokeWidth={"1.4"} fill={"none"} strokeLinecap={"round"} />
      {/* naushnik */}
      <path d={"M19.5 28c0-8.3 5.6-14.6 12.5-14.6S44.5 19.7 44.5 28"} stroke={"#0B1A4F"} strokeWidth={"2.2"} fill={"none"} />
      <rect x={"17"} y={"25"} width={"5"} height={"8.5"} rx={"2.4"} fill={"#0B1A4F"} />
      <rect x={"42"} y={"25"} width={"5"} height={"8.5"} rx={"2.4"} fill={"#0B1A4F"} />
      <path d={"M19.5 33.5c0 3.6 3 5.8 8.3 5.8"} stroke={"#0B1A4F"} strokeWidth={"1.6"} fill={"none"} strokeLinecap={"round"} />
      <circle cx={"28.6"} cy={"39.3"} r={"1.6"} fill={"#0B1A4F"} />
    </g>
  </svg>
  );
};

export default OperatorAvatar;
