# 🛒 TechShop — Kế hoạch Phát triển (Cập nhật theo thực tế repo)

> **Stack:** .NET 10 Web API · React 18 + JS · SQL Server 2022 · Docker  
> **Repo:** `https://github.com/PiupuiTenshi/TechWeb-2026`  
> **Branch hiện tại:** `main` | 9 branches | 19 commits

---

## 📊 Trạng Thái Hiện Tại (21/05/2026)

### ✅ Frontend — Đã làm được

| Đã có | Ghi chú |
|---|---|
| `Header`, `Footer` | Layout cơ bản |
| `BrandCard`, `BrandCardList` | Hiển thị danh sách hãng |
| `CategoryCard`, `CategoryCardList` | Danh sách danh mục |
| `ProductCard`, `ProductGrid`, `ProductSection` | Card + lưới sản phẩm |
| `FilterBar`, `SortBar` | Lọc + sắp xếp (UI) |
| `Breadcrumb`, `ScrollToTop` | UX components |
| `ProductDetail/*` — Hero, SpecsTable, Policy, AccessoryDesc | Trang chi tiết |
| `SeriesCard` | Card dòng sản phẩm |
| Pages: `HomePage`, `LaptopPage`, `PhonePage`, `AccessoryPage` | Các trang chính |
| Pages: `BrandSeriesPage`, `ProductDetailPage` | Trang brand + chi tiết |
| `data/products.js` | ⚠️ Data đang **hardcode** — cần chuyển sang API |
| Logo assets (acer, asus, dell, lenovo, msi...) | Static assets |

### ⚠️ Frontend — Chưa có / Cần làm

- Tích hợp API thật (axios, React Query)
- Auth pages (login, register)
- Cart, Checkout, Orders
- Admin panel
- State management (Zustand)

### ✅ Backend — Đã có

| Đã có | Ghi chú |
|---|---|
| `api.csproj` với packages | BCrypt, JWT, Swagger, EF Core, Google OAuth |
| `Program.cs` | Cấu hình cơ bản |
| `appsettings.json` | Settings template |

### ⚠️ Backend — Chưa có

- Controllers, Models, DTOs, Services
- DbContext + Migrations
- Tất cả API endpoints

### ⚠️ Database — Chưa có
- Schema chưa tạo, chưa có migration, chưa có seed data

---

## 👥 Phân Công (Giữ nguyên)

| Thành viên | Role | Nhánh chính |
|---|---|---|
| **Dev A** (PiupuiTenshi) | Backend .NET | `feature/backend-*` |
| **Dev B** (nguyenvanquyen-p3t) | Frontend React | `feature/frontend-*` |
| **Dev C** (Chyeonma)| Database + DevOps | `feature/db-*`, `feature/devops-*` |

---

## 🚨 Việc Cần Làm NGAY (Tuần này)

### Ưu tiên #1 — Dọn dẹp & Chuẩn hoá (Cả nhóm, 1–2 ngày)

#### Dev B — Tái cấu trúc Frontend (QUAN TRỌNG)

Hiện tại pages đang tách theo từng brand/category riêng lẻ (`LaptopPage`, `PhonePage`, `BrandSeriesPage`...). Cách này **không scale** khi có database thật. Cần refactor:

```
HIỆN TẠI (hardcode, không scale):
pages/LaptopPage.jsx      ← hardcode data laptop
pages/PhonePage.jsx       ← hardcode data phone
pages/AccessoryPage.jsx   ← hardcode data phụ kiện
pages/BrandSeriesPage.jsx ← hardcode theo brand
data/products.js          ← toàn bộ data nằm đây

↓ REFACTOR THÀNH (dynamic từ API):

pages/
├── shop/
│   ├── HomePage.jsx              ← giữ nguyên, sẽ fetch từ API
│   ├── ProductListPage.jsx       ← 1 trang duy nhất, nhận ?category=laptop&brand=asus
│   ├── ProductDetailPage.jsx     ← giữ nguyên, đổi data source
│   ├── CartPage.jsx              ← tạo mới
│   ├── CheckoutPage.jsx          ← tạo mới
│   └── OrderDetailPage.jsx       ← tạo mới
└── auth/
    ├── LoginPage.jsx             ← tạo mới
    └── RegisterPage.jsx          ← tạo mới
```

> **Giải pháp:** Gộp `LaptopPage`, `PhonePage`, `AccessoryPage` thành **1 `ProductListPage`** nhận query params. `BrandSeriesPage` → thành filter theo brand trong `ProductListPage`. Data từ `products.js` sẽ dùng tạm bằng mock API hook cho đến khi backend xong.

#### Dev C — Tạo Schema Database ngay

```bash
# Tạo branch
git checkout develop
git checkout -b feature/db-phase1-schema
# Tạo file database/init.sql và database/seed.sql
# PR vào develop cuối ngày
```

#### Dev A — Khởi tạo cấu trúc Backend

```bash
git checkout develop
git checkout -b feature/backend-setup
# Tạo thư mục Controllers/, Models/, DTOs/, Services/, Data/
# Setup AppDbContext kết nối với schema Dev C
```

---

## 🌿 Quy Ước GitHub (Cập nhật)

### Branch hiện có (cần dọn)

```bash
# Kiểm tra branch nào đã merge xong → xoá đi cho gọn
git branch -r  # xem remote branches
```

### Branch Strategy

```
main          ← production-ready (chỉ merge từ develop qua PR)
develop       ← integration branch ← tạo ngay nếu chưa có!
feature/xxx   ← từng feature nhỏ, tạo từ develop
hotfix/xxx    ← bug khẩn từ main
```

> ⚠️ Hiện tại đang commit thẳng lên `main`. Hãy **tạo branch `develop`** và làm việc từ đó.

```bash
# Tạo develop từ main
git checkout main
git checkout -b develop
git push -u origin develop
```

### Quy Ước Commit

```
feat: thêm ProductListPage dynamic
fix: sửa FilterBar không nhận query params
refactor: gộp LaptopPage + PhonePage → ProductListPage
chore: setup AppDbContext + migrations
```

### Cấu Trúc Repo Chuẩn (mục tiêu)

```
TechWeb-2026/
├── .github/
│   └── workflows/
│       └── ci.yml
├── Backend/                    ← đã có, cần thêm folders
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── ProductsController.cs
│   │   ├── CategoriesController.cs
│   │   ├── CartController.cs
│   │   ├── OrdersController.cs
│   │   ├── PaymentsController.cs
│   │   ├── ReviewsController.cs
│   │   └── Admin/
│   │       ├── AdminOrdersController.cs
│   │       ├── AdminInventoryController.cs
│   │       └── AdminReportsController.cs
│   ├── Models/                 # EF Core entities (21 bảng)
│   ├── DTOs/
│   │   ├── Auth/
│   │   ├── Product/
│   │   ├── Order/
│   │   └── Common/             # ApiResponse<T>, PagedResult<T>
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── ProductService.cs
│   │   ├── CartService.cs
│   │   ├── OrderService.cs
│   │   ├── InventoryService.cs
│   │   └── EmailService.cs
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   └── Migrations/
│   ├── Middleware/
│   │   └── ExceptionHandlerMiddleware.cs
│   ├── api.csproj              ← đã có
│   ├── Program.cs              ← đã có
│   └── appsettings.json        ← đã có
├── Frontend/                   ← đã có, cần refactor + thêm
│   ├── src/
│   │   ├── api/                # TẠO MỚI
│   │   │   ├── axiosConfig.js
│   │   │   ├── productApi.js
│   │   │   ├── authApi.js
│   │   │   ├── cartApi.js
│   │   │   └── orderApi.js
│   │   ├── store/              # TẠO MỚI
│   │   │   ├── authStore.js
│   │   │   └── cartStore.js
│   │   ├── hooks/              # TẠO MỚI
│   │   │   ├── useProducts.js  # wrap React Query
│   │   │   └── useAuth.js
│   │   ├── components/         # đã có, giữ nguyên + bổ sung
│   │   │   ├── BrandCard/      ✅
│   │   │   ├── Breadcrumb/     ✅
│   │   │   ├── CategoryCard/   ✅
│   │   │   ├── FilterBar/      ✅ (cần kết nối query params)
│   │   │   ├── Footer/         ✅
│   │   │   ├── Header/         ✅ (cần thêm cart badge, auth)
│   │   │   ├── ProductCard/    ✅
│   │   │   ├── ProductDetail/  ✅
│   │   │   ├── ProductGrid/    ✅
│   │   │   ├── ProductSection/ ✅
│   │   │   ├── SeriesCard/     ✅
│   │   │   ├── SortBar/        ✅
│   │   │   ├── ScrollToTop/    ✅
│   │   │   └── common/         TẠO MỚI (Button, Modal, Spinner, Toast)
│   │   ├── pages/
│   │   │   ├── shop/
│   │   │   │   ├── HomePage.jsx          ✅ refactor fetch từ API
│   │   │   │   ├── ProductListPage.jsx   🔄 gộp Laptop+Phone+Accessory
│   │   │   │   ├── ProductDetailPage.jsx ✅ refactor fetch từ API
│   │   │   │   ├── CartPage.jsx          ➕ tạo mới
│   │   │   │   ├── CheckoutPage.jsx      ➕ tạo mới
│   │   │   │   └── OrderDetailPage.jsx   ➕ tạo mới
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.jsx         ➕ tạo mới
│   │   │   │   └── RegisterPage.jsx      ➕ tạo mới
│   │   │   └── admin/                    ➕ tạo mới (Phase 3)
│   │   ├── assets/             ✅ đã có logos
│   │   ├── data/
│   │   │   └── products.js     ⚠️ dùng tạm, xoá khi API xong
│   │   ├── utils/              TẠO MỚI
│   │   │   └── formatPrice.js
│   │   └── constants/          TẠO MỚI
│   │       └── index.js        # ORDER_STATUS, ROLES, API_BASE_URL
│   ├── package.json            ✅
│   └── vite.config.js
├── database/                   TẠO MỚI (Dev C)
│   ├── init.sql
│   ├── seed.sql
│   └── indexes.sql
├── docker-compose.yml          TẠO MỚI (Dev C, Phase 4)
├── .env.example                TẠO MỚI
├── .gitignore                  ✅ đã có
└── README.md                   ➕ thêm hướng dẫn setup
```

---

## 📅 Phase 1 — Kết nối Frontend ↔ Backend (Tuần 1–4)

**Mục tiêu:** Chuyển data từ `products.js` hardcode sang API thật. Auth hoạt động. Giỏ hàng + đặt hàng COD.

---

### 🗄️ Dev C — Database Schema (Tuần 1)

**Branch:** `feature/db-phase1-schema`

**Thứ tự tạo 21 bảng (theo FK dependency):**

```sql
-- 1. Roles
CREATE TABLE Roles (
    RoleId   INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) UNIQUE NOT NULL  -- 'Admin','Staff','Customer'
);

-- 2. Categories (đa cấp, self-ref)
CREATE TABLE Categories (
    CategoryId   INT IDENTITY(1,1) PRIMARY KEY,
    ParentId     INT REFERENCES Categories(CategoryId),
    Name         NVARCHAR(150) NOT NULL,
    Slug         VARCHAR(200) UNIQUE NOT NULL,
    DisplayOrder INT DEFAULT 0,
    IsActive     BIT DEFAULT 1
);
-- Seed categories: Laptop, Điện thoại, Phụ kiện (cấp 1)
-- Sub: Gaming Laptop, MacBook, iPhone, Samsung... (cấp 2)

-- 3. Users
CREATE TABLE Users (
    UserId       UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Email        NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName     NVARCHAR(150) NOT NULL,
    Phone        NVARCHAR(20),
    AvatarUrl    NVARCHAR(500),
    RoleId       INT NOT NULL REFERENCES Roles(RoleId),
    IsActive     BIT DEFAULT 1,
    CreatedAt    DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

-- 4. RefreshTokens
CREATE TABLE RefreshTokens (
    TokenId   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    UserId    UNIQUEIDENTIFIER NOT NULL REFERENCES Users(UserId),
    Token     NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    IsRevoked BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- 5. Addresses
CREATE TABLE Addresses (
    AddressId    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    UserId       UNIQUEIDENTIFIER NOT NULL REFERENCES Users(UserId),
    ReceiverName NVARCHAR(150) NOT NULL,
    Phone        NVARCHAR(20) NOT NULL,
    Province     NVARCHAR(100) NOT NULL,
    District     NVARCHAR(100) NOT NULL,
    Ward         NVARCHAR(100) NOT NULL,
    Street       NVARCHAR(255) NOT NULL,
    IsDefault    BIT DEFAULT 0
);

-- 6. Coupons
CREATE TABLE Coupons (
    CouponId      UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Code          VARCHAR(50) UNIQUE NOT NULL,
    DiscountType  VARCHAR(20) NOT NULL,   -- 'Percent','Fixed'
    DiscountValue DECIMAL(18,2) NOT NULL,
    MinOrderValue DECIMAL(18,2) DEFAULT 0,
    MaxDiscount   DECIMAL(18,2),
    UsageLimit    INT DEFAULT 1,
    UsedCount     INT DEFAULT 0,
    StartsAt      DATETIME2 NOT NULL,
    ExpiresAt     DATETIME2 NOT NULL,
    IsActive      BIT DEFAULT 1
);

-- 7. Promotions
CREATE TABLE Promotions (
    PromotionId   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    Name          NVARCHAR(150) NOT NULL,
    DiscountType  VARCHAR(20) NOT NULL,
    DiscountValue DECIMAL(18,2) NOT NULL,
    StartsAt      DATETIME2 NOT NULL,
    EndsAt        DATETIME2 NOT NULL,
    IsActive      BIT DEFAULT 1
);

-- 8. Products
CREATE TABLE Products (
    ProductId    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    CategoryId   INT NOT NULL REFERENCES Categories(CategoryId),
    Name         NVARCHAR(255) NOT NULL,
    Slug         VARCHAR(300) UNIQUE NOT NULL,
    Brand        NVARCHAR(100),          -- 'Asus','Apple','Samsung'...
    Description  NVARCHAR(MAX),
    BasePrice    DECIMAL(18,2) NOT NULL,
    SalePrice    DECIMAL(18,2),
    ThumbnailUrl NVARCHAR(500),
    Tags         NVARCHAR(500),
    IsFeatured   BIT DEFAULT 0,
    IsActive     BIT DEFAULT 1,
    CreatedAt    DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt    DATETIME2 DEFAULT GETUTCDATE()
);

-- 9. ProductImages
CREATE TABLE ProductImages (
    ImageId   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    ProductId UNIQUEIDENTIFIER NOT NULL REFERENCES Products(ProductId),
    ImageUrl  NVARCHAR(500) NOT NULL,
    AltText   NVARCHAR(255),
    SortOrder INT DEFAULT 0
);

-- 10. ProductVariants
CREATE TABLE ProductVariants (
    VariantId   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    ProductId   UNIQUEIDENTIFIER NOT NULL REFERENCES Products(ProductId),
    SKU         VARCHAR(100) UNIQUE NOT NULL,
    Color       NVARCHAR(50),
    RAM         NVARCHAR(20),
    Storage     NVARCHAR(20),
    PriceOffset DECIMAL(18,2) DEFAULT 0,
    IsActive    BIT DEFAULT 1
);

-- 11. Specifications (key-value: CPU, RAM, Pin...)
CREATE TABLE Specifications (
    SpecId    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    ProductId UNIQUEIDENTIFIER NOT NULL REFERENCES Products(ProductId),
    SpecKey   NVARCHAR(100) NOT NULL,
    SpecValue NVARCHAR(255) NOT NULL,
    SortOrder INT DEFAULT 0
);

-- 12. PromotionProducts
CREATE TABLE PromotionProducts (
    Id          UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    PromotionId UNIQUEIDENTIFIER NOT NULL REFERENCES Promotions(PromotionId),
    ProductId   UNIQUEIDENTIFIER NOT NULL REFERENCES Products(ProductId)
);

-- 13. Inventory
CREATE TABLE Inventory (
    InventoryId   UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    VariantId     UNIQUEIDENTIFIER UNIQUE NOT NULL REFERENCES ProductVariants(VariantId),
    Quantity      INT DEFAULT 0 CHECK (Quantity >= 0),
    LowStockAlert INT DEFAULT 5,
    UpdatedAt     DATETIME2 DEFAULT GETUTCDATE()
);

-- 14. InventoryLogs
CREATE TABLE InventoryLogs (
    LogId      UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    VariantId  UNIQUEIDENTIFIER NOT NULL REFERENCES ProductVariants(VariantId),
    ChangeType VARCHAR(20) NOT NULL,  -- 'Import','Export','Adjust','SaleDeduct','CancelReturn'
    Quantity   INT NOT NULL,
    Note       NVARCHAR(255),
    CreatedBy  UNIQUEIDENTIFIER REFERENCES Users(UserId),
    CreatedAt  DATETIME2 DEFAULT GETUTCDATE()
);

-- 15. Carts
CREATE TABLE Carts (
    CartId    UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    UserId    UNIQUEIDENTIFIER REFERENCES Users(UserId),
    SessionId NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- 16. CartItems
CREATE TABLE CartItems (
    CartItemId UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    CartId     UNIQUEIDENTIFIER NOT NULL REFERENCES Carts(CartId),
    VariantId  UNIQUEIDENTIFIER NOT NULL REFERENCES ProductVariants(VariantId),
    Quantity   INT DEFAULT 1 CHECK (Quantity > 0),
    AddedAt    DATETIME2 DEFAULT GETUTCDATE()
);

-- 17. Orders
CREATE TABLE Orders (
    OrderId         UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    UserId          UNIQUEIDENTIFIER NOT NULL REFERENCES Users(UserId),
    CouponId        UNIQUEIDENTIFIER REFERENCES Coupons(CouponId),
    AddressId       UNIQUEIDENTIFIER NOT NULL REFERENCES Addresses(AddressId),
    Status          VARCHAR(30) DEFAULT 'Pending',
    SubTotal        DECIMAL(18,2) NOT NULL,
    DiscountAmount  DECIMAL(18,2) DEFAULT 0,
    ShippingFee     DECIMAL(18,2) DEFAULT 0,
    TotalAmount     DECIMAL(18,2) NOT NULL,
    Note            NVARCHAR(500),
    ShippingCarrier NVARCHAR(100),
    TrackingCode    NVARCHAR(100),
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 DEFAULT GETUTCDATE()
);

-- 18. OrderItems
CREATE TABLE OrderItems (
    OrderItemId UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    OrderId     UNIQUEIDENTIFIER NOT NULL REFERENCES Orders(OrderId),
    VariantId   UNIQUEIDENTIFIER NOT NULL REFERENCES ProductVariants(VariantId),
    ProductName NVARCHAR(255) NOT NULL,
    VariantInfo NVARCHAR(255),
    Quantity    INT NOT NULL CHECK (Quantity > 0),
    UnitPrice   DECIMAL(18,2) NOT NULL,
    Subtotal    AS (Quantity * UnitPrice) PERSISTED
);

-- 19. OrderStatusLogs
CREATE TABLE OrderStatusLogs (
    LogId     UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    OrderId   UNIQUEIDENTIFIER NOT NULL REFERENCES Orders(OrderId),
    OldStatus VARCHAR(30),
    NewStatus VARCHAR(30) NOT NULL,
    Note      NVARCHAR(255),
    ChangedBy UNIQUEIDENTIFIER REFERENCES Users(UserId),
    ChangedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- 20. Payments
CREATE TABLE Payments (
    PaymentId       UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    OrderId         UNIQUEIDENTIFIER UNIQUE NOT NULL REFERENCES Orders(OrderId),
    Method          VARCHAR(20) NOT NULL,  -- 'COD','VNPay','Momo'
    Status          VARCHAR(20) DEFAULT 'Pending',
    Amount          DECIMAL(18,2) NOT NULL,
    TransactionCode NVARCHAR(100),
    GatewayResponse NVARCHAR(MAX),
    PaidAt          DATETIME2,
    CreatedAt       DATETIME2 DEFAULT GETUTCDATE()
);

-- 21. Reviews
CREATE TABLE Reviews (
    ReviewId  UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    ProductId UNIQUEIDENTIFIER NOT NULL REFERENCES Products(ProductId),
    UserId    UNIQUEIDENTIFIER NOT NULL REFERENCES Users(UserId),
    OrderId   UNIQUEIDENTIFIER REFERENCES Orders(OrderId),
    Rating    TINYINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Title     NVARCHAR(150),
    Body      NVARCHAR(2000),
    IsVisible BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);
```

**Seed data tối thiểu để test:**
- 3 Roles: Admin, Staff, Customer
- Categories: Laptop, Điện thoại, Phụ kiện (+ subcategories theo brands đã có trong Frontend)
- 10 sản phẩm mẫu (khớp với data đang có trong `products.js` của Frontend)
- 2 Users: 1 Admin (`admin@techshop.vn`), 1 Customer (`test@techshop.vn`)

**Deliverable:** `database/init.sql` + `database/seed.sql` merge vào `develop` **trước thứ Tư**

---

### ⚙️ Dev A — Backend (Tuần 1–4)

#### Tuần 1 — Setup + Auth API

**Branch:** `feature/backend-auth`

> Packages đã có sẵn trong `api.csproj`: BCrypt, JWT, Swagger, EF Core, Google APIs

- [ ] Tạo cấu trúc folders: `Controllers/`, `Models/`, `DTOs/`, `Services/`, `Data/`
- [ ] `Data/AppDbContext.cs` — DbSet cho 21 entities, kết nối SQL Server
- [ ] `Models/` — 21 C# entities map đúng với schema Dev C
- [ ] Cấu hình `appsettings.json`:
  ```json
  {
    "ConnectionStrings": { "Default": "Server=...;Database=TechShop;..." },
    "Jwt": { "Secret": "", "Issuer": "TechShop", "AccessTokenExpiry": "15", "RefreshTokenExpiry": "7" }
  }
  ```
- [ ] `DTOs/Common/ApiResponse.cs` — wrapper chuẩn cho tất cả response
- [ ] **Auth endpoints:**
  - `POST /api/auth/register`
  - `POST /api/auth/login` → trả `accessToken` (15 phút) + `refreshToken` (7 ngày)
  - `POST /api/auth/refresh` → rotate refreshToken
  - `POST /api/auth/logout` → revoke refreshToken
- [ ] Swagger + bearer auth
- [ ] CORS cho `http://localhost:5173` (Vite dev server)

#### Tuần 2 — Products API (kết nối với data của Frontend)

**Branch:** `feature/backend-products`

> **Lưu ý:** Xem `data/products.js` của Dev B để biết cần trả về fields gì, đảm bảo response format khớp

- [ ] `GET /api/products` — list + filter (`?category=laptop&brand=asus&minPrice=&maxPrice=&sort=price_asc`) + phân trang
- [ ] `GET /api/products/:slug` — chi tiết + variants + images + specs + avgRating
- [ ] `GET /api/categories` — tree (đệ quy ParentId, phục vụ FilterBar)
- [ ] `GET /api/brands` — danh sách brand distinct (phục vụ BrandCard)
- [ ] `POST /api/products` (Admin/Staff) — tạo + variants + specs
- [ ] `PUT /api/products/:id` (Admin/Staff)
- [ ] `DELETE /api/products/:id` (Admin) — soft delete
- [ ] `POST /api/products/:id/images` — upload ảnh → `wwwroot/images/`

**Response format ví dụ (Dev B cần biết để kết nối):**
```json
GET /api/products
{
  "success": true,
  "data": [
    {
      "productId": "...",
      "name": "Laptop ASUS ROG Strix G16",
      "slug": "laptop-asus-rog-strix-g16",
      "brand": "Asus",
      "thumbnailUrl": "/images/asus-rog.webp",
      "basePrice": 35000000,
      "salePrice": 32000000,
      "category": { "categoryId": 1, "name": "Laptop", "slug": "laptop" },
      "isFeatured": true
    }
  ],
  "pagination": { "page": 1, "pageSize": 20, "total": 45 }
}
```

#### Tuần 3 — Cart & Order API

**Branch:** `feature/backend-cart-order`

- [ ] `GET /api/cart` — lấy giỏ (UserId hoặc SessionId)
- [ ] `POST /api/cart/items` — thêm vào giỏ
- [ ] `PUT /api/cart/items/:id` — cập nhật số lượng
- [ ] `DELETE /api/cart/items/:id` — xoá item
- [ ] `POST /api/cart/apply-coupon` — validate + áp dụng coupon
- [ ] `POST /api/orders` — tạo đơn (transaction: trừ kho + INSERT logs + gửi email mock)
- [ ] `GET /api/orders` — lịch sử đơn hàng
- [ ] `GET /api/orders/:id` — chi tiết đơn + OrderStatusLogs
- [ ] `PATCH /api/orders/:id/cancel` — huỷ đơn + hoàn kho

#### Tuần 4 — Reviews + Admin Orders

**Branch:** `feature/backend-reviews-admin`

- [ ] `POST /api/reviews` — tạo đánh giá (sau khi đơn Completed)
- [ ] `GET /api/products/:id/reviews` — lấy reviews IsVisible=true
- [ ] `GET /api/admin/orders` — tất cả đơn (Staff/Admin)
- [ ] `PATCH /api/admin/orders/:id/status` — cập nhật status + ghi OrderStatusLogs
- [ ] `PUT /api/admin/orders/:id/tracking` — cập nhật mã vận đơn

---

### 🎨 Dev B — Frontend (Tuần 1–4)

#### Tuần 1 — Cài thư viện + Setup API layer + Refactor pages

**Branch:** `feature/frontend-api-setup`

**Cài thêm packages:**
```bash
npm install axios @tanstack/react-query zustand react-hook-form
```

**Tạo `src/api/axiosConfig.js`:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Gắn token vào mọi request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh khi 401
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {
          refreshToken: localStorage.getItem('refreshToken')
        });
        localStorage.setItem('accessToken', data.data.accessToken);
        err.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(err.config);
      } catch { localStorage.clear(); window.location.href = '/login'; }
    }
    return Promise.reject(err);
  }
);
export default api;
```

**Tạo custom hook dùng tạm (giữ data/products.js cho đến khi API xong):**
```javascript
// src/hooks/useProducts.js
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import { mockProducts } from '../data/products'; // fallback tạm

export const useProducts = (filters = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      try {
        const res = await api.get('/products', { params: filters });
        return res.data.data;
      } catch {
        return mockProducts; // fallback khi API chưa xong
      }
    }
  });
};
```

**Refactor pages (QUAN TRỌNG):**
- [ ] Gộp `LaptopPage` + `PhonePage` + `AccessoryPage` → `ProductListPage` nhận `?category=&brand=`
- [ ] Gộp `BrandSeriesPage` vào `ProductListPage` filter theo brand
- [ ] Cập nhật `App.jsx` routing:
  ```jsx
  <Route path="/products" element={<ProductListPage />} />
  <Route path="/products/:slug" element={<ProductDetailPage />} />
  // Redirect các route cũ
  <Route path="/laptop" element={<Navigate to="/products?category=laptop" />} />
  <Route path="/phone" element={<Navigate to="/products?category=phone" />} />
  ```

**Cập nhật các components hiện có:**
- [ ] `Header` — thêm cart badge (số lượng từ `cartStore`), avatar + dropdown khi đã login
- [ ] `FilterBar` — kết nối với URL query params (`useSearchParams`)
- [ ] `SortBar` — kết nối URL query params
- [ ] `BrandCard` — khi click → navigate đến `/products?brand=asus`
- [ ] `CategoryCard` — khi click → navigate đến `/products?category=laptop`

#### Tuần 2 — Auth Pages + ProductListPage từ API

**Branch:** `feature/frontend-auth-productlist`

- [ ] `src/store/authStore.js` (Zustand):
  ```javascript
  import { create } from 'zustand';
  export const useAuthStore = create(set => ({
    user: null, accessToken: null,
    login: (user, token) => { set({ user, accessToken: token }); localStorage.setItem('accessToken', token); },
    logout: () => { set({ user: null, accessToken: null }); localStorage.clear(); }
  }));
  ```
- [ ] `src/store/cartStore.js` (Zustand) — items, count, total
- [ ] `/login` — form email/password, React Hook Form, gọi `authApi.login()`
- [ ] `/register` — form đăng ký + validation
- [ ] `ProtectedRoute` wrapper
- [ ] `ProductListPage` — fetch từ API thật (thay `products.js`), `FilterBar` + `SortBar` kết nối query params, phân trang
- [ ] `ProductDetailPage` — fetch từ API: ảnh gallery, variant selector (cập nhật giá = BasePrice + PriceOffset), SpecsTable từ Specifications API

#### Tuần 3 — Cart + Checkout

**Branch:** `feature/frontend-cart-checkout`

- [ ] `src/store/cartStore.js` sync với `/api/cart` (merge guest cart khi login)
- [ ] `/cart` — hiển thị CartItems, cập nhật qty, xoá, ô nhập coupon, tổng tiền
- [ ] `/checkout` — Wizard 3 bước:
  - Bước 1: Địa chỉ giao hàng (chọn đã lưu hoặc nhập mới)
  - Bước 2: Phương thức vận chuyển
  - Bước 3: Chọn COD + xác nhận
- [ ] `/orders` — lịch sử đơn hàng
- [ ] `/orders/:id` — chi tiết + timeline từ OrderStatusLogs + nút "Huỷ đơn"
- [ ] `/profile` — thông tin cá nhân + quản lý địa chỉ

#### Tuần 4 — Admin Panel Cơ Bản

**Branch:** `feature/frontend-admin-basic`

- [ ] Admin layout riêng (route `/admin/*` protected — chỉ Admin/Staff)
- [ ] `/admin/products` — bảng sản phẩm, CRUD form (tên, category, brand, giá, upload ảnh, variants, specs)
- [ ] `/admin/orders` — bảng đơn hàng, filter theo status, cập nhật status + mã vận đơn

---

## 📅 Phase 2 — Payment & Promotions (Tuần 5–7)

### ⚙️ Dev A

**Branch:** `feature/backend-payment`

- [ ] VNPay integration: `POST /api/payments/vnpay/create` + `POST /api/payments/vnpay/callback`
- [ ] Momo integration tương tự
- [ ] Email service (MailKit): xác nhận đơn, đổi trạng thái, huỷ đơn
- [ ] Promotions API: CRUD + gắn sản phẩm qua `PromotionProducts`
- [ ] `GET /api/promotions/active` — phục vụ banner trang chủ

### 🎨 Dev B

**Branch:** `feature/frontend-payment`

- [ ] Checkout bước 3: thêm VNPay / Momo
- [ ] Trang kết quả thanh toán (`/orders/:id?status=success|fail`)
- [ ] Homepage hiển thị banner Promotions đang active
- [ ] `ProductDetailPage` hiển thị giá sau khuyến mãi

### 🗄️ Dev C

**Branch:** `feature/db-phase2`

- [ ] Indexes: `RefreshTokens(UserId, IsRevoked)`, `Orders(Status, CreatedAt)`, `Payments(OrderId)`
- [ ] Migration thêm `RefundedAt`, `RefundNote` vào `Payments`

---

## 📅 Phase 3 — Admin Dashboard & Inventory (Tuần 8–10)

### ⚙️ Dev A

**Branch:** `feature/backend-admin-reports`

- [ ] `GET /api/admin/reports/revenue` — KPIs + dữ liệu biểu đồ
- [ ] `GET /api/admin/reports/top-products`
- [ ] `GET /api/admin/reports/low-stock`
- [ ] Inventory API: nhập/xuất kho + `InventoryLogs`
- [ ] Users management API
- [ ] Export Excel (ClosedXML)

### 🎨 Dev B

**Branch:** `feature/frontend-admin-dashboard`

- [ ] `/admin/dashboard` — KPI cards + Recharts LineChart doanh thu
- [ ] `/admin/inventory` — bảng tồn kho + InventoryLogs timeline
- [ ] `/admin/users` — quản lý tài khoản
- [ ] `/admin/promotions` — tạo/sửa promotion
- [ ] `/admin/reports` — báo cáo + nút Xuất Excel

### 🗄️ Dev C

**Branch:** `feature/db-phase3-performance`

- [ ] Indexes báo cáo: `OrderItems(VariantId)`, `InventoryLogs(VariantId, CreatedAt)`, `Reviews(ProductId, IsVisible)`
- [ ] Cập nhật seed: thêm dữ liệu mẫu đơn hàng, reviews, promotions

---

## 📅 Phase 4 — Docker & CI/CD (Tuần 11–12)

### 🗄️ Dev C

**Branch:** `feature/devops-docker`

**`docker-compose.yml`:**
```yaml
version: '3.9'
services:
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: Y
      MSSQL_SA_PASSWORD: ${DB_PASSWORD}
    volumes: [sqldata:/var/opt/mssql]
    restart: always

  api:
    build: ./Backend
    ports: ["5000:5000"]
    environment:
      ConnectionStrings__Default: "Server=db;Database=TechShop;User Id=sa;Password=${DB_PASSWORD};TrustServerCertificate=True"
      Jwt__Secret: ${JWT_SECRET}
    depends_on: [db]
    restart: always

  web:
    build: ./Frontend
    ports: ["3000:80"]
    depends_on: [api]

volumes:
  sqldata:
```

**`Dockerfile` Backend:**
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["api.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
EXPOSE 5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "api.dll"]
```

**`Dockerfile` Frontend:**
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

**GitHub Actions (`.github/workflows/ci.yml`):**
```yaml
name: CI
on:
  push: { branches: [develop, main] }
  pull_request: { branches: [develop] }
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '10.x' }
      - run: dotnet restore Backend/api.csproj
      - run: dotnet build Backend/api.csproj --no-restore
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci --prefix Frontend
      - run: npm run build --prefix Frontend
```

---

## 🔗 API Contract (Dev A ↔ Dev B)

### Chuẩn Response

```json
// Thành công
{ "success": true, "data": { ... }, "message": "OK" }

// Danh sách + phân trang
{ "success": true, "data": [...], "pagination": { "page": 1, "pageSize": 20, "total": 100 } }

// Lỗi
{ "success": false, "error": "NOT_FOUND", "message": "Sản phẩm không tồn tại" }
```

### Mapping data/products.js → API fields

> Dev A cần đảm bảo response trả về đúng tên fields để Dev B không phải sửa nhiều components

| `products.js` (hiện tại) | API response field | Ghi chú |
|---|---|---|
| `id` | `productId` | |
| `name` | `name` | |
| `image` | `thumbnailUrl` | |
| `price` | `basePrice` | |
| `salePrice` | `salePrice` | |
| `brand` | `brand` | |
| `specs` (object) | `specifications` (array key-value) | |
| `images` (array) | `images` (array `{imageUrl, altText, sortOrder}`) | |

---

## ⚠️ Dependency Map (Ai cần chờ ai)

```
Dev C (Schema + seed.sql) ──► Dev A (API + EF Models) ──► Dev B (kết nối API)

Tuần 1:
  Dev C: init.sql xong trước thứ Tư → Dev A bắt đầu AppDbContext
  Dev B: KHÔNG chờ — làm refactor pages + setup axios layer SONG SONG
         Dùng products.js làm fallback tạm, hook useProducts() tự switch

Tuần 2:
  Dev A: Products API xong → Dev B bỏ fallback products.js, dùng API thật
  Dev C: seed data khớp với products.js để Frontend test được

Tuần 3:
  Dev A: Cart + Order API PHẢI xong trước khi Dev B làm Checkout

Phase 2:
  Dev C: migration Payment → Dev A: Payment API → Dev B: Payment UI
```

---

## 📋 Checklist Trước Khi Tạo PR

- [ ] Build thành công (không lỗi compile / build Vite)
- [ ] Đã test thủ công flow vừa làm
- [ ] Không commit: `.env`, `bin/`, `obj/`, `node_modules/`, `*.user`
- [ ] Không có `console.log()` debug thừa
- [ ] Nếu thêm bước setup mới → cập nhật `README.md`
- [ ] PR description: làm gì, test thế nào, screenshot nếu có UI

---

## 🚀 Hướng Dẫn Setup Local (Hiện tại — chưa có Docker)

```bash
# Clone
git clone https://github.com/PiupuiTenshi/TechWeb-2026.git
cd TechWeb-2026
git checkout develop   # hoặc tạo develop nếu chưa có

# Backend
cd Backend
# Tạo appsettings.Development.json với connection string thật
dotnet restore
dotnet ef database update   # sau khi Dev C có migrations
dotnet run                  # chạy trên http://localhost:5000

# Frontend (terminal mới)
cd Frontend
npm install
# Tạo .env.local: VITE_API_URL=http://localhost:5000/api
npm run dev                 # chạy trên http://localhost:5173
```

---

*Cập nhật theo thực tế repo `PiupuiTenshi/TechWeb-2026` (21/05/2026)*  
*Phiên bản: 3.0 — điều chỉnh theo cấu trúc folder thực tế + ERD diagram*
