#!/usr/bin/env node
const key = process.env.RENDER_API_KEY;
if (!key) { console.error("Set RENDER_API_KEY env var first"); process.exit(1); }

const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
let pwd = process.env.NEW_PWD || "";
if (!pwd) { for (let i=0;i<16;i++) pwd+=chars[Math.floor(Math.random()*chars.length)]; }

const h = { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" };

(async()=>{
  const r = await fetch("https://api.render.com/v1/services?name=cosmacapital&type=web_service&limit=5",{headers:h});
  const d = await r.json();
  const svc = Array.isArray(d) ? d.find(x=>x.service?.name==="cosmacapital")?.service : null;
  if (!svc) { console.error("Service not found:", JSON.stringify(d)); process.exit(1); }
  console.log("Service:", svc.name, svc.id);

  const u = await fetch(`https://api.render.com/v1/services/${svc.id}/env-vars`,{
    method:"PUT", headers:h,
    body: JSON.stringify([{key:"ADMIN_PASSWORD",value:pwd}])
  });
  if (!u.ok) { console.error("Error:", await u.text()); process.exit(1); }
  console.log("Done. New pwd:", pwd);
  console.log("Render redeploys in ~1 min.");
})();
