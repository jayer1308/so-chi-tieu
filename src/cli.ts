export function usage(): string {
  return [
    "sct — Sổ chi tiêu cá nhân",
    "",
    "Sử dụng:",
    "  sct them --so-tien <n> --danh-muc <ten> [--ghi-chu <text>] [--ngay YYYY-MM-DD]",
    "  sct liet-ke [--thang YYYY-MM] [--danh-muc <ten>]",
    "  sct tong-ket [--thang YYYY-MM]",
    "  sct xoa --id <id>",
    "  sct xuat [--thang YYYY-MM] --file <path>",
    "",
    "Dữ liệu lưu trong file JSON (mặc định: chi-tieu.json trong thư mục làm việc).",
    "",
  ].join("\n");
}

export function main(argv: string[]): number {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(usage());
    return 0;
  }
  process.stderr.write("Lỗi: lệnh chưa được triển khai. Chạy `sct --help` để xem hướng dẫn.\n");
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = main(process.argv.slice(2));
}
