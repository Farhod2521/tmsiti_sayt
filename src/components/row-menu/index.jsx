// Jadval qatoridagi "⋮" amallar menyusi (Ma'lumotnoma, Qonunlar)
import React, { useEffect, useRef, useState } from "react";
import { MoreVerticalIcon } from "@/components/icons/docs";

const RowMenu = ({ items }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const itemCls = "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left text-[#0B1A4F] hover:bg-[#EEF4FF]";

  return (
    <div ref={ref} className={"relative shrink-0"}>
      <button
        type={"button"}
        onClick={() => setOpen((v) => !v)}
        aria-label={"Boshqa amallar"}
        aria-expanded={open}
        className={"w-9 h-9 rounded-[10px] flex items-center justify-center text-[#0B1A4F] hover:bg-[#F1F4FA] transition-colors"}
      >
        <MoreVerticalIcon className={"w-5 h-5"} />
      </button>
      {open && (
        <ul className={"absolute right-0 top-full mt-1 z-30 w-[220px] bg-white rounded-xl border border-[#EEF2FA] shadow-[0_12px_32px_rgba(16,42,116,0.14)] p-1.5"}>
          {items.filter(Boolean).map(({ label, Icon, href, onClick }) => (
            <li key={label}>
              {href ? (
                <a href={href} target={"_blank"} rel={"noopener noreferrer"} className={itemCls} onClick={() => setOpen(false)}>
                  {Icon && <Icon className={"w-4 h-4 text-[#5B6788]"} />} {label}
                </a>
              ) : (
                <button
                  type={"button"}
                  className={itemCls}
                  onClick={() => {
                    setOpen(false);
                    onClick?.();
                  }}
                >
                  {Icon && <Icon className={"w-4 h-4 text-[#5B6788]"} />} {label}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RowMenu;
