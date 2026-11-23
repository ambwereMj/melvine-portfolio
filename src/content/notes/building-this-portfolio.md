---
title: Building this portfolio in stages with Claude Code
summary: How this site was built one stage at a time, with a written design, a plan, tests first and an independent review before every commit.
date: 2026-11-23
draft: false
---

This site was built with Claude Code as a pair, in stages, with one rule above the rest: never state anything on the page that isn't true. These notes are about the process, because the process is most of what a client buys.

## One stage at a time

The work was split into stages: foundation, hero, case studies and services, the Signal Path animation and command palette, and these sections. Each stage ended with screenshots at phone and desktop widths, my approval, and exactly one commit. Nothing moved on until the previous stage was signed off, so a wrong turn never had time to grow.

## Design before code

Every stage started with a short conversation and a written design: what it's for, what it must not do, the approaches considered and which one was picked. Then a second, fresh reviewer read the design as if they had to build from it and came back with the questions they couldn't answer. Most were settled in the design itself; the rest were mine to decide. Only then came a plan: files, function names and the exact tests that prove each step.

## Tests first, then code

New behaviour started with a test that failed for the right reason, and code was written until it passed. The tests check things a visitor would notice: that tap targets are at least 44 pixels, that colours meet contrast rules in both themes, that the layout doesn't shift while loading, that the page works without JavaScript, and that keyboard users can reach everything. Accessibility checks run with the command palette open, not just on the plain page.

## An independent review before every commit

When a stage was finished, a fresh reviewer read the whole change with no memory of writing it. Its findings were graded by what a real visitor would experience, and anything important was fixed the same way as everything else: a failing test first, then the fix. Smaller points were written down and left for later rather than slipped in.

## Honesty, enforced by the build

Every fact on this site comes from somewhere I can point to: my own words, a project's README, or the code itself. Copy that was drafted for me is marked as a draft, and a check in the build refuses to publish the site while any draft remains. The rental agent's case study says plainly that the agent goes live in January, and lists what it is being built to handle rather than numbers it hasn't earned yet.

## Small on purpose

The scroll animation and command palette are plain JavaScript using the browser's built-in dialog, with no frameworks. A test fails the build if the site's JavaScript grows past 8 KB compressed, because many visitors here are on mid-range phones and slow connections.

## What carries over to client work

The same habits apply to anything I build for a client: agree what it's for before building, show working progress often, prove it works with tests, and never claim a result that isn't real.
