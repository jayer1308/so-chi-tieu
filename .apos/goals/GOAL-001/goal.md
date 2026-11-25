# GOAL-001 v1: Sổ chi tiêu v1: CLI thêm, liệt kê, tổng kết, xóa và xuất CSV các khoản chi, dữ liệu lưu file JSON

Status: executing

```json
{
  "id": "GOAL-001",
  "version": 1,
  "outcome": "Sổ chi tiêu v1: CLI thêm, liệt kê, tổng kết, xóa và xuất CSV các khoản chi, dữ liệu lưu file JSON",
  "source": {
    "path": "brief.md",
    "sha256": "e7ddd7bbf2eee2a2fd56cd77fb9a7a96f4980c521c932aa778038b60ba5e93f2",
    "capturedAt": "2026-11-25T02:30:59.882Z",
    "origin": "human"
  },
  "requirements": [
    {
      "id": "R-1",
      "sourceSpan": "dòng 7",
      "text": "Lệnh them thêm một khoản chi mới với --so-tien, --danh-muc, --ghi-chu tùy chọn và --ngay tùy chọn",
      "disposition": "acceptance"
    },
    {
      "id": "R-2",
      "sourceSpan": "dòng 8",
      "text": "Số tiền (--so-tien) phải lớn hơn 0",
      "disposition": "acceptance"
    },
    {
      "id": "R-3",
      "sourceSpan": "dòng 9",
      "text": "Danh mục (--danh-muc) là bắt buộc",
      "disposition": "acceptance"
    },
    {
      "id": "R-4",
      "sourceSpan": "dòng 10",
      "text": "Ngày (--ngay) mặc định là hôm nay khi không truyền",
      "disposition": "acceptance"
    },
    {
      "id": "R-5",
      "sourceSpan": "dòng 11",
      "text": "Lệnh liet-ke liệt kê các khoản chi, khoản mới nhất hiển thị trước, lọc được theo --thang và --danh-muc",
      "disposition": "acceptance"
    },
    {
      "id": "R-6",
      "sourceSpan": "dòng 12",
      "text": "Lệnh tong-ket in tổng chi theo từng danh mục và tổng cộng của tháng; không truyền --thang thì dùng tháng hiện tại",
      "disposition": "acceptance"
    },
    {
      "id": "R-7",
      "sourceSpan": "dòng 13",
      "text": "Lệnh xoa --id xóa khoản chi có id đã cho",
      "disposition": "acceptance"
    },
    {
      "id": "R-8",
      "sourceSpan": "dòng 14",
      "text": "Lệnh xuat xuất các khoản chi ra file CSV; --file là bắt buộc",
      "disposition": "acceptance"
    },
    {
      "id": "R-9",
      "sourceSpan": "dòng 18",
      "text": "Dữ liệu lưu trong một file JSON; mặc định là file chi-tieu.json trong thư mục làm việc",
      "disposition": "acceptance"
    },
    {
      "id": "R-10",
      "sourceSpan": "dòng 19",
      "text": "Người dùng có thể chỉ định file dữ liệu khác bằng --data <path>",
      "disposition": "acceptance"
    },
    {
      "id": "R-11",
      "sourceSpan": "dòng 20",
      "text": "Mỗi khoản chi có id duy nhất, số tiền, danh mục, ngày và ghi chú (tùy chọn)",
      "disposition": "acceptance"
    },
    {
      "id": "R-12",
      "sourceSpan": "dòng 24",
      "text": "Khi nhập liệu sai, chương trình in thông báo lỗi bằng tiếng Việt và thoát với mã khác 0",
      "disposition": "acceptance"
    },
    {
      "id": "R-13",
      "sourceSpan": "dòng 28",
      "text": "Không đồng bộ dữ liệu qua mạng",
      "disposition": "excluded",
      "exclusion": {
        "kind": "out-of-scope"
      },
      "exclusionReason": "Ngoài phạm vi v1 theo brief"
    },
    {
      "id": "R-14",
      "sourceSpan": "dòng 29",
      "text": "Không dùng cơ sở dữ liệu ngoài file JSON",
      "disposition": "excluded",
      "exclusion": {
        "kind": "out-of-scope"
      },
      "exclusionReason": "Ngoài phạm vi v1 theo brief"
    },
    {
      "id": "R-15",
      "sourceSpan": "dòng 30",
      "text": "Không có giao diện web",
      "disposition": "excluded",
      "exclusion": {
        "kind": "out-of-scope"
      },
      "exclusionReason": "Ngoài phạm vi v1 theo brief"
    }
  ],
  "scope": [
    "src/"
  ],
  "exclusions": [
    "đồng bộ dữ liệu qua mạng",
    "cơ sở dữ liệu ngoài file JSON",
    "giao diện web"
  ],
  "acceptance": [
    {
      "id": "AC-1",
      "text": "Thêm khoản chi: lưu được khoản chi với số tiền, danh mục, ngày (mặc định hôm nay) và ghi chú; mỗi khoản chi có id duy nhất; dữ liệu nằm trong file JSON mặc định hoặc file chỉ định bằng --data",
      "requirementIds": [
        "R-1",
        "R-4",
        "R-9",
        "R-10",
        "R-11"
      ],
      "examples": [
        {
          "input": "them --so-tien 50000 --danh-muc an-uong",
          "expected": "khoản chi 50000, danh mục an-uong, ngày hôm nay được lưu vào chi-tieu.json"
        },
        {
          "input": "them --so-tien 20000 --danh-muc di-lai --ngay 2026-11-20 --ghi-chu \"xe ôm\"",
          "expected": "khoản chi lưu đúng ngày 2026-11-20 và ghi chú xe ôm"
        }
      ],
      "boundaries": [
        "thêm hai khoản chi liên tiếp phải có id khác nhau",
        "thêm khoản chi không được ghi đè các khoản chi đã lưu trước đó"
      ],
      "prohibited": [
        "không được lưu khoản chi khi thiếu danh mục hoặc số tiền không lớn hơn 0"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-2",
      "text": "Kiểm tra đầu vào của lệnh them: số tiền phải lớn hơn 0, danh mục bắt buộc, ngày phải đúng định dạng YYYY-MM-DD và là ngày có thật; khi sai, in lỗi tiếng Việt và thoát với mã khác 0",
      "requirementIds": [
        "R-2",
        "R-3",
        "R-12"
      ],
      "examples": [
        {
          "input": "them --so-tien 0 --danh-muc an-uong",
          "expected": "lỗi bằng tiếng Việt, thoát với mã khác 0, không lưu khoản chi"
        },
        {
          "input": "them --so-tien 50000",
          "expected": "lỗi thiếu danh mục bằng tiếng Việt, thoát với mã khác 0"
        }
      ],
      "boundaries": [
        "số tiền 1 đồng là hợp lệ",
        "ngày 2026-02-30 (không tồn tại) bị từ chối"
      ],
      "prohibited": [
        "không được lưu khoản chi không hợp lệ vào file dữ liệu"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-3",
      "text": "Liệt kê khoản chi: khoản mới nhất hiển thị trước; lọc được theo tháng (--thang) và theo danh mục (--danh-muc)",
      "requirementIds": [
        "R-5"
      ],
      "examples": [
        {
          "input": "liet-ke",
          "expected": "các khoản chi hiển thị theo thứ tự mới nhất trước"
        },
        {
          "input": "liet-ke --thang 2026-11 --danh-muc an-uong",
          "expected": "chỉ hiển thị khoản chi tháng 11/2026 thuộc danh mục an-uong"
        }
      ],
      "boundaries": [
        "không có khoản chi nào thì in danh sách rỗng, không báo lỗi"
      ],
      "prohibited": [
        "không được hiển thị khoản chi ngoài bộ lọc đã chọn"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-4",
      "text": "Tổng kết tháng: in tổng chi theo từng danh mục và tổng cộng của tháng; không truyền --thang thì dùng tháng hiện tại",
      "requirementIds": [
        "R-6"
      ],
      "examples": [
        {
          "input": "tong-ket --thang 2026-11",
          "expected": "tổng chi theo từng danh mục của tháng 11/2026 và tổng cộng của tháng"
        }
      ],
      "boundaries": [
        "tháng không có khoản chi thì tổng bằng 0",
        "khoản chi tháng khác không được tính vào tổng của tháng đang xem"
      ],
      "prohibited": [
        "không được cộng trùng một khoản chi vào tổng"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-5",
      "text": "Xóa khoản chi: xoa --id xóa đúng khoản chi có id đó; id không tồn tại thì lỗi tiếng Việt, thoát với mã khác 0",
      "requirementIds": [
        "R-7",
        "R-12"
      ],
      "examples": [
        {
          "input": "xoa --id <id của khoản chi vừa thêm>",
          "expected": "khoản chi biến mất khỏi danh sách, các khoản chi khác còn nguyên"
        },
        {
          "input": "xoa --id khong-ton-tai",
          "expected": "lỗi bằng tiếng Việt, thoát với mã khác 0"
        }
      ],
      "boundaries": [
        "xóa xong liệt kê lại không còn khoản chi đó"
      ],
      "prohibited": [
        "không được xóa khoản chi khác id đã cho"
      ],
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-6",
      "text": "Xuất CSV: xuat ghi các khoản chi ra file CSV chỉ định bằng --file; thiếu --file thì lỗi tiếng Việt, thoát với mã khác 0",
      "requirementIds": [
        "R-8",
        "R-12"
      ],
      "examples": [
        {
          "input": "xuat --file chi-tieu-11.csv",
          "expected": "file CSV được tạo, chứa các khoản chi với đủ cột id, ngày, danh mục, số tiền, ghi chú"
        },
        {
          "input": "xuat",
          "expected": "lỗi thiếu --file bằng tiếng Việt, thoát với mã khác 0"
        }
      ],
      "boundaries": [
        "xuất khi không có khoản chi nào thì tạo file CSV chỉ có dòng tiêu đề"
      ],
      "prohibited": [
        "không được ghi đè file dữ liệu JSON khi xuất CSV"
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
