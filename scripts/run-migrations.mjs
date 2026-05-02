import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runMigrations() {
  try {
    console.log("📦 Reading migration file...");
    const migrationPath = join(process.cwd(), "supabase/migrations/20260502070000_content_tables.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("🚀 Running migrations...");
    const { error } = await supabase.rpc("query", { query: migrationSQL });

    if (error) {
      console.error("❌ Migration failed:", error);
      console.log("\n⚠️  Note: anon key cannot execute DDL (CREATE TABLE). Use manual dashboard method:");
      console.log("   1. Go to https://supabase.co/dashboard");
      console.log("   2. Select project ucghqoburfkakzfubets");
      console.log("   3. Click SQL Editor → New Query");
      console.log("   4. Copy and paste contents of supabase/migrations/20260502070000_content_tables.sql");
      console.log("   5. Click Run");
      process.exit(1);
    }

    console.log("✅ Migrations completed successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.log("\n⚠️  Note: Use the manual dashboard method:");
    console.log("   1. Go to https://supabase.co/dashboard");
    console.log("   2. Select project ucghqoburfkakzfubets");
    console.log("   3. Click SQL Editor → New Query");
    console.log("   4. Copy and paste contents of supabase/migrations/20260502070000_content_tables.sql");
    console.log("   5. Click Run");
    process.exit(1);
  }
}

runMigrations();
