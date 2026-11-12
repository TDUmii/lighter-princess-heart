# Film motion QA - Trái tim v3.3

## Nguồn video thực

- Đoạn video: [“点燃我，温暖你” 爱心片段](https://www.bilibili.com/video/BV1Bg411B7md/), uploader Xuxu许先生, xuất bản ngày 06/11/2022.
- Đây là trích đoạn đăng lại, dùng để **quan sát chuyển động**, không giả định các thông số thu được là thông số chính thức của phim.
- Trái tim xuất hiện khoảng **64,5–66,3 giây** và **69,0–72,2 giây** trong clip.
- Không lưu video, ảnh chụp hoặc âm thanh phim trong repository. Các ảnh QA chỉ nằm trong `QA_TEMP/` trên máy kiểm thử, được loại trừ bằng `.gitignore`.

## Đọc từng frame

- Lấy **33 frame**, cách nhau 0,1 giây từ 69,0 đến 72,2 giây.
- Thống kê nhịp trên 30 frame 69,0–71,9 giây, kích thước screenshot video 732 × 412.
- Vùng ảnh khảo sát: x = 240..465, y = 105..320.
- Phân đoạn vùng hồng nổi bật theo điều kiện `R>82 && R>1.28G && R>1.05B && R>max(G,B)+14`.
- Dùng percentile x3–x97, y3–y97 để giảm ảnh hưởng của ánh sáng rời rạc.
- Khớp hàm tuần hoàn `offset + trend*t + a*sin(2πt/P) + b*cos(2πt/P)` với P từ 0,65 đến 1,25 giây, bước 0,005 giây.

### Kết quả đo

| Tiêu chí | Ước lượng từ clip |
| --- | --- |
| Chu kỳ từ dao động chiều rộng | **0,895 giây** |
| Chu kỳ từ dao động chiều cao | **0,890 giây** |
| Chu kỳ từ số pixel hồng | ~0,930 giây (nhiễu hơn) |
| Mức biến thiên chiều rộng thô | 169–187 px |
| Biên độ sin sau loại trend | 4,25 px trên chiều rộng trung bình ~176 px |
| Độ cải thiện phần dư của mô hình sin chiều rộng | ~67% so với trend tuyến tính |

Đây là phân tích từ video nén và có cắt cảnh; giá trị chỉ định hướng thiết kế. Sự dịch chuyển camera/cắt cảnh cũng ảnh hưởng bbox. Không khẳng định chu kỳ gốc chính xác 0,895 giây.

## Sai khác của bản 3.2

- Chu kỳ mã nguồn cũ là **1,06 giây**, dài hơn video tham chiếu.
- Envelope cũ dùng nhiều xung keyframe tách bạch, trong clip chuyển động nhìn liên tục hơn, có một dao động chính rõ.
- Hạt bên trong phần lớn chỉ trôi ngẫu nhiên chậm và đổi kích thước; thiếu làn sóng di chuyển liên tục theo bán kính.
- Sáng tối ở các hạt chưa tham gia dao động truyền vào/ra.

## Sửa trong v3.3

- `ART.pulsePeriod = 0.90`, pha dao động trơn và có harmonic nhẹ.
- Bổ sung `travelingFlow`: làn sóng hướng tâm có độ trễ theo bán kính cùng dòng chuyển động tiếp tuyến nhỏ; trường Gaussian tránh ranh giới rõ.
- Lõi nhận biên độ xung mạnh hơn, viền vẫn di chuyển nhẹ liên tục; không tách thành hai lớp có quy tắc cứng.
- Độ sáng hạt lên/xuống nhẹ theo pha xung và vùng sóng, không đổi màu/mật độ/kích thước hạt thiết kế ở v3.2.
- WebGL2 và Canvas2D dự phòng cùng dùng chu kỳ và trường biến dạng tương ứng.

## Kiểm thử

- Desktop 1200 × 637: WebGL2, 14.000 hạt, chu kỳ 0,90 giây, không có lỗi GL.
- Lấy 30 trạng thái tại 0,0–2,9 giây: chiều rộng vùng sáng xấp xỉ 339–360 px (percentile 3%–97%); chu kỳ lặp đều.
- Mobile 390 × 844: WebGL2 chạy; zoom 450% hiển thị `love you`, reset 100% ẩn trở lại.
- Canvas fallback hoạt động.
- Kiểm thử JavaScript tự động 15/15 đạt.
- Chưa xác minh fps trên thiết bị di động vật lý hoặc đo lưu tốc chuyển động bằng optical-flow chuyên dụng.

## Giới hạn

Thiết kế dựa trên video nén 640 × 358 hiển thị trong trình duyệt, có các overlay của nền tảng và cắt cảnh. Có thể cần đối chiếu thêm nguồn có độ phân giải cao hơn để đạt độ giống cao hơn, đặc biệt trong ánh sáng chuyển động theo chiều sâu. Đây là bản hiệu chỉnh theo frame tham khảo, **không cam kết giống 100% phim**.
