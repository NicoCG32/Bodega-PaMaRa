<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Business data (deudas, encargos, productos, teléfonos) lives in device localStorage via `src/lib/store.ts` and, when the owner signs in with Google, syncs as a full JSON snapshot to the `backups` table via `src/lib/cloudSync.ts` (localStorage stays the local cache; cloud row wins when newer). Why: single-owner app; snapshot sync is simpler than normalized tables and enough for backup + push.
- Push notifications: FCM via connector gateway in `src/routes/api/public/jobs/recordatorios.ts` (daily managed HTTP schedule 13:00 UTC), tokens in `push_tokens`, client registration in `src/lib/push.ts` + `public/firebase-messaging-sw.js`. Why: avisos must arrive with the app closed.
- AI uses direct Groq calls only inside server functions in `src/lib/ai.functions.ts`; response schemas are validated before previewing a record. Why: keep provider credentials private and prevent malformed data from reaching registration.
- Voice captures native recognition alongside recorded audio; `vozNativa.ts` returns available transcripts with a short native-ready grace period, and Groq interpretation reconciles them as alternate versions, never additive inventory. Why: retain native speech when Whisper is slow without late duplicate registrations.
- Public storefront is only `/`; every other route is the private Vault wrapped in AppShell + AdminGate in `__root.tsx`, and the installed app starts at `/vault`. Why: clients and the owner must never share screens.
- Sale prices come from `precioVenta()` in `src/lib/store.ts` (product price or general price ± fixed amounts by estado stock/remate/encargo, stored in `State.precios`). Why: one rule shared by Boutique, Bodega and encargos.
