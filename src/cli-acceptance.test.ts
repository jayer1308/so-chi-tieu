import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { main } from "./cli.js";

// Acceptance tests cho GOAL-001 (AC-1..AC-6).
// Chỉ gọi public entry main(argv); dữ liệu cách ly trong thư mục tạm qua --data.
// Ngày "hôm nay" luôn tính động theo lịch địa phương, không hardcode.

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

// Số tiền có thể in dạng 80000, 80.000, 80,000 hay 80 000 — chấp nhận mọi dạng.
function numberPattern(n: number): RegExp {
  const s = String(n);
  const groups: string[] = [];
  let rest = s;
  while (rest.length > 3) {
    groups.unshift(rest.slice(-3));
    rest = rest.slice(0, -3);
  }
  groups.unshift(rest);
  return new RegExp(groups.join("[.,\\s]?"));
}

function containsNumber(out: string, n: number): boolean {
  return numberPattern(n).test(out);
}

function indexOfNumber(out: string, n: number): number {
  return out.search(numberPattern(n));
}

// Đọc các khoản chi từ file JSON mà không giả định schema lưu trữ cụ thể:
// root có thể là mảng, { expenses: [...] }, { items: [...] }, map theo id,
// hay một object khoản chi duy nhất.
type Expense = Record<string, unknown>;

function readExpenses(file: string): Expense[] {
  const data: unknown = JSON.parse(readFileSync(file, "utf-8"));
  if (Array.isArray(data)) return data as Expense[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["expenses", "items", "data", "entries"]) {
      if (Array.isArray(obj[key])) return obj[key] as Expense[];
    }
    const values = Object.values(obj).filter(
      (v) => v && typeof v === "object",
    ) as Expense[];
    if (values.length > 0) return values;
    return [obj];
  }
  return [];
}

function normKey(k: string): string {
  return k.toLowerCase().replace(/[-_\s]/g, "");
}

function pick(exp: Expense, ...names: string[]): unknown {
  const wanted = new Set(names.map(normKey));
  for (const [k, v] of Object.entries(exp)) {
    if (wanted.has(normKey(k))) return v;
  }
  return undefined;
}

function getId(exp: Expense): string {
  return String(pick(exp, "id") ?? "");
}

function getAmount(exp: Expense): number {
  const v = pick(exp, "so-tien", "soTien", "amount", "tien");
  return typeof v === "number" ? v : Number(v);
}

function getCategory(exp: Expense): string {
  return String(pick(exp, "danh-muc", "danhMuc", "category") ?? "");
}

function getDate(exp: Expense): string {
  return String(pick(exp, "ngay", "date") ?? "");
}

function getNote(exp: Expense): string {
  return String(pick(exp, "ghi-chu", "ghiChu", "note", "ghi_chu") ?? "");
}

// Lỗi phải bằng tiếng Việt: stderr không rỗng và chứa ký tự có dấu tiếng Việt.
const VIETNAMESE = /[àáâãèéêìíòóôõùúýăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/;

function expectVietnameseError(
  r: { code: number; err: string },
  keyword?: string,
): void {
  expect(r.code).not.toBe(0);
  expect(r.err.trim().length).toBeGreaterThan(0);
  expect(r.err).toMatch(VIETNAMESE);
  // Thông báo lỗi phải nêu rõ trường bị sai (không phải lỗi chung chung):
  // stub "lệnh chưa được triển khai" không nêu trường nào nên test này đỏ trên stub.
  if (keyword !== undefined) {
    expect(r.err.toLowerCase()).toContain(keyword);
  }
}

let tmp: string;
let dataFile: string;

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), "sct-acceptance-"));
  dataFile = join(tmp, "data.json");
});

afterEach(() => {
  rmSync(tmp, { recursive: true, force: true });
});

function them(
  args: string[],
  file: string = dataFile,
): { code: number; out: string; err: string } {
  return run(["them", ...args, "--data", file]);
}

function seed(
  entries: Array<{ amount: number; cat: string; date: string; note?: string }>,
): void {
  for (const e of entries) {
    const args = [
      "--so-tien",
      String(e.amount),
      "--danh-muc",
      e.cat,
      "--ngay",
      e.date,
    ];
    if (e.note !== undefined) args.push("--ghi-chu", e.note);
    const r = them(args);
    expect(r.code).toBe(0);
  }
}

describe("AC-1 them: thêm khoản chi", () => {
  it("lưu khoản chi 50000, danh mục an-uong, ngày mặc định là hôm nay", () => {
    const r = them(["--so-tien", "50000", "--danh-muc", "an-uong"]);
    expect(r.code).toBe(0);
    expect(existsSync(dataFile)).toBe(true);
    const expenses = readExpenses(dataFile);
    expect(expenses).toHaveLength(1);
    expect(getAmount(expenses[0])).toBe(50000);
    expect(getCategory(expenses[0])).toBe("an-uong");
    expect(getDate(expenses[0])).toBe(todayLocal());
  });

  it("lưu đúng ngày 2026-11-20 và ghi chú xe ôm", () => {
    const r = them([
      "--so-tien",
      "20000",
      "--danh-muc",
      "di-lai",
      "--ngay",
      "2026-11-20",
      "--ghi-chu",
      "xe ôm",
    ]);
    expect(r.code).toBe(0);
    const expenses = readExpenses(dataFile);
    expect(expenses).toHaveLength(1);
    expect(getAmount(expenses[0])).toBe(20000);
    expect(getCategory(expenses[0])).toBe("di-lai");
    expect(getDate(expenses[0])).toBe("2026-11-20");
    expect(getNote(expenses[0])).toBe("xe ôm");
  });

  it("hai khoản chi liên tiếp có id khác nhau và đều không rỗng", () => {
    expect(them(["--so-tien", "10000", "--danh-muc", "an-uong"]).code).toBe(0);
    expect(them(["--so-tien", "20000", "--danh-muc", "di-lai"]).code).toBe(0);
    const expenses = readExpenses(dataFile);
    expect(expenses).toHaveLength(2);
    const ids = expenses.map(getId);
    expect(ids[0].length).toBeGreaterThan(0);
    expect(ids[1].length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(2);
  });

  it("thêm khoản chi mới không ghi đè các khoản chi đã lưu trước đó", () => {
    expect(them(["--so-tien", "10000", "--danh-muc", "an-uong"]).code).toBe(0);
    expect(them(["--so-tien", "20000", "--danh-muc", "di-lai"]).code).toBe(0);
    const expenses = readExpenses(dataFile);
    expect(expenses).toHaveLength(2);
    expect(expenses.map(getAmount).sort((a, b) => a - b)).toEqual([10000, 20000]);
    const list = run(["liet-ke", "--data", dataFile]);
    expect(list.code).toBe(0);
    expect(containsNumber(list.out, 10000)).toBe(true);
    expect(containsNumber(list.out, 20000)).toBe(true);
  });

  it("--data chấp nhận ở bất cứ vị trí nào trong argv (đặt trước lệnh)", () => {
    const r = run([
      "--data",
      dataFile,
      "them",
      "--so-tien",
      "50000",
      "--danh-muc",
      "an-uong",
    ]);
    expect(r.code).toBe(0);
    expect(existsSync(dataFile)).toBe(true);
    expect(readExpenses(dataFile)).toHaveLength(1);
  });

  it("--data chấp nhận ở bất cứ vị trí nào trong argv (đặt giữa các cờ)", () => {
    const r = run([
      "them",
      "--so-tien",
      "50000",
      "--data",
      dataFile,
      "--danh-muc",
      "an-uong",
    ]);
    expect(r.code).toBe(0);
    expect(existsSync(dataFile)).toBe(true);
    expect(readExpenses(dataFile)).toHaveLength(1);
  });
});

describe("AC-2 them: kiểm tra đầu vào", () => {
  it("số tiền 0 bị từ chối: lỗi tiếng Việt, mã khác 0, không lưu khoản chi", () => {
    const r = them(["--so-tien", "0", "--danh-muc", "an-uong-khong-hop-le"]);
    expectVietnameseError(r, "số tiền");
    expect(existsSync(dataFile) ? readFileSync(dataFile, "utf-8") : "").not.toContain(
      "an-uong-khong-hop-le",
    );
  });

  it("số tiền âm bị từ chối: lỗi tiếng Việt, mã khác 0, không lưu khoản chi", () => {
    const r = them(["--so-tien", "-5000", "--danh-muc", "an-uong-khong-hop-le"]);
    expectVietnameseError(r, "số tiền");
    expect(existsSync(dataFile) ? readFileSync(dataFile, "utf-8") : "").not.toContain(
      "an-uong-khong-hop-le",
    );
  });

  it("số tiền không phải số bị từ chối: lỗi tiếng Việt, mã khác 0", () => {
    const r = them(["--so-tien", "abc", "--danh-muc", "an-uong-khong-hop-le"]);
    expectVietnameseError(r, "số tiền");
    expect(existsSync(dataFile) ? readFileSync(dataFile, "utf-8") : "").not.toContain(
      "an-uong-khong-hop-le",
    );
  });

  it("thiếu danh mục bị từ chối: lỗi tiếng Việt, mã khác 0", () => {
    const r = them(["--so-tien", "50000"]);
    expectVietnameseError(r, "danh mục");
    expect(existsSync(dataFile) ? readFileSync(dataFile, "utf-8") : "").not.toContain(
      "50000",
    );
  });

  it("thiếu số tiền bị từ chối: lỗi tiếng Việt, mã khác 0", () => {
    const r = them(["--danh-muc", "an-uong-khong-hop-le"]);
    expectVietnameseError(r, "số tiền");
    expect(existsSync(dataFile) ? readFileSync(dataFile, "utf-8") : "").not.toContain(
      "an-uong-khong-hop-le",
    );
  });

  it("số tiền 1 đồng là hợp lệ (boundary)", () => {
    const r = them(["--so-tien", "1", "--danh-muc", "an-uong"]);
    expect(r.code).toBe(0);
    expect(readExpenses(dataFile)).toHaveLength(1);
    expect(getAmount(readExpenses(dataFile)[0])).toBe(1);
  });

  it("ngày 2026-02-30 (không tồn tại) bị từ chối: lỗi tiếng Việt, mã khác 0", () => {
    const r = them([
      "--so-tien",
      "50000",
      "--danh-muc",
      "an-uong-khong-hop-le",
      "--ngay",
      "2026-02-30",
    ]);
    expectVietnameseError(r, "ngày");
    expect(existsSync(dataFile) ? readFileSync(dataFile, "utf-8") : "").not.toContain(
      "an-uong-khong-hop-le",
    );
  });

  it("ngày sai định dạng (2026-13-01) bị từ chối: lỗi tiếng Việt, mã khác 0", () => {
    const r = them([
      "--so-tien",
      "50000",
      "--danh-muc",
      "an-uong-khong-hop-le",
      "--ngay",
      "2026-13-01",
    ]);
    expectVietnameseError(r, "ngày");
    expect(existsSync(dataFile) ? readFileSync(dataFile, "utf-8") : "").not.toContain(
      "an-uong-khong-hop-le",
    );
  });

  it("ngày sai định dạng (20/11/2026) bị từ chối: lỗi tiếng Việt, mã khác 0", () => {
    const r = them([
      "--so-tien",
      "50000",
      "--danh-muc",
      "an-uong-khong-hop-le",
      "--ngay",
      "20/11/2026",
    ]);
    expectVietnameseError(r, "ngày");
    expect(existsSync(dataFile) ? readFileSync(dataFile, "utf-8") : "").not.toContain(
      "an-uong-khong-hop-le",
    );
  });
});

describe("AC-3 liet-ke: liệt kê khoản chi", () => {
  it("khoản mới nhất hiển thị trước (ngày giảm dần)", () => {
    seed([
      { amount: 10000, cat: "an-uong", date: "2026-11-10" },
      { amount: 20000, cat: "di-lai", date: "2026-11-20" },
    ]);
    const r = run(["liet-ke", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("2026-11-20");
    expect(r.out).toContain("2026-11-10");
    expect(r.out.indexOf("2026-11-20")).toBeLessThan(r.out.indexOf("2026-11-10"));
  });

  it("cùng ngày thì khoản thêm sau đứng trước", () => {
    seed([
      { amount: 11111, cat: "an-uong", date: "2026-11-20" },
      { amount: 22222, cat: "di-lai", date: "2026-11-20" },
    ]);
    const r = run(["liet-ke", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(indexOfNumber(r.out, 22222)).toBeGreaterThanOrEqual(0);
    expect(indexOfNumber(r.out, 11111)).toBeGreaterThanOrEqual(0);
    expect(indexOfNumber(r.out, 22222)).toBeLessThan(indexOfNumber(r.out, 11111));
  });

  it("chỉ hiển thị khoản chi tháng 11/2026 thuộc danh mục an-uong", () => {
    seed([
      { amount: 10000, cat: "an-uong", date: "2026-11-20" },
      { amount: 20000, cat: "di-lai", date: "2026-11-20" },
      { amount: 30000, cat: "an-uong", date: "2026-10-15" },
    ]);
    const r = run([
      "liet-ke",
      "--thang",
      "2026-11",
      "--danh-muc",
      "an-uong",
      "--data",
      dataFile,
    ]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 10000)).toBe(true);
    expect(containsNumber(r.out, 20000)).toBe(false);
    expect(containsNumber(r.out, 30000)).toBe(false);
  });

  it("lọc theo --thang loại khoản chi tháng khác", () => {
    seed([
      { amount: 10000, cat: "an-uong", date: "2026-11-20" },
      { amount: 20000, cat: "an-uong", date: "2026-10-15" },
    ]);
    const r = run(["liet-ke", "--thang", "2026-11", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 10000)).toBe(true);
    expect(containsNumber(r.out, 20000)).toBe(false);
  });

  it("lọc theo --danh-muc loại khoản chi danh mục khác", () => {
    seed([
      { amount: 10000, cat: "an-uong", date: "2026-11-20" },
      { amount: 20000, cat: "di-lai", date: "2026-11-20" },
    ]);
    const r = run(["liet-ke", "--danh-muc", "di-lai", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 20000)).toBe(true);
    expect(containsNumber(r.out, 10000)).toBe(false);
  });

  it("không có khoản chi nào thì in danh sách rỗng, không báo lỗi", () => {
    const r = run(["liet-ke", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(r.err).toBe("");
    expect(containsNumber(r.out, 10000)).toBe(false);
  });
});

describe("AC-4 tong-ket: tổng kết tháng", () => {
  it("in tổng chi theo từng danh mục của tháng 11/2026 và tổng cộng của tháng", () => {
    seed([
      { amount: 50000, cat: "an-uong", date: "2026-11-05" },
      { amount: 30000, cat: "an-uong", date: "2026-11-20" },
      { amount: 20000, cat: "di-lai", date: "2026-11-10" },
    ]);
    const r = run(["tong-ket", "--thang", "2026-11", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("an-uong");
    expect(r.out).toContain("di-lai");
    expect(containsNumber(r.out, 80000)).toBe(true);
    expect(containsNumber(r.out, 20000)).toBe(true);
    expect(containsNumber(r.out, 100000)).toBe(true);
  });

  it("tháng không có khoản chi thì tổng bằng 0", () => {
    seed([{ amount: 50000, cat: "an-uong", date: "2026-11-05" }]);
    const r = run(["tong-ket", "--thang", "2026-12", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 0)).toBe(true);
    expect(containsNumber(r.out, 50000)).toBe(false);
  });

  it("khoản chi tháng khác không được tính vào tổng của tháng đang xem", () => {
    seed([
      { amount: 50000, cat: "an-uong", date: "2026-11-05" },
      { amount: 70000, cat: "an-uong", date: "2026-10-05" },
    ]);
    const r = run(["tong-ket", "--thang", "2026-11", "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(containsNumber(r.out, 50000)).toBe(true);
    expect(containsNumber(r.out, 70000)).toBe(false);
    expect(containsNumber(r.out, 120000)).toBe(false);
  });

  it("không truyền --thang thì dùng tháng hiện tại", () => {
    const r = them(["--so-tien", "50000", "--danh-muc", "an-uong"]);
    expect(r.code).toBe(0);
    const summary = run(["tong-ket", "--data", dataFile]);
    expect(summary.code).toBe(0);
    expect(summary.out).toContain("an-uong");
    expect(containsNumber(summary.out, 50000)).toBe(true);
    expect(summary.out).toContain(currentMonth());
  });
});

describe("AC-5 xoa: xóa khoản chi", () => {
  it("xóa đúng khoản chi có id đó, các khoản chi khác còn nguyên", () => {
    expect(them(["--so-tien", "10000", "--danh-muc", "an-uong"]).code).toBe(0);
    expect(them(["--so-tien", "20000", "--danh-muc", "di-lai"]).code).toBe(0);
    const before = readExpenses(dataFile);
    expect(before).toHaveLength(2);
    const idToDelete = getId(before.find((e) => getAmount(e) === 10000)!);
    const r = run(["xoa", "--id", idToDelete, "--data", dataFile]);
    expect(r.code).toBe(0);
    const after = readExpenses(dataFile);
    expect(after).toHaveLength(1);
    expect(getAmount(after[0])).toBe(20000);
    expect(getCategory(after[0])).toBe("di-lai");
  });

  it("xóa xong liệt kê lại không còn khoản chi đó", () => {
    expect(them(["--so-tien", "10000", "--danh-muc", "an-uong"]).code).toBe(0);
    const id = getId(readExpenses(dataFile)[0]);
    expect(run(["xoa", "--id", id, "--data", dataFile]).code).toBe(0);
    const list = run(["liet-ke", "--data", dataFile]);
    expect(list.code).toBe(0);
    expect(containsNumber(list.out, 10000)).toBe(false);
  });

  it("id không tồn tại thì lỗi tiếng Việt, mã khác 0", () => {
    expect(them(["--so-tien", "10000", "--danh-muc", "an-uong"]).code).toBe(0);
    const r = run(["xoa", "--id", "khong-ton-tai", "--data", dataFile]);
    expectVietnameseError(r, "không tồn tại");
    expect(readExpenses(dataFile)).toHaveLength(1);
  });
});

describe("AC-6 xuat: xuất CSV", () => {
  it("tạo file CSV chứa các khoản chi với đủ cột id, ngày, danh mục, số tiền, ghi chú", () => {
    seed([
      { amount: 50000, cat: "an-uong", date: "2026-11-20", note: "xe ôm" },
      { amount: 20000, cat: "di-lai", date: "2026-11-10" },
    ]);
    const csvFile = join(tmp, "chi-tieu-11.csv");
    const r = run(["xuat", "--file", csvFile, "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(existsSync(csvFile)).toBe(true);
    const lines = readFileSync(csvFile, "utf-8").split("\n");
    expect(lines[0].trim()).toBe("id,ngay,danh-muc,so-tien,ghi-chu");
    const body = readFileSync(csvFile, "utf-8");
    expect(body).toContain("2026-11-20");
    expect(body).toContain("an-uong");
    expect(body).toContain("50000");
    expect(body).toContain("xe ôm");
    expect(body).toContain("2026-11-10");
    expect(body).toContain("di-lai");
  });

  it("thiếu --file thì lỗi tiếng Việt, mã khác 0", () => {
    seed([{ amount: 50000, cat: "an-uong", date: "2026-11-20" }]);
    const r = run(["xuat", "--data", dataFile]);
    expectVietnameseError(r, "file");
  });

  it("xuất khi không có khoản chi nào thì tạo file CSV chỉ có dòng tiêu đề", () => {
    const csvFile = join(tmp, "rong.csv");
    const r = run(["xuat", "--file", csvFile, "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(existsSync(csvFile)).toBe(true);
    expect(readFileSync(csvFile, "utf-8").trim()).toBe(
      "id,ngay,danh-muc,so-tien,ghi-chu",
    );
  });

  it("escape đúng trường chứa dấu phẩy và dấu nháy kép trong ghi chú", () => {
    seed([
      { amount: 50000, cat: "an-uong", date: "2026-11-20", note: 'cơm, "ngon"' },
    ]);
    const csvFile = join(tmp, "escape.csv");
    const r = run(["xuat", "--file", csvFile, "--data", dataFile]);
    expect(r.code).toBe(0);
    const body = readFileSync(csvFile, "utf-8");
    expect(body).toContain('"cơm, ""ngon"""');
  });

  it("escape đúng trường chứa ký tự xuống dòng trong ghi chú", () => {
    seed([
      { amount: 50000, cat: "an-uong", date: "2026-11-20", note: "dòng 1\ndòng 2" },
    ]);
    const csvFile = join(tmp, "newline.csv");
    const r = run(["xuat", "--file", csvFile, "--data", dataFile]);
    expect(r.code).toBe(0);
    const body = readFileSync(csvFile, "utf-8");
    expect(body).toContain('"dòng 1\ndòng 2"');
  });

  it("xuất CSV không ghi đè file dữ liệu JSON", () => {
    seed([{ amount: 50000, cat: "an-uong", date: "2026-11-20", note: "xe ôm" }]);
    const before = readFileSync(dataFile, "utf-8");
    const csvFile = join(tmp, "xuat.csv");
    const r = run(["xuat", "--file", csvFile, "--data", dataFile]);
    expect(r.code).toBe(0);
    expect(readFileSync(dataFile, "utf-8")).toBe(before);
    expect(readExpenses(dataFile)).toHaveLength(1);
  });

  it("xuất CSV lọc theo --thang loại khoản chi tháng khác", () => {
    seed([
      { amount: 50000, cat: "an-uong", date: "2026-11-20" },
      { amount: 70000, cat: "an-uong", date: "2026-10-05" },
    ]);
    const csvFile = join(tmp, "thang11.csv");
    const r = run(["xuat", "--thang", "2026-11", "--file", csvFile, "--data", dataFile]);
    expect(r.code).toBe(0);
    const body = readFileSync(csvFile, "utf-8");
    expect(body).toContain("2026-11-20");
    expect(body).not.toContain("2026-10-05");
  });
});
