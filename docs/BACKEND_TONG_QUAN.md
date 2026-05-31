# Tong quan Backend TechShop

Tai lieu nay tom tat backend hien tai cua TechShop theo code trong thu muc `Backend/`.
Muc tieu la giup nguoi moi vao du an hieu backend dang lam gi, chay nhu the nao,
co nhung API nao va luong du lieu chinh di qua dau.

## 1. Backend dung cong nghe gi?

Backend la ASP.NET Core Web API chay tren .NET 10.

Cac thanh phan chinh:

- ASP.NET Core Controllers: dinh nghia REST API.
- Entity Framework Core: lam viec voi SQL Server.
- SQL Server: database chinh.
- JWT Bearer: xac thuc request da dang nhap.
- Refresh token: cap lai access token khi het han.
- BCrypt: bam mat khau.
- Swagger: test API trong moi truong development.
- ClosedXML: xuat bao cao Excel.
- Mock email service: ghi log thay vi gui email that.
- Mock payment gateway: mo phong VNPay/Momo callback bang HMAC.

File cau hinh quan trong:

- `Backend/Program.cs`
- `Backend/appsettings.json`
- `Backend/Data/AppDbContext.cs`
- `Backend/Data/DbSeeder.cs`
- `Backend/Controllers/`
- `Backend/Models/`
- `Backend/DTOs/`
- `Backend/Services/`

## 2. Cach chay local

Backend can SQL Server dang chay va connection string dung trong `appsettings.json`.

Lenh thuong dung:

```bash
dotnet restore Backend/api.csproj
dotnet ef database update --project Backend/api.csproj --startup-project Backend/api.csproj
dotnet run --project Backend/api.csproj --urls http://localhost:5000
```

Swagger:

```text
http://localhost:5000/swagger
```

Frontend Vite duoc CORS cho origin:

```text
http://localhost:5173
```

Luu y: `appsettings.json` hien dang co connection string, SQL password va JWT secret.
Neu dua code len moi truong that, can chuyen cac gia tri nay sang environment variables,
user-secrets hoac secret manager.

## 3. Program.cs dang cau hinh gi?

`Program.cs` la diem khoi dong backend.

Nhung viec chinh:

- Dang ky controller API bang `AddControllers()`.
- Bat Swagger/OpenAPI cho development.
- Dang ky `AppDbContext` dung SQL Server.
- Dang ky `IEmailService` va `IPaymentGatewayService`.
- Cau hinh CORS policy `Vite`.
- Cau hinh JWT Bearer authentication.
- Goi `DbSeeder.Seed(context)` khi app start de seed du lieu mau.
- Gan middleware theo thu tu:
  - Swagger neu development.
  - HTTPS redirection.
  - CORS.
  - Authentication.
  - Authorization.
  - MapControllers.

## 4. Cau truc thu muc backend

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
├── Models/
├── Services/
├── Migrations/
├── Program.cs
└── api.csproj
```

Vai tro tung nhom:

- `Controllers`: noi nhan HTTP request va tra response.
- `Models`: EF Core entity, tuong ung bang database.
- `DTOs`: object request/response cho API.
- `Data`: DbContext va seed data.
- `Services`: logic ngoai controller, hien co email va payment gateway.
- `Migrations`: lich su thay doi schema database.

## 5. Response API chuan

Backend dung wrapper chung `ApiResponse<T>`.

Response thanh cong:

```json
{
  "success": true,
  "data": {},
  "message": "OK",
  "error": null,
  "pagination": null
}
```

Response loi:

```json
{
  "success": false,
  "data": null,
  "message": "San pham khong ton tai.",
  "error": "NOT_FOUND",
  "pagination": null
}
```

Response co phan trang:

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

Frontend nen doc `success`, `data`, `message`, `error`, `pagination` thay vi gia dinh API tra object thuan.

## 6. Cac nhom model/database chinh

### 6.1 Auth/User

Bang/model:

- `Role`
- `User`
- `RefreshToken`
- `Address`

Y nghia:

- `Role`: quyen `Admin`, `Staff`, `Customer`.
- `User`: tai khoan nguoi dung.
- `RefreshToken`: token dai han de refresh access token.
- `Address`: dia chi giao hang cua user.

### 6.2 Catalog

Bang/model:

- `Category`
- `Product`
- `ProductImage`
- `ProductVariant`
- `Specification`

Y nghia:

- `Category`: danh muc san pham, co the co cha/con.
- `Product`: san pham chinh, co slug, brand, gia, anh thumbnail.
- `ProductImage`: danh sach anh phu.
- `ProductVariant`: bien the SKU, mau, RAM, dung luong, chenhlech gia.
- `Specification`: thong so ky thuat dang key-value.

### 6.3 Cart

Bang/model:

- `Cart`
- `CartItem`
- `Coupon`

Y nghia:

- Cart co the gan voi `UserId` neu da dang nhap.
- Guest cart dung `SessionId` qua header `X-Session-Id`.
- Cart co the ap dung mot coupon.

### 6.4 Order/Payment

Bang/model:

- `Order`
- `OrderItem`
- `OrderStatusLog`
- `Payment`

Y nghia:

- `Order`: don hang, trang thai, dia chi nhan hang, tong tien.
- `OrderItem`: snapshot san pham tai thoi diem dat hang.
- `OrderStatusLog`: lich su thay doi trang thai.
- `Payment`: thong tin COD/VNPay/Momo.

### 6.5 Promotion/Inventory/Review

Bang/model:

- `Promotion`
- `PromotionProduct`
- `Inventory`
- `InventoryLog`
- `Review`

Y nghia:

- `Promotion`: chuong trinh khuyen mai theo thoi gian.
- `PromotionProduct`: bang noi promotion voi product.
- `Inventory`: ton kho theo variant.
- `InventoryLog`: lich su nhap/xuat/dieu chinh/tru kho/hoan kho.
- `Review`: danh gia san pham, mac dinh tao moi la cho duyet.

## 7. Cac API chinh

### 7.1 Auth API

Controller: `AuthController`

| Method | Endpoint | Quyen | Muc dich |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Dang ky user moi |
| POST | `/api/auth/login` | Public | Dang nhap, tra accessToken + refreshToken |
| POST | `/api/auth/refresh` | Public | Doi refreshToken lay accessToken moi |
| POST | `/api/auth/logout` | Public | Revoke refreshToken |

Sau khi login, frontend can gui header:

```text
Authorization: Bearer <accessToken>
```

### 7.2 Product/Catalog API

Controller: `ProductsController`, `CategoriesController`, `BrandsController`

| Method | Endpoint | Quyen | Muc dich |
|---|---|---|---|
| GET | `/api/products` | Public | List san pham, co filter/sort/paging |
| GET | `/api/products/{slug}` | Public | Chi tiet san pham theo slug |
| POST | `/api/products` | Admin/Staff | Tao san pham |
| PUT | `/api/products/{id}` | Admin/Staff | Cap nhat san pham |
| DELETE | `/api/products/{id}` | Admin | An san pham |
| POST | `/api/products/{id}/images` | Admin/Staff | Upload anh san pham |
| GET | `/api/categories` | Public | Lay cay danh muc |
| GET | `/api/brands` | Public | Lay danh sach brand dang co san pham |

Query `GET /api/products` ho tro:

- `category`
- `brand`
- `minPrice`
- `maxPrice`
- `sort`: `price_asc`, `price_desc`, `newest`
- `page`
- `pageSize`

Luu y quan trong cho frontend: API chi tiet san pham dung `slug`, khong dung id so nhu mock data hien tai.

### 7.3 Cart API

Controller: `CartController`

| Method | Endpoint | Quyen | Muc dich |
|---|---|---|---|
| GET | `/api/cart` | Public/Logged in | Lay gio hang hien tai |
| POST | `/api/cart/items` | Public/Logged in | Them variant vao gio |
| PUT | `/api/cart/items/{id}` | Public/Logged in | Cap nhat so luong cart item |
| DELETE | `/api/cart/items/{id}` | Public/Logged in | Xoa cart item |
| POST | `/api/cart/apply-coupon` | Public/Logged in | Ap ma giam gia |

Cart co 2 che do:

- User da dang nhap: tim cart theo `UserId` trong JWT.
- Guest: tim cart theo `X-Session-Id`.

Neu guest chua co session, backend se tao session moi va tra header:

```text
X-Session-Id: <session-id>
```

Frontend can luu lai header nay va gui lai o cac request cart tiep theo.

### 7.4 Order API

Controller: `OrdersController`

| Method | Endpoint | Quyen | Muc dich |
|---|---|---|---|
| POST | `/api/orders` | Logged in | Tao don COD tu cart hien tai |
| GET | `/api/orders` | Logged in | Lay danh sach don cua user |
| GET | `/api/orders/{id}` | Logged in | Lay chi tiet mot don |
| PATCH | `/api/orders/{id}/cancel` | Logged in | User huy don |

Luong tao don:

1. Lay `UserId` tu JWT.
2. Lay cart cua user.
3. Kiem tra cart khong rong.
4. Kiem tra ton kho tung variant.
5. Tao `Order`.
6. Tao `OrderItem` snapshot.
7. Tru `Inventory`.
8. Ghi `InventoryLog`.
9. Tinh subtotal, discount, grand total.
10. Tao `Payment` mac dinh COD/Pending.
11. Xoa cart items.
12. Gui email confirmation bang mock service.

### 7.5 Payment API

Controller: `PaymentsController`

| Method | Endpoint | Quyen | Muc dich |
|---|---|---|---|
| POST | `/api/payments/vnpay/create` | Logged in | Tao payment URL mock VNPay |
| POST | `/api/payments/momo/create` | Logged in | Tao payment URL mock Momo |
| POST | `/api/payments/vnpay/callback` | Public | Nhan callback VNPay |
| POST | `/api/payments/momo/callback` | Public | Nhan callback Momo |

Payment hien la mock:

- `CreatePaymentUrl()` tao URL callback/return gia lap.
- Callback duoc xac thuc bang HMACSHA256 voi `Payment:CallbackSecret`.
- Neu callback thanh cong, payment chuyen `Paid`, order co the chuyen `Paid`.

### 7.6 Promotion API

Controller: `PromotionsController`

| Method | Endpoint | Quyen | Muc dich |
|---|---|---|---|
| GET | `/api/promotions/active` | Public | Lay promotion dang active |
| GET | `/api/promotions` | Admin/Staff | List promotion |
| GET | `/api/promotions/{id}` | Admin/Staff | Chi tiet promotion |
| POST | `/api/promotions` | Admin/Staff | Tao promotion |
| PUT | `/api/promotions/{id}` | Admin/Staff | Cap nhat promotion |
| DELETE | `/api/promotions/{id}` | Admin/Staff | Tat promotion |

Promotion chi chap nhan `DiscountType` la `Percent` hoac `Fixed`.

### 7.7 Review API

Controller: `ReviewsController`

| Method | Endpoint | Quyen | Muc dich |
|---|---|---|---|
| POST | `/api/reviews` | Logged in | Tao review |
| GET | `/api/products/{id}/reviews` | Public | Lay review visible cua product |

Rule review:

- Rating phai tu 1 den 5.
- User chi review san pham da mua trong don `Completed`.
- Review moi tao co `IsVisible = false`, can duyet truoc khi hien thi.

### 7.8 Admin API

Nhom admin dung JWT role `Admin` hoac `Staff`, rieng user management yeu cau `Admin`.

| Nhom | Endpoint goc | Quyen | Muc dich |
|---|---|---|---|
| Admin Orders | `/api/admin/orders` | Admin/Staff | Quan ly don hang |
| Admin Inventory | `/api/admin/inventory` | Admin/Staff | Quan ly ton kho va log |
| Admin Reports | `/api/admin/reports` | Admin/Staff | Bao cao doanh thu/top products/low stock/export Excel |
| Admin Users | `/api/admin/users` | Admin | Quan ly tai khoan |

## 8. Seed data

`DbSeeder.Seed(context)` chay khi app start.

Du lieu mau hien co:

- Roles:
  - `Admin`
  - `Staff`
  - `Customer`
- Categories:
  - `laptop`
  - `phone`
  - `accessory`
- Users:
  - Admin: `admin@techshop.vn` / `Admin@123`
  - Customer: `test@techshop.vn` / `Test@123`
- Products mau:
  - Laptop ASUS ROG Strix G16
  - MacBook Air M3 13 inch
  - iPhone 15 Pro Max
  - Samsung Galaxy S24 Ultra
  - Tai nghe Sony WH-1000XM5
- Coupon:
  - `TECHSHOP10`
- Promotion:
  - `TechShop Phase 2 Launch`

## 9. Luong frontend can tich hop

### Browse san pham

1. Goi `GET /api/categories` de lay danh muc.
2. Goi `GET /api/brands` neu can filter brand.
3. Goi `GET /api/products?category=phone&page=1&pageSize=20`.
4. Khi click san pham, di den route dung slug.
5. Goi `GET /api/products/{slug}` de lay chi tiet, variants, specs, images.

### Dang nhap

1. Goi `POST /api/auth/login`.
2. Luu `accessToken`, `refreshToken`, `user`.
3. Gan `Authorization: Bearer <accessToken>` cho request can auth.
4. Khi access token het han, goi `POST /api/auth/refresh`.

### Gio hang guest

1. Goi `GET /api/cart`.
2. Neu response co header `X-Session-Id`, luu lai.
3. Them san pham bang `POST /api/cart/items` voi `variantId`.
4. Moi request cart sau do gui lai `X-Session-Id`.

### Checkout COD

1. User phai dang nhap.
2. Gio hang backend phai co item.
3. Goi `POST /api/orders`.
4. Backend tao order, tru kho, clear cart.

## 10. Diem can chu y khi phat trien tiep

Nhung diem da co nhung con nen cai thien:

- Frontend hien chua noi API backend that.
- Backend controller dang chua tach service layer nhieu, logic order/cart con nam truc tiep trong controller.
- `appsettings.json` dang chua phu hop production vi co secret hardcode.
- Payment va email van la mock.
- Review chua co API admin duyet/hien/an review.
- Chua thay test tu dong day du.
- Seed product backend it hon nhieu so voi mock data frontend.

## 11. Checklist khi sua backend

Truoc khi tao PR backend, nen chay:

```bash
dotnet format Backend/api.csproj
dotnet build Backend/api.csproj
```

Neu sua model/schema:

```bash
dotnet ef migrations add <MigrationName> --project Backend/api.csproj --startup-project Backend/api.csproj
dotnet ef database update --project Backend/api.csproj --startup-project Backend/api.csproj
```

Neu them API moi:

- Them DTO request/response neu can.
- Dung `ApiResponse<T>` de response dong nhat.
- Kiem tra role bang `[Authorize]` neu API can bao ve.
- Cap nhat Swagger/test `.http` neu co.
- Cap nhat tai lieu backend neu endpoint thay doi.

