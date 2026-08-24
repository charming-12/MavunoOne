# Mwongozo wa kupiga simu kuomba Payment Gateway

## Sentensi ya kuanzia

> Habari, sisi ni **Ipuli Milling and Animal Enterprise** ya Tabora. Tuna mfumo wa biashara unaoitwa MavunoOne, na tunataka kupokea malipo ya wateja kutoka kwenye Shop/POS yetu kwa kutumia Lipa Namba au merchant account, huku kila payment ikiunganishwa na order number na kuthibitishwa automatically. Tunaomba utuelekeze kwenye **merchant API/payment gateway integration** rasmi, siyo Lipa Namba ya kawaida pekee.

## Maswali ya kumuuliza provider

| Swali | Jibu tunalotaka |
|---|---|
| Je, mna merchant API au payment gateway kwa biashara? | Jina la portal/API na mchakato wa usajili |
| Je, mnatoa Sandbox/Test environment? | Credentials za test bila fedha halisi |
| Je, mteja anaweza kulipa kwa USSD push, hosted invoice, au Lipa Number? | Njia inayofaa kwa Shop na POS |
| Je, tunaweza kutuma order/invoice reference? | Field kama `external_id`, `reference` au `invoice number` |
| Je, mnatuma callback/webhook payment status? | URL, payload, status values na retry behavior |
| Webhook inalindwa kwa signature/secret? | Header, HMAC/signing method na secret |
| Mna transaction-status query API? | Endpoint ya fallback endapo webhook haikufika |
| Mna reversal/refund API? | Utaratibu wa malipo yaliyokosewa au order iliyofutwa |
| Mna receipt/transaction reference ya kudumu? | Transaction ID/receipt number ya reconciliation |
| Mna approval ya kwenda live? | Checklist na go-live review |
| API inafanya kazi kwenye operator gani? | M-Pesa, Mixx/Tigo, Airtel, HaloPesa au zaidi |
| Charges, settlement na limits ni zipi? | Ada, muda wa settlement, minimum/maximum amount |
| Kisheria/KYC inahitaji nini? | Business licence, TIN, bank account, certificate na authorised signatory |

## Taarifa za Ipuli Milling za kuwa nazo

Provider anaweza kuomba jina kamili la kampuni/biashara, TIN, business licence, certificate of incorporation au usajili wa biashara, anwani ya Tabora, jina na kitambulisho cha mwakilishi, namba ya simu ya biashara, settlement bank account, website ya production, na maelezo ya bidhaa/huduma. Usiwape API secret kwa mtu wa simu; provider ndiye anayepaswa kutengeneza credentials ndani ya portal salama.

## Tofauti ya namba na gateway

**Lipa Namba** ni namba ya kupokea pesa. **Payment gateway/API** ni huduma ya kiteknolojia inayotuma payment request, inarudisha transaction status, inakubali order reference, na inatuma callback kwa MavunoOne. Mtu akisema “ongeza API integration”, muulize wazi kama wanatoa API keys, sandbox, webhook/callback, transaction query na reversal.

## Utakachoweka kwenye Setup Wizard

Baada ya provider kukupa taarifa, kwenye Setup Wizard chagua `API Gateway — automatic callback`, kisha chagua `Sandbox / Testing` kwanza. Jaza provider, merchant/Lipa Number, API base URL, API key, API secret, webhook signing secret na webhook URL. Wizard haitaruhusu gateway configuration isiyokamilika kuhifadhiwa kama valid production setup. Webhook URL ya kawaida ni:

```text
https://mavuno-one.onrender.com/api/payment/webhook
```

Usitumie URL hii kwa provider mpaka payment webhook route ya provider-specific integration iwe imejengwa na kujaribiwa; kwa sasa itumike kama sehemu ya kuandaa taarifa za onboarding tu.

## Majibu ya provider ya kuomba kwa maandishi

Omba watume documentation au email yenye API base URL, authentication headers, request example, callback payload example, signature verification instructions, status values, retry policy, sandbox credentials, production go-live checklist, transaction query endpoint, reversal/refund rules na support contact. Hii ndiyo taarifa itakayowekwa kwenye implementation ya MavunoOne bila kubuni payload.

## Tahadhari

Usiweke API key/secret kwenye WhatsApp group, screenshot, GitHub, au sehemu ya public. Tumia Sandbox kwanza, kisha test payment ndogo kwa approval ya Boss na Finance. Payment status ya MavunoOne ibadilike kuwa `Paid` tu baada ya callback/signature/amount/reference kuthibitishwa; SMS au screenshot ya mteja pekee haitoshi.
