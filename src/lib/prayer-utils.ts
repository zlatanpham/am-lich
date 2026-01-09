import {
  DEFAULT_ANCESTOR_TEMPLATE,
  DEFAULT_MONG1_TEMPLATE,
  DEFAULT_RAM15_TEMPLATE,
} from "./prayer-templates";

export interface Petitioner {
  id?: string;
  name: string;
  birthYear: number;
  buddhistName?: string | null;
  isHead: boolean;
}

export function calculateVietnameseAge(
  birthYear: number,
  currentLunarYear: number,
): number {
  return currentLunarYear - birthYear + 1;
}

export function formatPetitionerList(
  petitioners: Petitioner[],
  currentLunarYear: number,
): string {
  if (petitioners.length === 0) return "(Chưa cấu hình tín chủ)";

  const sorted = [...petitioners].sort((a, b) => {
    if (a.isHead) return -1;
    if (b.isHead) return 1;
    return (a.id ?? "").localeCompare(b.id ?? "");
  });

  return sorted
    .map((p) => {
      const age = calculateVietnameseAge(p.birthYear, currentLunarYear);
      const buddhistPart = p.buddhistName
        ? `, pháp danh ${p.buddhistName}`
        : "";
      return `${p.name} (${age} tuổi${buddhistPart})`;
    })
    .join(", ");
}

export interface PrayerData {
  ngayAmLich: string;
  thangAmLich: string;
  namAmLich: string;
  ngayDuongLich: string;
  petitioners: Petitioner[];
  familySurname?: string;
  address?: string;
  tenToTien?: string;
  danhXungToTien?: string;
  currentLunarYear: number;
}

export function generatePrayer(
  type: "mong1" | "ram15" | "ancestor",
  data: PrayerData,
  customTemplate?: string | null,
): string {
  let template = customTemplate;

  if (!template) {
    switch (type) {
      case "mong1":
        template = DEFAULT_MONG1_TEMPLATE;
        break;
      case "ram15":
        template = DEFAULT_RAM15_TEMPLATE;
        break;
      case "ancestor":
        template = DEFAULT_ANCESTOR_TEMPLATE;
        break;
    }
  }

  if (!template) return "";

  const placeholders: Record<string, string> = {
    "{{ngayAmLich}}": data.ngayAmLich,
    "{{thangAmLich}}": data.thangAmLich,
    "{{namAmLich}}": data.namAmLich,
    "{{ngayDuongLich}}": data.ngayDuongLich,
    "{{danhSachTinChu}}": formatPetitionerList(
      data.petitioners,
      data.currentLunarYear,
    ),
    "{{diaChiNhaTai}}": data.address || "(Chưa nhập địa chỉ)",
    "{{hoGiaDinh}}": data.familySurname || "(Chưa nhập họ gia đình)",
    "{{tenToTien}}": data.tenToTien || "(Chưa nhập tên tổ tiên)",
    "{{danhXungToTien}}": data.danhXungToTien || "Cụ",
  };

  let result = template;
  for (const [key, value] of Object.entries(placeholders)) {
    // result = result.replaceAll(key, value);
    result = result.split(key).join(value);
  }

  return result;
}
