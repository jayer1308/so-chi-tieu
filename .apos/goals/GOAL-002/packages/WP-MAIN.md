# WP-MAIN v1: Lệnh liet-ke thêm cờ --gioi-han N: chỉ hiện N khoản chi mới nhất; N không hợp lệ bị từ chối bằng lỗi tiếng Việt

```json
{
  "id": "WP-MAIN",
  "goalId": "GOAL-002",
  "goalVersion": 1,
  "version": 1,
  "owner": "lead",
  "outcome": "Lệnh liet-ke thêm cờ --gioi-han N: chỉ hiện N khoản chi mới nhất; N không hợp lệ bị từ chối bằng lỗi tiếng Việt",
  "scope": [
    "src/"
  ],
  "exclusions": [
    "mọi thay đổi khác ngoài cờ --gioi-han của liet-ke"
  ],
  "dependencies": [],
  "interfaces": [
    "EXEC-2@v1"
  ],
  "acceptance": [
    {
      "id": "AC-1",
      "text": "Liệt kê có giới hạn: liet-ke --gioi-han N chỉ hiển thị N khoản chi mới nhất, thứ tự mới nhất trước",
      "goalAcceptanceId": "AC-1",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-2",
      "text": "Không có cờ thì hiện tất cả: liet-ke không có --gioi-han hiển thị toàn bộ các khoản chi như cũ",
      "goalAcceptanceId": "AC-2",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-3",
      "text": "N không hợp lệ bị từ chối: --gioi-han 0, số âm hoặc không phải số thì in lỗi tiếng Việt và thoát với mã khác 0",
      "goalAcceptanceId": "AC-3",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    }
  ],
  "integration": "Solo: the package is the whole Goal",
  "paths": [
    "src/**"
  ],
  "stubPaths": []
}
```
