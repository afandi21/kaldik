export type LocaleMode = "ar" | "id";

export type AcademicYear = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type Category = {
  id: string;
  nameAr: string;
  nameId: string;
  color: string;
};

export type CalendarEvent = {
  id: string;
  academicYearId: string;
  categoryId: string | null;
  titleAr: string;
  titleId: string;
  descriptionAr: string | null;
  descriptionId: string | null;
  startDate: string;
  endDate: string | null;
  isImportant: boolean;
  category?: Category | null;
};
