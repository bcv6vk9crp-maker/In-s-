import { describe, expect, it } from "vitest";
import { csvCell, retentionCutoff, slugify } from "@/lib/orders";

describe("slugify", () => {
  it("retire accents et ponctuation", () => {
    expect(slugify("Léa, Marseille — été 2025")).toBe("lea-marseille-ete-2025");
    expect(slugify("!!!")).toBe("photo");
  });
});

describe("csvCell", () => {
  it("protège les séparateurs, guillemets et retours à la ligne", () => {
    expect(csvCell("simple")).toBe("simple");
    expect(csvCell('dit "bonjour"; merci')).toBe('"dit ""bonjour""; merci"');
    expect(csvCell("ligne 1\nligne 2")).toBe('"ligne 1\nligne 2"');
    expect(csvCell(null)).toBe("");
  });
});

describe("retentionCutoff", () => {
  it("renvoie la date d'il y a un an", () => {
    expect(retentionCutoff(new Date("2026-09-25T00:00:00Z")).toISOString()).toBe("2025-09-25T00:00:00.000Z");
  });
});

describe("csvCell et formules Excel", () => {
  it("neutralise un texte qui commencerait une formule", () => {
    expect(csvCell("=HYPERLINK(\"http://x\")")).toBe("\"'=HYPERLINK(\"\"http://x\"\")\"");
    expect(csvCell("+33 6 12 34 56 78")).toBe("'+33 6 12 34 56 78");
    expect(csvCell("@cmd")).toBe("'@cmd");
  });

  it("laisse les nombres intacts", () => {
    expect(csvCell(-5)).toBe("-5");
  });
});
