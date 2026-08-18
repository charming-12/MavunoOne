"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Link from "next/link";
import { Camera, CameraOff, CircleAlert, ExternalLink, ShieldCheck } from "lucide-react";

type CctvStatus = {
  enabled: boolean;
  configured: boolean;
  brand: string | null;
  protocol: string | null;
  streamName: string;
  gatewayUrl: string | null;
  hlsUrl: string | null;
};

export default function CamerasPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CctvStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerError, setPlayerError] = useState("");

  useEffect(() => {
    fetch("/api/cctv/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: CctvStatus) => setStatus(data))
      .catch(() => setStatus({ enabled: false, configured: false, brand: null, protocol: null, streamName: "camera_1", gatewayUrl: null, hlsUrl: null }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!status?.configured || !status.hlsUrl || !videoRef.current) return;
    const video = videoRef.current;
    setPlayerError("");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = status.hlsUrl;
      return () => { video.pause(); video.removeAttribute("src"); video.load(); };
    }
    if (!Hls.isSupported()) {
      const timer = window.setTimeout(() => setPlayerError("Browser hii haiwezi kucheza HLS stream moja kwa moja."), 0);
      return () => window.clearTimeout(timer);
    }
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(status.hlsUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) setPlayerError("Stream haikupatikana. Hakikisha go2rtc na Cloudflare Tunnel bado vinaendelea kwenye desktop.");
    });
    return () => { hls.destroy(); };
  }, [status]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Security operations</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Kamera za usalama</h1>
        <p className="mt-2 text-slate-500">CCTV stream inayotoka kwenye gateway iliyosanidiwa na Setup Wizard.</p>
      </div>

      {loading && <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Inakagua CCTV configuration...</div>}

      {!loading && !status?.configured && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-start gap-3"><CircleAlert className="mt-0.5 text-amber-600" size={21} /><div><h2 className="font-black text-amber-950">CCTV haijawezeshwa</h2><p className="mt-1 text-sm text-amber-900/80">Washa CCTV kwenye Setup Wizard, weka Gateway HTTPS URL na stream name, kisha save configuration.</p><Link href="/office/setup-wizard" className="mt-3 inline-block font-bold text-amber-950 underline">Fungua Setup Wizard →</Link></div></div></div>}

      {!loading && status?.configured && <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-700" size={22} /><div><p className="font-black text-emerald-950">Gateway configured</p><p className="text-sm text-emerald-800">{status.brand} · {status.protocol} · {status.streamName}</p></div></div>{status.gatewayUrl && <a href={status.gatewayUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-bold text-emerald-900">Fungua gateway <ExternalLink size={16} /></a>}</div>
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl"><div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 text-sm text-slate-300"><span className="flex items-center gap-2"><Camera size={17} /> {status.streamName}</span><span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-300">LIVE GATEWAY</span></div><video ref={videoRef} controls muted autoPlay playsInline className="aspect-video w-full bg-black" />{playerError && <p className="border-t border-slate-800 px-4 py-3 text-sm text-amber-200">{playerError}</p>}</div>
      </div>}

      <div className="grid gap-5 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ShieldCheck className="text-emerald-600" size={22} /><h2 className="mt-4 font-black text-slate-900">Secure streams</h2><p className="mt-2 text-sm text-slate-500">DVR credentials zinabaki server-side; dashboard inatumia gateway HLS URL iliyosanidiwa.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><CameraOff className="text-slate-500" size={22} /><h2 className="mt-4 font-black text-slate-900">No fake feeds</h2><p className="mt-2 text-sm text-slate-500">Ikiwa gateway haipatikani, mfumo utaonyesha status ya kweli badala ya picha ya kubuni.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><ExternalLink className="text-sky-600" size={22} /><h2 className="mt-4 font-black text-slate-900">Hardware setup</h2><p className="mt-2 text-sm text-slate-500">Weka provider details na stream name kupitia Setup Wizard.</p><Link href="/office/setup-wizard" className="mt-4 inline-block text-sm font-bold text-emerald-700">Fungua setup →</Link></div></div>
    </div>
  );
}
