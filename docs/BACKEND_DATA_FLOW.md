# So do luong du lieu Backend TechShop

Tai lieu nay mo ta cac luong du lieu chinh cua backend TechShop bang Mermaid.
Co the xem truc tiep tren GitHub hoac cac Markdown viewer ho tro Mermaid.

## 1. Tong quan request pipeline

Moi request di vao backend se qua cac middleware trong `Program.cs`, sau do moi den controller.

```mermaid
flowchart TD
    Client[Frontend / API Client]
    Cors[CORS policy: Vite]
    AuthN[Authentication: JWT Bearer]
    AuthZ[Authorization: Role policy]
    Controller[ASP.NET Core Controller]
    DbContext[AppDbContext]
    SqlServer[(SQL Server)]
    Response[ApiResponse<T>]

    Client -->|HTTP request| Cors
    Cors --> AuthN
    AuthN --> AuthZ
    AuthZ --> Controller
    Controller --> DbContext
    DbContext --> SqlServer
    SqlServer --> DbContext
    DbContext --> Controller
    Controller --> Response
    Response -->|JSON| Client
```

Ghi chu:

- API public van di qua middleware auth, nhung khong bat buoc co token neu endpoint khong gan `[Authorize]`.
- API admin/staff can JWT co role phu hop.
- Moi response nen theo wrapper `ApiResponse<T>`.

## 2. Luong auth: dang ky, dang nhap, refresh token

```mermaid
flowchart TD
    User[User]
    Register[POST /api/auth/register]
    Login[POST /api/auth/login]
    Refresh[POST /api/auth/refresh]
    Logout[POST /api/auth/logout]
    AuthController[AuthController]
    Users[(Users)]
    Roles[(Roles)]
    RefreshTokens[(RefreshTokens)]
    Jwt[Access token JWT]
    NewRefresh[Refresh token]

    User -->|email, password, fullName| Register
    Register --> AuthController
    AuthController -->|check email exists| Users
    AuthController -->|get Customer role| Roles
    AuthController -->|hash password BCrypt| Users
    AuthController -->|user dto| User

    User -->|email, password| Login
    Login --> AuthController
    AuthController -->|find active user + role| Users
    AuthController -->|verify BCrypt| AuthController
    AuthController --> Jwt
    AuthController --> NewRefresh
    NewRefresh --> RefreshTokens
    AuthController -->|accessToken + refreshToken + user| User

    User -->|refreshToken| Refresh
    Refresh --> AuthController
    AuthController -->|find token| RefreshTokens
    AuthController -->|revoke old token| RefreshTokens
    AuthController -->|create replacement| RefreshTokens
    AuthController -->|new accessToken + refreshToken| User

    User -->|refreshToken| Logout
    Logout --> AuthController
    AuthController -->|revoke token| RefreshTokens
    AuthController -->|OK| User
```

Token duoc dung tiep o cac API can dang nhap:

```text
Authorization: Bearer <accessToken>
```

## 3. Luong browse san pham

```mermaid
flowchart TD
    FE[Frontend]
    Categories[GET /api/categories]
    Brands[GET /api/brands]
    ProductList[GET /api/products]
    ProductDetail[GET /api/products/{slug}]
    CategoriesController[CategoriesController]
    BrandsController[BrandsController]
    ProductsController[ProductsController]
    CategoryTable[(Categories)]
    ProductTable[(Products)]
    ProductImages[(ProductImages)]
    ProductVariants[(ProductVariants)]
    Inventory[(Inventory)]
    Specs[(Specifications)]
    Reviews[(Reviews)]

    FE --> Categories
    Categories --> CategoriesController
    CategoriesController --> CategoryTable
    CategoriesController -->|category tree| FE

    FE --> Brands
    Brands --> BrandsController
    BrandsController --> ProductTable
    BrandsController -->|distinct brands| FE

    FE -->|category, brand, price, sort, page| ProductList
    ProductList --> ProductsController
    ProductsController --> ProductTable
    ProductsController --> CategoryTable
    ProductsController -->|paged product list| FE

    FE -->|slug| ProductDetail
    ProductDetail --> ProductsController
    ProductsController --> ProductTable
    ProductsController --> ProductImages
    ProductsController --> ProductVariants
    ProductVariants --> Inventory
    ProductsController --> Specs
    ProductsController --> Reviews
    ProductsController -->|detail dto| FE
```

Diem quan trong:

- List san pham dung filter query string.
- Chi tiet san pham dung `slug`, khong dung id so.
- Gia variant = `SalePrice/BasePrice + PriceOffset`.
- Stock nam o `Inventory` theo tung variant.

## 4. Luong cart cho guest va user da dang nhap

```mermaid
flowchart TD
    FE[Frontend]
    CartApi[Cart API]
    CartController[CartController]
    JwtCheck{Co JWT hop le?}
    HeaderCheck{Co X-Session-Id?}
    UserCart[Find cart by UserId]
    GuestCart[Find cart by SessionId]
    CreateCart[Create Cart]
    CartTable[(Carts)]
    CartItems[(CartItems)]
    Variants[(ProductVariants)]
    Products[(Products)]
    Inventory[(Inventory)]
    Coupon[(Coupons)]
    Response[Cart response]

    FE -->|GET /api/cart| CartApi
    FE -->|POST /api/cart/items| CartApi
    FE -->|PUT/DELETE cart item| CartApi
    FE -->|POST /api/cart/apply-coupon| CartApi
    CartApi --> CartController

    CartController --> JwtCheck
    JwtCheck -->|Yes| UserCart
    JwtCheck -->|No| HeaderCheck
    HeaderCheck -->|Yes| GuestCart
    HeaderCheck -->|No| CreateCart

    UserCart --> CartTable
    GuestCart --> CartTable
    CreateCart --> CartTable

    CartController --> CartItems
    CartItems --> Variants
    Variants --> Products
    Variants --> Inventory
    CartController --> Coupon
    CartController --> Response
    Response -->|JSON + optional X-Session-Id| FE
```

Rule chinh:

- Guest cart duoc dinh danh bang header `X-Session-Id`.
- User cart duoc dinh danh bang `UserId` trong JWT.
- Them vao gio can `VariantId`, khong phai `ProductId`.
- Backend kiem tra stock truoc khi them vao gio.
- Coupon duoc tinh theo subtotal cua cart.

## 5. Luong checkout COD va tao order

```mermaid
flowchart TD
    FE[Frontend]
    OrderApi[POST /api/orders]
    Auth[JWT required]
    OrdersController[OrdersController]
    Cart[(Carts)]
    CartItems[(CartItems)]
    Variants[(ProductVariants)]
    Products[(Products)]
    Inventory[(Inventory)]
    InventoryLogs[(InventoryLogs)]
    Coupons[(Coupons)]
    Orders[(Orders)]
    OrderItems[(OrderItems)]
    OrderStatusLogs[(OrderStatusLogs)]
    Payments[(Payments)]
    Email[EmailService mock]
    Response[Order response]

    FE -->|receiver, phone, address, note| OrderApi
    OrderApi --> Auth
    Auth --> OrdersController
    OrdersController -->|load user cart| Cart
    Cart --> CartItems
    CartItems --> Variants
    Variants --> Products
    Variants --> Inventory

    OrdersController -->|validate not empty| CartItems
    OrdersController -->|validate stock| Inventory
    OrdersController -->|create order| Orders
    OrdersController -->|snapshot items| OrderItems
    OrdersController -->|deduct stock| Inventory
    OrdersController -->|write SaleDeduct logs| InventoryLogs
    OrdersController -->|calculate discount| Coupons
    OrdersController -->|status Pending| OrderStatusLogs
    OrdersController -->|COD Pending| Payments
    OrdersController -->|clear cart items| CartItems
    OrdersController --> Email
    OrdersController --> Response
    Response --> FE
```

Ket qua sau khi checkout:

- Tao `Order`.
- Tao cac `OrderItem`.
- Tru ton kho trong `Inventory`.
- Ghi log tru kho trong `InventoryLogs`.
- Tao `Payment` mac dinh `COD/Pending`.
- Clear cart item cua user.
- Goi mock email confirmation.

## 6. Luong huy don

```mermaid
flowchart TD
    FE[Frontend]
    CancelApi[PATCH /api/orders/{id}/cancel]
    OrdersController[OrdersController]
    Orders[(Orders)]
    OrderItems[(OrderItems)]
    Inventory[(Inventory)]
    InventoryLogs[(InventoryLogs)]
    StatusLogs[(OrderStatusLogs)]
    Email[EmailService mock]
    Response[Cancel response]

    FE -->|JWT| CancelApi
    CancelApi --> OrdersController
    OrdersController -->|load order of current user| Orders
    Orders --> OrderItems
    OrdersController -->|reject Completed/Cancelled| OrdersController
    OrdersController -->|set Cancelled| Orders
    OrdersController -->|return stock| Inventory
    OrdersController -->|write CancelReturn logs| InventoryLogs
    OrdersController -->|write status log| StatusLogs
    OrdersController --> Email
    OrdersController --> Response
    Response --> FE
```

## 7. Luong payment VNPay/Momo mock

```mermaid
flowchart TD
    FE[Frontend]
    CreatePayment[POST /api/payments/vnpay/create or momo/create]
    PaymentsController[PaymentsController]
    Orders[(Orders)]
    Payments[(Payments)]
    Gateway[PaymentGatewayService mock]
    PaymentUrl[Mock payment URL]
    Callback[POST /api/payments/{gateway}/callback]
    Verify[Verify HMAC signature]
    StatusLogs[(OrderStatusLogs)]
    Email[EmailService mock]

    FE -->|orderId, returnUrl, JWT| CreatePayment
    CreatePayment --> PaymentsController
    PaymentsController -->|load order + payment| Orders
    Orders --> Payments
    PaymentsController -->|set method/status Pending| Payments
    PaymentsController --> Gateway
    Gateway --> PaymentUrl
    PaymentUrl --> FE

    FE -->|redirect/mock callback| Callback
    Callback --> PaymentsController
    PaymentsController --> Verify
    Verify -->|invalid| FE
    Verify -->|valid| Payments
    PaymentsController -->|Paid/Failed/Pending| Payments
    PaymentsController -->|if Paid and order Pending, set order Paid| Orders
    PaymentsController --> StatusLogs
    PaymentsController --> Email
    PaymentsController --> FE
```

Payment hien chua tich hop cong thanh toan that. Day la mock gateway de test luong tao giao dich va callback.

## 8. Luong admin quan ly don, kho va bao cao

```mermaid
flowchart TD
    AdminFE[Admin Frontend / Swagger]
    Jwt[JWT Admin/Staff]
    AdminOrders[api/admin/orders]
    AdminInventory[api/admin/inventory]
    AdminReports[api/admin/reports]
    AdminUsers[api/admin/users]
    Orders[(Orders)]
    StatusLogs[(OrderStatusLogs)]
    Inventory[(Inventory)]
    InventoryLogs[(InventoryLogs)]
    OrderItems[(OrderItems)]
    Users[(Users)]
    Excel[ClosedXML Excel export]

    AdminFE --> Jwt
    Jwt --> AdminOrders
    Jwt --> AdminInventory
    Jwt --> AdminReports
    Jwt --> AdminUsers

    AdminOrders -->|list/update status/tracking| Orders
    AdminOrders --> StatusLogs

    AdminInventory -->|list/import/export/adjust| Inventory
    AdminInventory --> InventoryLogs

    AdminReports --> Orders
    AdminReports --> OrderItems
    AdminReports --> Inventory
    AdminReports -->|revenue export| Excel

    AdminUsers -->|Admin only| Users
```

Quyen:

- `Admin,Staff`: admin orders, inventory, reports.
- `Admin`: user management.

## 9. Ban do bang du lieu theo chuc nang

```mermaid
flowchart LR
    Auth[Auth/User] --> Role[(Roles)]
    Auth --> User[(Users)]
    Auth --> RefreshToken[(RefreshTokens)]
    Auth --> Address[(Addresses)]

    Catalog[Catalog] --> Category[(Categories)]
    Catalog --> Product[(Products)]
    Product --> Image[(ProductImages)]
    Product --> Variant[(ProductVariants)]
    Product --> Spec[(Specifications)]

    CartFeature[Cart] --> Cart[(Carts)]
    Cart --> CartItem[(CartItems)]
    CartFeature --> Coupon[(Coupons)]

    OrderFeature[Order] --> Order[(Orders)]
    Order --> OrderItem[(OrderItems)]
    Order --> StatusLog[(OrderStatusLogs)]
    Order --> Payment[(Payments)]

    InventoryFeature[Inventory] --> Inventory[(Inventory)]
    Inventory --> InventoryLog[(InventoryLogs)]

    Promo[Promotion] --> Promotion[(Promotions)]
    Promotion --> PromotionProduct[(PromotionProducts)]

    ReviewFeature[Review] --> Review[(Reviews)]
```

## 10. Tom tat luong end-to-end quan trong nhat

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant Auth as AuthController
    participant Product as ProductsController
    participant Cart as CartController
    participant Order as OrdersController
    participant DB as SQL Server

    FE->>Auth: POST /api/auth/login
    Auth->>DB: Find user, verify password, save refresh token
    Auth-->>FE: accessToken, refreshToken, user

    FE->>Product: GET /api/products
    Product->>DB: Query products/categories
    Product-->>FE: Product list

    FE->>Product: GET /api/products/{slug}
    Product->>DB: Query product detail, variants, inventory, specs
    Product-->>FE: Product detail

    FE->>Cart: POST /api/cart/items
    Cart->>DB: Validate variant stock, add/update cart item
    Cart-->>FE: Cart response

    FE->>Order: POST /api/orders
    Order->>DB: Load cart, create order, deduct stock, clear cart
    Order-->>FE: Order response
```

