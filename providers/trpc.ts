// Re-export the single shared tRPC React client instance.
// NOTE: `createTRPCReact()` creates its own React Context each time it is
// called, so this app must only ever create ONE instance and share it
// everywhere (provider + pages) — otherwise useQuery/useMutation break with
// a missing-context error. `lib/trpc.ts` is the canonical instance.
export { trpc } from "@/lib/trpc";
