import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { main } from "./cli.js";

// Acceptance tests cho GOAL-003 (AC-1..AC-3): tong-ket --nam YYYY.
// Chỉ gọi public entry main(argv); dữ liệu cách ly trong thư mục tạm qua --data.

function run(argv: string[]): { code: number; out: string; err: string } {
  let out = "";
  let err = "";
  const outSpy = vi
    .spyOn(process.stdout, "write")
    .mockImplementation(((chunk: unknown) => {
      out += String(chunk);
      return true;
    }) as never);
  const errSpy = vi
    .spyOn(process.stderr, "write")
    .mockImplementation(((chunk: unknown) => {
      err += String(chunk);
      return true;
    }) as never);
  let code: number;
  try {
    code = main(argv);
  } finally {
    outSpy.mockRestore();
    errSpy.mockRestore();
  }
  return { code, out, err };
}

function containsNumber(out: string, n: number): boolean {
  return out.includes(String(n));
}

const VIETNAMESE =
  /[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/;

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function currentMonth(): string {
  return todayLocal().slice(0, 7);
}

let tmp: string;
let dataFile: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), "sct-nam-"));
  dataFile = join(tmp, "data.json");
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

function seed(
  entries: Array<{ amount: number; cat: string; date: string }>,
): void {
  for (const e of entries) {
    const r = run([
      "them",
      "--so-tien",
      String(e.amount),
      "--danh-muc",
      e.cat,
      "--ngay",
      e.date,
      "--data",
      dataFile,
    ]);
    expect(r.code).toBe(0);
  }
}

/** Các dòng "Tháng MM: ..." trong kết quả tổng kết năm, theo thứ tự xuất hiện. */
function monthLines(out: string): string[] {
  return out.split("\n").filter((line) => /^Tháng \d{2}:/.test(line));
}

describe("GOAL-003 AC-1 tong-ket --nam: tổng kết cả năm theo từng tháng", () => {
  it("đủ 12 dòng tháng 1 tới tháng 12, tổng và số khoản đúng từng tháng", () => {
    seed([
      { amount: 10000, cat: "an-uong", date: "2026-01-05" },
      { amount: 20000, cat: "di-lai", date: "2026-01-20" },
      { amount: 50000, cat: "an-uong", date: "2026-03-10" },
    ]);
    const r = run(["tong-ket", "--nam", "2026", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("2026");
    const lines = monthLines(r.out);
    expect(lines).toHaveLength(12);
    expect(lines.map((l) => l.slice(6, 8))).toEqual([
      "01", "02", "03", "04", "05", "06",
      "07", "08", "09", "10", "11", "12",
    ]);
    // Tháng 1: tổng 30000, 2 khoản.
    expect(lines[0]).toContain("30000");
    expect(lines[0]).toMatch(/2 khoản/);
    // Tháng 3: tổng 50000, 1 khoản.
    expect(lines[2]).toContain("50000");
    expect(lines[2]).toMatch(/1 khoản/);
  });

  it("tháng không có khoản chi thì hiện tổng 0, số khoản 0", () => {
    seed([{ amount: 50000, cat: "an-uong", date: "2026-03-10" }]);
    const r = run(["tong-ket", "--nam", "2026", "--data", dataFile]);
    expect(r.code).toBe(0);
    const lines = monthLines(r.out);
    expect(lines).toHaveLength(12);
    for (const [i, line] of lines.entries()) {
      if (i === 2) continue;
      expect(line).toContain("0");
      expect(line).toMatch(/0 khoản/);
    }
  });

  it("không tính khoản chi của năm khác vào tổng", () => {
    seed([
      { amount: 10000, cat: "an-uong", date: "2026-01-05" },
      { amount: 999999, cat: "an-uong", date: "2025-01-05" },
      { amount: 888888, cat: "an-uong", date: "2027-06-05" },
    ]);
    const r = run(["tong-ket", "--nam", "2026", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 999999)).toBe(false);
    expect(containsNumber(r.out, 888888)).toBe(false);
    expect(monthLines(r.out)[0]).toContain("10000");
  });

  it("--nam thắng khi đi cùng --thang: tổng kết cả năm, bỏ qua --thang", () => {
    seed([
      { amount: 10000, cat: "an-uong", date: "2026-01-05" },
      { amount: 20000, cat: "an-uong", date: "2026-11-05" },
    ]);
    const r = run([
      "tong-ket",
      "--nam",
      "2026",
      "--thang",
      "2026-11",
      "--data",
      dataFile,
    ]);
    expect(r.code).toBe(0);
    expect(monthLines(r.out)).toHaveLength(12);
    expect(r.out).not.toContain("Tổng kết tháng");
    expect(monthLines(r.out)[0]).toContain("10000");
    expect(monthLines(r.out)[10]).toContain("20000");
  });
});

describe("GOAL-003 AC-2 tong-ket không có --nam: như cũ", () => {
  it("không cờ thì tổng kết tháng hiện tại", () => {
    const r = run([
      "them",
      "--so-tien",
      "50000",
      "--danh-muc",
      "an-uong",
      "--data",
      dataFile,
    ]);
    expect(r.code).toBe(0);
    const summary = run(["tong-ket", "--data", dataFile]);
    expect(summary.code).toBe(0);
    expect(summary.out).toContain("Tổng kết tháng");
    expect(summary.out).toContain(currentMonth());
    expect(summary.out).toContain("an-uong");
    expect(containsNumber(summary.out, 50000)).toBe(true);
  });

  it("--thang vẫn tổng kết đúng một tháng như cũ", () => {
    seed([
      { amount: 50000, cat: "an-uong", date: "2026-11-05" },
      { amount: 70000, cat: "an-uong", date: "2026-10-05" },
    ]);
    const r = run(["tong-ket", "--thang", "2026-11", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("Tổng kết tháng 2026-11");
    expect(containsNumber(r.out, 50000)).toBe(true);
    expect(containsNumber(r.out, 70000)).toBe(false);
    expect(monthLines(r.out)).toHaveLength(0);
  });
});

describe("GOAL-003 AC-3 --nam không hợp lệ bị từ chối", () => {
  it.each(["abc", "1899", "2101", "2026.5", " 2026", ""])(
    "--nam %s: lỗi tiếng Việt, mã khác 0, không in tổng kết",
    (value) => {
      seed([{ amount: 50000, cat: "an-uong", date: "2026-01-05" }]);
      const r = run(["tong-ket", "--nam", value, "--data", dataFile]);
      expect(r.code).not.toBe(0);
      expect(r.err.trim().length).toBeGreaterThan(0);
      expect(r.err).toMatch(VIETNAMESE);
      expect(r.err.toLowerCase()).toContain("năm");
      expect(monthLines(r.out)).toHaveLength(0);
      expect(r.out).not.toContain("Tổng kết");
      expect(containsNumber(r.out, 50000)).toBe(false);
    },
  );
});
