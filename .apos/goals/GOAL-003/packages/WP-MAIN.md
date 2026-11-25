# WP-MAIN v1: Lệnh tong-ket thêm cờ --nam YYYY: tổng kết cả năm theo từng tháng; năm không hợp lệ bị từ chối bằng lỗi tiếng Việt

```json
{
  "id": "WP-MAIN",
  "goalId": "GOAL-003",
  "goalVersion": 1,
  "version": 1,
  "owner": "lead",
  "outcome": "Lệnh tong-ket thêm cờ --nam YYYY: tổng kết cả năm theo từng tháng; năm không hợp lệ bị từ chối bằng lỗi tiếng Việt",
  "scope": [
    "src/"
  ],
  "exclusions": [
    "mọi thay đổi khác ngoài cờ --nam của tong-ket"
  ],
  "dependencies": [],
  "interfaces": [
    "EXEC-3@v1"
  ],
  "acceptance": [
    {
      "id": "AC-1",
      "text": "Tổng kết cả năm: tong-ket --nam YYYY hiển thị đủ 12 tháng, mỗi tháng một dòng gồm tháng, tổng chi và số khoản",
      "goalAcceptanceId": "AC-1",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-2",
      "text": "Không có cờ thì như cũ: tong-ket không có --nam tổng kết một tháng như cũ",
      "goalAcceptanceId": "AC-2",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-3",
      "text": "Năm không hợp lệ bị từ chối: --nam không phải số hoặc ngoài khoảng 1900–2100 thì in lỗi tiếng Việt và thoát với mã khác 0",
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
