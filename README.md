<div align="center">
  <img src="Frontend/public/favicon.jpg" alt="TechShop Logo" width="120" style="border-radius: 20px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); margin-bottom: 16px;" />

  # 🛒 TechShop

  **Nền tảng E-Commerce hiện đại dành cho thiết bị công nghệ**
  
  ### 🌐 [**TRẢI NGHIỆM WEBSITE TRỰC TUYẾN TẠI ĐÂY (LIVE DEMO)**](#) 🌐

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

Để khởi chạy dự án (dù bằng Docker hay Thủ công), **bắt buộc** phải thiết lập biến môi trường trước.

### Yêu cầu tiên quyết (Prerequisites)
*   **Nếu dùng Docker (Khuyên dùng):** Cài đặt [Docker Desktop](https://www.docker.com/).
*   **Nếu chạy thủ công:** Cài đặt [Node.js](https://nodejs.org/) (v18+), [.NET SDK 10](https://dotnet.microsoft.com/), và [PostgreSQL](https://www.postgresql.org/).

### Bước 1. Clone repository
Tải mã nguồn về máy:
```bash
git clone https://github.com/PiupuiTenshi/TechWeb-2026.git
cd TechWeb-2026
```

---

### Bước 2. Cấu hình Biến môi trường (BẮT BUỘC)

#### 2.1. Cấu hình Backend (`Backend/appsettings.json`)
Tại thư mục `Backend`, tạo file `appsettings.json` (có thể copy từ `appsettings.example.json`) với nội dung mẫu kèm giải thích như sau:

```json
{
  "ConnectionStrings": {
    // Chuỗi kết nối đến PostgreSQL. 
    "DefaultConnection": "Host=db;Port=5432;Database=TechShopDB;Username=postgres;Password=Iloveyou123@123"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    // Danh sách các URL của Frontend được phép gọi tới API (tránh lỗi CORS)
    "AllowedOrigins": [
      "http://localhost:5173"
    ]
  },
  "Jwt": {
    // Chuỗi bí mật dùng để ký và mã hóa Token (Cần đặt phức tạp, không được để lộ)
    "Secret": "Mot-Cai-Key-That-Dai-Va-Bao-Mat-Cua-Sang-12345",
    "Key": "Mot-Cai-Key-That-Dai-Va-Bao-Mat-Cua-Sang-12345",
    // Định danh bên phát hành Token (Issuer) và bên tiêu thụ Token (Audience)
    "Issuer": "TechShop",
    "Audience": "TechShopClient",
    // Thời hạn sống của Access Token (tính bằng phút) và Refresh Token (tính bằng ngày)
    "AccessTokenExpiry": "15",
    "RefreshTokenExpiry": "7"
  },
  "Payment": {
    // Mã bảo mật dùng để xác thực Webhook trả về từ cổng thanh toán
    "CallbackSecret": "TechShop-Payment-Dev-Secret"
  },
  "Brevo": {
    // Cấu hình dịch vụ gửi Email (Brevo) - Nhập API Key thật của bạn vào đây
    "ApiKey": "write-brevokey-cua-ban",
    "SenderName": "TechShop",
    "SenderEmail": "Techshop@techshop.com"
  }
}
```

#### 2.2. Cấu hình Frontend (`Frontend/.env`)
Tại thư mục `Frontend`, tạo file `.env` (có thể copy từ `.env.example`) và cấu hình như sau:

```env
# Địa chỉ gốc của Backend API để Frontend thực hiện các lời gọi mạng (Axios/Fetch)
VITE_API_URL=http://localhost:5000

# Mã Client ID của ứng dụng Google (Dùng cho tính năng Đăng nhập bằng Google Oauth2)
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

### Bước 3. Khởi chạy dự án (Chọn 1 trong 2 cách)

#### Cách 1. Chạy tự động bằng Docker (Khuyên dùng 🌟)
Cách này sẽ tự động tải các Image cần thiết và chạy Backend, Frontend, PostgreSQL DB trong các container cô lập.

1. Tại thư mục gốc `TechWeb-2026`, mở terminal và chạy:
   ```bash
   docker-compose up --build
   ```
2. Chờ quá trình build hoàn tất. Dịch vụ sẽ chạy tại:
   *   **Frontend:** `http://localhost:5173`
   *   **Backend API & Swagger:** `http://localhost:5000/swagger`
   *   **Database (PostgreSQL):** Chạy trên cổng `5432`

#### Cách 2. Chạy thủ công (Manual Setup)
Dành cho trường hợp bạn muốn viết code và debug chuyên sâu ở từng phần.

**1. Khởi chạy Backend:**
```bash
cd Backend
# Cập nhật schema database (Nếu chưa có)
dotnet ef database update
# Chạy Web API
dotnet run
```
*(API sẽ khởi chạy ở `http://localhost:5000`)*

**2. Khởi chạy Frontend:** Mở một cửa sổ Terminal mới
```bash
cd Frontend
# Cài đặt thư viện Node.js
npm install
# Khởi chạy server React/Vite
npm run dev
```
*(Giao diện sẽ khởi chạy ở `http://localhost:5173`)*

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
LƯU Ý: File này đã cũ và không còn được cập nhật!

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
