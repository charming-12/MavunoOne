"use client";

import { FormEvent, useMemo, useState } from "react";
import { Check, Globe2, Pencil, Send, ShieldCheck, SquarePen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { readStoredUser } from "@/lib/auth";

type ContentForm = {
  id?: number;
  slug: string;
  contentType: string;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: string;
};

const blankForm: ContentForm = { slug: "", contentType: "announcement", title: "", subtitle: "", body: "", imageUrl: "", ctaLabel: "", ctaHref: "", sortOrder: "0" };
const statusLabel: Record<string, string> = { draft: "Draft", review: "In review", approved: "Approved", published: "Published", archived: "Archived" };
const statusClass: Record<string, string> = { draft: "bg-slate-100 text-slate-700", review: "bg-amber-100 text-amber-800", approved: "bg-blue-100 text-blue-800", published: "bg-emerald-100 text-emerald-800", archived: "bg-red-100 text-red-800" };

export default function ContentManagementPage() {
  const utils = trpc.useUtils();
  const query = trpc.content.list.useQuery();
  const save = trpc.content.save.useMutation({ onSuccess: () => { utils.content.list.invalidate(); setForm(blankForm); setEditing(false); setNotice("Content imehifadhiwa kama draft."); } });
  const changeStatus = trpc.content.changeStatus.useMutation({ onSuccess: () => { utils.content.list.invalidate(); setNotice("Status ya content imebadilishwa."); } });
  const [form, setForm] = useState<ContentForm>(blankForm);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const user = readStoredUser();
  const canPublish = user?.role === "admin" || user?.role === "owner";
  const content = useMemo(() => query.data ?? [], [query.data]);

  const editItem = (item: typeof content[number]) => {
    setForm({ id: item.id, slug: item.slug, contentType: item.contentType, title: item.title, subtitle: item.subtitle ?? "", body: item.body ?? "", imageUrl: item.imageUrl ?? "", ctaLabel: item.ctaLabel ?? "", ctaHref: item.ctaHref ?? "", sortOrder: String(item.sortOrder ?? 0) });
    setEditing(true);
    setNotice("");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    save.mutate({ ...form, id: form.id, sortOrder: Number(form.sortOrder) || 0, subtitle: form.subtitle || undefined, body: form.body || undefined, imageUrl: form.imageUrl || undefined, ctaLabel: form.ctaLabel || undefined, ctaHref: form.ctaHref || undefined });
  };

  const statusAction = (id: number, status: "review" | "approved" | "published" | "archived") => changeStatus.mutate({ id, status });

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Public publishing</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-950"><Globe2 className="text-emerald-600" /> Public Content</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Andaa taarifa za Home Page na Shop hapa. Content haitakuwa public mpaka ipitie review na publish.</p></div>
      <button onClick={() => { setForm(blankForm); setEditing((value) => !value); setNotice(""); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white"><SquarePen size={17} /> {editing ? "Funga editor" : "Content mpya"}</button>
    </header>

    {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{notice}</div>}
    {save.error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{save.error.message}</div>}
    {changeStatus.error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{changeStatus.error.message}</div>}

    {editing && <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2"><p className="text-lg font-black text-slate-950">{form.id ? "Hariri content" : "Andaa content mpya"}</p><p className="mt-1 text-sm text-slate-500">Hifadhi kwanza kama draft. Manager anaweza ku-review; Admin/Owner anaweza ku-publish.</p></div>
      <div><label className="label">Slug</label><input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} className="input" placeholder="mafuta-ya-alizeti" /></div>
      <div><label className="label">Aina ya content</label><select value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })} className="input"><option value="announcement">Announcement</option><option value="hero">Home hero</option><option value="product_feature">Product feature</option><option value="promotion">Promotion</option><option value="news">News</option></select></div>
      <div className="md:col-span-2"><label className="label">Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Mafuta ya Alizeti ya MavunoOne" /></div>
      <div className="md:col-span-2"><label className="label">Subtitle</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input" placeholder="Maelezo mafupi ya public" /></div>
      <div className="md:col-span-2"><label className="label">Body / description</label><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="input min-h-28" placeholder="Andika taarifa ambayo mteja ataiona..." /></div>
      <div><label className="label">Image URL (optional)</label><input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" placeholder="https://..." /></div>
      <div><label className="label">CTA label (optional)</label><input value={form.ctaLabel} onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })} className="input" placeholder="Tazama Shop" /></div>
      <div><label className="label">CTA link (optional)</label><input value={form.ctaHref} onChange={(e) => setForm({ ...form, ctaHref: e.target.value })} className="input" placeholder="/shop" /></div>
      <div><label className="label">Order</label><input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="input" /></div>
      <div className="flex items-center gap-3 md:col-span-2"><button disabled={save.isPending} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{save.isPending ? "Inahifadhi..." : "Hifadhi draft"}</button><button type="button" onClick={() => { setEditing(false); setForm(blankForm); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Cancel</button></div>
    </form>}

    <section className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Jumla</p><p className="mt-2 text-3xl font-black text-slate-950">{content.length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">In review</p><p className="mt-2 text-3xl font-black text-amber-600">{content.filter((item) => item.status === "review").length}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Published</p><p className="mt-2 text-3xl font-black text-emerald-600">{content.filter((item) => item.status === "published").length}</p></div></section>

    <section className="space-y-4">{query.isLoading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Inapakia public content...</div> : content.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Globe2 className="mx-auto text-slate-300" size={34} /><p className="mt-3 font-bold text-slate-800">Hakuna content bado</p><p className="mt-1 text-sm text-slate-500">Anza kwa kuandaa announcement au product feature.</p></div> : content.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass[item.status] || statusClass.draft}`}>{statusLabel[item.status] || item.status}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{item.contentType}</span>{item.isPublic && <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700"><Globe2 size={13} /> Public</span>}</div><h2 className="mt-3 text-xl font-black text-slate-950">{item.title}</h2><p className="mt-1 text-sm text-slate-500">/{item.slug} · Created by {item.creatorName || "System user"}</p>{item.subtitle && <p className="mt-3 text-sm font-semibold text-slate-700">{item.subtitle}</p>}{item.body && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{item.body}</p>}</div><button onClick={() => editItem(item)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700"><Pencil size={14} /> Hariri</button></div><div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">{item.status === "draft" && <button onClick={() => statusAction(item.id, "review")} className="inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-black text-amber-900"><Send size={14} /> Tuma review</button>}{item.status === "review" && <button onClick={() => statusAction(item.id, "approved")} className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-2 text-xs font-black text-blue-900"><ShieldCheck size={14} /> Approve</button>}{item.status === "approved" && canPublish && <button onClick={() => statusAction(item.id, "published")} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white"><Check size={14} /> Publish public</button>}{item.status === "published" && canPublish && <button onClick={() => statusAction(item.id, "archived")} className="rounded-lg bg-red-100 px-3 py-2 text-xs font-black text-red-800">Archive</button>}{item.status === "published" && <span className="text-xs font-semibold text-slate-500">Published content ndiyo pekee inayoonekana public.</span>}</div></article>)}</section>
    <style jsx>{`.label{display:block;margin-bottom:.35rem;font-size:.75rem;font-weight:700;color:#475569}.input{width:100%;border:1px solid #dbe4e0;border-radius:.75rem;background:#fff;padding:.7rem .8rem;font-size:.875rem;color:#0f172a;outline:none}.input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.12)}`}</style>
  </div>;
}
