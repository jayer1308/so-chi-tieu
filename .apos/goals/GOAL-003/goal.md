# GOAL-003 v1: Lệnh tong-ket thêm cờ --nam YYYY: tổng kết cả năm theo từng tháng; năm không hợp lệ bị từ chối bằng lỗi tiếng Việt

Status: executing

```json
{
  "id": "GOAL-003",
  "version": 1,
  "outcome": "Lệnh tong-ket thêm cờ --nam YYYY: tổng kết cả năm theo từng tháng; năm không hợp lệ bị từ chối bằng lỗi tiếng Việt",
  "source": {
    "path": "brief-003.md",
    "sha256": "9a548b9712c4e8ea0202ab2bfb85d53d47a6835648e151ea0986574316ce5ce0",
    "capturedAt": "2026-11-25T03:51:38.626Z",
    "origin": "human"
  },
  "requirements": [
    {
      "id": "R-1",
      "sourceSpan": "dòng 8",
      "text": "Lệnh tong-ket chấp nhận cờ mới --nam YYYY",
      "disposition": "acceptance"
    },
    {
      "id": "R-2",
      "sourceSpan": "dòng 9",
      "text": "Khi có --nam YYYY, hiển thị tổng kết cả năm: mỗi tháng một dòng (tháng, tổng chi, số khoản)",
      "disposition": "acceptance"
    },
    {
      "id": "R-3",
      "sourceSpan": "dòng 10",
      "text": "Khi không có cờ --nam, giữ nguyên hành vi cũ (tổng kết tháng hiện tại, hoặc theo --thang nếu có)",
      "disposition": "acceptance"
    },
    {
      "id": "R-4",
      "sourceSpan": "dòng 11",
      "text": "Năm phải là số nguyên trong khoảng 1900–2100",
      "disposition": "acceptance"
    },
    {
      "id": "R-5",
      "sourceSpan": "dòng 12",
      "text": "Năm không hợp lệ (không phải số, ngoài khoảng 1900–2100) thì in thông báo lỗi bằng tiếng Việt và thoát với mã khác 0, không in tổng kết",
      "disposition": "acceptance"
    },
    {
      "id": "R-6",
      "sourceSpan": "dòng 16",
      "text": "Mọi thứ khác không đổi: các lệnh them, liet-ke, xoa, xuat; định dạng hiển thị của tổng kết tháng; file dữ liệu",
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
    "mọi thay đổi khác ngoài cờ --nam của tong-ket"
  ],
  "acceptance": [
    {
      "id": "AC-1",
      "text": "Tổng kết cả năm: tong-ket --nam YYYY hiển thị đủ 12 tháng, mỗi tháng một dòng gồm tháng, tổng chi và số khoản",
      "requirementIds": [
        "R-1",
        "R-2"
      ],
      "examples": [
        {
          "input": "tong-ket --nam 2026 (với các khoản chi đã lưu trong năm 2026)",
          "expected": "đủ 12 dòng, mỗi dòng một tháng với tổng chi và số khoản đúng"
        }
      ],
      "boundaries": [
        "tháng không có khoản chi thì hiện tổng 0, số khoản 0",
        "thứ tự các tháng từ tháng 1 tới tháng 12"
      ],
      "prohibited": [
        "không được thiếu tháng nào trong 12 tháng",
        "không được tính khoản chi của năm khác vào tổng"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-2",
      "text": "Không có cờ thì như cũ: tong-ket không có --nam tổng kết một tháng như cũ",
      "requirementIds": [
        "R-1",
        "R-3"
      ],
      "examples": [
        {
          "input": "tong-ket",
          "expected": "tổng kết một tháng như cũ (tháng hiện tại, hoặc tháng theo --thang nếu có)"
        }
      ],
      "boundaries": [
        "không có khoản chi nào trong tháng thì in tổng 0 như cũ"
      ],
      "prohibited": [
        "không được đổi định dạng hay nội dung tổng kết tháng khi không có cờ --nam"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-3",
      "text": "Năm không hợp lệ bị từ chối: --nam không phải số hoặc ngoài khoảng 1900–2100 thì in lỗi tiếng Việt và thoát với mã khác 0",
      "requirementIds": [
        "R-4",
        "R-5"
      ],
      "examples": [
        {
          "input": "tong-ket --nam abc",
          "expected": "lỗi bằng tiếng Việt, thoát với mã khác 0, không in tổng kết"
        },
        {
          "input": "tong-ket --nam 1899",
          "expected": "lỗi bằng tiếng Việt, thoát với mã khác 0, không in tổng kết"
        },
        {
          "input": "tong-ket --nam 2101",
          "expected": "lỗi bằng tiếng Việt, thoát với mã khác 0, không in tổng kết"
        }
      ],
      "boundaries": [
        "năm là số thập phân (ví dụ 2026.5) cũng bị từ chối"
      ],
      "prohibited": [
        "không được in tổng kết khi năm không hợp lệ"
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
