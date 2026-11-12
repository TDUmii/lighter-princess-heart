# Trái tim

Một trái tim bằng hạt sáng màu hồng, lấy cảm hứng từ cảnh lập trình trong phim *Chiếc Bật Lửa và Váy Công Chúa*. Dự án sử dụng WebGL2 để tạo chuyển động mềm mại, quầng sáng và các tia sáng giữa nền đêm.

**Xem trực tiếp:** https://tdumii.github.io/lighter-princess-heart/

## Hiệu ứng

- Viền tim ổn định, hạt vòng ngoài trôi và nhấp nháy liên tục.
- Lõi tim đập hai nhịp với mức co giãn khác nhau theo vị trí.
- Hào quang, chùm tia hồng lan ra từ tâm và điểm sáng nền.
- Phóng to bằng con lăn, chụm hai ngón hoặc nút +/−; kéo khi đã zoom.
- Tự giảm độ phân giải khi thiết bị không đủ nhanh và có Canvas dự phòng.

## Chạy tại máy

```bash
python -m http.server 8000
```

Mở http://localhost:8000. Không cần npm install hoặc CDN.

## Cấu trúc

| Thành phần | Vai trò |
| --- | --- |
| `src/main.js` | Khởi tạo và kết nối nút zoom |
| `src/scene.js` | Vòng lặp hoạt ảnh và điều khiển |
| `src/config.js` | Thông số thiết kế và hiệu năng |
| `src/geometry.js` | Phương trình, điểm bên trong và trên viền tim |
| `src/art/particles.js` | Tạo dữ liệu đám hạt |
| `src/art/heartbeat.js` | Nhịp tim hai đỉnh |
| `src/gpu/shaders.js` | Shader hạt, nền trời đêm và tia sáng |
| `src/gpu/renderer.js` | Vẽ bằng GPU |
| `src/fallback.js` | Bộ vẽ Canvas 2D dự phòng |
| `tests/` | Kiểm thử tự động |

Kế hoạch tái dựng và các nguồn đối chiếu nằm trong [REBUILD_PLAN.md](./REBUILD_PLAN.md).

## Kiểm thử

```bash
npm test
```

## Giấy phép

MIT. Đây là tác phẩm được lập trình mới, không phải mã nguồn hoặc hiệu ứng chính thức được trích xuất từ phim.
