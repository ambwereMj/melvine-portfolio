import { it, expect } from "vitest";
// @ts-expect-error plain JS module
import { findDrafts, servicesHaveDrafts, isProductionBuild } from "../../scripts/check-drafts.mjs";

const md = (fm: string, body = "") => ({ path: "a.md", text: `---\n${fm}\n---\n${body}` });

it("flags markdown with draft: true in frontmatter", () => expect(findDrafts([md("title: x\ndraft: true")])).toEqual(["a.md"]));
it("ignores draft: false", () => expect(findDrafts([md("draft: false")])).toEqual([]));
it("ignores draft: true in the body", () => expect(findDrafts([md("draft: false", "We once had draft: true here.")])).toEqual([]));
it("handles CRLF line endings", () => expect(findDrafts([{ path: "a.md", text: "---\r\ndraft: true\r\n---\r\n" }])).toEqual(["a.md"]));
it("handles a UTF-8 BOM", () => expect(findDrafts([{ path: "a.md", text: "﻿---\ndraft: true\n---\n" }])).toEqual(["a.md"]));
it("handles YAML spellings of true", () => {
  expect(findDrafts([md("draft: True")])).toEqual(["a.md"]);
  expect(findDrafts([md("draft : true")])).toEqual(["a.md"]);
});
it("treats a file without frontmatter as not a draft", () => expect(findDrafts([{ path: "a.md", text: "# hi" }])).toEqual([]));

it("services check reads the data, not comments", () => {
  expect(servicesHaveDrafts([{ draft: false }, { draft: false }])).toBe(false);
  expect(servicesHaveDrafts([{ draft: false }, { draft: true }])).toBe(true);
});

it("detects production builds on Vercel and Netlify", () => {
  expect(isProductionBuild({ VERCEL_ENV: "production" })).toBe(true);
  expect(isProductionBuild({ CONTEXT: "production" })).toBe(true);
  expect(isProductionBuild({ VERCEL_ENV: "preview" })).toBe(false);
  expect(isProductionBuild({})).toBe(false);
});

// @ts-expect-error plain JS module
import { profileHasDraft, processHasDraft } from "../../scripts/check-drafts.mjs";
it("profile and process drafts are detected from data", () => {
  expect(profileHasDraft({ aboutDraft: true })).toBe(true);
  expect(profileHasDraft({ aboutDraft: false })).toBe(false);
  expect(processHasDraft({ draft: true })).toBe(true);
  expect(processHasDraft({ draft: false })).toBe(false);
});
