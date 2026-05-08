import type { AcademicYear, CalendarEvent, Category } from "@/lib/types";

export const sampleYear: AcademicYear = {
  id: "sample-year",
  name: "Tahun Akademik 2026/2027",
  startDate: "2026-07-01",
  endDate: "2027-06-30",
  isActive: true
};

export const sampleCategories: Category[] = [
  {
    id: "cat-libur",
    nameAr: "عطلة",
    nameId: "Libur",
    color: "#0f766e"
  },
  {
    id: "cat-ujian",
    nameAr: "اختبار",
    nameId: "Ujian",
    color: "#b45309"
  },
  {
    id: "cat-kegiatan",
    nameAr: "نشاط",
    nameId: "Kegiatan",
    color: "#2563eb"
  }
];

export const sampleEvents: CalendarEvent[] = [
  {
    id: "sample-1",
    academicYearId: sampleYear.id,
    categoryId: "cat-kegiatan",
    titleAr: "بداية العام الدراسي",
    titleId: "Awal Tahun Akademik",
    descriptionAr: "Pembukaan kegiatan belajar tahun akademik baru.",
    descriptionId: "Pembukaan kegiatan belajar tahun akademik baru.",
    startDate: "2026-07-04",
    endDate: null,
    isImportant: true,
    category: sampleCategories[2]
  },
  {
    id: "sample-2",
    academicYearId: sampleYear.id,
    categoryId: "cat-ujian",
    titleAr: "اختبار منتصف الفصل",
    titleId: "Ujian Tengah Semester",
    descriptionAr: "Rentang pelaksanaan ujian tengah semester.",
    descriptionId: "Rentang pelaksanaan ujian tengah semester.",
    startDate: "2026-09-12",
    endDate: "2026-09-17",
    isImportant: true,
    category: sampleCategories[1]
  },
  {
    id: "sample-3",
    academicYearId: sampleYear.id,
    categoryId: "cat-libur",
    titleAr: "عطلة نهاية الفصل",
    titleId: "Libur Akhir Semester",
    descriptionAr: "Masa libur akhir semester.",
    descriptionId: "Masa libur akhir semester.",
    startDate: "2026-12-19",
    endDate: "2027-01-02",
    isImportant: true,
    category: sampleCategories[0]
  }
];
