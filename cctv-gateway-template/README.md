# MavunoOne CCTV Gateway Template

Hii ni template ya Windows desktop kwa CCTV yenye camera nyingi. Usirun go2rtc mpaka taarifa za DVR/NVR au IP cameras zimethibitishwa.

## Files

`go2rtc.yaml.example` ni configuration template. Copy iwe `go2rtc.yaml`, kisha badilisha placeholders kwa taarifa halisi. `start-cctv-gateway.ps1` inakagua kama `go2rtc.exe` na `go2rtc.yaml` zipo, halafu inaanzisha local gateway.

## Taarifa za kumuuliza Boss

Omba picha ya DVR/NVR yenye logo/model na picha ya nyuma yenye ports, idadi ya cameras/channels, app inayotumika kuangalia recordings, na kama box ina LAN cable kwenda router. Usipokee password, QR code au token kwenye WhatsApp group.

## Local Windows setup

Weka `go2rtc.exe`, `go2rtc.yaml` na `start-cctv-gateway.ps1` kwenye folder moja, kwa mfano `C:\MavunoOne\cctv-gateway`. Kisha fungua PowerShell kwenye folder hilo na tumia:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\start-cctv-gateway.ps1
```

Fungua `http://127.0.0.1:1984` kwenye desktop hiyo. Test local stream kwanza. Cloudflare Tunnel ianzishwe baada ya preview kufanya kazi.

## Hikvision-style channel examples

Kwa Hikvision, channel 1 mara nyingi hutumia `101` main stream au `102` sub-stream; channel 2 hutumia `201`/`202`, na kuendelea. Hizi ni examples tu—thibitisha brand/model na RTSP path ya kifaa kabla ya production.

## Security

Usicommit `go2rtc.yaml` yenye username/password halisi kwenye GitHub. Usitumie password yenyewe kama Cloudflare URL. Tumia Setup Wizard kwa public gateway URL na encrypted secret profile kwa device credentials.
