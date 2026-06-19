<div align="center">
  <img src="Frontend/public/favicon.jpg" alt="TechShop Logo" width="120" style="border-radius: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 16px;" />

  # 🛒 TechShop

  **Nền tảng E-Commerce hiện đại dành cho thiết bị công nghệ**

  [![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![SQL Server](https://img.shields.io/badge/SQL_Server-2022-CC292B?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/sql-server)
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
*   **Cơ sở dữ liệu:** SQL Server 2022
*   **Containerization:** Docker & Docker Compose
*   **Công cụ:** Swagger UI (API Docs)

## 🚀 Hướng dẫn cài đặt (Getting Started)

Làm theo các bước dưới đây để thiết lập môi trường và chạy dự án trên máy của bạn.

### Yêu cầu tiên quyết (Prerequisites)
*   [Node.js](https://nodejs.org/) (Phiên bản LTS, khuyên dùng v18+)
*   [.NET SDK 10](https://dotnet.microsoft.com/)
*   [SQL Server 2022](https://www.microsoft.com/sql-server) hoặc [Docker](https://www.docker.com/)

### 1. Clone repository
```bash
git clone https://github.com/PiupuiTenshi/TechWeb-2026.git
cd TechWeb-2026
```

### 2. Thiết lập Backend (.NET API)
```bash
cd Backend
```
*   **Cấu hình Biến môi trường:** Mở/tạo file `appsettings.Development.json` (hoặc `appsettings.json`) và thêm cấu hình chuỗi kết nối Database cũng như JWT Secret Key:
    ```json
    {
      "ConnectionStrings": {
        "DefaultConnection": "Server=localhost;Database=TechShopDb;User Id=sa;Password=MatKhauCuaBan123@;TrustServerCertificate=True;"
      },
      "Jwt": {
        "Key": "chuoi-ki-tu-bi-mat-cua-ban-dai-hon-32-ki-tu",
        "Issuer": "http://localhost:5000",
        "Audience": "http://localhost:5173"
      }
    }
    ```
*   Cài đặt EF Core CLI (nếu chưa có): `dotnet tool install --global dotnet-ef`
*   Chạy Migrations để tạo Database:
```bash
dotnet ef database update
```
*   Khởi chạy Backend:
```bash
dotnet run
```
*   *API sẽ chạy mặc định. Truy cập `/swagger` để xem tài liệu API.*

### 3. Thiết lập Frontend (React)
Mở một terminal mới và trỏ vào thư mục Frontend:
```bash
cd Frontend
```
*   **Cấu hình Biến môi trường:** Tạo file `.env` ở gốc thư mục `Frontend` (bạn có thể copy từ `.env.example` nếu có) và cấu hình các thông số cần thiết:
    ```env
    # Đường dẫn tới Backend API
    VITE_API_URL=http://localhost:5000
    
    # Các cấu hình khác nếu có
    # VITE_GOOGLE_CLIENT_ID=your-google-client-id
    ```
*   Cài đặt dependencies và chạy project:
```bash
npm install
npm run dev
```

### 4. Chạy bằng Docker (Khuyên dùng)
Nếu bạn đã cài Docker, bạn có thể khởi chạy toàn bộ hệ thống bằng 1 lệnh duy nhất ở thư mục gốc:
```bash
docker-compose up --build
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
