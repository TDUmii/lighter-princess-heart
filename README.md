# Trái tim

Dựng một trái tim hạt 3D mềm mại lấy cảm hứng từ cảnh Lý Tuân trong phim *Chiếc Bật Lửa và Váy Công Chúa*.

**Website:** https://tdumii.github.io/lighter-princess-heart/

## Phiên bản 4.0

Dựng lại toàn bộ hệ hiệu ứng thay vì sửa tiếp thuật toán cũ. Đám hạt được tổ chức thành ba lớp độc lập:

- **Lõi 3D:** hàng nghìn hạt có tọa độ trước/sau và độ sáng theo chiều sâu; co tròn vào tâm rồi nở ra.
- **Lớp vỏ:** hạt phân bố mềm quanh đường bao, thay đổi độ sáng và co bóp nhẹ theo cùng nhịp, không tạo viền cứng.
- **Hạt bung:** một đợt ngắn bật ra khỏi viền khi tim nở đến gần đỉnh, rồi mờ và biến mất.

Nhịp 0,90 giây được chọn sau khi lấy mẫu các khung hình từ clip phim tham khảo. Ánh sáng hồng nhẹ tỏa từ nền phía sau toàn bộ tim. Khi phóng to, các hạt hiện hình trái tim nhỏ và câu **love you** viết tay xuất hiện ở vùng trung tâm.

Tương thích điện thoại và desktop. Dùng WebGL2 tăng tốc GPU và Canvas2D dự phòng khi thiết bị không hỗ trợ. Có chế độ giảm chuyển động và tự giảm độ phân giải khi tốc độ khung hình thấp.

## Chạy dự án

Không cần thư viện ngoài hoặc quá trình build:

```bash
python -m http.server 8000
```

Mở http://localhost:8000.

## Cấu trúc

```text
src/
  main.js
  v4/
    config.js
    geometry.js
    heartbeat.js
    particles.js
    layers/
      core.js
      shell.js
      burst.js
    shaders.js
    renderer.js
    fallback.js
    scene.js
tests/
  v4.test.js
```

`npm test` chạy kiểm thử hình học, trường 3D, luồng hạt và nhịp. `npm run check` kiểm tra cú pháp.

## Nguồn tham khảo và QA

- [Kế hoạch dựng mới](./V4_BUILD_PLAN.md).
- [Kiểm thử kỹ thuật và đối chiếu hình](./V4_QA.md).
- [Video trái tim trong phim](https://www.bilibili.com/video/BV1Bg411B7md/), đặc biệt đoạn 69–72,2 giây.
- [Bài giải thích tái tạo hiệu ứng](https://www.cnblogs.com/crossin/p/16912110.html).

Đây là chương trình mới lấy cảnh phim làm chuẩn tham khảo, **không phải mã nguồn/hiệu ứng gốc được trích xuất**, và chưa thể khẳng định giống tuyệt đối từng khung hình.

Phiên bản 3.3 được bảo lưu trong lịch sử Git tại tag `v3.3-before-rebuild`.

## Giấy phép

MIT.

## Phiên bản 4.1: góc nhìn 3D

- Kéo chuột hoặc vuốt một ngón để xoay khối tim quanh 360° theo chiều ngang, nghiêng lên/xuống.
- Bản 4.1 từng có xoay tự động; từ phiên bản 4.5 đã bỏ tự xoay hoàn toàn.
- Chữ **love you** chỉ hiện khi zoom sâu vào trung tâm, và vẫn hướng người xem ở mọi góc.
- Đáy tim được bo và rút ngắn; giữ lõi 3D, vỏ hạt mềm và hạt bắn ra ở đỉnh nhịp.
- Chế độ Canvas2D dự phòng cũng hỗ trợ quay góc nhìn.
- [Báo cáo kiểm thử 4.1](./V4_1_QA.md).
## Phiên bản 4.2 - Khối tim 3D tròn đầy
- Lõi có độ dày 3D theo đường bao thực tế, vỏ bám mặt cong trước/sau thay vì tập trung trên một đường dọc phẳng.
- Hạt bung ra theo pháp tuyến 3D (cả trục Z), hình nhìn từ cạnh tròn và ít vạch viền cứng hơn.
- Chữ `love you` ẩn ở 100% và chỉ hiển thị khi zoom sâu vào tâm, dù đang xoay ở góc nào.
- Đã loại dòng hướng dẫn ở góc màn hình, giữ các nút xoay và zoom.
- [Báo cáo kiểm thử 4.2](./V4_2_QA.md).

## Phiên bản 4.3 - Dựng lại khối tim 3D thật

- Thay hình học 2D kéo dày bằng **trường hình khối 3D liên tục**, gồm hai múi cầu trên kết hợp mềm với phần thân bo cong và thu dần về đáy.
- Toàn bộ hạt lõi được lấy mẫu trong **thể tích 3D**. Các hạt vỏ và hạt bung được lấy mẫu trên **bề mặt khối 3D** cùng pháp tuyến 3 trục.
- Xoay ngang không còn đỉnh bị cắt phẳng hoặc dải sáng ghép giữa hai mặt; rìa hồng sáng rõ hơn còn phần tâm dịu hơn.
- Giữ nhịp 0,9 giây, góc quay 360°, phóng to, chữ `love you` chỉ xuất hiện khi zoom sâu, và không có dòng hướng dẫn ở góc.
- Bản 4.2 cũ được giữ trong lịch sử Git để có thể hoàn nguyên.
- [Báo cáo kiểm thử hình học và đối chiếu ảnh phim 4.3](./V4_3_QA.md).

Cảnh phim chỉ cung cấp ảnh/video tham khảo; đây không phải mã nguồn, rig hoặc dữ liệu hoạt hình chính thức của đoàn phim.

## Phiên bản 4.4 — Trái tim hồng tròn theo ảnh mẫu

- Dựng lại dáng tim bằng **một phương trình khối 3D duy nhất** thay vì ghép các elip dễ làm méo hai múi.
- Hai múi trên tròn đầy, phần lõm cân đối, thân thu mềm về đáy; góc nhìn ngang là một khối cong, không có mặt cắt phẳng.
- Phần giữa tối sâu hơn; viền là hạt hồng trắng có quầng sáng mạnh hơn, rải thêm một số trái tim nhỏ lấp lánh.
- Góc nhìn đầu tiên hướng gần chính diện, khối tim lớn và rõ hơn trên màn hình.
- Giữ xoay 3D, nhịp 0,90 giây, hạt bung theo bề mặt, zoom và chữ `love you` ẩn ở chế độ bình thường.
- [Báo cáo kiểm thử 4.4](./V4_4_QA.md).

Ảnh mẫu là hình nghệ thuật tĩnh được dùng làm định hướng phong cách; bản web là hiệu ứng 3D lập trình độc lập chứ không chèn ảnh vào nền.

## Phiên bản 4.5 — Nhịp co rõ, nhiều trái tim nhỏ và camera đứng yên

- Pha **nén vào tâm** tăng mạnh, đồng bộ cả chiều sâu 3D; sau đó tim bật nở rồi hồi nhẹ theo chu kỳ 0,90 giây.
- Các hạt hình trái tim nhỏ xuất hiện nhiều hơn ở bên trong; hạt bay khỏi mặt ngoài cũng là trái tim mini thay vì chỉ là chấm sáng.
- Số hạt bung tăng lên 2.000 (desktop) và 850 (mobile), đi xa hơn một chút nhưng vẫn tắt nhanh theo nhịp.
- **Tắt hoàn toàn tự xoay**, kể cả quán tính sau khi kéo. Vẫn kéo bằng chuột/vuốt để xoay thủ công.
- Nút **⟲ Chính diện** nằm giữa phía dưới, đưa tim về góc nhìn trước; nút zoom ở phía dưới bên phải.
- Chữ bí mật vẫn chỉ hiện khi phóng to sâu vào giữa tim.
- [Báo cáo QA phiên bản 4.5](./V4_5_QA.md).

## Phiên bản 4.6 — Trái tim nhỏ bay trở về khi co

- Khắc phục lỗi trước đây: khi tim co, chỉ có toàn bộ khối hạt thu nhỏ còn những trái tim nhỏ ngoài viền thì biến mất.
- Sau pha bung ra, các **trái tim mini bay ngược từ bên ngoài về tim** theo hướng pháp tuyến 3D của từng hạt, rồi tiến vào bên trong lớp vỏ.
- Quỹ đạo trở về chuyển tiếp mượt qua ranh giới giữa hai nhịp, không nhảy vị trí khi đồng hồ nhịp quay về 0.
- Các hạt quay về sáng và lớn hơn nhẹ để dễ phân biệt; chuyển động nén cả khối vẫn giữ nguyên.
- Không tự xoay; nút **⟲ Chính diện** vẫn ở giữa. Chữ `love you` chỉ hiện khi zoom sâu.
- [Báo cáo kiểm thử v4.6](./V4_6_QA.md).

## Phiên bản 4.7 — Bay ra bằng bay về, nhịp tim cân đối

- Sửa sai lệch của 4.6: **hạt bay ra và bay về dùng cùng một quỹ đạo 3D**, cùng quãng đường tối đa **6 đơn vị**, không có cảnh hạt đột ngột xuất hiện ở xa tim.
- Hai nửa chuyển động bằng nhau, mỗi nửa 0,445 chu kỳ; hạt bay ra đến điểm xa nhất rồi **đảo chiều và bay về đúng vị trí xuất phát** trên bề mặt 3D.
- Tăng độ rõ của hạt bay ra ở vùng viền tim, giữ nguyên chiều sâu của cả khối; kích thước và độ sáng trái tim mini giống nhau ở hai chiều.
- Biên độ co/nở của tim được cân thành **−11,5% / +11,5%** (tại điểm có trọng số 1), thay vì co mạnh hơn nở.
- Giữ xoay thủ công, nút **⟲ Chính diện** và dòng chữ `love you` chỉ hiện khi zoom sâu.
- [Báo cáo kiểm thử và so sánh v4.7](./V4_7_QA.md).
