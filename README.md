# Trái tim

Trái tim màu hồng phát sáng trên nền đen. Giao diện giữ phong cách hạt sáng mịn: các hạt vòng ngoài trôi nhẹ và nhấp nháy như bản đầu, trong khi viền tim không co giãn. Chỉ lõi phía trong đập hai nhịp.

## Chạy

```bash
python -m http.server 8000
```

Mở `http://localhost:8000`.

## Tương tác

- Cuộn con lăn hoặc nhấn +/− để phóng to/thu nhỏ.
- Chụm hoặc mở hai ngón tay trên điện thoại để zoom.
- Kéo để xem các khu vực khác khi phóng to.
- Nhấn 100% hoặc nhấp đúp vào nền để đặt lại.
- Chạm trái tim để tạo thêm nhịp đập.

## Cấu trúc

- `index.html`: bố cục và điều khiển zoom.
- `styles.css`: giao diện tối giản.
- `src/main.js`: khởi tạo và gắn sự kiện cho nút.
- `src/scene.js`: vẽ, phóng to, thao tác chuột và cảm ứng.
- `src/particles.js`: hạt của lớp vỏ và lõi.
- `src/motion.js`: chuyển động và độ sáng của hạt vòng ngoài.
- `src/geometry.js`: công thức trái tim.
- `src/heartbeat.js`: nhịp đập đôi.
- `src/config.js`: mật độ hạt, màu sắc, zoom.
- `tests/`: kiểm thử.

## Kiểm thử

```bash
npm test
```

## Giấy phép

MIT.
