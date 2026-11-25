# EXEC-2 v1: solo-direct

Mở rộng lệnh liet-ke trong src/cli.ts: parse thêm cờ --gioi-han N (chấp nhận ở bất cứ vị trí nào như các cờ hiện có), kiểm tra N là số nguyên lớn hơn 0 (0, số âm, số thập phân, không phải số đều bị từ chối bằng lỗi tiếng Việt ra process.stderr, thoát mã khác 0, không in danh sách), khi hợp lệ chỉ hiển thị N khoản chi mới nhất giữ nguyên thứ tự mới nhất trước và các bộ lọc --thang/--danh-muc hiện có, khi không có cờ thì hiển thị tất cả như cũ. Thêm test acceptance trong src/ cho AC-1 (giới hạn 2 trên 3 khoản, N bằng đúng và lớn hơn số khoản), AC-2 (không cờ hiện tất cả, danh sách rỗng không lỗi) và AC-3 (0, -1, abc, 1.5). Không thêm dependency, không đổi các lệnh khác, định dạng hiển thị hay file dữ liệu.

```json
{
  "id": "EXEC-2",
  "version": 1,
  "goalId": "GOAL-002",
  "goalVersion": 1,
  "mode": "solo-direct",
  "approach": "Mở rộng lệnh liet-ke trong src/cli.ts: parse thêm cờ --gioi-han N (chấp nhận ở bất cứ vị trí nào như các cờ hiện có), kiểm tra N là số nguyên lớn hơn 0 (0, số âm, số thập phân, không phải số đều bị từ chối bằng lỗi tiếng Việt ra process.stderr, thoát mã khác 0, không in danh sách), khi hợp lệ chỉ hiển thị N khoản chi mới nhất giữ nguyên thứ tự mới nhất trước và các bộ lọc --thang/--danh-muc hiện có, khi không có cờ thì hiển thị tất cả như cũ. Thêm test acceptance trong src/ cho AC-1 (giới hạn 2 trên 3 khoản, N bằng đúng và lớn hơn số khoản), AC-2 (không cờ hiện tất cả, danh sách rỗng không lỗi) và AC-3 (0, -1, abc, 1.5). Không thêm dependency, không đổi các lệnh khác, định dạng hiển thị hay file dữ liệu.",
  "risks": [
    "Cờ --gioi-han phải kết hợp đúng với --thang và --danh-muc: giới hạn áp dụng sau khi lọc, trên danh sách đã sắp mới nhất trước",
    "Giá trị --gioi-han dạng số thập phân (1.5) hoặc chuỗi số có khoảng trắng phải bị từ chối, không được làm tròn hay ép kiểu lặng lẽ"
  ],
  "baseCommit": "77b1f8756d9307ebd2d7e59e46b25e4c1c3f1fba",
  "sourceSha256": "4d33a6e3e4edb0441bffab5f0876ade71a74f64fd3df0adf560ef5ddd6dce807",
  "estimatedCost": {
    "wallMinutes": 30
  },
  "rationale": "Goal nhỏ, một thay đổi gắn kết trong lệnh liet-ke của src/cli.ts, một owner giữ toàn bộ ngữ cảnh là đủ; không có seam độc lập nào để tách Multi-WP.",
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
    }
  ],
  "verificationStrategy": "Run npm test; then npm run build"
}
```
