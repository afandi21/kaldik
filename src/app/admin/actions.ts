"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { queryDatabase } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

function value(formData: FormData, key: string) {
  const item = formData.get(key);
  return typeof item === "string" ? item.trim() : "";
}

function optionalValue(formData: FormData, key: string) {
  const item = value(formData, key);
  return item.length > 0 ? item : null;
}

async function runAdminMutation(mutation: () => Promise<void>) {
  await requireAdmin();

  try {
    await mutation();
  } catch (error) {
    console.error("Admin form mutation failed", error);
    redirect("/admin?error=database");
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function createAcademicYear(formData: FormData) {
  const isActive = formData.get("is_active") === "on";

  await runAdminMutation(async () => {
    if (isActive) {
      await queryDatabase("update academic_years set is_active = false");
    }

    await queryDatabase(
      `insert into academic_years (name, start_date, end_date, is_active)
       values ($1, $2, $3, $4)`,
      [value(formData, "name"), value(formData, "start_date"), value(formData, "end_date"), isActive]
    );
  });
}

export async function updateAcademicYear(formData: FormData) {
  const isActive = formData.get("is_active") === "on";
  const id = value(formData, "id");

  await runAdminMutation(async () => {
    if (isActive) {
      await queryDatabase("update academic_years set is_active = false where id <> $1", [id]);
    }

    await queryDatabase(
      `update academic_years
       set name = $1, start_date = $2, end_date = $3, is_active = $4
       where id = $5`,
      [value(formData, "name"), value(formData, "start_date"), value(formData, "end_date"), isActive, id]
    );
  });
}

export async function deleteAcademicYear(formData: FormData) {
  await runAdminMutation(async () => {
    await queryDatabase("delete from academic_years where id = $1", [value(formData, "id")]);
  });
}

export async function createCategory(formData: FormData) {
  await runAdminMutation(async () => {
    await queryDatabase(
      `insert into categories (name_ar, name_id, color)
       values ($1, $2, $3)`,
      [value(formData, "name_ar"), value(formData, "name_id"), value(formData, "color")]
    );
  });
}

export async function updateCategory(formData: FormData) {
  await runAdminMutation(async () => {
    await queryDatabase(
      `update categories
       set name_ar = $1, name_id = $2, color = $3
       where id = $4`,
      [
        value(formData, "name_ar"),
        value(formData, "name_id"),
        value(formData, "color"),
        value(formData, "id")
      ]
    );
  });
}

export async function deleteCategory(formData: FormData) {
  await runAdminMutation(async () => {
    await queryDatabase("delete from categories where id = $1", [value(formData, "id")]);
  });
}

export async function createEvent(formData: FormData) {
  await runAdminMutation(async () => {
    await queryDatabase(
      `insert into events (
        academic_year_id,
        category_id,
        title_ar,
        title_id,
        description_ar,
        description_id,
        start_date,
        end_date,
        is_important
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        value(formData, "academic_year_id"),
        optionalValue(formData, "category_id"),
        value(formData, "title_ar"),
        value(formData, "title_id"),
        optionalValue(formData, "description_ar"),
        optionalValue(formData, "description_id"),
        value(formData, "start_date"),
        optionalValue(formData, "end_date"),
        formData.get("is_important") === "on"
      ]
    );
  });
}

export async function updateEvent(formData: FormData) {
  await runAdminMutation(async () => {
    await queryDatabase(
      `update events
       set
        academic_year_id = $1,
        category_id = $2,
        title_ar = $3,
        title_id = $4,
        description_ar = $5,
        description_id = $6,
        start_date = $7,
        end_date = $8,
        is_important = $9
       where id = $10`,
      [
        value(formData, "academic_year_id"),
        optionalValue(formData, "category_id"),
        value(formData, "title_ar"),
        value(formData, "title_id"),
        optionalValue(formData, "description_ar"),
        optionalValue(formData, "description_id"),
        value(formData, "start_date"),
        optionalValue(formData, "end_date"),
        formData.get("is_important") === "on",
        value(formData, "id")
      ]
    );
  });
}

export async function deleteEvent(formData: FormData) {
  await runAdminMutation(async () => {
    await queryDatabase("delete from events where id = $1", [value(formData, "id")]);
  });
}
