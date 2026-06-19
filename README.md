<div align="center">
  <img src="Frontend/public/favicon.jpg" alt="TechShop Logo" width="120" style="border-radius: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 16px;" />

  # 🛒 TechShop

  **Nền tảng E-Commerce hiện đại dành cho thiết bị công nghệ**
  
  ### 🌐 [**TRẢI NGHIỆM WEBSITE TRỰC TUYẾN TẠI ĐÂY (LIVE DEMO)**](https://techshop-55gp.vercel.app/) 🌐

  [![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

  [Khám phá Frontend](#frontend) •
  [Khám phá Backend](#backend) •
  [Lộ trình phát triển](./TECHSHOP_DEV_ROADMAP.md)
</div>

---

## 📖 Giới thiệu (About The Project)

**TechShop** là một hệ thống thương mại điện tử full-stack chuyên cung cấp các thiết bị công nghệ như Laptop, Điện thoại, và Phụ kiện. Dự án được thiết kế với kiến trúc hiện đại, phân tách rõ ràng giữa Backend (Cung cấp RESTful API) và Frontend (Giao diện người dùng tương tác cao), đảm bảo hiệu năng và khả năng mở rộng.

<div align="center">
  <!-- TODO: Thay thế ảnh dưới đây bằng ảnh chụp màn hình thực tế của dự án -->
  <img src="https://raw.githubusercontent.com/PiupuiTenshi/TechWeb-2026/main/docs/screenshot.png" alt="TechShop Screenshot" onerror="this.src='https://via.placeholder.com/1000x500.png?text=Ảnh+chụp+màn+hình+Trang+chủ+TechShop'" width="100%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
</div>

## ✨ Tính năng nổi bật (Key Features)

*   **🛍️ Mua sắm & Khám phá:** Duyệt sản phẩm theo danh mục (Laptop, Điện thoại), thương hiệu, và cấu hình.
*   **🔍 Lọc & Tìm kiếm:** Lọc sản phẩm động đa tiêu chí (giá, hãng, cấu hình).
*   **🔐 Xác thực & Phân quyền:** Đăng nhập an toàn với JWT và Google OAuth (đang phát triển).
*   **🛒 Giỏ hàng & Thanh toán:** Quản lý giỏ hàng trực quan, hỗ trợ quy trình đặt hàng.
*   **📱 Thiết kế Đáp ứng (Responsive):** Tối ưu hóa UI/UX trên cả PC, Tablet và Mobile.
*   **⚙️ Quản trị hệ thống:** Admin panel quản lý sản phẩm, đơn hàng và người dùng.

## 🛠 Công nghệ sử dụng (Tech Stack)

### Frontend
*   **Framework:** React 18 (sử dụng Vite)
*   **Ngôn ngữ:** JavaScript / HTML / CSS
*   **State Management:** Zustand (dự kiến)
*   **Data Fetching:** Axios / React Query

### Backend
*   **Framework:** .NET 10 Web API
*   **Ngôn ngữ:** C#
*   **ORM:** Entity Framework Core
*   **Authentication:** BCrypt, JWT Bearer

### Database & DevOps
*   **Cơ sở dữ liệu:** PostgreSQL 15 (Supabase / Local)
*   **Containerization:** Docker & Docker Compose
*   **Công cụ:** Swagger UI (API Docs)

## 🚀 Hướng dẫn cài đặt và khởi chạy (Getting Started)

Dự án có thể được khởi chạy theo hai cách trên môi trường Local. Chúng tôi **khuyến nghị sử dụng Docker** để thiết lập nhanh nhất và đồng bộ môi trường.

### Yêu cầu tiên quyết (Prerequisites)
*   **Nếu dùng Docker (Khuyên dùng):** Cài đặt [Docker Desktop](https://www.docker.com/).
*   **Nếu chạy thủ công:** Cài đặt [Node.js](https://nodejs.org/) (v18+), [.NET SDK 10](https://dotnet.microsoft.com/), và [PostgreSQL](https://www.postgresql.org/) (hoặc sử dụng Supabase).

### Bước 1. Clone repository
Dù chạy bằng cách nào, trước tiên bạn cần tải mã nguồn về máy:
```bash
git clone https://github.com/PiupuiTenshi/TechWeb-2026.git
cd TechWeb-2026
```

---

### Cách 1. Chạy tự động bằng Docker (Khuyên dùng 🌟)
Phương pháp này sẽ tự động khởi tạo Frontend, Backend API, và cả Database PostgreSQL trong các container riêng biệt mà không cần cài đặt thêm gì.

1. Tại thư mục gốc `TechWeb-2026`, mở terminal và chạy lệnh:
   ```bash
   docker-compose up --build
   ```
2. Đợi quá trình tải và build hoàn tất. Hệ thống sẽ có sẵn tại:
   *   **Frontend:** `http://localhost:5173`
   *   **Backend API & Swagger:** `http://localhost:5000/swagger`
   *   **Database:** `localhost:5432`

---

### Cách 2. Chạy thủ công (Manual Setup)
Nếu bạn muốn phát triển từng phần độc lập mà không dùng Docker, hãy làm theo các bước sau:

#### Thiết lập Backend (.NET API)
```bash
cd Backend
```
1.  **Cấu hình Biến môi trường:** Mở/tạo file `appsettings.Development.json` (hoặc `appsettings.json`) và cấu hình chuỗi kết nối Database cũng như JWT Secret Key:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Host=localhost;Port=5432;Database=techshop;Username=postgres;Password=local_password_123;"
      },
      "Jwt": {
        "Key": "chuoi-ki-tu-bi-mat-cua-ban-dai-hon-32-ki-tu",
        "Issuer": "TechShop",
        "Audience": "TechShopClient"
      }
    }
    ```
2.  Cài đặt EF Core CLI (nếu chưa có): `dotnet tool install --global dotnet-ef`
3.  Chạy Migrations để khởi tạo Database:
    ```bash
    dotnet ef database update
    ```
4.  Khởi chạy Backend:
    ```bash
    dotnet run
    ```

#### Thiết lập Frontend (React)
Mở một terminal mới và trỏ vào thư mục Frontend:
```bash
cd Frontend
```
1.  **Cấu hình Biến môi trường:** Tạo file `.env` ở gốc thư mục `Frontend` (bạn có thể copy từ `.env.example` nếu có):
    ```env
    VITE_API_URL=http://localhost:5000
    ```
2.  Cài đặt dependencies và khởi chạy:
    ```bash
    npm install
    npm run dev
    ```

## 📂 Cấu trúc thư mục (Folder Structure)

```text
TechWeb-2026/
├── Backend/                 # Mã nguồn .NET 10 Web API
│   ├── Controllers/         # API Endpoints
│   ├── Models/              # Database Entities
│   ├── DTOs/                # Data Transfer Objects
│   ├── Services/            # Business Logic
│   └── ...
├── Frontend/                # Mã nguồn React
│   ├── src/                 # Source code (Components, Pages, utils...)
│   ├── public/              # Static assets
│   └── ...
├── docs/                    # Tài liệu bổ sung
├── TECHSHOP_DEV_ROADMAP.md  # Kế hoạch phát triển chi tiết
└── docker-compose.yml       # Cấu hình Docker cho toàn bộ dự án
```

## 🗺 Lộ trình phát triển (Roadmap)
Dự án đang được phát triển tích cực. Vui lòng xem chi tiết kế hoạch các tính năng và phân công công việc tại [TECHSHOP_DEV_ROADMAP.md](./TECHSHOP_DEV_ROADMAP.md).

## 👥 Đội ngũ phát triển (Contributors)

| Avatar | Developer | Role | GitHub |
| :---: | :--- | :--- | :--- |
| <img src="https://github.com/PiupuiTenshi.png" width="40" style="border-radius:50%;" alt="PiupuiTenshi"/> | **Dev A (PiupuiTenshi)** | Backend .NET | [@PiupuiTenshi](https://github.com/PiupuiTenshi) |
| <img src="https://github.com/nguyenvanquyen-p3t.png" width="40" style="border-radius:50%;" alt="nguyenvanquyen-p3t"/> | **Dev B (nguyenvanquyen-p3t)** | Frontend React | [@nguyenvanquyen-p3t](https://github.com/nguyenvanquyen-p3t) |
| <img src="https://github.com/Chyeonma.png" width="40" style="border-radius:50%;" alt="Chyeonma"/> | **Dev C (Chyeonma)** | Database & DevOps | [@Chyeonma](https://github.com/Chyeonma) |

---
<div align="center">
  <i>Được thiết kế và phát triển với ❤️ bởi TechShop Team.</i>
</div>
