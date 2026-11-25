import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { main } from "./cli.js";

// Acceptance tests cho GOAL-002 (AC-1..AC-3): liet-ke --gioi-han N.
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

let tmp: string;
let dataFile: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), "sct-gioi-han-"));
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

function seedThree(): void {
  seed([
    { amount: 10000, cat: "an-uong", date: "2026-11-10" },
    { amount: 20000, cat: "di-lai", date: "2026-11-20" },
    { amount: 30000, cat: "an-uong", date: "2026-11-25" },
  ]);
}

describe("GOAL-002 AC-1 liet-ke --gioi-han: chỉ hiện N khoản mới nhất", () => {
  it("--gioi-han 2 trên 3 khoản: chỉ 2 mới nhất, mới nhất trước, khoản cũ nhất không hiện", () => {
    seedThree();
    const r = run(["liet-ke", "--gioi-han", "2", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 30000)).toBe(true);
    expect(containsNumber(r.out, 20000)).toBe(true);
    expect(containsNumber(r.out, 10000)).toBe(false);
    expect(r.out.indexOf("30000")).toBeLessThan(r.out.indexOf("20000"));
  });

  it("N bằng đúng số khoản chi thì hiện tất cả", () => {
    seedThree();
    const r = run(["liet-ke", "--gioi-han", "3", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 10000)).toBe(true);
    expect(containsNumber(r.out, 20000)).toBe(true);
    expect(containsNumber(r.out, 30000)).toBe(true);
  });

  it("N lớn hơn số khoản chi thì hiện tất cả", () => {
    seedThree();
    const r = run(["liet-ke", "--gioi-han", "10", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 10000)).toBe(true);
    expect(containsNumber(r.out, 20000)).toBe(true);
    expect(containsNumber(r.out, 30000)).toBe(true);
  });

  it("giới hạn áp dụng sau khi lọc --thang/--danh-muc", () => {
    seedThree();
    const r = run([
      "liet-ke",
      "--thang",
      "2026-11",
      "--danh-muc",
      "an-uong",
      "--gioi-han",
      "1",
      "--data",
      dataFile,
    ]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 30000)).toBe(true);
    expect(containsNumber(r.out, 10000)).toBe(false);
    expect(containsNumber(r.out, 20000)).toBe(false);
  });
});

describe("GOAL-002 AC-2 liet-ke không cờ: hiện tất cả như cũ", () => {
  it("không có --gioi-han thì hiển thị toàn bộ, mới nhất trước", () => {
    seedThree();
    const r = run(["liet-ke", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 10000)).toBe(true);
    expect(containsNumber(r.out, 20000)).toBe(true);
    expect(containsNumber(r.out, 30000)).toBe(true);
    expect(r.out.indexOf("30000")).toBeLessThan(r.out.indexOf("20000"));
    expect(r.out.indexOf("20000")).toBeLessThan(r.out.indexOf("10000"));
  });

  it("không có khoản chi nào thì in danh sách rỗng, không báo lỗi", () => {
    const r = run(["liet-ke", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(r.err).toBe("");
    expect(containsNumber(r.out, 10000)).toBe(false);
  });
});

describe("GOAL-002 AC-3 --gioi-han không hợp lệ bị từ chối", () => {
  it.each(["0", "-1", "abc", "1.5"])(
    "--gioi-han %s: lỗi tiếng Việt, mã khác 0, không in danh sách",
    (value) => {
      seedThree();
      const r = run(["liet-ke", "--gioi-han", value, "--data", dataFile]);
      expect(r.code).not.toBe(0);
      expect(r.err.trim().length).toBeGreaterThan(0);
      expect(r.err).toMatch(VIETNAMESE);
      expect(r.err.toLowerCase()).toContain("giới hạn");
      expect(containsNumber(r.out, 10000)).toBe(false);
      expect(containsNumber(r.out, 20000)).toBe(false);
      expect(containsNumber(r.out, 30000)).toBe(false);
    },
  );
});
