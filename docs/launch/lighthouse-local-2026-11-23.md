# Lighthouse — local build, 2026-11-23

Mobile form factor, simulated throttling, `astro preview` on 127.0.0.1, Playwright Chromium 1255 headless.

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 96 | 100 | 0.9 s | 0 | 20 ms |
| `/work/opportunity-finder/` | 100 | 100 | 96 | 100 | 0.8 s | 0 | 0 ms |
| `/lab/building-this-portfolio/` | 100 | 100 | 96 | 100 | 0.8 s | 0 | 10 ms |

Targets (Performance ≥ 90, Accessibility 100, Best Practices ≥ 95, SEO 100, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms): all met.
To be re-run against the live Vercel URL after deploy.

Best Practices 96 was a 404 for /favicon.ico; fixed by adding /favicon.svg (test added). Re-measured live after deploy.
