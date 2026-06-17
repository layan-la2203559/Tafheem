/**
 * PLACEHOLDER — replaced by Supabase-generated types.
 *
 * After the project-scoped Supabase MCP is authenticated, regenerate with:
 *   MCP generate_typescript_types  (or `supabase gen types typescript`)
 * and overwrite this file. Until then this permissive type keeps the project
 * compiling. Domain-level row shapes live in `lib/types.ts`.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Permissive placeholder so `SupabaseClient<Database>` compiles. The generated
// file will replace this with the real, table-accurate definition.
export type Database = any;
