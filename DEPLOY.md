# Deploying ayodhya.work

This site is a static site — `index.html`, `case-study.html`, and the `assets/`
folder. There are two free paths to **ayodhya.work**.

The fast path: **GitHub Pages** (10 min, free forever, custom domain + SSL included).
The bonus path: **Framer** (visual editor, free while you're a student, ~2 hr rebuild).

Do the fast path first, then layer the bonus path on top if you want it.

---

## Path A — GitHub Pages (free forever)

You need: a GitHub account (you have one — `gh` is authenticated on this machine),
admin access to `ayodhya.work` on Hover, and a browser.

### 1. Push the site to a GitHub repo

From the repo root:

```bash
git init
git add .
git commit -m "Initial portfolio"
gh repo create ayodhya.work --public --source=. --remote=origin --push
```

(If you'd rather use an org / different name, substitute it — but the repo name
`ayodhya.work` makes the URL obvious if you ever remove the custom domain.)

The first push puts `CNAME`, `.nojekyll`, `index.html`, `case-study.html`,
`404.html`, `robots.txt`, `sitemap.xml`, and `assets/` on `main`.

### 2. Turn on GitHub Pages

In the browser:

1. Open the repo → **Settings → Pages**.
2. **Source:** "Deploy from a branch".
3. **Branch:** `main` · **Folder:** `/ (root)` · Save.
4. Under **Custom domain**, type `ayodhya.work` and Save.
5. Wait for the DNS check. It will show a yellow warning until the records
   below exist. Green = good.
6. Once green, tick **Enforce HTTPS**. (May take up to 24 h to be available —
   usually a few minutes.)

### 3. Point the domain at GitHub (Hover)

Open Hover → Domains → `ayodhya.work` → **DNS** (Hover uses its own DNS by default
— that's fine, no need to move nameservers).

Delete the existing `A` records on `@` (currently pointing to Hover's parking
IPs `31.43.160.6` and `31.43.161.6`).

Add these **A records** for the apex (`@` / `ayodhya.work`):

| Type | Host | Value | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

(Optionally also add the four AAAA records for IPv6 — same pattern, addresses
`2606:50c0:8000::153` through `2606:50c0:8003::153`.)

Add a **CNAME** for the `www` subdomain so it redirects to the apex:

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | www | `ayodhyamohanthy.github.io` | 3600 |

(Replace `ayodhyamohanthy` with your actual GitHub username if different.)

### 4. Verify

```bash
dig ayodhya.work +short A       # → the four GitHub IPs
dig www.ayodhya.work +short     # → ayodhyamohanthy.github.io
```

DNS can take 5–30 minutes to propagate. Once the GitHub Pages settings panel
shows the domain as green and "HTTPS" is enforceable, you're live.

### 5. Push updates

```bash
git add .
git commit -m "Update copy"
git push
```

GitHub rebuilds and publishes automatically within ~30 seconds.

### Cost
$0. No GitHub Pro needed — Pages is free for public repos on the free plan.
SSL is free. No bandwidth cap worth worrying about for a portfolio.

---

## Path B — Framer (free while a student)

Framer's free student plan = the **Basic** plan ($120/yr value), including a
custom domain and CMS. The catch: **you rebuild the site inside Framer's
canvas** using the spec in `FRAMER-BUILD-GUIDE-WARM.md` (the guide file is not checked into this repo). ~90–120 min.

### 1. Apply

Go to **https://www.framer.com/education/students/** and apply with:
- name
- school
- **school email** (your `.edu` / institutional address — this is what unlocks
  the discount; GitHub Student Pack alone isn't enough, but they're separate
  things)
- expected graduation date
- a photo of your student ID (clear name + school logo)

Review takes up to 5 working days. You'll get a coupon code for the Basic plan.

### 2. Redeem the coupon

Sign up at framer.com as a **new** customer (coupon redemption is currently new-
customer only — see the FAQ on the education page), then enter the coupon at
checkout. Don't pay anything; the coupon zeroes it out.

### 3. Rebuild

Use `FRAMER-BUILD-GUIDE-WARM.md` as the spec (it is not checked into this repo). Component-by-component. The guide
includes:

- exact colors, text styles, shadows
- all 8 reusable components
- section-by-section values
- CMS schema (Projects, Roles — note the basic plan allows 2 collections)
- motion + reduced-motion behavior
- publish checklist

### 4. Connect the domain

In Framer: **Site Settings → Domains → Connect Domain → `ayodhya.work`**.

Framer shows the exact DNS records to add at Hover. They're a CNAME and an A
record pointing at Framer's edge — **different from the GitHub Pages records
above**. If you switch from Path A to Path B, replace the DNS records.

### 5. (Optional) Use the GitHub Student Pack too

GitHub Student Developer Pack isn't required for this site (the domain is yours,
the hosting is free), but it's worth claiming for the other things in it:
Namecheap free domain credits, DigitalOcean / Azure credits for side projects,
etc. Apply at **education.github.com/pack** with your student email + a photo
of your ID.

### Cost
$0 while a student. Re-apply every 11 months. After graduation, Framer reverts
to a free plan (framer.app subdomain, no custom domain) — point DNS elsewhere
or pay the Basic plan.

---

## Which to pick

| | GitHub Pages | Framer (student) |
|---|---|---|
| Setup time | ~10 min | ~2 hr rebuild |
| Edits | edit HTML/CSS/JS in a code editor | drag, drop, animate visually |
| CMS | hand-edit HTML | built-in (2 collections on Basic) |
| Custom domain | free | free |
| SSL | free | free |
| Ongoing cost after student | $0 | $0 while student → $120/yr after |
| Longevity | 10+ years (static files) | tied to platform |

**Recommendation: do Path A first.** It's a real, live site at your domain in
under 30 minutes, and it stays free forever. If you want a visual editor later,
layer Path B on top by rebuilding inside Framer.
