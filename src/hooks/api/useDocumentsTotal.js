import { useQuery } from "@tanstack/react-query";
import { get } from "lodash";
import useGetTMSITIQuery from "@/hooks/api/useGetTMSITIQuery";
import { KEYS } from "@/constants/key";
import { URLS } from "@/constants/url";

// /shnq sahifasidagi kabi: 4-quyi tizim (iqtisodiy normativlar) hisobga olinmaydi
const isFourthSectionTitle = (title = "") => /^\s*0?4\s*[-–.]/.test(title);

const fetchJson = (url) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  });

/**
 * Me'yoriy hujjatlar soni = SHNQ/QMQ hujjatlari (/shnq) + standartlar (/standards).
 * Hisoblash qoidalari o'sha sahifalardagi bilan bir xil, raqamlar mos tushadi.
 */
const useDocumentsTotal = () => {
  const shnq = useQuery(["shnq-subsystems"], () =>
    fetchJson("https://shnk.tmsiti.uz/subsystems/")
  );
  const newStandards = useQuery(["standard-list-new"], () =>
    fetchJson("https://main.tmsiti.uz/api/standard-list/")
  );
  const oldStandards = useGetTMSITIQuery({
    key: KEYS.standards,
    url: URLS.standards,
    showErrorMsg: false,
  });

  const shnqCount = (shnq.data || [])
    .filter((item) => !isFourthSectionTitle(get(item, "title", "")))
    .reduce(
      (sum, item) =>
        sum +
        get(item, "groups", []).reduce(
          (acc, group) => acc + get(group, "documents", []).length,
          0
        ),
      0
    );

  // Standartlar sahifasidagi kabi slug (yoki id) bo'yicha takrorlar olib tashlanadi
  const standardKeys = new Set(
    [
      ...get(newStandards.data, "data", []),
      ...get(oldStandards.data, "data", []),
    ].map((item) => get(item, "slug") || String(get(item, "id", "")))
  );

  const isLoading =
    shnq.isLoading || newStandards.isLoading || oldStandards.isLoading;
  const total = shnqCount + standardKeys.size;

  return { total, isLoading, hasData: total > 0 };
};

export default useDocumentsTotal;
