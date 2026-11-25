# EXEC-1 v1: solo-direct

Một module CLI duy nhất trong src/cli.ts (thêm module con trong src/ nếu cần), tự parse argv, không thêm dependency. Dữ liệu lưu file JSON. Tester viết acceptance test trước, gọi duy nhất qua public entry main(argv) và usage() trong src/cli.ts; Worker triển khai tới khi test pass. Quy ước giao diện: main(argv) trả mã thoát, ghi kết quả ra process.stdout, lỗi tiếng Việt ra process.stderr; cờ toàn cục --data <path> chấp nhận ở bất cứ vị trí nào, mặc định chi-tieu.json trong thư mục làm việc; ngày là lịch địa phương dạng YYYY-MM-DD, --ngay phải là ngày có thật; --so-tien phải là số > 0; liet-ke mới nhất trước (ngày giảm dần, cùng ngày thì thứ tự thêm sau trước); tong-ket tổng theo danh mục + tổng cộng, mặc định tháng hiện tại; xoa --id sai thì lỗi tiếng Việt, mã thoát khác 0; xuat --file bắt buộc, CSV có tiêu đề id,ngay,danh-muc,so-tien,ghi-chu, rỗng thì chỉ có tiêu đề, escape đúng trường chứa dấu phẩy/dấu nháy; id duy nhất mỗi khoản chi.

```json
{
  "id": "EXEC-1",
  "version": 1,
  "goalId": "GOAL-001",
  "goalVersion": 1,
  "mode": "solo-direct",
  "approach": "Một module CLI duy nhất trong src/cli.ts (thêm module con trong src/ nếu cần), tự parse argv, không thêm dependency. Dữ liệu lưu file JSON. Tester viết acceptance test trước, gọi duy nhất qua public entry main(argv) và usage() trong src/cli.ts; Worker triển khai tới khi test pass. Quy ước giao diện: main(argv) trả mã thoát, ghi kết quả ra process.stdout, lỗi tiếng Việt ra process.stderr; cờ toàn cục --data <path> chấp nhận ở bất cứ vị trí nào, mặc định chi-tieu.json trong thư mục làm việc; ngày là lịch địa phương dạng YYYY-MM-DD, --ngay phải là ngày có thật; --so-tien phải là số > 0; liet-ke mới nhất trước (ngày giảm dần, cùng ngày thì thứ tự thêm sau trước); tong-ket tổng theo danh mục + tổng cộng, mặc định tháng hiện tại; xoa --id sai thì lỗi tiếng Việt, mã thoát khác 0; xuat --file bắt buộc, CSV có tiêu đề id,ngay,danh-muc,so-tien,ghi-chu, rỗng thì chỉ có tiêu đề, escape đúng trường chứa dấu phẩy/dấu nháy; id duy nhất mỗi khoản chi.",
  "risks": [
    "Ngày mặc định dùng lịch địa phương — test và code phải dùng cùng cách tính ngày YYYY-MM-DD",
    "Định dạng CSV khi ghi chú chứa dấu phẩy hoặc dấu nháy kép cần escape đúng"
  ],
  "baseCommit": "1f502a942d50d44eb87c2ce4db23836c2fd7d80d",
  "sourceSha256": "e7ddd7bbf2eee2a2fd56cd77fb9a7a96f4980c521c932aa778038b60ba5e93f2",
  "estimatedCost": {
    "wallMinutes": 60
  },
  "rationale": "Goal nhỏ, một module gắn kết, một owner giữ toàn bộ ngữ cảnh là đủ; không có seam độc lập nào để tách Multi-WP.",
  "sharedPaths": [],
  "paths": [
    "src/**"
  ],
  "stubPaths": [],
  "entries": [
    "src/cli.ts:main",
    "src/cli.ts:usage"
  ],
  "acceptanceMapping": [
    {
      "acceptanceId": "AC-1",
      "verification": "npm test"
    },
    {
      "acceptanceId": "AC-2",
      "verification": "npm test"
    },
    {
      "acceptanceId": "AC-3",
      "verification": "npm test"
    },
    {
      "acceptanceId": "AC-4",
      "verification": "npm test"
    },
    {
      "acceptanceId": "AC-5",
      "verification": "npm test"
    },
    {
      "acceptanceId": "AC-6",
      "verification": "npm test"
    }
  ],
  "verificationStrategy": "Run npm test; then npm run build"
}
```
