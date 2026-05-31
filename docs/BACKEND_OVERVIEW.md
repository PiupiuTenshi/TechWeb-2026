# TechShop Backend Overview

Tài liệu này giải thích backend hiện tại của TechShop theo code trong thư mục `Backend/`. Mục tiêu là giúp Dev A, Dev B và Dev C hiểu backend đang có gì, chạy thế nào, luồng dữ liệu đi ra sao và frontend cần gọi API nào.

## Nên đọc tài liệu nào?

- `docs/BACKEND_STRUCTURE.md`: giải thích cấu trúc thư mục, vai trò từng file/class/controller/service/model.
- `docs/BACKEND_API_REFERENCE.md`: tra cứu endpoint, request body, response, quyền, lỗi và thứ tự test API.
- `docs/BACKEND_DATABASE_AND_FLOWS.md`: giải thích database model, quan hệ, seed data và các luồng auth/cart/order/payment/admin.
- `docs/BACKEND_DATA_FLOW.md`: sơ đồ Mermaid tóm tắt các luồng chính.

## 1. Công nghệ sử dụng

- Framework: ASP.NET Core Web API trên .NET 10.
- Database: SQL Server qua Entity Framework Core.
- Auth: JWT Bearer + refresh token.
- Password hashing: BCrypt.
- API docs: Swagger trong môi trường Development.
- Export báo cáo: ClosedXML.
- Payment: đang là mock gateway cho VNPay/Momo, có ký callback bằng HMAC.
- Email: đang là mock service, ghi log thay vì gửi email thật.

File cấu hình chính:

- `Backend/Program.cs`
- `Backend/appsettings.json`
- `Backend/appsettings.Development.json`
- `Backend/Data/AppDbContext.cs`
- `Backend/Data/DbSeeder.cs`

## 2. Cách chạy backend local

Từ thư mục gốc repo:

```powershell
dotnet restore Backend\api.csproj
dotnet ef database update --project Backend\api.csproj --startup-project Backend\api.csproj
dotnet run --project Backend\api.csproj --urls http://localhost:5000
```

Swagger chạy ở:

```text
http://localhost:5000/swagger
```

Frontend Vite mặc định được CORS cho:

```text
http://localhost:5173
```

## 3. Cấu trúc thư mục Backend

```text
Backend/
├── Controllers/
│   ├── AuthController.cs
│   ├── BrandsController.cs
│   ├── CartController.cs
│   ├── CategoriesController.cs
│   ├── OrdersController.cs
│   ├── PaymentsController.cs
│   ├── ProductsController.cs
│   ├── PromotionsController.cs
│   ├── ReviewsController.cs
│   └── Admin/
├── Data/
│   ├── AppDbContext.cs
│   └── DbSeeder.cs
├── DTOs/
│   ├── Admin/
│   ├── Common/
│   ├── Order/
│   ├── Payment/
│   ├── Product/
│   ├── Promotion/
│   ├── Review/
│   ├── AuthDto.cs
│   └── CartDto.cs
├── Models/
│   ├── CatalogModels.cs
│   ├── CommerceModels.cs
│   ├── OrderModels.cs
│   ├── User.cs
│   ├── Cart.cs
│   └── CartItems.cs
├── Services/
│   ├── EmailService.cs
│   └── PaymentGatewayService.cs
├── Migrations/
├── Program.cs
└── api.csproj
```

## 4. Program.cs đang cấu hình gì

`Program.cs` đăng ký các phần chính:

- `AddControllers()` để dùng controller API.
- Swagger + Bearer auth cho test API.
- `AppDbContext` dùng SQL Server từ `ConnectionStrings:DefaultConnection`.
- `IEmailService` -> `EmailService`.
- `IPaymentGatewayService` -> `PaymentGatewayService`.
- CORS policy `Vite` cho frontend `http://localhost:5173`.
- JWT Bearer auth với `Jwt:Secret` hoặc fallback `Jwt:Key`.
- `DbSeeder.Seed(context)` khi app start để seed dữ liệu mẫu.

Middleware order:

```text
Swagger nếu Development
HTTPS redirection
CORS
Authentication
Authorization
MapControllers
```

## 5. Response chuẩn

Backend dùng wrapper chung `ApiResponse<T>`:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "error": null,
  "pagination": null
}
```

Với lỗi:

```json
{
  "success": false,
  "data": null,
  "message": "San pham khong ton tai.",
  "error": "NOT_FOUND",
  "pagination": null
}
```

Với list có phân trang:

```json
{
  "success": true,
  "data": [],
  "message": "OK",
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100
  }
}
```

## 6. Database và model chính

Backend hiện map các nhóm bảng chính sau.

### 6.1 User/Auth

Model:

- `Role`
- `User`
- `RefreshToken`
- `Address`

Ý nghĩa:

- `Role`: quyền `Admin`, `Staff`, `Customer`.
- `User`: tài khoản người dùng, có email unique, password hash, role, trạng thái active.
- `RefreshToken`: token dài hạn, có trạng thái revoke.
- `Address`: địa chỉ giao hàng của user.

### 6.2 Catalog

Model:

- `Category`
- `Product`
- `ProductImage`
- `ProductVariant`
- `Specification`

Ý nghĩa:

- `Category`: danh mục cha/con, có `Slug`.
- `Product`: sản phẩm chính, có `BasePrice`, `SalePrice`, `Brand`, `ThumbnailUrl`, `IsActive`.
- `ProductImage`: ảnh phụ của sản phẩm.
- `ProductVariant`: biến thể theo SKU, màu, RAM, storage, price offset.
- `Specification`: thông số dạng key-value.

### 6.3 Cart

Model:

- `Cart`
- `CartItem`
- `Coupon`

Ý nghĩa:

- Cart có thể thuộc `UserId` hoặc `SessionId`.
- Guest cart dùng header `X-Session-Id`.
- Cart có thể áp dụng một coupon.

### 6.4 Order/Payment

Model:

- `Order`
- `OrderItem`
- `OrderStatusLog`
- `Payment`

Ý nghĩa:

- `Order`: đơn hàng, địa chỉ nhận hàng, tổng tiền, trạng thái.
- `OrderItem`: snapshot sản phẩm tại thời điểm đặt hàng.
- `OrderStatusLog`: lịch sử thay đổi trạng thái.
- `Payment`: thông tin thanh toán COD/VNPay/Momo.

### 6.5 Promotion/Inventory/Review

Model:

- `Promotion`
- `PromotionProduct`
- `Inventory`
- `InventoryLog`
- `Review`

Ý nghĩa:

- `Promotion`: chương trình khuyến mãi theo thời gian.
- `PromotionProduct`: bảng nối promotion với product.
- `Inventory`: tồn kho theo variant.
- `InventoryLog`: log nhập/xuất/điều chỉnh/trừ kho khi bán/hoàn kho khi hủy.
- `Review`: đánh giá sản phẩm, chỉ hiện khi `IsVisible = true`.

## 7. Quan hệ và rule trong AppDbContext

`AppDbContext` đang có DbSet cho toàn bộ entity chính.

Các rule quan trọng:

- Unique index:
  - `Role.RoleName`
  - `Category.Slug`
  - `User.Email`
  - `Coupon.Code`
  - `Product.Slug`
  - `ProductVariant.SKU`
  - `Inventory.VariantId`
  - `Payment.OrderId`
- Bảng `Inventory` được đặt tên singular là `Inventory`.
- Decimal mặc định precision `18,2`.
- Hầu hết foreign key dùng `DeleteBehavior.Restrict`.
- Cascade delete chỉ mở rõ cho:
  - `Cart -> CartItems`
  - `Order -> OrderItems`
  - `Order -> OrderStatusLogs`

Điểm cần nhớ: hệ thống ưu tiên soft delete cho product/user/promotion thay vì xóa cứng.

## 8. Seed data

`DbSeeder.Seed()` chạy khi backend start.

Dữ liệu mẫu:

- Roles:
  - `Admin`
  - `Staff`
  - `Customer`
- Categories:
  - `Laptop`
  - `Dien thoai`
  - `Phu kien`
- Users:
  - Admin: `admin@techshop.vn` / `Admin@123`
  - Customer: `test@techshop.vn` / `Test@123`
- Products mẫu:
  - Laptop ASUS ROG Strix G16
  - MacBook Air M3 13 inch
  - iPhone 15 Pro Max
  - Samsung Galaxy S24 Ultra
  - Tai nghe Sony WH-1000XM5
- Coupon:
  - `TECHSHOP10`
- Promotion mẫu:
  - `TechShop Phase 2 Launch`

## 9. Auth API

Controller: `AuthController`

Base route:

```text
/api/auth
```

Endpoints:

| Method | URL | Auth | Mục đích |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Đăng ký customer |
| POST | `/api/auth/login` | Public | Đăng nhập, trả accessToken + refreshToken |
| POST | `/api/auth/refresh` | Public | Rotate refresh token và cấp access token mới |
| POST | `/api/auth/logout` | Public | Revoke refresh token |

JWT claims đang có:

- `NameIdentifier`: `UserId`
- `Email`: email
- `Name`: full name
- `Role`: `Admin`, `Staff`, hoặc `Customer`

Frontend cần gửi token:

```text
Authorization: Bearer <accessToken>
```

## 10. Product/Catalog API

### Products

Controller: `ProductsController`

Base route:

```text
/api/products
```

Endpoints:

| Method | URL | Auth | Mục đích |
|---|---|---|---|
| GET | `/api/products` | Public | List sản phẩm, filter, sort, paging |
| GET | `/api/products/{slug}` | Public | Chi tiết sản phẩm |
| POST | `/api/products` | Admin/Staff | Tạo sản phẩm |
| PUT | `/api/products/{id}` | Admin/Staff | Cập nhật sản phẩm |
| DELETE | `/api/products/{id}` | Admin | Soft delete sản phẩm |
| POST | `/api/products/{id}/images` | Admin/Staff | Upload ảnh |

Query cho list:

```text
category=laptop
brand=Asus
minPrice=1000000
maxPrice=50000000
sort=price_asc | price_desc | newest
page=1
pageSize=20
```

Response list trả các field frontend cần:

- `productId`
- `name`
- `slug`
- `brand`
- `thumbnailUrl`
- `basePrice`
- `salePrice`
- `category`
- `isFeatured`

Response detail có thêm:

- `images`
- `variants`
- `specifications`
- `avgRating`

### Categories

Controller: `CategoriesController`

```text
GET /api/categories
```

Trả cây category cha/con để frontend dựng menu/filter.

### Brands

Controller: `BrandsController`

```text
GET /api/brands
```

Trả danh sách brand distinct từ product active.

## 11. Cart API

Controller: `CartController`

Base route:

```text
/api/cart
```

Endpoints:

| Method | URL | Auth | Mục đích |
|---|---|---|---|
| GET | `/api/cart` | Optional | Lấy hoặc tạo giỏ hàng |
| POST | `/api/cart/items` | Optional | Thêm variant vào giỏ |
| PUT | `/api/cart/items/{id}` | Optional | Cập nhật số lượng item |
| DELETE | `/api/cart/items/{id}` | Optional | Xóa item |
| POST | `/api/cart/apply-coupon` | Optional | Áp dụng coupon |

Guest cart:

- Nếu chưa login, backend tạo `SessionId`.
- Nếu request chưa có `X-Session-Id`, response sẽ trả header `X-Session-Id`.
- Frontend nên lưu header này và gửi lại trong các request cart tiếp theo.

User cart:

- Nếu có JWT, backend lấy `UserId` từ token.
- Cart được tìm theo `UserId`.

Cart response gồm:

- `cartId`
- `userId`
- `sessionId`
- `coupon`
- `items`
- `subtotal`
- `discount`
- `total`

## 12. Order API

Controller: `OrdersController`

Base route:

```text
/api/orders
```

Tất cả endpoint trong controller này cần đăng nhập.

Endpoints:

| Method | URL | Mục đích |
|---|---|---|
| POST | `/api/orders` | Tạo đơn từ cart hiện tại |
| GET | `/api/orders` | Lịch sử đơn của user |
| GET | `/api/orders/{id}` | Chi tiết đơn |
| PATCH | `/api/orders/{id}/cancel` | User hủy đơn |

Luồng tạo đơn:

1. Lấy cart theo user đang login.
2. Kiểm tra cart không rỗng.
3. Bắt đầu transaction.
4. Kiểm tra từng item có variant/product/inventory hợp lệ.
5. Kiểm tra tồn kho đủ.
6. Tính `UnitPrice = SalePrice/BasePrice + PriceOffset`.
7. Tạo `OrderItem`.
8. Trừ inventory.
9. Ghi `InventoryLog` với `ChangeType = SaleDeduct`.
10. Tính subtotal, discount, grand total.
11. Tạo `OrderStatusLog` trạng thái `Pending`.
12. Tạo payment COD trạng thái `Pending`.
13. Tăng `Coupon.UsedCount` nếu có coupon.
14. Xóa cart items.
15. Commit transaction.
16. Gọi mock email xác nhận đơn.

Luồng hủy đơn:

1. Chỉ owner của đơn được hủy.
2. Không cho hủy nếu đơn `Completed` hoặc `Cancelled`.
3. Đổi status sang `Cancelled`.
4. Ghi `OrderStatusLog`.
5. Hoàn tồn kho.
6. Ghi `InventoryLog` với `ChangeType = CancelReturn`.
7. Gọi mock email đổi trạng thái.

## 13. Payment API

Controller: `PaymentsController`

Base route:

```text
/api/payments
```

Endpoints:

| Method | URL | Auth | Mục đích |
|---|---|---|---|
| POST | `/api/payments/vnpay/create` | User | Tạo payment URL mock VNPay |
| POST | `/api/payments/momo/create` | User | Tạo payment URL mock Momo |
| POST | `/api/payments/vnpay/callback` | Public | Callback VNPay mock |
| POST | `/api/payments/momo/callback` | Public | Callback Momo mock |

Hiện tại payment gateway là mock:

- `CreatePaymentUrl()` tạo một URL return có query string:
  - `paymentId`
  - `method`
  - `status=Success`
  - `transactionCode`
  - `signature`
- Signature dùng HMACSHA256 với `Payment:CallbackSecret`.
- Callback verify signature bằng fixed-time compare.

Khi callback success:

- Payment status đổi thành `Paid`.
- `PaidAt` được set.
- Nếu order đang `Pending`, order status đổi thành `Paid`.
- Ghi `OrderStatusLog`.
- Gọi mock email kết quả thanh toán.

## 14. Promotions API

Controller: `PromotionsController`

Base route:

```text
/api/promotions
```

Endpoints:

| Method | URL | Auth | Mục đích |
|---|---|---|---|
| GET | `/api/promotions/active` | Public | Lấy promotion đang active |
| GET | `/api/promotions` | Admin/Staff | List promotion |
| GET | `/api/promotions/{id}` | Admin/Staff | Chi tiết promotion |
| POST | `/api/promotions` | Admin/Staff | Tạo promotion |
| PUT | `/api/promotions/{id}` | Admin/Staff | Cập nhật promotion |
| DELETE | `/api/promotions/{id}` | Admin/Staff | Tắt promotion |

Validate promotion:

- `DiscountType` phải là `Percent` hoặc `Fixed`.
- `DiscountValue` > 0.
- Nếu `Percent`, value không được > 100.
- `EndsAt` phải sau `StartsAt`.
- ProductIds chỉ nhận product đang active.

## 15. Reviews API

Controller: `ReviewsController`

Base route đặc biệt:

```text
/api
```

Endpoints:

| Method | URL | Auth | Mục đích |
|---|---|---|---|
| POST | `/api/reviews` | User | Gửi đánh giá |
| GET | `/api/products/{id}/reviews` | Public | Lấy review visible của sản phẩm |

Rule tạo review:

- Rating phải từ 1 đến 5.
- User chỉ được review sản phẩm đã nằm trong đơn `Completed`.
- Review mới tạo có `IsVisible = false`, cần admin duyệt thủ công trong DB hoặc API admin tương lai.

## 16. Admin APIs

Các API admin dùng JWT role.

### Admin Orders

Controller: `AdminOrdersController`

Base route:

```text
/api/admin/orders
```

Role:

```text
Admin, Staff
```

Endpoints:

| Method | URL | Mục đích |
|---|---|---|
| GET | `/api/admin/orders` | List tất cả đơn, filter theo status |
| PATCH | `/api/admin/orders/{id}/status` | Cập nhật trạng thái đơn |
| PUT | `/api/admin/orders/{id}/tracking` | Cập nhật mã vận đơn |

### Admin Inventory

Controller: `AdminInventoryController`

Base route:

```text
/api/admin/inventory
```

Role:

```text
Admin, Staff
```

Endpoints:

| Method | URL | Mục đích |
|---|---|---|
| GET | `/api/admin/inventory` | List tồn kho |
| GET | `/api/admin/inventory/logs` | List log tồn kho |
| POST | `/api/admin/inventory/import` | Nhập kho |
| POST | `/api/admin/inventory/export` | Xuất kho |
| PATCH | `/api/admin/inventory/adjust` | Điều chỉnh tồn kho |

ChangeType đang dùng:

- `Import`
- `Export`
- `Adjust`
- `SaleDeduct`
- `CancelReturn`

### Admin Reports

Controller: `AdminReportsController`

Base route:

```text
/api/admin/reports
```

Role:

```text
Admin, Staff
```

Endpoints:

| Method | URL | Mục đích |
|---|---|---|
| GET | `/api/admin/reports/revenue` | Báo cáo doanh thu |
| GET | `/api/admin/reports/top-products` | Top sản phẩm bán chạy |
| GET | `/api/admin/reports/low-stock` | Sản phẩm tồn kho thấp |
| GET | `/api/admin/reports/revenue/export` | Export Excel doanh thu |

Revenue query:

```text
from=2026-05-01
to=2026-05-31
groupBy=day | month
```

### Admin Users

Controller: `AdminUsersController`

Base route:

```text
/api/admin/users
```

Role:

```text
Admin
```

Endpoints:

| Method | URL | Mục đích |
|---|---|---|
| GET | `/api/admin/users` | List user, search/filter/paging |
| GET | `/api/admin/users/{id}` | Chi tiết user |
| POST | `/api/admin/users` | Tạo user |
| PUT | `/api/admin/users/{id}` | Cập nhật user |
| PATCH | `/api/admin/users/{id}/status` | Bật/tắt user |
| PATCH | `/api/admin/users/{id}/password` | Đổi mật khẩu user |
| DELETE | `/api/admin/users/{id}` | Soft delete bằng `IsActive = false` |

## 17. Luồng frontend cần tích hợp

### 17.1 Browse sản phẩm

1. Gọi `GET /api/categories` để lấy category tree.
2. Gọi `GET /api/brands` để lấy brand filter.
3. Gọi `GET /api/products?category=&brand=&sort=&page=`.
4. Khi click product, gọi `GET /api/products/{slug}`.
5. Trang detail dùng `variants` để chọn SKU và tồn kho.

### 17.2 Auth

1. Register: `POST /api/auth/register`.
2. Login: `POST /api/auth/login`.
3. Lưu `accessToken`, `refreshToken`, `user`.
4. Gắn `Authorization: Bearer <accessToken>` cho request cần auth.
5. Khi 401, gọi `POST /api/auth/refresh`.
6. Logout: `POST /api/auth/logout`.

### 17.3 Cart guest

1. Gọi `GET /api/cart`.
2. Nếu response có header `X-Session-Id`, lưu lại.
3. Các request cart sau gửi header `X-Session-Id`.
4. Add item bằng `POST /api/cart/items`.

### 17.4 Checkout COD

1. User login.
2. Add sản phẩm vào cart.
3. Apply coupon nếu có.
4. Gọi `POST /api/orders` với:

```json
{
  "receiverName": "Nguyen Van A",
  "phone": "0900000000",
  "shippingAddress": "123 Le Loi, Q1, TP.HCM",
  "note": "Giao gio hanh chinh"
}
```

5. Backend tạo order COD, trừ kho, clear cart.

### 17.5 Checkout VNPay/Momo mock

1. Tạo order trước bằng `POST /api/orders`.
2. Gọi:

```text
POST /api/payments/vnpay/create
POST /api/payments/momo/create
```

Body:

```json
{
  "orderId": "<order-id>",
  "returnUrl": "http://localhost:5173/payment-result"
}
```

3. Frontend redirect sang `paymentUrl`.
4. Mock callback xử lý payment thành công qua endpoint callback.

## 18. Test API

Repo hiện có:

- `Backend/TechShopApiTests.http`
- `Backend/TestFullApiFlow.ps1`

Gợi ý thứ tự test full flow:

1. Chạy migration.
2. Chạy backend.
3. Login bằng `test@techshop.vn` / `Test@123`.
4. Lấy products.
5. Lấy product detail để lấy `variantId`.
6. Add to cart.
7. Apply coupon `TECHSHOP10`.
8. Create order.
9. Get orders.
10. Cancel order hoặc tạo payment.
11. Login admin `admin@techshop.vn` / `Admin@123`.
12. Test admin orders, inventory, reports, users.

## 19. Những điểm còn là mock hoặc cần làm tiếp

- Email service mới log ra console, chưa gửi email thật.
- VNPay/Momo mới là mock gateway, chưa tích hợp cổng thật.
- Review chưa có API admin duyệt `IsVisible`.
- Product update hiện chỉ update thông tin chính, chưa update nested images/specs/variants.
- Upload ảnh chưa validate extension/content-type kỹ.
- Chưa có global exception middleware.
- Chưa có unit/integration test tự động.
- Guest cart chưa có flow merge vào user cart sau login.
- JWT secret và connection string cần đưa vào env/secret khi deploy.

## 20. Checklist khi sửa backend

- Chạy build:

```powershell
dotnet build Backend\api.csproj
```

- Kiểm tra migration có pending model change:

```powershell
dotnet ef migrations has-pending-model-changes --project Backend\api.csproj --startup-project Backend\api.csproj
```

- Nếu đổi model/entity:

```powershell
dotnet ef migrations add <MigrationName> --project Backend\api.csproj --startup-project Backend\api.csproj
dotnet ef database update --project Backend\api.csproj --startup-project Backend\api.csproj
```

- Không commit:
  - `bin/`
  - `obj/`
  - `.env`
  - log test local
  - file secret thật
