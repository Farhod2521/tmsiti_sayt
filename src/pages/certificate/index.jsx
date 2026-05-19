import React from "react";
import Main from "@/layouts/main";
import Menu from "@/components/menu";
import Link from "next/link";

const PARTICIPANTS = [
  {
    id: 1,
    full_name: "Xakkulov Masrur Muzaffarovich",
    department: "Kreditlarni ma'qullash departamaneti, Korporativ va o'rta biznes bo'yicha anderrayting xizmati",
    position: "Katta menejer",
    phone: "97-585-25-89",
  },
  {
    id: 2,
    full_name: "Iskandarov Maqsadbek Ganja O'g'li",
    department: "Kreditlarni ma'qullash departamaneti, Korporativ va o'rta biznes bo'yicha anderrayting xizmati",
    position: "Yetakchi menejer",
    phone: "94-711-10-03",
  },
  {
    id: 3,
    full_name: "Nomozov O'ktam Qulmamat O'g'li",
    department: "Kreditlarni ma'qullash departamaneti, Mikro va kichik biznes bo'yicha anderrayting xizmati",
    position: "Menejer",
    phone: "97-340-06-22",
  },
  {
    id: 4,
    full_name: "Normo'minov Temurbek Akmal O'g'li",
    department: "Kreditlarni ma'qullash departamaneti, Mikro va kichik biznes bo'yicha anderrayting xizmati",
    position: "Menejer",
    phone: "90-346-49-42",
  },
  {
    id: 5,
    full_name: "Sunnatov Jovlon Akrom O'g'li",
    department: "Kreditlarni ma'qullash departamaneti, Mikro va kichik biznes bo'yicha anderrayting xizmati",
    position: "Menejer",
    phone: "99-862-92-92",
  },
  {
    id: 6,
    full_name: "Egamqulov Islom Shuxrat O'g'li",
    department: "Kreditlarni ma'qullash departamaneti, Mikro va kichik biznes bo'yicha anderrayting xizmati",
    position: "Menejer",
    phone: "90-818-30-09",
  },
  {
    id: 7,
    full_name: "Miratdinov Salauatdin Quanishbay o'g'li",
    department: "Kreditlarni ma'qullash departamaneti, Qoraqalpog'iston Respublikasi bo'yicha anderrayting xizmati",
    position: "Yetakchi menejer",
    phone: "-",
  },
  {
    id: 8,
    full_name: "Sabirbaev Dastan Karimbaevich",
    department: "Kreditlarni ma'qullash departamaneti, Qoraqalpog'iston Respublikasi bo'yicha anderrayting xizmati",
    position: "Menejer",
    phone: "91-874-77-00",
  },
  {
    id: 9,
    full_name: "Ibrohimov Ma'rufjon Marat o'g'li",
    department: "Investitsion loyihalarni moliyalashtirish departamenti, Korporativ biznes sub'ektlari loyihalarini tahlil qilish xizmati",
    position: "Kichik menejer",
    phone: "90-339-46-11",
  },
  {
    id: 10,
    full_name: "Oblaqulov Abdulla Abdurashid o'g'li",
    department: "Kreditlarni ma'qullash departamaneti, Korporativ va o'rta biznes bo'yicha anderrayting xizmati",
    position: "Yetakchi menejer",
    phone: "-",
  },
];

const CertificatePage = () => {
  const filtered = PARTICIPANTS;

  return (
    <Main>
      <Menu />

      {/* Breadcrumb */}
      <section className="bg-[#EFF3FA] text-xs text-[#607198]">
        <div className="container py-[12px]">
          <Link href="/">Bosh sahifa</Link>
          {" / "}
          <Link href="#">O'quv seminar</Link>
          {" / "}
          <span className="text-[#14255B] font-medium">Sertifikatlar ro'yxati</span>
        </div>
      </section>

      <section className="container mx-auto py-8 px-4 md:px-0">
        {/* Sarlavha */}
        <div className="border border-gray-300 rounded-t-lg bg-white px-6 py-5 text-center">
          <h1 className="text-[#14255B] font-bold text-base md:text-lg leading-snug">
            &quot;Qurilish sohasiga oid qonunchilik, qurilish hujjatlari va amaliy bilimlar
            bo&apos;yicha&quot; o&apos;quv semenarda ishtirok etuvchi xodimlar ro&apos;yxati
          </h1>
          <p className="text-right text-sm text-gray-600 mt-3 font-medium">
            12-18 may 2026-y.
          </p>
        </div>

        {/* Jadval */}
        <div className="overflow-x-auto border border-gray-300 rounded-b-lg shadow-sm">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#c5cfe8] text-[#14255B]">
                <th className="border border-gray-300 px-3 py-3 text-center font-bold w-10">
                  №
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-bold min-w-[180px]">
                  Xodimning FISH
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-bold min-w-[280px]">
                  Tarkibiy tuzilma nomi
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-bold min-w-[140px]">
                  Lavozimi
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center font-bold min-w-[120px]">
                  tel. raqami
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    Qidiruv bo&apos;yicha natija topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((p, index) => (
                  <tr
                    key={p.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#f5f7fd]"}
                  >
                    <td className="border border-gray-200 px-3 py-3 text-center font-semibold text-[#14255B]">
                      {index + 1}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center font-medium">
                      {p.full_name}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">
                      {p.department}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">
                      {p.position}
                    </td>
                    <td className="border border-gray-200 px-4 py-3 text-center text-gray-700">
                      {p.phone}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-right text-xs text-gray-400 mt-2">
          Jami: {filtered.length} ta ishtirokchi
        </p>
      </section>
    </Main>
  );
};

export default CertificatePage;
