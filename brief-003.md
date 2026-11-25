# Sổ chi tiêu — brief GOAL-003 (tổng kết cả năm)

Lệnh `tong-ket` hiện chỉ tổng kết một tháng. Goal này thêm cờ
`--nam YYYY` để tổng kết cả năm theo từng tháng.

## Yêu cầu

1. `sct tong-ket [--thang YYYY-MM] [--nam YYYY]` chấp nhận cờ mới `--nam YYYY`.
2. Khi có `--nam YYYY`, hiển thị tổng kết cả năm: mỗi tháng một dòng (tháng, tổng chi, số khoản).
3. Khi không có cờ `--nam`, giữ nguyên hành vi cũ (tổng kết tháng hiện tại, hoặc theo --thang nếu có).
4. Năm phải là số nguyên trong khoảng 1900–2100.
5. Năm không hợp lệ (không phải số, ngoài khoảng 1900–2100) thì in thông báo lỗi bằng tiếng Việt và thoát với mã khác 0, không in tổng kết.

## Ngoài phạm vi

6. Mọi thứ khác không đổi: các lệnh them, liet-ke, xoa, xuat; định dạng hiển thị của tổng kết tháng; file dữ liệu.
