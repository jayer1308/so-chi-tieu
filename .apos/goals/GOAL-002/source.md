# Sổ chi tiêu — brief GOAL-002 (giới hạn số dòng liệt kê)

Lệnh `liet-ke` hiện luôn in toàn bộ các khoản chi. Goal này thêm cờ
`--gioi-han N` để chỉ xem N khoản mới nhất.

## Yêu cầu

1. `sct liet-ke [--thang YYYY-MM] [--danh-muc <ten>] [--gioi-han N]` chấp nhận cờ mới `--gioi-han N`.
2. Khi có `--gioi-han N`, chỉ hiển thị N khoản chi mới nhất (thứ tự mới nhất trước như cũ).
3. Khi không có cờ `--gioi-han`, hiển thị tất cả các khoản chi như cũ.
4. N phải là số nguyên lớn hơn 0.
5. N không hợp lệ (0, số âm, không phải số) thì in thông báo lỗi bằng tiếng Việt và thoát với mã khác 0, không in danh sách.

## Ngoài phạm vi

6. Mọi thứ khác không đổi: các lệnh them, tong-ket, xoa, xuat; định dạng hiển thị; file dữ liệu.
