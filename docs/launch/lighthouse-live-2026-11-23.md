# Lighthouse and axe — live site, 2026-11-23

https://melvine-jerry.vercel.app — mobile form factor, simulated throttling, Chromium 1255 headless.

| Page | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 1.3 s | 0 | 10 ms |
| `/work/opportunity-finder/` | 100 | 100 | 100 | 100 | 0.9 s | 0 | 10 ms |
| `/lab/building-this-portfolio/` | 100 | 100 | 100 | 100 | 0.8 s | 0 | 0 ms |

axe: 0 violations on all 6 pages plus the 404 page, in dark and light themes.

Live checks: every sitemap URL returns 200; canonical, Open Graph URLs and robots.txt point at melvine-jerry.vercel.app;
slashless URLs 308-redirect to the trailing-slash form; unknown pages return 404 with the site's "Page not found" page;
only per-deployment URLs are behind Vercel's login (production address is public).
