// O'zbek kirill -> lotin transliteratsiyasi (hujjat nomlarini lotin yozuvli saytda ko'rsatish va
// qidiruvda "obodon" yozilganda "Ободонлаштириш" ham topilishi uchun).
const MAP = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ж: "j", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "x", ч: "ch", ш: "sh", щ: "sh", ы: "i", ь: "",
  э: "e", ю: "yu", я: "ya", ё: "yo", ў: "oʻ", қ: "q", ғ: "gʻ", ҳ: "h", ъ: "ʼ", ц: "ts",
};
const AFTER_VOWEL = "аеёиоуўэюяъь";

const convertWord = (word) => {
  const allCaps = word.length > 1 && word === word.toUpperCase();
  let out = "";
  for (let i = 0; i < word.length; i += 1) {
    const ch = word[i];
    const lower = ch.toLowerCase();
    const prev = i ? word[i - 1].toLowerCase() : null;
    let lat;
    if (lower === "е") lat = !prev || AFTER_VOWEL.includes(prev) ? "ye" : "e"; // ер -> yer, лойиҳа -> loyiha
    else if (lower === "ц") lat = prev && AFTER_VOWEL.includes(prev) ? "ts" : "s"; // sement, konstruksiya, kanalizatsiya
    else lat = MAP[lower] ?? ch;
    if (ch !== lower && lat) lat = allCaps ? lat.toUpperCase() : lat[0].toUpperCase() + lat.slice(1);
    out += lat;
  }
  return out;
};

export const toLatin = (text) => String(text || "").replace(/[А-Яа-яЁёЎўҚқҒғҲҳ]+/g, convertWord);

// Qidiruv uchun: yozuv, registr va tutuq belgilaridan qat'i nazar solishtiriladi
export const searchNorm = (text) =>
  toLatin(text)
    .toLowerCase()
    .replace(/[ʻʼ‘’`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

// Matn o'zbek kirillidami? Ruscha matnni lotinga o'girib bo'lmaydi ("Земляные работы" -> "Zemlyanie raboti").
// ы/щ — ruscha (э o'zbekchada ham bor: этиш); ў/қ/ғ/ҳ yoki o'zbekcha qo'shimchalar (-лар, -нинг, " ва ") — o'zbekcha.
export const isUzbekCyrillic = (text) => {
  const s = ` ${String(text || "").toLowerCase()} `;
  if (!/[а-яё]/.test(s) || /[ыщ]/.test(s)) return false;
  return /[ўқғҳ]/.test(s) || /(лар|лари|ларни|нинг|ини|ига|ида|даги|учун)[\s.,;:)»"]|\sва\s/.test(s);
};

// Sayt tiliga qarab: o'zbekcha (lotin) saytda o'zbek kirill matni lotinga o'giriladi;
// ruscha matn va rus tilidagi sayt — asl holicha
// Hujjat nomi oxiridagi nuqta (bazada ba'zilarida bor, ba'zilarida yo'q) — bir xil ko'rinishi uchun olib tashlanadi.
// Ko'p nuqta (…) ham, oxiridagi bo'shliqlar ham olinadi.
export const trimTitle = (text) => String(text || "").replace(/[\s.]+$/, "");

export const displayText = (text, lang) => (lang === "ru" || !isUzbekCyrillic(text) ? text : toLatin(text));

// Hujjat shifri (ШНҚ 2.01.02-04, ҚМҚ, ҚР, СРН) — o'zbekcha saytda doim lotinda
export const displayCode = (code, lang) =>
  lang !== "ru" && /^\s*(ШНҚ|ШНК|ҚМҚ|КМК|ҚР|СРН)(\s|$)/.test(code || "") ? toLatin(code) : code || "";
