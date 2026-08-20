"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Camera, CameraOff, CircleAlert, ShieldCheck } from "lucide-react";

type CctvStatus = { enabled: boolean; configured: boolean; brand: string | null; protocol: string | null; streamName: string; hlsUrl: string | null };

export default function BossCamerasPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CctvStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cctv/status", { cache: "no-store" }).then((response) => response.json()).then((data: CctvStatus) => setStatus(data)).catch(() => setStatus({ enabled: false, configured: false, brand: null, protocol: null, streamName: "camera_1", hlsUrl: null })).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!status?.configured || !status.hlsUrl || !videoRef.current) return;
    const video = videoRef.current;
    setError("");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = status.hlsUrl;
      return () => { video.pause(); video.removeAttribute("src"); video.load(); };
    }
    if (!Hls.isSupported()) { const timer = window.setTimeout(() => setError("Browser hii haiwezi kucheza HLS stream."), 0); return () => window.clearTimeout(timer); }
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(status.hlsUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) setError("CCTV gateway haipatikani kwa sasa."); });
    return () => hls.destroy();
  }, [status]);

  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Security operations</p><h1 className="mt-1 text-3xl font-black text-slate-900">CCTV ya Executive</h1><p className="mt-2 text-slate-500">Live monitoring ya read-only kwa Boss. Configuration inabaki kwa Admin.</p></div>
    {loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Inakagua CCTV status...</div>}
    {!loading && !status?.configured && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 text-amber-600" size={21} /><div><h2 className="font-black text-amber-950">CCTV haijawezeshwa</h2><p className="mt-1 text-sm text-amber-900/80">Hakuna live gateway iliyosanidiwa kwa sasa. Admin ndiye anayefanya hardware setup.</p></div></div></div>}
    {!loading && status?.configured && <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4 text-sm text-slate-300"><span className="flex items-center gap-2"><Camera size={17} />{status.streamName}</span><span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300"><ShieldCheck size={14} /> LIVE GATEWAY</span></div><video ref={videoRef} controls muted autoPlay playsInline className="aspect-video w-full bg-black" />{error && <p className="border-t border-slate-800 px-5 py-3 text-sm text-amber-200">{error}</p>}</div>}
    <div className="grid gap-5 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ShieldCheck className="text-emerald-600" size={22} /><h2 className="mt-4 font-black text-slate-900">Secure stream</h2><p className="mt-2 text-sm text-slate-500">Credentials za DVR/NVR hazionekani kwa Boss; anaona stream iliyothibitishwa tu.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CameraOff className="text-slate-500" size={22} /><h2 className="mt-4 font-black text-slate-900">No fake feeds</h2><p className="mt-2 text-sm text-slate-500">Gateway ikiwa offline, status halisi itaonekana badala ya video ya kubuni.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CircleAlert className="text-amber-600" size={22} /><h2 className="mt-4 font-black text-slate-900">Admin-managed setup</h2><p className="mt-2 text-sm text-slate-500">Mabadiliko ya gateway na hardware yanafanywa na Admin pekee.</p></div></div>
  </div>;
}
