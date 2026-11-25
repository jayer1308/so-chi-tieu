import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function usage(): string {
  return [
    "sct — Sổ chi tiêu cá nhân",
    "",
    "Sử dụng:",
    "  sct them --so-tien <n> --danh-muc <ten> [--ghi-chu <text>] [--ngay YYYY-MM-DD]",
    "  sct liet-ke [--thang YYYY-MM] [--danh-muc <ten>] [--gioi-han N]",
    "  sct tong-ket [--thang YYYY-MM]",
    "  sct xoa --id <id>",
    "  sct xuat [--thang YYYY-MM] --file <path>",
    "",
    "Dữ liệu lưu trong file JSON (mặc định: chi-tieu.json trong thư mục làm việc).",
    "Dùng --data <path> để chỉ định file dữ liệu khác.",
    "",
  ].join("\n");
}

interface Expense {
  id: string;
  "so-tien": number;
  "danh-muc": string;
  ngay: string;
  "ghi-chu"?: string;
}

type Flags = Record<string, string>;

const KNOWN_FLAGS = new Set([
  "--so-tien",
  "--danh-muc",
  "--ghi-chu",
  "--ngay",
  "--thang",
  "--gioi-han",
  "--id",
  "--file",
]);

function fail(message: string): number {
  process.stderr.write(`Lỗi: ${message}\n`);
  return 1;
}

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

/** Kiểm tra ngày YYYY-MM-DD có thật trên lịch địa phương hay không. */
function isValidDate(value: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return false;
  const y = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const d = new Date(y, month - 1, day);
  return (
    d.getFullYear() === y && d.getMonth() === month - 1 && d.getDate() === day
  );
}

function isValidMonth(value: string): boolean {
  const m = /^(\d{4})-(\d{2})$/.exec(value);
  if (!m) return false;
  const month = Number(m[2]);
  return month >= 1 && month <= 12;
}

/**
 * Tách cờ toàn cục --data <path> ra khỏi argv (chấp nhận ở bất cứ vị trí
 * nào). Trả về đường dẫn file dữ liệu và argv còn lại.
 */
function extractDataFile(argv: string[]): { dataFile: string; rest: string[] } {
  const rest: string[] = [];
  let dataFile: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--data") {
      if (i + 1 >= argv.length) {
        // Thiếu giá trị: để main() báo lỗi tiếng Việt ở bước sau.
        rest.push(arg);
        continue;
      }
      if (dataFile === undefined) dataFile = argv[i + 1];
      i++;
      continue;
    }
    rest.push(arg);
  }
  return {
    dataFile: dataFile ?? join(process.cwd(), "chi-tieu.json"),
    rest,
  };
}

/** Đọc các cờ --ten <giá trị> từ argv (sau tên lệnh). */
function parseFlags(args: string[]): { flags: Flags; error?: string } {
  const flags: Flags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) {
      return { flags, error: `tham số không hợp lệ: ${arg}` };
    }
    if (!KNOWN_FLAGS.has(arg)) {
      return { flags, error: `cờ không hợp lệ: ${arg}` };
    }
    if (i + 1 >= args.length) {
      return { flags, error: `thiếu giá trị cho cờ ${arg}` };
    }
    flags[arg] = args[i + 1];
    i++;
  }
  return { flags };
}

function loadExpenses(dataFile: string): { expenses: Expense[]; error?: string } {
  if (!existsSync(dataFile)) return { expenses: [] };
  let raw: string;
  try {
    raw = readFileSync(dataFile, "utf-8");
  } catch {
    return { expenses: [], error: "không đọc được file dữ liệu" };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return { expenses: [], error: "file dữ liệu không đúng định dạng" };
    }
    return { expenses: parsed as Expense[] };
  } catch {
    return { expenses: [], error: "file dữ liệu không đúng định dạng JSON" };
  }
}

function saveExpenses(dataFile: string, expenses: Expense[]): void {
  writeFileSync(dataFile, JSON.stringify(expenses, null, 2) + "\n", "utf-8");
}

/** Mới nhất trước: ngày giảm dần, cùng ngày thì thêm sau đứng trước. */
function sortNewestFirst(expenses: Expense[]): Expense[] {
  return expenses
    .map((e, index) => ({ e, index }))
    .sort((a, b) => {
      if (a.e.ngay !== b.e.ngay) return a.e.ngay < b.e.ngay ? 1 : -1;
      return b.index - a.index;
    })
    .map(({ e }) => e);
}

function formatExpense(e: Expense): string {
  const parts = [e.ngay, e["danh-muc"], String(e["so-tien"])];
  if (e["ghi-chu"] !== undefined && e["ghi-chu"] !== "") {
    parts.push(e["ghi-chu"]);
  }
  parts.push(e.id);
  return parts.join(" ");
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function cmdThem(flags: Flags, dataFile: string): number {
  const rawAmount = flags["--so-tien"];
  if (rawAmount === undefined || rawAmount.trim() === "") {
    return fail("thiếu số tiền. Cần truyền --so-tien với số lớn hơn 0.");
  }
  const amount = Number(rawAmount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return fail("số tiền phải là số lớn hơn 0.");
  }
  const category = flags["--danh-muc"];
  if (category === undefined || category.trim() === "") {
    return fail("thiếu danh mục. Cần truyền --danh-muc.");
  }
  const date = flags["--ngay"] ?? todayLocal();
  if (!isValidDate(date)) {
    return fail(
      "ngày không hợp lệ. Ngày phải đúng định dạng YYYY-MM-DD và là ngày có thật.",
    );
  }
  const loaded = loadExpenses(dataFile);
  if (loaded.error) return fail(loaded.error);
  const expense: Expense = {
    id: randomUUID(),
    "so-tien": amount,
    "danh-muc": category,
    ngay: date,
  };
  const note = flags["--ghi-chu"];
  if (note !== undefined) expense["ghi-chu"] = note;
  loaded.expenses.push(expense);
  saveExpenses(dataFile, loaded.expenses);
  process.stdout.write(`Đã thêm khoản chi ${amount} (${category}, ${date}).\n`);
  return 0;
}

function cmdLietKe(flags: Flags, dataFile: string): number {
  const month = flags["--thang"];
  if (month !== undefined && !isValidMonth(month)) {
    return fail("tháng không hợp lệ. Tháng phải đúng định dạng YYYY-MM.");
  }
  const rawLimit = flags["--gioi-han"];
  let limit: number | undefined;
  if (rawLimit !== undefined) {
    if (!/^\d+$/.test(rawLimit.trim())) {
      return fail(
        "giới hạn không hợp lệ. --gioi-han phải là số nguyên lớn hơn 0.",
      );
    }
    limit = Number(rawLimit);
    if (!Number.isSafeInteger(limit) || limit <= 0) {
      return fail(
        "giới hạn không hợp lệ. --gioi-han phải là số nguyên lớn hơn 0.",
      );
    }
  }
  const loaded = loadExpenses(dataFile);
  if (loaded.error) return fail(loaded.error);
  let list = loaded.expenses;
  if (month !== undefined) {
    list = list.filter((e) => e.ngay.startsWith(month));
  }
  const category = flags["--danh-muc"];
  if (category !== undefined) {
    list = list.filter((e) => e["danh-muc"] === category);
  }
  const sorted = sortNewestFirst(list);
  const shown = limit === undefined ? sorted : sorted.slice(0, limit);
  if (shown.length === 0) {
    process.stdout.write("Không có khoản chi nào.\n");
    return 0;
  }
  for (const e of shown) {
    process.stdout.write(formatExpense(e) + "\n");
  }
  return 0;
}

function cmdTongKet(flags: Flags, dataFile: string): number {
  const month = flags["--thang"] ?? currentMonth();
  if (!isValidMonth(month)) {
    return fail("tháng không hợp lệ. Tháng phải đúng định dạng YYYY-MM.");
  }
  const loaded = loadExpenses(dataFile);
  if (loaded.error) return fail(loaded.error);
  const list = loaded.expenses.filter((e) => e.ngay.startsWith(month));
  const totals = new Map<string, number>();
  let total = 0;
  for (const e of list) {
    totals.set(e["danh-muc"], (totals.get(e["danh-muc"]) ?? 0) + e["so-tien"]);
    total += e["so-tien"];
  }
  process.stdout.write(`Tổng kết tháng ${month}:\n`);
  for (const [category, sum] of totals) {
    process.stdout.write(`${category}: ${sum}\n`);
  }
  process.stdout.write(`Tổng cộng: ${total}\n`);
  return 0;
}

function cmdXoa(flags: Flags, dataFile: string): number {
  const id = flags["--id"];
  if (id === undefined || id.trim() === "") {
    return fail("thiếu id. Cần truyền --id của khoản chi cần xóa.");
  }
  const loaded = loadExpenses(dataFile);
  if (loaded.error) return fail(loaded.error);
  const index = loaded.expenses.findIndex((e) => e.id === id);
  if (index === -1) {
    return fail(`khoản chi có id ${id} không tồn tại.`);
  }
  loaded.expenses.splice(index, 1);
  saveExpenses(dataFile, loaded.expenses);
  process.stdout.write(`Đã xóa khoản chi có id ${id}.\n`);
  return 0;
}

function cmdXuat(flags: Flags, dataFile: string): number {
  const file = flags["--file"];
  if (file === undefined || file.trim() === "") {
    return fail("thiếu file đầu ra. Cần truyền --file <path> khi xuất CSV.");
  }
  const month = flags["--thang"];
  if (month !== undefined && !isValidMonth(month)) {
    return fail("tháng không hợp lệ. Tháng phải đúng định dạng YYYY-MM.");
  }
  const loaded = loadExpenses(dataFile);
  if (loaded.error) return fail(loaded.error);
  let list = loaded.expenses;
  if (month !== undefined) {
    list = list.filter((e) => e.ngay.startsWith(month));
  }
  const lines = ["id,ngay,danh-muc,so-tien,ghi-chu"];
  for (const e of sortNewestFirst(list)) {
    lines.push(
      [
        csvEscape(e.id),
        csvEscape(e.ngay),
        csvEscape(e["danh-muc"]),
        csvEscape(String(e["so-tien"])),
        csvEscape(e["ghi-chu"] ?? ""),
      ].join(","),
    );
  }
  writeFileSync(file, lines.join("\n") + "\n", "utf-8");
  process.stdout.write(`Đã xuất ${list.length} khoản chi ra file ${file}.\n`);
  return 0;
}

export function main(argv: string[]): number {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(usage());
    return 0;
  }
  const { dataFile, rest } = extractDataFile(argv);
  if (rest.length === 0) {
    process.stdout.write(usage());
    return 0;
  }
  if (rest.includes("--data")) {
    return fail("thiếu đường dẫn file dữ liệu cho cờ --data.");
  }
  const [command, ...args] = rest;
  const parsed = parseFlags(args);
  if (parsed.error) return fail(parsed.error);
  const flags = parsed.flags;
  switch (command) {
    case "them":
      return cmdThem(flags, dataFile);
    case "liet-ke":
      return cmdLietKe(flags, dataFile);
    case "tong-ket":
      return cmdTongKet(flags, dataFile);
    case "xoa":
      return cmdXoa(flags, dataFile);
    case "xuat":
      return cmdXuat(flags, dataFile);
    default:
      return fail(
        `lệnh không hợp lệ: ${command}. Chạy \`sct --help\` để xem hướng dẫn.`,
      );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = main(process.argv.slice(2));
}
