---
title: A room site that turns browsers into WhatsApp chats, with an AI agent on the way
project: Luxe Condos
summary: Room catalogue for my short-stay rentals in Juja. Guests browse rooms and tap to WhatsApp. An AI agent that answers guests goes live in January 2027.
status: In development · agent live January 2027
order: 1
role: Solo builder
stack: [Next.js, Supabase, Vercel]
links: []
result: null
diagram: luxe-condos
planned:
  - Availability
  - Prices
  - Location and directions
  - Check-in details
  - Amenities
  - Handing bookings over to me
draft: false
---

## Context and problem

I run short-stay rentals in Juja. Guests reach us through links I share on social media and WhatsApp Status, then ask their questions in a WhatsApp chat. Every one of those chats is answered by me, by hand.

## Approach

I started with what guests see first: a fast room catalogue. Each room has photos, prices and an availability flag, and every room page leads to one action, a tap that opens WhatsApp.

A hidden admin area lets me add rooms, change prices, reorder photos and mark rooms booked or free. Changes appear on the public site within a few seconds.

A small stats page shows visitors, room views and WhatsApp taps for each room, and where visitors came from. That tells me which rooms and which posts actually start conversations, instead of guessing.

The next piece is the agent: a WhatsApp AI agent that answers the common questions from the same room data, and hands the chat to me for bookings and anything it isn't sure about.

## What's next

The agent goes live in January 2027. Once it has handled real guests, this page will show real numbers: how many questions it answered on its own and how many chats became bookings. Until then, the list below is what it is being built to handle, not a record of what it has done.
