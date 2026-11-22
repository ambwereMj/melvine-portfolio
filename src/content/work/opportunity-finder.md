---
title: A daily agent that finds verified opportunities and sends them to Telegram
project: Opportunity Finder
summary: Finds scholarships, internships, paid work and hackathons, checks each on its official page, filters scams, ranks them and sends a daily Telegram digest.
status: Live
order: 2
role: Solo builder
stack: [GitHub Actions, Supabase, Vercel, Telegram]
links:
  - label: Source code (GitHub)
    href: https://github.com/ambwereMj/orppotunities
result: All four phases live, running daily at $0/month on free tiers.
diagram: opportunity-finder
draft: false
---

## Context and problem

Scholarships, internships, remote paid work and hackathons are scattered across hundreds of sites. Many listings are copies of copies, some are out of date, and some are scams. Checking them by hand every day takes hours, and a missed deadline is a missed chance.

## Approach

Every morning at 06:00 EAT a scheduled job collects listings from a list of sources, removes duplicates and follows each one back to its **official page**. A rule-based reader pulls facts only from sentences on that page. If a fact isn't there, it is recorded as unknown, never guessed.

Each item then passes eligibility rules and scam rules and gets a score from 0 to 100. At 07:00 EAT a Telegram digest arrives with Apply, Save, Skip and Not interested buttons, and the ranking learns from those taps. Instant alerts, deadline reminders, alerts when a source breaks, and a kill switch run alongside it.

Tapping Apply starts an application assistant: a checklist from the official page, a CV tailored to it, a letter outline to write in my own words, and referee email drafts. A form helper reads the real application form and prepares answers to copy, stopping at logins, CAPTCHAs, declarations, payments and the final submit. It never submits anything itself. Documents go into an encrypted vault.

Everything runs on free tiers: GitHub Actions, Supabase, Vercel and Telegram. No AI model is used unless a budget is approved.

## What's next

All four phases are live and it runs every day. Sites that block automated readers but publish feeds are never worked around: their items are built from the feed text and always marked for a manual check.
