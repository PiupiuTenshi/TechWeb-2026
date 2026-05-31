# Huong Dan Tong Quan Thu Muc Backend

Tai lieu nay giai thich nhanh cac file va thu muc nam trong `Backend/`. Muc
tieu la giup nguoi moi mo thu muc backend len co the hieu dai khai tung phan
dung de lam gi.

```text
Backend/
├── Controllers/
├── Data/
├── DTOs/
├── Migrations/
├── Models/
├── Properties/
├── Services/
├── Program.cs
├── api.csproj
├── appsettings.json
├── appsettings.Development.json
├── TechShopApiTests.http
├── TestFullApiFlow.ps1
├── api.http
└── api.csproj.lscache
```

## Cac Thu Muc Chinh

`Controllers/`

Noi chua cac API endpoint. Frontend goi API thi request se vao day truoc. Vi du
dang nhap vao `AuthController`, san pham vao `ProductsController`, gio hang vao
`CartController`, don hang vao `OrdersController`.

`Controllers/Admin/`

Cac API danh cho admin/staff, nhu quan ly don hang, ton kho, bao cao va nguoi
dung.

`Data/`

Lop ket noi database. Quan trong nhat la `AppDbContext.cs`, dung EF Core de
backend doc/ghi SQL Server. `DbSeeder.cs` tao du lieu mau khi chay app.

`Models/`

Co cac class mo ta du lieu trong database, vi du `User`, `Product`, `Cart`,
`Order`, `Payment`, `Review`. Co the hieu day la ban thiet ke bang database
bang C#.

`DTOs/`

Cac object dung de nhan request va tra response API. Vi du login can `LoginDto`,
tao order can `CreateOrderDto`, response san pham dung `ProductDetailDto`.

`Services/`

Chua logic phu tro ngoai controller. Hien co email mock va payment gateway mock
cho VNPay/Momo.

`Migrations/`

Lich su thay doi database do EF Core tao ra. Khi model thay doi, migration giup
cap nhat schema SQL Server.

`Properties/`

Chua `launchSettings.json`, cau hinh cach chay backend local, port va
environment.

## Cac File Quan Trong

`Program.cs`

File khoi dong backend. No cau hinh controller, Swagger, database, CORS, JWT
authentication, service injection va middleware.

`api.csproj`

File project cua .NET. Khai bao backend dung `.NET 10` va cac package nhu EF
Core, JWT, Swagger, BCrypt, ClosedXML.

`appsettings.json`

File cau hinh chinh: connection string SQL Server, JWT secret, payment secret
va logging.

`appsettings.Development.json`

Cau hinh rieng cho moi truong development.

`TechShopApiTests.http`

File test API thu cong bang REST Client trong VS Code. Co san request login,
products, cart, order, admin.

`TestFullApiFlow.ps1`

Script PowerShell test mot luong day du: login, lay san pham, them gio hang,
dat hang, thanh toan mock, admin cap nhat don, review.

`api.http`

File test mac dinh tu template, hien khong quan trong lam vi van con endpoint
mau `weatherforecast`.

`api.csproj.lscache`

File cache/tooling cua .NET hoac IDE. Khong phai logic chinh, thuong khong can
doc hoac sua.

## Tom Tat Nhanh

```text
Controllers  = noi nhan API
Models       = du lieu/database entity
DTOs         = du lieu request/response API
Data         = ket noi va cau hinh database
Services     = logic phu tro
Migrations   = lich su schema database
Program.cs   = cau hinh va khoi dong backend
appsettings  = cau hinh moi truong
```

Neu moi doc backend, thu tu de hieu nhat la:

```text
Program.cs -> Controllers/ -> Models/ -> Data/AppDbContext.cs -> DTOs/ -> Services/
```
