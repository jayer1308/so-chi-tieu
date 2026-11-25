# GOAL-002 v1: Lệnh liet-ke thêm cờ --gioi-han N: chỉ hiện N khoản chi mới nhất; N không hợp lệ bị từ chối bằng lỗi tiếng Việt

Status: closed

```json
{
  "id": "GOAL-002",
  "version": 1,
  "outcome": "Lệnh liet-ke thêm cờ --gioi-han N: chỉ hiện N khoản chi mới nhất; N không hợp lệ bị từ chối bằng lỗi tiếng Việt",
  "source": {
    "path": "brief-002.md",
    "sha256": "4d33a6e3e4edb0441bffab5f0876ade71a74f64fd3df0adf560ef5ddd6dce807",
    "capturedAt": "2026-11-25T03:04:38.644Z",
    "origin": "human"
  },
  "requirements": [
    {
      "id": "R-1",
      "sourceSpan": "dòng 8",
      "text": "Lệnh liet-ke chấp nhận cờ mới --gioi-han N",
      "disposition": "acceptance"
    },
    {
      "id": "R-2",
      "sourceSpan": "dòng 9",
      "text": "Khi có --gioi-han N, chỉ hiển thị N khoản chi mới nhất (thứ tự mới nhất trước như cũ)",
      "disposition": "acceptance"
    },
    {
      "id": "R-3",
      "sourceSpan": "dòng 10",
      "text": "Khi không có cờ --gioi-han, hiển thị tất cả các khoản chi như cũ",
      "disposition": "acceptance"
    },
    {
      "id": "R-4",
      "sourceSpan": "dòng 11",
      "text": "N phải là số nguyên lớn hơn 0",
      "disposition": "acceptance"
    },
    {
      "id": "R-5",
      "sourceSpan": "dòng 12",
      "text": "N không hợp lệ (0, số âm, không phải số) thì in thông báo lỗi bằng tiếng Việt và thoát với mã khác 0, không in danh sách",
      "disposition": "acceptance"
    },
    {
      "id": "R-6",
      "sourceSpan": "dòng 16",
      "text": "Mọi thứ khác không đổi: các lệnh them, tong-ket, xoa, xuat; định dạng hiển thị; file dữ liệu",
      "disposition": "excluded",
      "exclusion": {
        "kind": "out-of-scope"
      },
      "exclusionReason": "Ngoài phạm vi theo brief"
    }
  ],
  "scope": [
    "src/"
  ],
  "exclusions": [
    "mọi thay đổi khác ngoài cờ --gioi-han của liet-ke"
  ],
  "acceptance": [
    {
      "id": "AC-1",
      "text": "Liệt kê có giới hạn: liet-ke --gioi-han N chỉ hiển thị N khoản chi mới nhất, thứ tự mới nhất trước",
      "requirementIds": [
        "R-1",
        "R-2"
      ],
      "examples": [
        {
          "input": "liet-ke --gioi-han 2 (với 3 khoản chi đã lưu)",
          "expected": "chỉ 2 khoản chi mới nhất hiển thị, khoản cũ nhất không hiển thị"
        }
      ],
      "boundaries": [
        "N bằng đúng số khoản chi thì hiện tất cả",
        "N lớn hơn số khoản chi thì hiện tất cả"
      ],
      "prohibited": [
        "không được hiển thị khoản chi cũ hơn N khoản mới nhất"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-2",
      "text": "Không có cờ thì hiện tất cả: liet-ke không có --gioi-han hiển thị toàn bộ các khoản chi như cũ",
      "requirementIds": [
        "R-1",
        "R-3"
      ],
      "examples": [
        {
          "input": "liet-ke",
          "expected": "tất cả các khoản chi hiển thị, mới nhất trước"
        }
      ],
      "boundaries": [
        "không có khoản chi nào thì in danh sách rỗng, không báo lỗi"
      ],
      "prohibited": [
        "không được bớt khoản chi nào khi không có cờ --gioi-han"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-3",
      "text": "N không hợp lệ bị từ chối: --gioi-han 0, số âm hoặc không phải số thì in lỗi tiếng Việt và thoát với mã khác 0",
      "requirementIds": [
        "R-4",
        "R-5"
      ],
      "examples": [
        {
          "input": "liet-ke --gioi-han 0",
          "expected": "lỗi bằng tiếng Việt, thoát với mã khác 0, không in danh sách"
        },
        {
          "input": "liet-ke --gioi-han -1",
          "expected": "lỗi bằng tiếng Việt, thoát với mã khác 0, không in danh sách"
        },
        {
          "input": "liet-ke --gioi-han abc",
          "expected": "lỗi bằng tiếng Việt, thoát với mã khác 0, không in danh sách"
        }
      ],
      "boundaries": [
        "N là số thập phân (ví dụ 1.5) cũng bị từ chối"
      ],
      "prohibited": [
        "không được in danh sách khi N không hợp lệ"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    }
  ],
  "checks": [
    {
      "id": "CHK-1",
      "kind": "command",
      "command": "npm test",
      "expect": "pass",
      "runs": 1,
      "timeoutMs": 600000,
      "env": {}
    },
    {
      "id": "CHK-2",
      "kind": "command",
      "command": "npm run build",
      "expect": "pass",
      "runs": 1,
      "timeoutMs": 600000,
      "env": {}
    }
  ],
  "dependencies": [],
  "priority": 1
}
```
