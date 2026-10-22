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
- AI (transcription + classification) runs only in server functions in `src/lib/ai.functions.ts` through Lovable AI Gateway. Why: API key must stay server-side.
