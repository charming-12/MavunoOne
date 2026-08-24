# MavunoOne — Ripoti ya Ukaguzi wa Production Readiness

**Tarehe ya ukaguzi:** 24 Agosti 2026  
**Production:** Render — [mavuno-one.onrender.com](https://mavuno-one.onrender.com)  
**Staging:** Vercel Preview — [mavuno-one-git-audit-fixes-josiah6.vercel.app](https://mavuno-one-git-audit-fixes-josiah6.vercel.app)  
**Branch iliyokaguliwa:** `audit-fixes`  
**Mwandishi:** Manus AI

## Muhtasari wa uamuzi

Mfumo una msingi mzuri wa biashara na unajenga kwa mafanikio. Public shell ya Render production na Vercel staging ilifunguka wakati wa ukaguzi, routes zote zilizokaguliwa zipo, package-level inventory imeunganishwa kwenye Stock In na Stock Out, na fractional POS quantities zinaruhusiwa kwa bidhaa za kilo/litre. Hata hivyo, mfumo **haukuwa bado umefikia kiwango cha kusema automatic real-money payment verification imekamilika**. Production endpoint ya payment instructions ilirudisha payment ikiwa haijawezeshwa na namba/API ikiwa tupu, kwa hiyo Lipa Namba pekee bado haijaunganishwa na order kwa webhook halisi.

Kwa usalama, hali ya sasa inapaswa kutafsiriwa kama **production-ready kwa manual payment confirmation, lakini siyo fully ready kwa automatic mobile-money settlement**. Automatic verification itawekwa baada ya kuchagua payment provider/gateway rasmi, kupata credentials za production, ku-configure callback/webhook, na kufanya sandbox pamoja na controlled live test.

## Mazingira yaliyothibitishwa

| Eneo | Hali | Ushahidi |
|---|---|---|
| Render production | Inafunguka | Public home ya Ipuli Milling ilifunguka kwenye `mavuno-one.onrender.com` |
| Vercel staging | Inafunguka | Public home ya staging ilifunguka na ilionyesha `Tigo Pesa — Simulated Test` |
| Staging Preview ya code fixes | Ready | Commit `3558283` ilipata Vercel Preview ya Ready baada ya build ya takriban dakika moja |
| Production payment config | Haijawezeshwa | `/api/payment/instructions` ilirudisha `enabled:false`, provider `mpesa`, na merchant number tupu |
| Production readiness endpoint | Bado ina missing config | Ilirudisha `LIPA_NUMBER`, `LIPA_API_KEY` na CCTV variables kuwa missing |
| Build | Imepita | `npm run build` ilicompile, TypeScript ikapita na routes 74 zikageneratiwa |
| Lint | Imepita baada ya fix | `npm run lint` ilipita baada ya kurekebisha OfflineSupport |
| Route audit | Imepita | `scripts/audit_routes.py` haikupata referenced missing routes |

## Matokeo ya payment na order flow

Public Shop inahifadhi order kwenye `sales` ikiwa na `invoiceNumber`, customer, bidhaa, quantity, total, payment method na `paymentStatus: pending`. Hii ni sahihi kwa kuzuia order ya online kujifanya imelipwa. Checkout inaonyesha namba ya malipo na inaeleza kwamba timu itathibitisha payment kwa mawasiliano. Tatizo lililobaki ni kwamba checkout haianzishi request ya payment gateway, haipokei provider transaction reference, na haina callback route ya ku-update order automatically.

POS ya ndani inaruhusu Cash, M-Pesa, Tigo Pesa, Airtel Money, Bank, Credit, na staging-only simulated Tigo. Cash na simulated staging huwekwa `paid`; mobile-money na bank hubaki `pending`. Kabla ya marekebisho, stock movement iliandikwa wakati sale ilipohifadhiwa hata kama payment ilikuwa pending. Hii inaweza kutumika kama stock reservation, lakini lazima iwe na cancellation/release process ya payment iliyofeli; vinginevyo stock inaweza kuonekana imepungua bila pesa kuthibitishwa.

Nimeongeza `sales.confirmPayment` yenye ruhusa ya Admin, Owner, au Manager mwenye `jobTitle=finance`. Itahitaji payment reference, inahifadhi `paymentReference` na optional `paymentTransactionId`, inabadilisha sale kutoka pending kwenda paid, na inaandika audit log. Update hutumia condition ya `paymentStatus=pending`, hivyo confirmation ya pili hairuhusiwi kwa sale ileile. Nimeongeza pia columns hizi kwenye schema na build-time `ensure-schema.ts` ili databases za staging na production ziweze kuongezwa kwa usalama bila migration ya kubahatisha.

> **Muhimu:** Hii ni confirmation workflow salama ya Finance; bado si provider webhook. Mfumo haupaswi kuitangaza production kuwa automatic mpaka endpoint ya provider na signature verification viunganishwe.

### Flow inayotakiwa baada ya gateway rasmi

| Hatua | Mfumo unatakiwa kufanya nini |
|---|---|
| 1 | Kutengeneza order/invoice reference ya kipekee, kwa mfano `ORD-2026-000145` |
| 2 | Kutuma payment request au hosted invoice kwa gateway kwa amount na customer phone |
| 3 | Gateway kurudisha request/reference ya provider ikiwa payment bado processing |
| 4 | Provider kutuma callback kwenye HTTPS webhook baada ya success/failure |
| 5 | Mfumo kuthibitisha signature, merchant account, currency, amount na order reference |
| 6 | `SUCCESS` yenye taarifa zinazolingana kuweka sale `paid` mara moja kwa idempotency |
| 7 | `FAILED`, `CANCELLED`, `PENDING`, amount pungufu, au reference isiyolingana kuacha exception |
| 8 | Finance kushughulikia exception, refund, duplicate, reconciliation na release ya reservation |
| 9 | Storekeeper/delivery kupewa ruhusa ya fulfilment baada ya payment kuwa paid |

Gateway documentation ya PlusPesa inaonyesha muundo huu: `external_id` ya merchant, callback URL, webhook yenye success/failed, callback signature, na reference ya provider kwa reconciliation [1]. PayIn pia inaonyesha unified mobile-money API, real-time signed callbacks na idempotency keys [2]. Vodacom M-Pesa ina developer portal yenye C2B, reversal na transaction-status APIs, pamoja na sandbox na go-live review [3]. Hii inathibitisha kwamba API integration ya kweli inahitaji provider account na onboarding; kuweka namba tu kwenye Setup Wizard haitoshi.

## RBAC na separation of duties

Nimekuta middleware inalinda `/boss` kwa Boss pekee na `/office` kwa staff roles halali. `AuthGuard` pia inathibitisha session kutoka server kabla ya page kuonekana. Sidebar inachuja routes kulingana na role, na Finance Manager ana workspace tofauti na Operations Manager.

Kulikuwa na kasoro muhimu kwenye server authorization: `financeProcedure` ilikuwa inaruhusu role ya `cashier`. Hii ingeweza kumpa Cashier uwezo wa kufanya baadhi ya financial mutations kama customer debt payment, reconciliation approval, farmer-payment actions au financial records kupitia direct API hata kama link haionekani kwenye sidebar. Nimeiondoa cashier kwenye finance guard. Sasa finance guard inaruhusu Admin/Owner na Manager mwenye `jobTitle=finance`, huku farmer approval ikiwa na explicit Boss/Admin/Owner approval na maker-checker rule.

| Jukumu | Kazi inayofaa |
|---|---|
| Cashier | Kutengeneza POS sale, kupokea cash, kuona sales history inayoruhusiwa; siyo ku-confirm mobile-money exception |
| Storekeeper | Stock In, Stock Out, package/bag weights, warehouse traceability; siyo ku-approve finance |
| Finance Manager | Customer debt payments, reconciliation approvals zilizopewa, payment confirmation, reconciliation na financial exceptions |
| Operations Manager | Operations, inventory, deliveries, machines na reports za operation; siyo finance approval isipokuwa amepewa job title ya finance |
| Admin/Owner | Configuration, access management, payment setup, audit na emergency administration |
| Boss | Executive view na approval za juu; siyo lazima aingie kwenye kila cashier transaction |

Ulinzi huu wa server ni muhimu kuliko kuficha button pekee. Hata mtu akijaribu direct API, role isiyohusika inapaswa kukataliwa.

## Inventory na package-level weights

Stock In ina fields za `packageCount`, `packageWeightKg`, individual comma-separated `packageWeightsKg`, `baseQuantity`, supplier/farmer source, purchase/GRN reference, batch, vehicle, warehouse, receiver, quality status na cost per unit. Stock Out ina package count, uniform au individual weights, reason na notes. Backend huhesabu base kilograms na ku-update current stock kwa transaction ya movement. POS inatumia decimal quantity kwa kg/litre, kwa hiyo quantity kama `0.5` inakubalika.

Hii inakidhi mahitaji ya kutofautisha **idadi ya magunia** na **jumla ya kilo**. Mfano: magunia 3 yenye `50, 48, 52 kg` yanapaswa kuwa packages 3 na base quantity 150 kg. Product ya `packageSizeKg` inaonyesha conversion ya unit kwenda base kg; bei ya unit inatumika kwenye line total, na stock inakatwa kwa base quantity.

Mapengo ya baadaye ya kuimarisha inventory ni kuunganisha sale fulfilment na stock reservation/release kwa transaction moja, pamoja na batch-level costing/FIFO kama biashara itahitaji. Kwa sasa package tracking na fractional quantities zipo kwenye code iliyokaguliwa.

## Staging, production na data safety

Production ya Render na staging ya Vercel zinaonekana kutenganishwa kwa public configuration: staging ilionyesha `Tigo Pesa — Simulated Test` na `TEST-MERCHANT-001`, wakati Render production haikuonyesha simulated payment. Vercel branch Preview imeunganishwa na `audit-fixes`; Render production haikuguswa na push hii.

Sample-data reset endpoint imefungwa kwa Admin/Owner, inahitaji environment isiwe production na `MAVUNO_ALLOW_SAMPLE_RESET=true`. Backup hufanyika kabla ya reset, na protected admin/boss/owner accounts hazipaswi kufutwa na sample reset. Hii ni ulinzi mzuri, lakini production secrets na staging secrets lazima zibaki tofauti kabisa: `DATABASE_URL`, session secret, payment keys, SMS keys na reset flags hazipaswi kuvuka mazingira.

Production readiness endpoint ilionyesha `LIPA_NUMBER` na `LIPA_API_KEY` missing. Hivyo hakuna sababu ya kujaribu payment halisi kwenye Render mpaka variables na provider account vithibitishwe. Staging simulated payment inaweza kuendelea kwa mafunzo bila kutuma fedha halisi.

## Offline mode na deployment health

Service worker `v2` ina-cache app shell, static Next assets, styles, scripts, fonts, images, `/login` na `/offline.html`. API responses hazicachiwi, jambo ambalo ni sahihi kwa data ya mauzo, payments na authenticated dashboard. Navigations hutumia network-first na branded Swahili fallback.

Nimekuta lint error kwenye `OfflineSupport.tsx`: effect ilikuwa iki-set state synchronously na timer cleanup ilikuwa inarudishwa ndani ya callback badala ya effect. Nimeirekebisha kwa lazy initial state, proper timer cleanup na unsubscribe cleanup. Build na lint zilipita baada ya marekebisho. Next.js bado ina warning ya middleware convention kuwa deprecated; hii si failure ya build lakini inapaswa kupangwa kuwa `proxy` katika maintenance task inayofuata.

## Marekebisho yaliyowekwa kwenye branch ya staging

Marekebisho yako kwenye branch `audit-fixes` na commit kuu ya code ni `3558283` (`harden payment confirmation and finance access`). Commit ya documentation ya deployment observations ni `fc40c84`. Vercel Preview ya code commit `3558283` ilifikia status **Ready**. Hakuna commit iliyopushwa kwenye `master`, na Render production haikuredeploywa.

Marekebisho yaliyofanywa ni haya: finance guard sasa haimruhusu Cashier kufanya finance-only mutations; sales schema imeongezewa payment reference na transaction ID; `ensure-schema.ts` imeongezewa columns hizo; sales history imepata Finance-only payment confirmation UI; na OfflineSupport imepata cleanup sahihi ya effect/timer.

## Vitu ambavyo bado havijakamilika

Mfumo hauwezi kuitwa fully complete kwa automatic real-money payment mpaka provider rasmi achaguliwe na credentials zitolewe. Pia hakuna provider-specific webhook route, signature verification, idempotency storage, automatic reconciliation polling fallback, refund/reversal workflow, au provider receipt table iliyojitenga. Haya ni mapengo ya kweli ya payment integration, siyo mapungufu ya kujaribu kuficha kwa UI.

Public checkout pia inaonyesha mobile-money instructions lakini haisukumi payment request moja kwa moja. Kwa gateway inayotumia hosted invoice au USSD push, checkout inapaswa kuomba gateway request baada ya order kuundwa na kumrudishia mteja payment URL/prompt. Kwa manual Lipa Namba flow, order inapaswa kubaki pending na Finance athibitishe reference kwa portal/statement.

## Mpangilio wa hatua zinazofuata

Kwanza, Boss athibitishe provider atakayetumika: direct M-Pesa API, Mixx/Tigo official integration, au aggregator kama PayIn/PlusPesa. Pili, provider atoe sandbox credentials, production credentials, webhook signing secret, merchant account na callback requirements. Tatu, integration ijengwe kwa provider payload halisi—si payload ya kubuni—ikiwa na signature verification, idempotency, amount matching, currency check, duplicate protection na audit logs. Nne, staging ifanyiwe test ya successful, failed, pending, wrong amount, duplicate callback, timeout na reversal. Tano, baada ya Finance/Boss ku-approve test results, production credentials ziwekwe Render na deployment ifanywe kwa maintenance window.

Kwa sasa unaweza kuendelea na manual training kwenye Vercel staging: Admin/Finance aingie Sales History, afungue sale ya pending, athibitishe reference kutoka statement, kisha abonyeze `Thibitisha malipo`. Cashier hawezi tena kufanya finance confirmation. Usitumie staging simulated payment kama ushahidi kwamba Lipa Namba ya production inafanya kazi.

## Hitimisho

Mfumo umefika hatua nzuri ya **controlled production operation** kwa cash sales, manual mobile-money confirmation, inventory package tracking, fractional quantities, RBAC msingi, staging separation na offline shell. Hauko tayari bado kwa kauli kwamba malipo ya Lipa Namba yanajithibitisha yenyewe kwa kila order. Jibu la kitaalamu ni: **misingi ipo na payment-confirmation workflow imeimarishwa, lakini automatic gateway/webhook integration bado ni hatua tofauti inayohitaji provider credentials na test ya kweli.**

## References

[1]: https://docs.pluspesa.com/ "PlusPesa Collections API — callbacks, webhooks, signatures and transaction status"

[2]: https://docs.payin.co.tz/ "PayIn API — Tanzania mobile-money collections, signed webhooks and idempotency"

[3]: https://business.m-pesa.com/developers/ "Vodacom M-Pesa Developer Portal — C2B, reversals, transaction status and go-live workflow"

[4]: https://mavuno-one.onrender.com "MavunoOne Render production public site"

[5]: https://mavuno-one-git-audit-fixes-josiah6.vercel.app "MavunoOne Vercel audit-fixes branch Preview"

[6]: https://github.com/charming-12/MavunoOne/tree/audit-fixes "MavunoOne audit-fixes branch"
