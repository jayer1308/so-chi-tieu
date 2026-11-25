import { describe, expect, it } from "vitest";
import { usage } from "./cli.js";

describe("usage", () => {
  it("liệt kê đủ 5 lệnh của v1", () => {
    const text = usage();
    for (const cmd of ["them", "liet-ke", "tong-ket", "xoa", "xuat"]) {
      expect(text).toContain(cmd);
    }
  });
});
