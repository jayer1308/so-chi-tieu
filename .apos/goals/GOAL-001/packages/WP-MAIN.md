# WP-MAIN v1: Sổ chi tiêu v1: CLI thêm, liệt kê, tổng kết, xóa và xuất CSV các khoản chi, dữ liệu lưu file JSON

```json
{
  "id": "WP-MAIN",
  "goalId": "GOAL-001",
  "goalVersion": 1,
  "version": 1,
  "owner": "lead",
  "outcome": "Sổ chi tiêu v1: CLI thêm, liệt kê, tổng kết, xóa và xuất CSV các khoản chi, dữ liệu lưu file JSON",
  "scope": [
    "src/"
  ],
  "exclusions": [
    "đồng bộ dữ liệu qua mạng",
    "cơ sở dữ liệu ngoài file JSON",
    "giao diện web"
  ],
  "dependencies": [],
  "interfaces": [
    "EXEC-1@v1"
  ],
  "acceptance": [
    {
      "id": "AC-1",
      "text": "Thêm khoản chi: lưu được khoản chi với số tiền, danh mục, ngày (mặc định hôm nay) và ghi chú; mỗi khoản chi có id duy nhất; dữ liệu nằm trong file JSON mặc định hoặc file chỉ định bằng --data",
      "goalAcceptanceId": "AC-1",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-2",
      "text": "Kiểm tra đầu vào của lệnh them: số tiền phải lớn hơn 0, danh mục bắt buộc, ngày phải đúng định dạng YYYY-MM-DD và là ngày có thật; khi sai, in lỗi tiếng Việt và thoát với mã khác 0",
      "goalAcceptanceId": "AC-2",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-3",
      "text": "Liệt kê khoản chi: khoản mới nhất hiển thị trước; lọc được theo tháng (--thang) và theo danh mục (--danh-muc)",
      "goalAcceptanceId": "AC-3",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-4",
      "text": "Tổng kết tháng: in tổng chi theo từng danh mục và tổng cộng của tháng; không truyền --thang thì dùng tháng hiện tại",
      "goalAcceptanceId": "AC-4",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-5",
      "text": "Xóa khoản chi: xoa --id xóa đúng khoản chi có id đó; id không tồn tại thì lỗi tiếng Việt, thoát với mã khác 0",
      "goalAcceptanceId": "AC-5",
      "checkIds": [
        "CHK-1",
        "CHK-2"
      ]
    },
    {
      "id": "AC-6",
      "text": "Xuất CSV: xuat ghi các khoản chi ra file CSV chỉ định bằng --file; thiếu --file thì lỗi tiếng Việt, thoát với mã khác 0",
      "goalAcceptanceId": "AC-6",
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
