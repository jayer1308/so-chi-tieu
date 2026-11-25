# Sổ chi tiêu — brief v1

Sổ chi tiêu là công cụ dòng lệnh (CLI) chạy bằng Node.js, giúp một người ghi lại các khoản chi tiêu hằng ngày và xem lại chúng theo tháng, theo danh mục.

## Lệnh

1. `sct them --so-tien <n> --danh-muc <ten> [--ghi-chu <text>] [--ngay YYYY-MM-DD]` thêm một khoản chi mới.
2. Số tiền (`--so-tien`) phải lớn hơn 0.
3. Danh mục (`--danh-muc`) là bắt buộc.
4. Ngày (`--ngay`) mặc định là hôm nay khi không truyền.
5. `sct liet-ke [--thang YYYY-MM] [--danh-muc <ten>]` liệt kê các khoản chi, khoản mới nhất hiển thị trước.
6. `sct tong-ket [--thang YYYY-MM]` in tổng chi theo từng danh mục và tổng cộng của tháng; không truyền `--thang` thì dùng tháng hiện tại.
7. `sct xoa --id <id>` xóa khoản chi có id đã cho.
8. `sct xuat [--thang YYYY-MM] --file <path>` xuất các khoản chi ra file CSV; `--file` là bắt buộc.

## Dữ liệu

9. Dữ liệu lưu trong một file JSON; mặc định là file `chi-tieu.json` trong thư mục làm việc.
10. Người dùng có thể chỉ định file dữ liệu khác bằng `--data <path>`.
11. Mỗi khoản chi có id duy nhất, số tiền, danh mục, ngày và ghi chú (tùy chọn).

## Lỗi

12. Khi nhập liệu sai (thiếu danh mục, số tiền không lớn hơn 0, ngày sai định dạng, id không tồn tại, thiếu `--file` khi xuất), chương trình in thông báo lỗi bằng tiếng Việt và thoát với mã khác 0.

## Ngoài phạm vi v1

13. Không đồng bộ dữ liệu qua mạng.
14. Không dùng cơ sở dữ liệu ngoài file JSON.
15. Không có giao diện web.
