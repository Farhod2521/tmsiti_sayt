import React, { useEffect, useState } from "react";
import clsx from "clsx";
import axios from "axios";
import toast from "react-hot-toast";
import { config } from "@/config";

// Hujjat bandi yonidagi ⋮ menyusidan "Hujjatga taklif yuborish".
// Yuborilgan taklif admin panel -> "Takliflar" bo'limiga tushadi (viloyat va shahar IP bo'yicha aniqlanadi).

const TEXTS = {
  uz: {
    title: "Hujjatga taklif yuborish",
    typePlaceholder: "Taklif turini tanlang",
    types: { suggestion: "Hujjatga taklif", error: "Texnik xatolik" },
    quote: "Tanlangan band",
    name: "Ism-familiyangiz",
    phone: "Telefon raqamingiz",
    text: "Taklif matni",
    agree: "Shaxsiy ma'lumotlarim taklifni ko'rib chiqish uchun ishlatilishiga roziman",
    send: "Yuborish",
    sending: "Yuborilmoqda...",
    cancel: "Bekor qilish",
    done: "Rahmat! Taklifingiz qabul qilindi va mutaxassislarga yuborildi.",
    error: "Yuborib bo'lmadi. Maydonlarni tekshirib, qayta urinib ko'ring.",
  },
  ru: {
    title: "Отправить предложение к документу",
    typePlaceholder: "Выберите тип предложения",
    types: { suggestion: "Предложение к документу", error: "Техническая ошибка" },
    quote: "Выбранный пункт",
    name: "Фамилия и имя",
    phone: "Номер телефона",
    text: "Текст предложения",
    agree: "Согласен на обработку персональных данных для рассмотрения предложения",
    send: "Отправить",
    sending: "Отправка...",
    cancel: "Отмена",
    done: "Спасибо! Ваше предложение принято и передано специалистам.",
    error: "Не удалось отправить. Проверьте поля и попробуйте снова.",
  },
};

const field =
  "w-full rounded-[12px] border border-[#DCE3F0] bg-white px-4 py-2.5 text-[14px] text-[#0B1A4F] placeholder:text-[#8A95B0] outline-none focus:border-[#1D5BE8] focus:ring-4 focus:ring-[#1D5BE8]/10 transition";

const SuggestionModal = ({ target, onClose, lang = "uz" }) => {
  const tx = TEXTS[lang === "ru" ? "ru" : "uz"];
  const [form, setForm] = useState({ type: "", full_name: "", phone: "+998 ", text: "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!target) return undefined;
    setForm((prev) => ({ ...prev, type: "", text: "" }));
    setAgree(false);
    setError(null);
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [target, onClose]);

  if (!target) return null;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await axios.post(`${config.BASE_MAIN_API}suggestions/`, {
        ...form,
        kind: target.kind,
        doc_id: target.docId,
        doc_title: target.docTitle,
        block: target.blockId,
        block_text: target.blockText,
      });
      toast.success(tx.done);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.detail || tx.error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={"fixed inset-0 z-[70] flex items-center justify-center p-4 bg-[#0B1A4F]/40 backdrop-blur-[2px] print:hidden"} onMouseDown={onClose}>
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className={"w-full max-w-[560px] max-h-[92vh] overflow-y-auto rounded-[20px] bg-white shadow-[0_24px_70px_rgba(16,42,116,0.3)]"}
      >
        <div className={"flex items-center justify-between gap-4 px-6 py-4 border-b border-[#EEF2FA]"}>
          <h3 className={"text-[18px] font-bold text-[#0B1A4F]"}>{tx.title}</h3>
          <button type={"button"} onClick={onClose} aria-label={tx.cancel} className={"w-8 h-8 rounded-full text-[#5B6788] hover:bg-[#F1F4FA] flex items-center justify-center text-[20px] leading-none"}>
            ×
          </button>
        </div>
        <div className={"px-6 py-5 space-y-3"}>
          {target.blockText && (
            <div className={"rounded-[12px] bg-[#F6F9FF] border-l-4 border-[#1D5BE8] px-4 py-2.5"}>
              <p className={"text-[11px] font-semibold uppercase tracking-wide text-[#5B6788]"}>{tx.quote}</p>
              <p className={"mt-1 text-[13px] leading-[1.5] text-[#1E2B5A] line-clamp-3"}>{target.blockText}</p>
            </div>
          )}
          <select required value={form.type} onChange={set("type")} className={clsx(field, !form.type && "text-[#8A95B0]")}>
            <option value={""} disabled>
              {tx.typePlaceholder}
            </option>
            {Object.entries(tx.types).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <div className={"grid sm:grid-cols-2 gap-3"}>
            <input required minLength={3} maxLength={200} value={form.full_name} onChange={set("full_name")} placeholder={tx.name} className={field} />
            <input required type={"tel"} maxLength={30} value={form.phone} onChange={set("phone")} placeholder={tx.phone} className={field} />
          </div>
          <textarea required minLength={5} maxLength={5000} rows={6} value={form.text} onChange={set("text")} placeholder={tx.text} className={clsx(field, "resize-y")} />
          <label className={"flex items-start gap-2.5 text-[13px] text-[#5B6788] cursor-pointer"}>
            <input type={"checkbox"} checked={agree} onChange={(e) => setAgree(e.target.checked)} className={"mt-0.5 w-4 h-4 accent-[#1D5BE8]"} />
            {tx.agree}
          </label>
          {error && <p className={"text-[13px] text-[#E5484D]"}>{error}</p>}
        </div>
        <div className={"flex justify-end gap-2 px-6 py-4 border-t border-[#EEF2FA]"}>
          <button type={"button"} onClick={onClose} className={"h-[42px] px-5 rounded-[12px] text-[14px] font-medium text-[#5B6788] hover:bg-[#F1F4FA]"}>
            {tx.cancel}
          </button>
          <button
            type={"submit"}
            disabled={busy || !agree}
            className={"h-[42px] px-6 rounded-[12px] bg-[#1D5BE8] text-white text-[14px] font-semibold hover:bg-[#174FD0] disabled:opacity-50 transition-colors"}
          >
            {busy ? tx.sending : tx.send}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuggestionModal;
