import React from "react";
import clsx from "clsx";
import { CheckIcon } from "@/components/icons/docs";

export const Checkbox = ({ checked, round }) => (
  <span
    className={clsx(
      "w-[20px] h-[20px] shrink-0 flex items-center justify-center border-[1.5px] transition-colors",
      round ? "rounded-full" : "rounded-[5px]",
      checked
        ? round
          ? "border-[#1D5BE8]"
          : "bg-[#1D5BE8] border-[#1D5BE8] text-white"
        : "border-[#C9D2E3] bg-white"
    )}
  >
    {checked &&
      (round ? (
        <span className={"w-[10px] h-[10px] rounded-full bg-[#1D5BE8]"} />
      ) : (
        <CheckIcon className={"w-3 h-3"} />
      ))}
  </span>
);

export const CountBadge = ({ children, active }) => (
  <span
    className={clsx(
      "min-w-[42px] px-2 py-0.5 rounded-md text-center text-[12px]",
      active ? "bg-[#E6F6EC] text-[#1E9E62]" : "bg-[#F1F4FA] text-[#5B6788]"
    )}
  >
    {children}
  </span>
);
