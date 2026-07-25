// Local copy of @workspace/api-client-react — inlined for Vercel/standalone builds.
// This replaces the workspace package so the frontend builds without monorepo resolution.

export * from "./generated/api";
export * from "./generated/api.schemas";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";
