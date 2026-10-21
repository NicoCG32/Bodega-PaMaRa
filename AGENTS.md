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
- Business data (deudas, encargos, productos, teléfonos) lives in device localStorage via `src/lib/store.ts`; single-owner app with no login. Why: one user on one phone, keeps it simple.
- AI (transcription + classification) runs only in server functions in `src/lib/ai.functions.ts` through Lovable AI Gateway. Why: API key must stay server-side.
