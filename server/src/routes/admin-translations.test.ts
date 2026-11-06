import { describe, it, expect, vi, beforeEach } from "vitest";

// The AI and the database are replaced with fakes: these tests check what we
// keep from an AI reply, not the AI itself.
const reply = vi.fn<() => Promise<string>>();
vi.mock("../lib/ai.js", () => ({ aiEnabled: () => true, chatGenerate: () => reply() }));
vi.mock("../db.js", () => ({ query: async () => ({ rows: [{ term: "PIN", bem: "PIN", nya: "PIN", note: "" }] }) }));

const { _forTests } = await import("./admin-translations.js");
const { aiTranslate } = _forTests;

describe("AI translation checks", () => {
  beforeEach(() => reply.mockReset());

  it("keeps good text and list translations", async () => {
    reply.mockResolvedValue(JSON.stringify({ a: "Mwapoleni", b: ["umo", "babili"] }));
    const out = await aiTranslate("bem", [
      { key: "a", value: "Hello", type: "text" },
      { key: "b", value: ["one", "two"], type: "list" },
    ]);
    expect(out.get("a")).toBe("Mwapoleni");
    expect(out.get("b")).toEqual(["umo", "babili"]);
  });

  it("drops a list whose length changed", async () => {
    reply.mockResolvedValue(JSON.stringify({ b: ["only one"] }));
    const out = await aiTranslate("bem", [{ key: "b", value: ["one", "two"], type: "list" }]);
    expect(out.has("b")).toBe(false);
  });

  it("drops a translation that changed or lost a link", async () => {
    reply.mockResolvedValue(JSON.stringify({ a: "Belengeni [apa](https://evil.example)" }));
    const out = await aiTranslate("nya", [{ key: "a", value: "Read [here](https://civicwise.online/about)", type: "longtext" }]);
    expect(out.has("a")).toBe(false);
  });

  it("keeps a translation that kept the link", async () => {
    reply.mockResolvedValue(JSON.stringify({ a: "Werengani [apa](https://civicwise.online/about)" }));
    const out = await aiTranslate("nya", [{ key: "a", value: "Read [here](https://civicwise.online/about)", type: "longtext" }]);
    expect(out.get("a")).toBe("Werengani [apa](https://civicwise.online/about)");
  });

  it("survives a reply that is not JSON, and code fences", async () => {
    reply.mockResolvedValueOnce("sorry, I cannot");
    expect((await aiTranslate("bem", [{ key: "a", value: "Hi", type: "text" }])).size).toBe(0);
    reply.mockResolvedValueOnce("```json\n{\"a\":\"Moni\"}\n```");
    expect((await aiTranslate("nya", [{ key: "a", value: "Hi", type: "text" }])).get("a")).toBe("Moni");
  });

  it("ignores empty answers and keys it was not asked for", async () => {
    reply.mockResolvedValue(JSON.stringify({ a: "  ", extra: "x" }));
    const out = await aiTranslate("bem", [{ key: "a", value: "Hi", type: "text" }]);
    expect(out.size).toBe(0);
  });
});
