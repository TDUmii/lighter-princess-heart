# Quality Assurance - Heart v4.0

## Kiến trúc được kiểm tra

- WebGL2 shader được biên dịch và liên kết thành công, không có lỗi GL.
- Dữ liệu hạt sinh theo seed cố định, có giá trị hữu hạn.
- Ba vùng buffer core/shell/burst riêng, liên tục và không chồng lấn.
- Mọi hạt lõi có tọa độ 3D; depth trải cả phía trước và sau.
- Normal hạt viền hầu hết hướng ra ngoài, xử lý đặc biệt ở lõm giữa hai múi.
- Nhịp nén/giãn và hạt burst có biên độ hữu hạn, tuần hoàn 0,90 giây.

## Kiểm tra trực quan

So với ảnh phim cùng khung 1200 × 637:

| Đại lượng | Frame phim | V4 GPU thử nghiệm |
| --- | ---: | ---: |
| Vùng đỏ hồng nổi bật | ~9,39% | ~7,64% |
| Màu RGB trung vị vùng nổi bật | (150, 70, 94) | (162, 72, 105) |
| Bbox vùng sáng, x | 411–825 | 395–805 |
| Bbox vùng sáng, y | 126–528 | 130–517 |

Các con số sử dụng ngưỡng `R>80, R>1.28*G, R>1.03*B, R>max(G,B)+10`. Đây là các đại lượng so sánh thị giác có sai số, không phải phép chứng minh giống tuyệt đối. Vị trí khung hình và độ sáng có thể thay đổi theo pha nhịp.

## Khung chuyển động

Đã kết xuất năm trạng thái riêng biệt trên GPU:

| Pha | Bbox chiều rộng |
| --- | ---: |
| Nén | 400 px |
| Nở | 427 px |
| Hạt bung | 412 px |
| Hồi | 424 px |
| Nghỉ | 422 px |

Mẫu render cũng xác nhận lớp hạt bật ra được kích hoạt ngắn sau pha nở; không có xoáy làm xiên khối tim.

## Mobile và tương thích

- Viewport 390 × 844: WebGL2 hoạt động, không lỗi console.
- Tổng hạt mobile: 7.200 (lõi 4.750, vỏ 1.900, burst 550).
- Zoom 450%: `love you` hiện, nhấn 100%: ẩn trở lại.
- Đo bằng requestAnimationFrame ở viewport giả lập: khoảng 60 FPS. Không đồng nghĩa tốc độ trên điện thoại vật lý.
- Tắt WebGL2 để thử fallback: Canvas2D hoạt động.

Ảnh thử và frame phim chỉ lưu ở QA_TEMP trong máy làm việc, thư mục này không được commit.

## Giới hạn

- Một số chênh lệch màu, ánh sáng và nhiễu hạt vẫn có thể nhìn thấy.
- Không có mã gốc hoặc tài nguyên hậu kỳ từ đoàn phim, nên không khẳng định giống 100%.
- Cần kiểm thử thiết bị điện thoại thật nếu yêu cầu đảm bảo FPS.
