# TechShop

Nền tảng thương mại điện tử bán sản phẩm công nghệ (laptop, điện thoại, phụ kiện).

**Repo:** https://github.com/PiupuiTenshi/TechWeb-2026  
**Stack:** .NET 10 Web API · React 19 + Vite · PostgreSQL · Docker

---

## Tính năng

- Duyệt, tìm kiếm và lọc sản phẩm theo danh mục, thương hiệu, giá
- Trang chi tiết sản phẩm với ảnh, thông số kỹ thuật, variants (màu, RAM, dung lượng)
- Giỏ hàng — hỗ trợ cả guest (session) và người dùng đã đăng nhập
- Đặt hàng COD, thanh toán VNPay / Momo (mock)
- Mã giảm giá, khuyến mãi theo thời gian
- Đánh giá sản phẩm (sau khi đơn hoàn thành)
- Đăng ký / đăng nhập bằng email hoặc Google OAuth
- Trang quản trị Admin: quản lý sản phẩm, đơn hàng, kho, báo cáo doanh thu, xuất Excel

---

## Cấu trúc thư mục

```
TechWeb-2026/
├── Backend/                  # .NET 10 Web API
│   ├── Controllers/          # API endpoints (Auth, Products, Cart, Orders, Payments, Admin...)
│   ├── Models/               # EF Core entities (User, Product, Order, Cart, Payment, Review...)
│   ├── DTOs/                 # Request / Response objects
│   ├── Data/                 # AppDbContext + DbSeeder
│   ├── Services/             # EmailService (mock), PaymentGatewayService (mock)
│   ├── Migrations/           # Lịch sử schema database
│   ├── Program.cs
│   └── api.csproj
├── Frontend/                 # React 19 + Vite
│   └── src/
│       ├── api/              # Axios config + API functions
│       ├── store/            # Zustand stores (auth, cart)
│       ├── hooks/            # Custom hooks (useProducts, useAuth...)
│       ├── components/       # UI components (Header, Footer, ProductCard, FilterBar...)
│       ├── pages/            # Các trang (HomePage, ProductListPage, Admin...)
│       └── assets/           # Logo hãng, hình ảnh tĩnh
├── docs/                     # Tài liệu nội bộ (API reference, database, data flow)
├── docker-compose.yml
├── Dockerfile
└── render.yaml
```

---

## Yêu cầu

| Công cụ | Phiên bản |
|---|---|
| .NET SDK | 10.x |
| Node.js | 20.x |
| PostgreSQL | 15+ (hoặc SQL Server 2022) |
| Docker (tuỳ chọn) | 24+ |

---

## Cài đặt và chạy local

### 1. Clone repo

```bash
git clone https://github.com/PiupuiTenshi/TechWeb-2026.git
cd TechWeb-2026
git checkout develop
```

### 2. Backend

Tạo file `Backend/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TechShop;User Id=sa;Password=YourPassword;TrustServerCertificate=True"
  },
  "Jwt": {
    "Secret": "your-secret-key-at-least-32-characters",
    "Issuer": "TechShop",
    "AccessTokenExpiry": "15",
    "RefreshTokenExpiry": "7"
  }
}
```

Chạy backend:

```powershell
dotnet restore Backend\api.csproj
dotnet ef database update --project Backend\api.csproj --startup-project Backend\api.csproj
dotnet run --project Backend\api.csproj --urls http://localhost:5000
```

Swagger UI: http://localhost:5000/swagger

### 3. Frontend

Tạo file `Frontend/.env.local`:

```
VITE_API_URL=http://localhost:5000/api
```

Chạy frontend:

```bash
cd Frontend
npm install
npm run dev
```

Ứng dụng: http://localhost:5173

### 4. Docker (tuỳ chọn)

```bash
docker-compose up --build
```

---

## Tài khoản mẫu (seed data)

| Role | Email | Mật khẩu |
|---|---|---|
| Admin | admin@techshop.vn | Admin@123 |
| Customer | test@techshop.vn | Test@123 |

Coupon mẫu: `TECHSHOP10`

---

## API nhanh

| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/products` | Danh sách sản phẩm (filter, sort, paging) |
| GET | `/api/products/{slug}` | Chi tiết sản phẩm |
| GET | `/api/categories` | Cây danh mục |
| GET | `/api/brands` | Danh sách thương hiệu |
| GET | `/api/cart` | Xem giỏ hàng |
| POST | `/api/cart/items` | Thêm vào giỏ |
| POST | `/api/orders` | Đặt hàng |
| GET | `/api/admin/reports/revenue` | Báo cáo doanh thu (Admin/Staff) |

Xem chi tiết: [`docs/BACKEND_API_REFERENCE.md`](docs/BACKEND_API_REFERENCE.md)

---

## Test API

```powershell
# Dùng PowerShell script test toàn bộ flow
.\Backend\TestFullApiFlow.ps1

# Hoặc dùng REST Client trong VS Code
# Mở Backend/TechShopApiTests.http
```

Thứ tự test: login → lấy product → lấy variantId → add to cart → apply coupon → create order → payment mock → admin update status.

---

## Phân công nhóm

| Thành viên | Role | Branch |
|---|---|---|
| PiupuiTenshi | Backend .NET | `feature/backend-*` |
| nguyenvanquyen-p3t | Frontend React | `feature/frontend-*` |
| Chyeonma | Database + DevOps | `feature/db-*`, `feature/devops-*` |

---

## Quy ước làm việc

**Branch strategy:**
```
main          ← production (chỉ merge từ develop qua PR)
develop       ← integration
feature/xxx   ← từng feature, tạo từ develop
hotfix/xxx    ← bug khẩn từ main
```

**Commit message:**
```
feat: thêm ProductListPage dynamic
fix: sửa FilterBar không nhận query params
refactor: gộp LaptopPage + PhonePage → ProductListPage
chore: setup AppDbContext + migrations
```

**Checklist trước khi tạo PR:**
- [ ] Build thành công
- [ ] Đã test thủ công flow vừa làm
- [ ] Không commit: `.env`, `bin/`, `obj/`, `node_modules/`
- [ ] Không có `console.log()` debug thừa
- [ ] PR description: làm gì, test thế nào, screenshot nếu có UI
- [ ] Nếu thêm bước setup mới → cập nhật `README.md`

---

## Tài liệu nội bộ

| File | Nội dung |
|---|---|
| [`docs/BACKEND_OVERVIEW.md`](docs/BACKEND_OVERVIEW.md) | Tổng quan backend, luồng dữ liệu, API chi tiết |
| [`docs/BACKEND_API_REFERENCE.md`](docs/BACKEND_API_REFERENCE.md) | API reference đầy đủ |
| [`docs/BACKEND_DATABASE_AND_FLOWS.md`](docs/BACKEND_DATABASE_AND_FLOWS.md) | Schema database, quan hệ, các luồng chính |
| [`docs/BACKEND_DATA_FLOW.md`](docs/BACKEND_DATA_FLOW.md) | Sơ đồ luồng dữ liệu (Mermaid) |
| [`TECHSHOP_DEV_ROADMAP.md`](TECHSHOP_DEV_ROADMAP.md) | Kế hoạch phát triển theo phase |

---

## Trạng thái dự án

Xem chi tiết tại [`TECHSHOP_DEV_ROADMAP.md`](TECHSHOP_DEV_ROADMAP.md).

- **Phase 1** — Kết nối Frontend ↔ Backend, Auth, Cart, Order COD
- **Phase 2** — Thanh toán VNPay/Momo, Email thật, Promotions
- **Phase 3** — Admin Dashboard, Inventory, Báo cáo, Export Excel
- **Phase 4** — Docker, CI/CD, Deploy
