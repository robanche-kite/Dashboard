import { describe, it, expect, beforeEach } from "vitest";
import { projectInputSchema } from "@/lib/validators/project";

describe("projectInputSchema", () => {
  it("requires a name", () => {
    const result = projectInputSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("accepts a minimal project", () => {
    const result = projectInputSchema.safeParse({ name: "My Project" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Project");
      expect(result.data.status).toBe("active");
    }
  });

  it("rejects bad ISO dates", () => {
    const result = projectInputSchema.safeParse({ name: "X", startDate: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("treats empty-string optional fields as undefined", () => {
    const result = projectInputSchema.safeParse({ name: "X", description: "", color: "" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
      expect(result.data.color).toBeUndefined();
    }
  });

  // ensure beforeEach is referenced so future cases can be added easily
  beforeEach(() => {});
});
