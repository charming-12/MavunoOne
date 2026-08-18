import { NextResponse } from "next/server";
import { and, asc, desc, eq, isNotNull, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { publicContent } from "@/drizzle/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const rows = await db.select({
    id: publicContent.id,
    slug: publicContent.slug,
    contentType: publicContent.contentType,
    title: publicContent.title,
    subtitle: publicContent.subtitle,
    body: publicContent.body,
    imageUrl: publicContent.imageUrl,
    ctaLabel: publicContent.ctaLabel,
    ctaHref: publicContent.ctaHref,
    sortOrder: publicContent.sortOrder,
    publishedAt: publicContent.publishedAt,
  }).from(publicContent).where(and(
    eq(publicContent.isPublic, true),
    eq(publicContent.status, "published"),
    or(isNotNull(publicContent.publishedAt), lte(publicContent.createdAt, now)),
  )).orderBy(asc(publicContent.sortOrder), desc(publicContent.publishedAt));

  return NextResponse.json({ content: rows });
}
