import React from "react";
import clsx from "clsx";

// Operator rasmi (public/images/operator.webp) — sayt yordamchisi tugmasi va chat oynasida
export const OperatorAvatar = ({ className }) => (
  <img
    src={"/images/operator.webp"}
    alt={""}
    aria-hidden={"true"}
    draggable={false}
    className={clsx("rounded-full object-cover bg-[#E8F0FE]", className)}
  />
);

export default OperatorAvatar;
