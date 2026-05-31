# TechShop Backend Structure And File Guide

Tai lieu nay giai thich cau truc backend theo code hien tai trong `Backend/`.
Muc tieu: nhin vao mot file la biet file do nam o dau trong he thong, chiu trach
nhiem gi, va khi nao nen sua file do.

## 1. Backend dang lam gi?

Backend la ASP.NET Core Web API cho website TechShop. He thong hien co cac nhom
chuc nang:

- Auth: dang ky, dang nhap, refresh token, logout.
- Catalog: category, brand, product list/detail, tao/sua/an san pham.
- Cart: gio hang cho guest va user da dang nhap, coupon.
- Order: tao don COD tu cart, xem lich su, xem chi tiet, huy don.
- Payment: tao giao dich VNPay/Momo mock va xu ly callback co chu ky HMAC.
- Promotion: khuyen mai public va CRUD cho admin/staff.
- Review: user danh gia sau khi don hang hoan tat, review moi can duyet.
- Admin: quan ly don hang, ton kho, bao cao, user.

## 2. Cau truc thu muc

```text
Backend/
├── Controllers/
│   ├── Admin/
│   │   ├── AdminInventoryController.cs
│   │   ├── AdminOrdersController.cs
│   │   ├── AdminReportsController.cs
│   │   └── AdminUsersController.cs
│   ├── AuthController.cs
│   ├── BrandsController.cs
│   ├── CartController.cs
│   ├── CategoriesController.cs
│   ├── OrdersController.cs
│   ├── PaymentsController.cs
│   ├── ProductsController.cs
│   ├── PromotionsController.cs
│   └── ReviewsController.cs
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
├── Migrations/
├── Models/
├── Properties/
├── Services/
├── Program.cs
├── api.csproj
├── appsettings.json
├── appsettings.Development.json
├── TechShopApiTests.http
└── TestFullApiFlow.ps1
```

Vai tro nhanh:

- `Controllers/`: nhan HTTP request, validate co ban, goi EF Core/service, tra `ApiResponse<T>`.
- `Models/`: EF Core entities, gan voi bang database.
- `DTOs/`: object request/response cho API, tranh dung entity truc tiep o hop dong API.
- `Data/`: `DbContext`, mapping relationship/index, seed du lieu mau.
- `Services/`: logic ha tang ngoai controller, hien co email mock va payment mock.
- `Migrations/`: lich su thay doi schema do EF Core tao.
- File `.http` va `.ps1`: test thu cong/full flow API.

## 3. Entry Point Va Cau Hinh

| File | Chuc nang | Nen sua khi |
|---|---|---|
| `Program.cs` | Diem khoi dong app. Dang ky controllers, Swagger, SQL Server `AppDbContext`, services, CORS, JWT auth, seed data, middleware pipeline. | Them service moi, doi CORS, doi auth, them middleware, doi cach seed/startup. |
| `api.csproj` | Khai bao target framework `net10.0` va packages: EF Core SQL Server, JWT Bearer, Swagger, BCrypt, ClosedXML, Google Auth. | Them/xoa package backend. |
| `appsettings.json` | Connection string, logging, JWT secret/issuer/audience/expiry, payment callback secret. | Doi cau hinh local/dev. Luu y khong nen dung secret hardcode cho production. |
| `appsettings.Development.json` | Override cau hinh rieng moi truong Development, hien moi co logging. | Them cau hinh chi dung khi dev. |
| `Properties/launchSettings.json` | Profile chay local: `http://localhost:5000`, HTTPS `https://localhost:7188`, environment `Development`. | Doi port/profile chay bang IDE/dotnet run. |

Middleware order trong `Program.cs`:

```text
Swagger neu Development
HTTPS redirection
CORS policy Vite
Authentication
Authorization
MapControllers
```

CORS policy `Vite` cho `http://localhost:5173` va expose header `X-Session-Id`
de frontend luu guest cart session.

## 4. Data Layer

### `Data/AppDbContext.cs`

`AppDbContext` la lop EF Core trung tam. File nay khai bao `DbSet` cho toan bo
entity chinh:

- Auth/User: `Roles`, `Users`, `RefreshTokens`, `Addresses`.
- Catalog: `Categories`, `Products`, `ProductImages`, `ProductVariants`, `Specifications`.
- Commerce: `Coupons`, `Promotions`, `PromotionProducts`, `Inventories`, `InventoryLogs`.
- Cart/Order: `Carts`, `CartItems`, `Orders`, `OrderItems`, `OrderStatusLogs`, `Payments`, `Reviews`.

`OnModelCreating` cau hinh cac rule quan trong:

- Unique index: `Role.RoleName`, `Category.Slug`, `User.Email`, `Coupon.Code`,
  `Product.Slug`, `ProductVariant.SKU`, `Inventory.VariantId`, `Payment.OrderId`.
- Bang `Inventory` duoc map ten singular la `Inventory`.
- Decimal mac dinh precision `18,2`.
- Mac dinh foreign key la `DeleteBehavior.Restrict`.
- Cascade delete duoc bat rieng cho:
  - `Cart -> CartItems`
  - `Order -> OrderItems`
  - `Order -> OrderStatusLogs`

Khi sua model/database, thuong phai sua file nay va tao migration moi.

### `Data/DbSeeder.cs`

`DbSeeder.Seed(context)` duoc goi moi lan app start trong `Program.cs`.

Seed hien tai:

- Roles: `Admin`, `Staff`, `Customer`.
- Categories: `laptop`, `phone`, `accessory`.
- Users:
  - `admin@techshop.vn` / `Admin@123`
  - `test@techshop.vn` / `Test@123`
- Products mau:
  - Laptop ASUS ROG Strix G16
  - MacBook Air M3 13 inch
  - iPhone 15 Pro Max
  - Samsung Galaxy S24 Ultra
  - Tai nghe Sony WH-1000XM5
- Coupon `TECHSHOP10`.
- Promotion `TechShop Phase 2 Launch`.

Ham private `AddProduct(...)` tao product kem variant mac dinh, inventory,
thumbnail image va mot vai specification.

## 5. Models

Models la entity EF Core. Chung dai dien du lieu luu trong database, khong phai
luc nao cung nen tra thang ra API.

| File | Classes | Chuc nang |
|---|---|---|
| `Models/User.cs` | `User` | Tai khoan nguoi dung: email, password hash, full name, phone, avatar, role, active flag, timestamps, refresh tokens, addresses, carts. |
| `Models/CatalogModels.cs` | `Role`, `Category`, `Product`, `ProductImage`, `ProductVariant`, `Specification` | Role va catalog san pham. `Product` co category, images, variants, specs, reviews. `ProductVariant` co SKU/mau/RAM/storage/price offset/inventory. |
| `Models/CommerceModels.cs` | `RefreshToken`, `Address`, `Coupon`, `Promotion`, `PromotionProduct`, `Inventory`, `InventoryLog` | Token dai han, dia chi, ma giam gia, khuyen mai, ton kho va log ton kho. |
| `Models/Cart.cs` | `Cart` | Gio hang gan voi `UserId` neu login hoac `SessionId` neu guest, co optional coupon va list items. |
| `Models/CartItems.cs` | `CartItem` | Dong san pham trong gio hang: `CartId`, `VariantId`, `Quantity`, `AddedAt`. |
| `Models/OrderModels.cs` | `Order`, `OrderItem`, `OrderStatusLog`, `Payment`, `Review` | Don hang, snapshot item, lich su status, thanh toan, danh gia san pham. |

Quy uoc trang thai dang dung:

- Order: `Pending`, `Paid`, `Completed`, `Cancelled` va cac status admin co the set them qua API.
- Payment: `Pending`, `Paid`, `Failed`.
- Inventory log: `Import`, `Export`, `Adjust`, `SaleDeduct`, `CancelReturn`.
- Discount type: `Percent`, `Fixed`.

## 6. DTOs

DTOs la hop dong API. Khi frontend goi API, nen doc DTO truoc khi doc model.

| File | DTOs | Chuc nang |
|---|---|---|
| `DTOs/Common/ApiResponse.cs` | `ApiResponse<T>`, `PaginationMeta` | Wrapper response chuan cho thanh cong/loi/phan trang. |
| `DTOs/AuthDto.cs` | `RegisterDto`, `LoginDto`, `RefreshTokenDto`, `LogoutDto` | Body cho auth endpoints. |
| `DTOs/CartDto.cs` | `AddToCartDto`, `UpdateCartItemDto`, `ApplyCouponDto` | Body cho cart endpoints. |
| `DTOs/Product/ProductDtos.cs` | `CategoryDto`, `ProductListItemDto`, `ProductDetailDto`, `CreateProductDto`, `UpdateProductDto`, input DTOs | Response catalog va request tao/sua san pham. |
| `DTOs/Order/OrderDtos.cs` | `CreateOrderDto`, `UpdateOrderStatusDto`, `UpdateTrackingDto` | Body tao don va admin cap nhat don. |
| `DTOs/Payment/PaymentDtos.cs` | `CreatePaymentRequestDto`, `PaymentCallbackDto`, `PaymentGatewayResultDto` | Body tao thanh toan, callback va response payment URL. |
| `DTOs/Promotion/PromotionDtos.cs` | `PromotionDto`, `PromotionProductDto`, `CreatePromotionDto`, `UpdatePromotionDto` | CRUD promotion va danh sach product gan voi promotion. |
| `DTOs/Review/ReviewDtos.cs` | `CreateReviewDto` | Body tao review. |
| `DTOs/Admin/AdminDtos.cs` | `RevenueReportDto`, `TopProductDto`, `LowStockDto`, `InventoryItemDto`, `InventoryLogDto`, user DTOs | Response/report/request cho admin reports, inventory, user management. |

Response chuan:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "error": null,
  "pagination": null
}
```

## 7. Services

| File | Interface/Class | Chuc nang |
|---|---|---|
| `Services/EmailService.cs` | `IEmailService`, `EmailService` | Email mock. Cac ham chi log: order confirmation, order status changed, payment result. |
| `Services/PaymentGatewayService.cs` | `IPaymentGatewayService`, `PaymentGatewayService` | Payment gateway mock. Tao payment URL tra ve `returnUrl` kem query params; tao/verify HMAC signature cho callback. |

`PaymentGatewayService` co 3 ham chinh:

- `CreatePaymentUrl(Payment payment, string method, string returnUrl)`: tao transaction code, signature va URL mock.
- `CreateSignature(Guid paymentId, string status, string? transactionCode)`: HMACSHA256 voi `Payment:CallbackSecret`.
- `VerifySignature(...)`: so sanh chu ky bang fixed-time compare.

## 8. Public Controllers

### `AuthController.cs`

Route goc: `/api/auth`.

| Method | Path | Ham | Chuc nang |
|---|---|---|---|
| POST | `/register` | `Register` | Tao customer moi, hash password bang BCrypt, role mac dinh `Customer`. |
| POST | `/login` | `Login` | Verify email/password, tao JWT access token va refresh token. |
| POST | `/refresh` | `Refresh` | Kiem tra refresh token, revoke token cu, tao replacement va access token moi. |
| POST | `/logout` | `Logout` | Revoke refresh token neu ton tai. |

Private helpers:

- `GenerateJwtToken(User user)`: tao JWT voi claims `NameIdentifier`, `Email`, `Name`, `Role`.
- `CreateRefreshToken(Guid userId)`: tao random token 64 bytes base64.
- `ToUserDto(...)`: shape user tra ve frontend.

### `ProductsController.cs`

Route goc: `/api/products`.

| Method | Path | Quyen | Ham | Chuc nang |
|---|---|---|---|---|
| GET | `/` | Public | `GetProducts` | List product active, filter category/brand/price, sort, paging. |
| GET | `/{slug}` | Public | `GetProduct` | Chi tiet product theo slug, kem images, variants, specs, avg rating visible. |
| POST | `/` | Admin/Staff | `CreateProduct` | Tao product kem images/specs/variants/inventory. |
| PUT | `/{id}` | Admin/Staff | `UpdateProduct` | Cap nhat thong tin chinh cua product. |
| DELETE | `/{id}` | Admin | `DeleteProduct` | Soft delete bang `IsActive = false`. |
| POST | `/{id}/images` | Admin/Staff | `UploadImage` | Luu file vao `wwwroot/images` va tao `ProductImage`. |

Luu y:

- List product dung `slug` category, brand so sanh lower-case.
- `pageSize` bi clamp tu 1 den 100.
- `UpdateProduct` khong cap nhat nested images/specs/variants.
- `UploadImage` moi check file rong, chua validate extension/content-type.

### `CategoriesController.cs`

Route goc: `/api/categories`.

- `GET /`: lay category active, sort theo `DisplayOrder`, build cay cha/con bang helper `MapCategory`.

### `BrandsController.cs`

Route goc: `/api/brands`.

- `GET /`: lay danh sach brand distinct tu product active, sort alphabet.

### `CartController.cs`

Route goc: `/api/cart`.

| Method | Path | Ham | Chuc nang |
|---|---|---|---|
| GET | `/` | `GetCart` | Lay hoac tao cart hien tai. |
| POST | `/items` | `AddToCart` | Them variant vao cart, kiem tra quantity va stock. |
| PUT | `/items/{id}` | `UpdateItem` | Doi quantity; quantity <= 0 thi xoa item. |
| DELETE | `/items/{id}` | `DeleteItem` | Xoa cart item. |
| POST | `/apply-coupon` | `ApplyCoupon` | Validate coupon va gan vao cart. |

Private helpers:

- `GetOrCreateCart()`: neu co JWT thi tim theo `UserId`, neu guest thi tim/tao theo `X-Session-Id`.
- `LoadCart(Guid id)`: load cart kem item, variant, product, inventory, coupon.
- `GetUserIdFromToken()`: doc claim `NameIdentifier`.
- `GetOrCreateSessionId()`: doc header `X-Session-Id` hoac tao GUID moi.
- `CalculateSubtotal(...)`, `CalculateDiscount(...)`: tinh tien gio hang.
- `MapCart(...)`: shape response cart gom items, subtotal, discount, total.

Luu y: controller khong gan `[Authorize]`, nen endpoint cart ho tro ca guest va user.

### `OrdersController.cs`

Route goc: `/api/orders`. Controller gan `[Authorize]`, tat ca endpoint can JWT.

| Method | Path | Ham | Chuc nang |
|---|---|---|---|
| POST | `/` | `CreateOrder` | Tao order COD tu cart user, transaction tru kho, log kho, tao payment COD, clear cart. |
| GET | `/` | `GetOrders` | Lay lich su don cua user hien tai. |
| GET | `/{id}` | `GetOrder` | Lay chi tiet don neu user la owner. |
| PATCH | `/{id}/cancel` | `CancelOrder` | User huy don neu chua `Completed`/`Cancelled`, hoan kho va ghi log. |

Private helpers:

- `LoadOrder(Guid id)`: include items, status logs, payment.
- `GetUserId()`: doc `NameIdentifier`.
- `CalculateDiscount(...)`: tinh coupon discount tai thoi diem tao don.
- `MapOrder(...)`: shape response order detail.

### `PaymentsController.cs`

Route goc: `/api/payments`.

| Method | Path | Quyen | Ham | Chuc nang |
|---|---|---|---|---|
| POST | `/vnpay/create` | User | `CreateVnPayPayment` | Tao payment URL mock VNPay. |
| POST | `/momo/create` | User | `CreateMomoPayment` | Tao payment URL mock Momo. |
| POST | `/vnpay/callback` | Public | `VnPayCallback` | Xu ly callback VNPay mock. |
| POST | `/momo/callback` | Public | `MomoCallback` | Xu ly callback Momo mock. |

Private helpers:

- `CreateGatewayPayment(...)`: load order/payment, reject order `Cancelled`/`Completed`, reset payment ve `Pending`, tra payment URL.
- `HandleCallback(...)`: verify signature, update payment status, neu paid va order pending thi set order `Paid`.

### `PromotionsController.cs`

Route goc: `/api/promotions`.

| Method | Path | Quyen | Ham | Chuc nang |
|---|---|---|---|---|
| GET | `/active` | Public | `GetActivePromotions` | Lay promotion active theo thoi gian hien tai. |
| GET | `/` | Admin/Staff | `GetPromotions` | List promotion, filter active, paging. |
| GET | `/{id}` | Admin/Staff | `GetPromotion` | Chi tiet promotion. |
| POST | `/` | Admin/Staff | `CreatePromotion` | Tao promotion va gan product active. |
| PUT | `/{id}` | Admin/Staff | `UpdatePromotion` | Cap nhat promotion va thay danh sach product. |
| DELETE | `/{id}` | Admin/Staff | `DeletePromotion` | Tat promotion bang `IsActive = false`. |

Private helpers:

- `BasePromotionQuery()`: include `PromotionProducts.Product`.
- `GetActiveProductIds(...)`: loc productIds unique va active.
- `ValidatePromotion(...)`: validate discount type/value/date range.
- `ToDto(...)`: map entity sang `PromotionDto`.

### `ReviewsController.cs`

Route goc dac biet: `/api`.

| Method | Path | Quyen | Ham | Chuc nang |
|---|---|---|---|---|
| POST | `/reviews` | User | `CreateReview` | Tao review neu user da co order `Completed` chua product do. |
| GET | `/products/{id}/reviews` | Public | `GetProductReviews` | Lay review visible cua product. |

Review moi tao co `IsVisible = false`, nen chua hien ra public ngay.

## 9. Admin Controllers

### `AdminOrdersController.cs`

Route goc: `/api/admin/orders`. Quyen: `Admin,Staff`.

| Method | Path | Ham | Chuc nang |
|---|---|---|---|
| GET | `/` | `GetOrders` | List tat ca order, filter status, paging, kem thong tin customer. |
| PATCH | `/{id}/status` | `UpdateStatus` | Cap nhat order status, ghi `OrderStatusLog`, gui email mock. |
| PUT | `/{id}/tracking` | `UpdateTracking` | Cap nhat ma van don. |

### `AdminInventoryController.cs`

Route goc: `/api/admin/inventory`. Quyen: `Admin,Staff`.

| Method | Path | Ham | Chuc nang |
|---|---|---|---|
| GET | `/` | `GetInventory` | List ton kho, search SKU/product/brand, filter low stock, paging. |
| GET | `/logs` | `GetLogs` | List inventory logs, filter variant/changeType, paging. |
| POST | `/import` | `ImportStock` | Nhap kho, tao inventory neu can, ghi log `Import`. |
| POST | `/export` | `ExportStock` | Xuat kho neu du ton, ghi log `Export`. |
| PATCH | `/adjust` | `AdjustStock` | Set ton kho ve quantity moi, ghi log `Adjust` voi delta. |

Private helpers:

- `GetOrCreateInventory(Guid variantId)`: tao inventory quantity 0 neu variant active chua co.
- `AddLog(...)`: ghi `InventoryLog` voi user admin/staff hien tai.
- `FormatVariant(...)`: ghep color/RAM/storage.

### `AdminReportsController.cs`

Route goc: `/api/admin/reports`. Quyen: `Admin,Staff`.

| Method | Path | Ham | Chuc nang |
|---|---|---|---|
| GET | `/revenue` | `GetRevenue` | Bao cao doanh thu theo range, group day/month. |
| GET | `/top-products` | `GetTopProducts` | Top product variant theo revenue/quantity trong range. |
| GET | `/low-stock` | `GetLowStock` | San pham ton kho thap theo threshold hoac `LowStockAlert`. |
| GET | `/revenue/export` | `ExportRevenue` | Xuat report Excel bang ClosedXML. |

Private helpers:

- `BuildRevenueReport(...)`: query orders khong cancelled, tinh total revenue/orders/AOV/points.
- `NormalizeRange(...)`: default 30 ngay gan nhat.
- `FormatVariant(...)`: ghep thong tin variant.

### `AdminUsersController.cs`

Route goc: `/api/admin/users`. Quyen: `Admin`.

| Method | Path | Ham | Chuc nang |
|---|---|---|---|
| GET | `/` | `GetUsers` | List users, search email/name/phone, filter role/active, paging. |
| GET | `/{id}` | `GetUser` | Chi tiet user. |
| POST | `/` | `CreateUser` | Tao user voi role bat ky, hash password. |
| PUT | `/{id}` | `UpdateUser` | Cap nhat profile, avatar, role, active. |
| PATCH | `/{id}/status` | `UpdateStatus` | Bat/tat user. |
| PATCH | `/{id}/password` | `ChangePassword` | Doi password user. |
| DELETE | `/{id}` | `DeleteUser` | Soft delete/khoa user bang `IsActive = false`. |

Private helper:

- `ToDto(User user)`: map entity sang `AdminUserDto`.

## 10. Migrations Va Test Files

| File/Folder | Chuc nang |
|---|---|
| `Migrations/*.cs` | EF Core migrations. Khong sua tay neu khong can; tao bang `dotnet ef migrations add <Name>`. |
| `Migrations/AppDbContextModelSnapshot.cs` | Snapshot schema moi nhat cho EF Core. |
| `TechShopApiTests.http` | REST Client collection test tung endpoint theo thu tu. Co bien login va token. |
| `TestFullApiFlow.ps1` | Script PowerShell test full flow tu login, catalog, cart, order, payment, admin, review, promotion, inventory, user. |
| `api.http` | File mac dinh template con endpoint weatherforecast cu, khong phan anh API hien tai. |
| `api.csproj.lscache` | File cache tooling, khong phai source logic. |

Lenh hay dung:

```bash
dotnet restore Backend/api.csproj
dotnet build Backend/api.csproj
dotnet ef database update --project Backend/api.csproj --startup-project Backend/api.csproj
dotnet run --project Backend/api.csproj --urls http://localhost:5000
```

Chay full API flow khi backend va database dang san sang:

```powershell
pwsh Backend/TestFullApiFlow.ps1
```

## 11. Diem Can Nho Khi Phat Trien

- Moi response API nen di qua `ApiResponse<T>`.
- API can dang nhap dung `[Authorize]`; admin/staff dung role trong attribute.
- Product detail public dung `slug`, review public dung `productId`.
- Cart guest dung `X-Session-Id`; frontend phai luu header nay.
- Order tao tu cart cua user dang login, khong tao truc tiep tu danh sach product request.
- Inventory tru/hoan kho phai di kem `InventoryLog`.
- Delete product/promotion/user hien la soft delete/tat active flag.
- Email va VNPay/Momo hien moi la mock, chua gui/tich hop cong that.
- `appsettings.json` hien co secret local; khi deploy can chuyen sang environment variables, user-secrets hoac secret manager.
