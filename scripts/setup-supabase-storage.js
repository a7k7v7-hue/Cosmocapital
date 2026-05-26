#!/usr/bin/env node
// Run once after creating Supabase project:
// SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/setup-supabase-storage.js

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup-supabase-storage.js");
  process.exit(1);
}

async function run() {
  const base = `${url}/storage/v1`;
  const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(`${base}/bucket`, {
    method: "POST",
    headers,
    body: JSON.stringify({ id: "objects", name: "objects", public: true, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"], fileSizeLimit: 10485760 }),
  });

  const data = await res.json();
  if (res.ok) {
    console.log("✓ Bucket 'objects' created:", data);
  } else if (data.error === "Duplicate") {
    console.log("✓ Bucket 'objects' already exists");
  } else {
    console.error("✗ Error:", data);
    process.exit(1);
  }
}

run();
