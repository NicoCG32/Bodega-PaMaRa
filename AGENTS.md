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
- Products and sale prices live in Cloud tables `productos` (one jsonb row per code) and `ajustes_tienda`, synced by `src/lib/productosSync.ts` for admin accounts; deudas/encargos/teléfonos stay in localStorage + `backups` snapshot via `src/lib/cloudSync.ts`. Why: the public Boutique must read real stock from any device.
- Vault access = Google sign-in + `admin` row in `user_roles` (first account to sign in becomes admin by trigger), checked in `AdminGate`. Why: a device PIN was not real protection.
- Push notifications: FCM via connector gateway in `src/routes/api/public/jobs/recordatorios.ts` (daily managed HTTP schedule 13:00 UTC), tokens in `push_tokens`, client registration in `src/lib/push.ts` + `public/firebase-messaging-sw.js`. Why: avisos must arrive with the app closed.
- AI uses direct Groq calls only inside server functions in `src/lib/ai.functions.ts`; response schemas are validated before previewing a record. Why: keep provider credentials private and prevent malformed data from reaching registration.
- Voice captures native recognition alongside recorded audio; `vozNativa.ts` returns available transcripts with a short native-ready grace period, and Groq interpretation reconciles them as alternate versions, never additive inventory. Why: retain native speech when Whisper is slow without late duplicate registrations.
- Public storefront is only `/`; every other route is the private Vault wrapped in AppShell + AdminGate in `__root.tsx`, and the installed app starts at `/bodega` (admin pages live under `/bodega/*`; old paths redirect). Why: clients and the owner must never share screens.
- Sale prices come from `precioVenta()` in `src/lib/store.ts` (product price or general price ± fixed amounts by estado stock/remate/encargo, stored in `State.precios`). Why: one rule shared by Boutique, Bodega and encargos.
