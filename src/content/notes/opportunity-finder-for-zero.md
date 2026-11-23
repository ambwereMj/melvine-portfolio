---
title: How Opportunity Finder runs daily for $0
summary: A personal agent that checks scholarships, internships and paid work on their official pages every morning, on free tiers only.
date: 2026-11-23
draft: false
---

Opportunity Finder is a personal agent I built. Every day it finds scholarships, internships, remote paid work, paid programmes and hackathons, checks each one on its official page, and sends me a ranked digest on Telegram. It costs nothing to run. These notes are about how it stays at $0 without cutting corners on trust.

## The free-tier stack

The whole system runs on four free tiers: GitHub Actions for the scheduled jobs (the repository is public, which keeps Actions free), Supabase for the database, Vercel's Hobby plan for the Telegram bot and a small tracker page, and Telegram itself for delivery. There is no server to pay for and nothing running when no job is due.

The daily finder starts at 06:00 EAT. It reads a list of sources, respects each site's robots.txt, waits five seconds between requests to the same site and retries politely. The digest goes out at 07:00 EAT, and a lighter job runs every three hours for instant alerts, deadline reminders and warnings when a source breaks.

## No AI model, by default

The cheapest model is no model. Facts are pulled by a free, rule-based reader that only accepts what it can quote from a sentence on the official page. If a deadline or an eligibility rule isn't on the page, it is recorded as unknown rather than guessed. The AI step exists but is switched off with a monthly cap of zero dollars; if it is ever turned on, spending stops at the cap.

## Trust over volume

Most of the work is in what gets thrown away. Listings found on aggregator sites are followed back to the official page before anything is trusted. Eligibility rules drop what I can't apply for, and scam rules reject listings asking for fees, PINs or upfront payments (on official programme pages, fees are flagged instead), while flagging guaranteed acceptance, unrealistic pay, chat-only recruiters and free-mail contacts with the reason. Partial funding is never shown as full funding.

Sites that forbid bots are never worked around. Where a site blocks automated readers but publishes a feed, items are built from the feed text and always marked for a manual check.

## A person stays in charge

Each item in the digest has Apply, Save, Skip and Not interested buttons, and the ranking learns from those taps. Tapping Apply prepares an application pack: a checklist from the official page, a tailored CV, a letter outline I write in my own words, and referee email drafts I send myself. A form helper can read a real application form and prepare answers to copy, but it stops at logins, CAPTCHAs, declarations, payments and the final submit. Nothing is ever submitted on my behalf.

## What I'd tell someone building one

Free tiers go a long way if the work is scheduled rather than always on. Rules you can read beat a model you can't check when the cost of a wrong fact is a missed deadline or a scam. And the safest automation is the one that prepares everything and leaves the last click to a person.
