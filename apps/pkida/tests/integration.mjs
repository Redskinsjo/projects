import assert from "node:assert/strict";
import { test } from "node:test";
import { createHmac, randomUUID } from "node:crypto";
const base = process.env.PKIDA_TEST_URL || "http://localhost:3001";
const origin = new URL(base).origin;
async function demo() {
  if (process.env.PKIDA_TEST_SESSION_SECRET) {
    const payload = Buffer.from(
      JSON.stringify({
        id: `test:${randomUUID()}`,
        name: "Test",
        email: "",
        exp: Date.now() + 600000,
      }),
    ).toString("base64url");
    return `pkida_session=${payload}.${createHmac("sha256", process.env.PKIDA_TEST_SESSION_SECRET).update(payload).digest("base64url")}`;
  }
  const response = await fetch(`${base}/api/auth/demo`, {
    method: "POST",
    headers: { origin },
    redirect: "manual",
  });
  assert.equal(
    response.status,
    303,
    "Run this test against the development server",
  );
  return response.headers.get("set-cookie").split(";")[0];
}
function request(path, cookie, method = "GET", data) {
  return fetch(`${base}${path}`, {
    method,
    redirect: "manual",
    headers: {
      cookie,
      origin,
      ...(data ? { "Content-Type": "application/json" } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
}
test("Protected routes reject unauthenticated and forged sessions", async () => {
  assert.equal((await request("/api/cv", "")).status, 401);
  assert.equal(
    (await request("/api/profile", "pkida_session=forged", "PUT", {})).status,
    401,
  );
  assert.equal((await request("/espace", "")).status, 307);
  const callback = await request(
    "/api/auth/google/callback?code=fake&state=fake",
    "",
  );
  assert.equal(callback.status, 302);
  assert.match(callback.headers.get("location"), /error=connexion/);
});
test("Profile, campaign and PDF persist and remain isolated between accounts", async () => {
  const cookie = await demo();
  const other = await demo();
  const profile = {
    name: "Test PKida",
    email: "test@example.com",
    phone: "",
    role: "Designer produit",
    location: "Lyon",
    salary: 50000,
    experience: 4,
    about: "Profil de test automatisé",
  };
  const forbidden = await fetch(`${base}/api/profile`, {
    method: "PUT",
    headers: {
      cookie,
      origin: "https://other.example",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });
  assert.equal(forbidden.status, 403);
  assert.equal(
    (await request("/api/profile", cookie, "PUT", { ...profile, salary: -1 }))
      .status,
    400,
  );
  assert.equal(
    (await request("/api/profile", cookie, "PUT", profile)).status,
    200,
  );
  const page = await request("/espace", cookie);
  assert.match(await page.text(), /Designer produit/);
  const campaign = {
    title: `Recherche test ${Date.now()}`,
    role: profile.role,
    location: profile.location,
    salary: profile.salary,
    experience: 4,
    contract: "CDI",
    remote: "Hybride",
    pace: 5,
    keywords: "SaaS",
    exclusions: "",
    review: true,
  };
  assert.equal(
    (await request("/api/campaigns", cookie, "POST", { ...campaign, pace: 50 }))
      .status,
    400,
  );
  const created = await request("/api/campaigns", cookie, "POST", campaign);
  assert.equal(created.status, 201);
  assert.equal((await created.json()).status, "Préparée");
  assert.ok(
    (await (await request("/espace", cookie)).text()).includes(campaign.title),
  );
  assert.ok(
    !(await (await request("/espace", other)).text()).includes(campaign.title),
  );
  const invalid = new FormData();
  invalid.set(
    "file",
    new File(["not a pdf"], "fake.pdf", { type: "application/pdf" }),
  );
  assert.equal(
    (
      await fetch(`${base}/api/cv`, {
        method: "POST",
        headers: { cookie, origin },
        body: invalid,
      })
    ).status,
    400,
  );
  const pdf = "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF";
  const upload = new FormData();
  upload.set(
    "file",
    new File([pdf], "cv-test.pdf", { type: "application/pdf" }),
  );
  assert.equal(
    (
      await fetch(`${base}/api/cv`, {
        method: "POST",
        headers: { cookie, origin },
        body: upload,
      })
    ).status,
    200,
  );
  const downloaded = await request("/api/cv", cookie);
  assert.equal(downloaded.headers.get("content-type"), "application/pdf");
  assert.equal(await downloaded.text(), pdf);
  assert.equal((await request("/api/cv", other)).status, 404);
  assert.equal((await request("/api/cv", cookie, "DELETE")).status, 200);
  assert.equal((await request("/api/cv", cookie)).status, 404);
  const logout = await request("/api/auth/logout", cookie, "POST");
  assert.equal(logout.status, 303);
  assert.match(logout.headers.get("set-cookie"), /pkida_session=;/);
});

test("Research routes show saved criteria and isolate accounts", async () => {
  const cookie = await demo();
  const other = await demo();
  const campaign = {
    title: `Recherche privée ${Date.now()}`,
    role: "Designer",
    location: "Paris",
    salary: 45000,
    experience: 3,
    contract: "CDI",
    remote: "Hybride",
    pace: 5,
    keywords: "SaaS",
    exclusions: "",
    review: true,
  };
  const created = await request("/api/campaigns", cookie, "POST", campaign);
  assert.equal(created.status, 201);
  const saved = await created.json();
  assert.equal(saved.status, "Préparée");
  const detailPath = `/espace/recherches/${saved.id}`;
  const detail = await request(detailPath, cookie);
  assert.equal(detail.status, 200);
  const detailHtml = await detail.text();
  assert.ok(detailHtml.includes(campaign.title));
  assert.ok(detailHtml.includes("Offres correspondantes"));
  assert.ok(detailHtml.includes("SaaS"));
  const otherDetail = await request(detailPath, other);
  const otherHtml = await otherDetail.text();
  assert.ok(!otherHtml.includes(campaign.title));
  assert.ok(otherHtml.includes("Cette page n’existe pas"));
  assert.equal((await request(detailPath, "")).status, 307);
  assert.equal(
    (await request("/espace/recherches/nouvelle", cookie)).status,
    200,
  );
});

test("Applications persist, update status and enforce ownership", async () => {
  const cookie = await demo();
  const other = await demo();
  const researchResponse = await request("/api/campaigns", cookie, "POST", {
    title: "Test candidatures PostgreSQL",
    role: "Designer",
    location: "Paris",
    salary: 45000,
    experience: 4,
    contract: "CDI",
    remote: "Hybride",
    pace: 5,
    keywords: "",
    exclusions: "",
    review: true,
  });
  assert.equal(researchResponse.status, 201);
  const research = await researchResponse.json();
  const input = {
    company: "Entreprise de test",
    role: "Designer",
    location: "Paris",
    researchId: research.id,
    status: "En cours",
    notes: "Premier contact",
  };
  assert.equal(
    (await request("/api/applications", "", "POST", input)).status,
    401,
  );
  assert.equal(
    (await request("/api/applications", other, "POST", input)).status,
    404,
  );
  const created = await request("/api/applications", cookie, "POST", input);
  assert.equal(created.status, 201);
  const application = await created.json();
  const listed = await (await request("/api/applications", cookie)).json();
  assert.equal(
    listed.find((a) => a.id === application.id).researchId,
    research.id,
  );
  assert.equal(
    (await (await request("/api/applications", other)).json()).length,
    0,
  );
  const route = `/api/applications/${application.id}`;
  assert.equal(
    (await request(route, other, "PATCH", { status: "Envoyée" })).status,
    404,
  );
  assert.equal(
    (await request(route, cookie, "PATCH", { status: "invalide" })).status,
    400,
  );
  assert.equal(
    (
      await request(route, cookie, "PATCH", {
        status: "Entretien",
        notes: "Entretien lundi",
      })
    ).status,
    200,
  );
  const stored = (await (await request("/api/applications", cookie)).json())[0];
  assert.equal(stored.status, "Entretien");
  assert.equal(stored.notes, "Entretien lundi");
  assert.ok(
    (await (await request("/espace", cookie)).text()).includes(
      "Entreprise de test",
    ),
  );
  // Independent profile writes must not replace related researches or applications.
  await request("/api/profile", cookie, "PUT", {
    name: "Profil modifié",
    email: "",
    phone: "",
    role: "Designer",
    location: "Paris",
    salary: 55000,
    experience: 5,
    about: "",
  });
  assert.equal(
    (await (await request("/api/applications", cookie)).json()).length,
    1,
  );
  assert.equal(
    (await request(`/espace/recherches/${research.id}`, cookie)).status,
    200,
  );
});
