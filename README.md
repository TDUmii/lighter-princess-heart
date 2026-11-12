# Trái tim

Hiệu ứng trái tim màu hồng trên nền đen được tạo từ các hạt sáng. Vòng ngoài giữ nguyên vị trí, phần lõi bên trong đập nhịp đôi.

## Chạy thử

Dùng một máy chủ tĩnh để hỗ trợ JavaScript modules:

```bash
python -m http.server 8000
```

Mở `http://localhost:8000`.

## Cấu trúc

- `index.html`: trang web.
- `styles.css`: giao diện.
- `src/main.js`: điểm bắt đầu.
- `src/scene.js`: khung hình và vòng lặp hoạt ảnh.
- `src/particles.js`: tạo và vẽ các lớp hạt.
- `src/geometry.js`: công thức hình trái tim và lấy mẫu.
- `src/heartbeat.js`: nhịp tim.
- `src/config.js`: màu sắc, kích thước và mật độ hạt.
- `tests/`: kiểm thử những hàm không phụ thuộc trình duyệt.

## Tùy chỉnh

Điều chỉnh `coreParticles` và `shellParticles` trong `src/config.js` để thay đổi mật độ. Thay `beatStrength` để chỉnh độ mạnh của nhịp. Thay `coreSize` để chỉnh kích thước lõi.

Vòng ngoài được kết xuất một lần vào lớp Canvas riêng. Trong lúc chạy chỉ lõi được co giãn và các điểm sáng bên trong nhấp nháy. Trang không dùng thư viện ngoài.

## Kiểm thử

```bash
npm test
```

## Giấy phép

MIT.
