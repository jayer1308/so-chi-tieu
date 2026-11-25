import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { main } from "./cli.js";

// Hành vi file dữ liệu mặc định (chi-tieu.json trong thư mục làm việc).
// File riêng vì phải đổi process.cwd() sang thư mục tạm trong beforeEach
// và khôi phục trong afterEach — không bao giờ ghi vào chi-tieu.json thật.

function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

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

let tmp: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  tmp = mkdtempSync(join(tmpdir(), "sct-default-"));
  process.chdir(tmp);
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(tmp, { recursive: true, force: true });
});

describe("AC-1 file mặc định: chi-tieu.json trong thư mục làm việc", () => {
  it("them không --data ghi khoản chi vào chi-tieu.json trong cwd", () => {
    const r = run(["them", "--so-tien", "50000", "--danh-muc", "an-uong"]);
    expect(r.code).toBe(0);
    const file = join(tmp, "chi-tieu.json");
    expect(existsSync(file)).toBe(true);
    const raw = readFileSync(file, "utf-8");
    expect(raw).toContain("50000");
    expect(raw).toContain("an-uong");
    expect(raw).toContain(todayLocal());
  });

  it("liet-ke không --data đọc lại các khoản chi đã lưu trong chi-tieu.json", () => {
    expect(run(["them", "--so-tien", "50000", "--danh-muc", "an-uong"]).code).toBe(0);
    expect(run(["them", "--so-tien", "20000", "--danh-muc", "di-lai"]).code).toBe(0);
    const list = run(["liet-ke"]);
    expect(list.code).toBe(0);
    expect(list.out).toContain("50000");
    expect(list.out).toContain("20000");
    expect(list.out).toContain("an-uong");
    expect(list.out).toContain("di-lai");
  });
});

describe("AC-2 file mặc định: nhập sai không tạo chi-tieu.json", () => {
  it("them với số tiền 0 không tạo chi-tieu.json", () => {
    const r = run(["them", "--so-tien", "0", "--danh-muc", "an-uong"]);
    expect(r.code).not.toBe(0);
    expect(r.err.trim().length).toBeGreaterThan(0);
    expect(r.err.toLowerCase()).toContain("số tiền");
    expect(existsSync(join(tmp, "chi-tieu.json"))).toBe(false);
  });
});
