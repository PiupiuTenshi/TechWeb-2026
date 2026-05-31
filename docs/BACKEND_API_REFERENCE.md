# TechShop Backend API Reference

Tai lieu nay la bang tra cuu endpoint backend theo code hien tai trong
`Backend/Controllers/`. Neu can hieu file nao nam o dau, doc them
`docs/BACKEND_STRUCTURE.md`.

## 1. Convention Chung

Base URL local:

```text
http://localhost:5000/api
```

Swagger khi chay Development:

```text
http://localhost:5000/swagger
```

Header auth cho endpoint can dang nhap:

```text
Authorization: Bearer <accessToken>
```

Header guest cart:

```text
X-Session-Id: <session-id>
```

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
  "message": "Thong bao loi",
  "error": "ERROR_CODE",
  "pagination": null
}
```

Response list co phan trang:

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

Seed accounts tu `DbSeeder`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@techshop.vn` | `Admin@123` |
| Customer | `test@techshop.vn` | `Test@123` |

## 2. Auth API

Controller: `AuthController`

Base path: `/api/auth`

### POST `/api/auth/register`

Quyen: Public

Body:

```json
{
  "email": "user@example.com",
  "password": "User@123",
  "fullName": "Nguyen Van A",
  "phone": "0900000000"
}
```

Xu ly:

- Normalize email ve lowercase.
- Neu email da ton tai, tra `EMAIL_EXISTS`.
- Tim role `Customer`.
- Hash password bang BCrypt.
- Tao user moi va tra user info.

### POST `/api/auth/login`

Quyen: Public

Body:

```json
{
  "email": "test@techshop.vn",
  "password": "Test@123"
}
```

Xu ly:

- Tim user active theo email.
- Verify password bang BCrypt.
- Tao JWT access token.
- Tao refresh token va luu vao DB.

Response `data` gom:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "userId": "...",
    "email": "test@techshop.vn",
    "fullName": "Khach hang TechShop",
    "phone": null,
    "avatarUrl": null,
    "roleId": 3,
    "role": "Customer"
  }
}
```

Loi chinh: `INVALID_CREDENTIALS`.

### POST `/api/auth/refresh`

Quyen: Public

Body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Xu ly:

- Tim refresh token.
- Reject neu token bi revoke hoac het han.
- Revoke token cu.
- Tao refresh token moi.
- Tra access token moi, refresh token moi va user.

Loi chinh: `INVALID_REFRESH_TOKEN`.

### POST `/api/auth/logout`

Quyen: Public

Body:

```json
{
  "refreshToken": "<refresh-token>"
}
```

Xu ly:

- Neu token ton tai thi set `IsRevoked = true`.
- Luon tra thanh cong.

## 3. Catalog API

### GET `/api/categories`

Controller: `CategoriesController`

Quyen: Public

Tra category active dang tree:

```json
[
  {
    "categoryId": 1,
    "name": "Laptop",
    "slug": "laptop",
    "children": []
  }
]
```

### GET `/api/brands`

Controller: `BrandsController`

Quyen: Public

Tra danh sach brand distinct tu product active:

```json
["Apple", "Asus", "Samsung", "Sony"]
```

### GET `/api/products`

Controller: `ProductsController`

Quyen: Public

Query:

| Query | Kieu | Ghi chu |
|---|---|---|
| `category` | string | Category slug, vi du `laptop`. |
| `brand` | string | Brand, so sanh khong phan biet hoa thuong. |
| `minPrice` | decimal | Loc theo gia hien thi `SalePrice ?? BasePrice`. |
| `maxPrice` | decimal | Loc theo gia hien thi. |
| `sort` | string | `price_asc`, `price_desc`, `newest`; mac dinh featured + newest. |
| `page` | int | Mac dinh `1`, min `1`. |
| `pageSize` | int | Mac dinh `20`, clamp `1..100`. |

Vi du:

```text
GET /api/products?category=laptop&brand=Apple&sort=price_desc&page=1&pageSize=12
```

Response item:

```json
{
  "productId": "...",
  "name": "MacBook Air M3 13 inch",
  "slug": "macbook-air-m3-13",
  "brand": "Apple",
  "thumbnailUrl": "/images/macbook-air-m3-13.webp",
  "basePrice": 28990000,
  "salePrice": 27490000,
  "category": {
    "categoryId": 1,
    "name": "Laptop",
    "slug": "laptop"
  },
  "isFeatured": true
}
```

### GET `/api/products/{slug}`

Quyen: Public

Tra chi tiet product active theo slug.

Response `data` gom:

- Thong tin product chinh.
- `category`.
- `images` sort theo `SortOrder`.
- `variants` active, moi variant co `stock`.
- `specifications` sort theo `SortOrder`.
- `avgRating` tinh tu review visible.

Loi chinh: `NOT_FOUND`.

### POST `/api/products`

Quyen: `Admin,Staff`

Body:

```json
{
  "categoryId": 1,
  "name": "Laptop Test",
  "slug": "laptop-test",
  "brand": "TechShop",
  "description": "Mo ta",
  "basePrice": 19990000,
  "salePrice": 17990000,
  "thumbnailUrl": "/images/laptop-test.webp",
  "tags": "test,laptop",
  "isFeatured": false,
  "variants": [
    {
      "sku": "LAPTOP-TEST-STD",
      "color": "Black",
      "ram": "16GB",
      "storage": "512GB",
      "priceOffset": 0,
      "quantity": 10
    }
  ],
  "images": [
    {
      "imageUrl": "/images/laptop-test.webp",
      "altText": "Laptop Test",
      "sortOrder": 0
    }
  ],
  "specifications": [
    {
      "specKey": "CPU",
      "specValue": "Intel Core i5",
      "sortOrder": 1
    }
  ]
}
```

Xu ly:

- Check duplicate slug.
- Tao product.
- Tao nested images, specs, variants.
- Moi variant tao inventory quantity theo `quantity`.

Loi chinh: `SLUG_EXISTS`.

### PUT `/api/products/{id}`

Quyen: `Admin,Staff`

Cap nhat thong tin chinh:

```json
{
  "categoryId": 1,
  "name": "Laptop Test Updated",
  "slug": "laptop-test",
  "brand": "TechShop",
  "description": "Mo ta moi",
  "basePrice": 19990000,
  "salePrice": 16990000,
  "thumbnailUrl": "/images/laptop-test.webp",
  "tags": "test,laptop,updated",
  "isFeatured": true,
  "isActive": true
}
```

Luu y: endpoint nay chua update nested images/specs/variants.

### DELETE `/api/products/{id}`

Quyen: `Admin`

Soft delete product bang `IsActive = false`.

### POST `/api/products/{id}/images`

Quyen: `Admin,Staff`

Content type: `multipart/form-data`

Form fields:

- `file`: anh upload.
- `altText`: optional.
- `sortOrder`: optional, mac dinh `0`.

Xu ly:

- Luu file vao `wwwroot/images`.
- Tao row `ProductImage`.

Loi chinh: `NOT_FOUND`, `EMPTY_FILE`.

## 4. Cart API

Controller: `CartController`

Base path: `/api/cart`

Quyen: Optional. Neu co JWT thi cart theo user; neu khong co JWT thi cart theo
`X-Session-Id`.

### GET `/api/cart`

Lay hoac tao cart.

Neu guest chua gui `X-Session-Id`, response se expose header:

```text
X-Session-Id: <session-id>
```

Response `data`:

```json
{
  "cartId": "...",
  "userId": null,
  "sessionId": "...",
  "coupon": null,
  "items": [],
  "subtotal": 0,
  "discount": 0,
  "total": 0
}
```

### POST `/api/cart/items`

Body:

```json
{
  "variantId": "...",
  "quantity": 1
}
```

Xu ly:

- `quantity` phai > 0.
- Variant phai ton tai va active.
- Stock hien tai phai du.
- Neu item da co trong cart thi cong quantity.

Loi chinh: `INVALID_QUANTITY`, `VARIANT_NOT_FOUND`, `OUT_OF_STOCK`.

### PUT `/api/cart/items/{id}`

Body:

```json
{
  "quantity": 2
}
```

Xu ly:

- Neu quantity > 0 thi cap nhat.
- Neu quantity <= 0 thi xoa item.

Loi chinh: `ITEM_NOT_FOUND`.

### DELETE `/api/cart/items/{id}`

Xoa item khoi cart hien tai.

Loi chinh: `ITEM_NOT_FOUND`.

### POST `/api/cart/apply-coupon`

Body:

```json
{
  "code": "TECHSHOP10"
}
```

Validate:

- Coupon ton tai.
- `IsActive = true`.
- Nam trong khoang `StartsAt..ExpiresAt`.
- `UsedCount < UsageLimit`.
- Cart subtotal >= `MinOrderValue`.

Loi chinh: `INVALID_COUPON`, `MIN_ORDER_VALUE`.

## 5. Order API

Controller: `OrdersController`

Base path: `/api/orders`

Quyen: User da dang nhap.

### POST `/api/orders`

Body:

```json
{
  "receiverName": "Nguyen Van A",
  "phone": "0900000000",
  "shippingAddress": "123 Le Loi, Q1, TP HCM",
  "note": "Giao gio hanh chinh"
}
```

Xu ly trong transaction:

1. Lay cart theo `UserId`.
2. Reject neu cart rong.
3. Validate moi item co variant/product/inventory hop le.
4. Validate ton kho.
5. Tao `OrderItem` snapshot.
6. Tru inventory.
7. Ghi `InventoryLog` `SaleDeduct`.
8. Tinh subtotal, discount, grand total.
9. Tao `OrderStatusLog` `Pending`.
10. Tao `Payment` method `COD`, status `Pending`.
11. Tang `Coupon.UsedCount` neu co coupon.
12. Clear cart items va coupon.
13. Gui email mock confirmation.

Loi chinh: `EMPTY_CART`, `INVALID_CART`, `OUT_OF_STOCK`.

### GET `/api/orders`

Tra lich su don cua user hien tai:

```json
[
  {
    "orderId": "...",
    "status": "Pending",
    "grandTotal": 1000000,
    "createdAt": "2026-05-30T00:00:00Z",
    "itemCount": 2
  }
]
```

### GET `/api/orders/{id}`

Tra chi tiet order neu order thuoc user hien tai.

Response gom:

- Thong tin nguoi nhan, tien, tracking, note.
- `items`: snapshot product/variant/unit price/subtotal.
- `payment`: method/status/amount.
- `statusLogs`: lich su status.

Loi chinh: `NOT_FOUND`.

### PATCH `/api/orders/{id}/cancel`

User huy don cua minh.

Rule:

- Chi owner cua order duoc huy.
- Khong huy neu status la `Completed` hoac `Cancelled`.
- Set status `Cancelled`.
- Hoan stock tung item.
- Ghi `InventoryLog` `CancelReturn`.
- Ghi `OrderStatusLog`.
- Gui email mock.

Loi chinh: `NOT_FOUND`, `INVALID_STATUS`.

## 6. Payment API

Controller: `PaymentsController`

Base path: `/api/payments`

### POST `/api/payments/vnpay/create`

Quyen: User da dang nhap

Body:

```json
{
  "orderId": "...",
  "returnUrl": "http://localhost:5173/payment-result"
}
```

Xu ly:

- Load order va payment.
- Reject order `Cancelled` hoac `Completed`.
- Tao/payment reset ve method `VNPay`, status `Pending`.
- Tra payment URL mock.

### POST `/api/payments/momo/create`

Giong VNPay nhung method la `Momo`.

Response `data`:

```json
{
  "paymentId": "...",
  "orderId": "...",
  "method": "VNPay",
  "amount": 1000000,
  "paymentUrl": "http://localhost:5173/payment-result?...",
  "transactionCode": "VNPAY-...",
  "expiresAt": "..."
}
```

Loi chinh: `ORDER_NOT_FOUND`, `INVALID_ORDER_STATUS`.

### POST `/api/payments/vnpay/callback`

Quyen: Public

Body:

```json
{
  "paymentId": "...",
  "status": "Success",
  "transactionCode": "VNPAY-...",
  "gatewayResponse": "Manual callback",
  "signature": "<hmac-signature>"
}
```

Xu ly:

- Verify signature.
- Load payment co method `VNPay`.
- Map status:
  - `Success` -> `Paid`
  - `Failed` -> `Failed`
  - Khac -> `Pending`
- Neu payment paid va order pending thi set order `Paid`.
- Ghi status log va gui email mock.

### POST `/api/payments/momo/callback`

Giong VNPay callback nhung method la `Momo`.

Loi chinh: `INVALID_SIGNATURE`, `PAYMENT_NOT_FOUND`.

## 7. Promotion API

Controller: `PromotionsController`

Base path: `/api/promotions`

### GET `/api/promotions/active`

Quyen: Public

Lay promotion co:

- `IsActive = true`
- `StartsAt <= now`
- `EndsAt >= now`

Response gom promotion va danh sach product active duoc gan.

### GET `/api/promotions`

Quyen: `Admin,Staff`

Query:

| Query | Ghi chu |
|---|---|
| `active` | Neu `true` chi lay promotion active theo thoi gian; neu `false` lay inactive/expired/not-started. |
| `page` | Mac dinh `1`. |
| `pageSize` | Mac dinh `20`, clamp `1..100`. |

### GET `/api/promotions/{id}`

Quyen: `Admin,Staff`

Chi tiet promotion.

### POST `/api/promotions`

Quyen: `Admin,Staff`

Body:

```json
{
  "name": "Summer Sale",
  "discountType": "Percent",
  "discountValue": 10,
  "startsAt": "2026-05-21T00:00:00Z",
  "endsAt": "2026-06-21T00:00:00Z",
  "isActive": true,
  "productIds": ["..."]
}
```

Validate:

- `discountType` chi nhan `Percent` hoac `Fixed`.
- `discountValue > 0`.
- Neu `Percent`, value khong duoc > 100.
- `EndsAt > StartsAt`.
- ProductIds duoc loc con product active.

### PUT `/api/promotions/{id}`

Quyen: `Admin,Staff`

Cap nhat promotion va thay toan bo danh sach product gan voi promotion.

### DELETE `/api/promotions/{id}`

Quyen: `Admin,Staff`

Set `IsActive = false`.

Loi chinh: `NOT_FOUND`, `INVALID_DISCOUNT_TYPE`, `INVALID_DISCOUNT_VALUE`, `INVALID_DATE_RANGE`.

## 8. Review API

Controller: `ReviewsController`

Base path dac biet: `/api`

### POST `/api/reviews`

Quyen: User da dang nhap

Body:

```json
{
  "productId": "...",
  "orderId": "...",
  "rating": 5,
  "title": "Great product",
  "body": "Noi dung danh gia"
}
```

Rule:

- Rating tu 1 den 5.
- User phai co order `Completed` chua product do.
- Neu gui `orderId`, order do phai khop.
- Review moi tao `IsVisible = false`.

Loi chinh: `INVALID_RATING`, `ORDER_NOT_COMPLETED`.

### GET `/api/products/{id}/reviews`

Quyen: Public

Lay review visible theo product id, kem `FullName` va `AvatarUrl` cua user.

## 9. Admin Orders API

Controller: `AdminOrdersController`

Base path: `/api/admin/orders`

Quyen: `Admin,Staff`

### GET `/api/admin/orders`

Query:

| Query | Ghi chu |
|---|---|
| `status` | Optional, loc status exact. |
| `page` | Mac dinh `1`. |
| `pageSize` | Mac dinh `20`, clamp `1..100`. |

Tra order list kem customer.

### PATCH `/api/admin/orders/{id}/status`

Body:

```json
{
  "status": "Completed",
  "note": "Completed by staff"
}
```

Xu ly:

- Set order status moi.
- Ghi `OrderStatusLog` voi admin/staff hien tai.
- Gui email mock.

### PUT `/api/admin/orders/{id}/tracking`

Body:

```json
{
  "trackingCode": "TS-0001"
}
```

Cap nhat ma van don.

## 10. Admin Inventory API

Controller: `AdminInventoryController`

Base path: `/api/admin/inventory`

Quyen: `Admin,Staff`

### GET `/api/admin/inventory`

Query:

| Query | Ghi chu |
|---|---|
| `keyword` | Search SKU, product name, brand. |
| `lowStock` | `true` de lay item co `Quantity <= LowStockAlert`. |
| `page` | Mac dinh `1`. |
| `pageSize` | Mac dinh `20`, clamp `1..100`. |

### GET `/api/admin/inventory/logs`

Query:

| Query | Ghi chu |
|---|---|
| `variantId` | Optional. |
| `changeType` | Optional: `Import`, `Export`, `Adjust`, `SaleDeduct`, `CancelReturn`. |
| `page` | Mac dinh `1`. |
| `pageSize` | Mac dinh `20`, clamp `1..100`. |

### POST `/api/admin/inventory/import`

Body:

```json
{
  "variantId": "...",
  "quantity": 5,
  "note": "Nhap kho"
}
```

Rule:

- Quantity phai > 0.
- Variant phai active.
- Tao inventory neu variant chua co inventory.
- Quantity log la so duong.

### POST `/api/admin/inventory/export`

Body:

```json
{
  "variantId": "...",
  "quantity": 1,
  "note": "Xuat kho"
}
```

Rule:

- Quantity phai > 0.
- Inventory phai ton tai.
- Ton kho phai du.
- Quantity log la so am.

### PATCH `/api/admin/inventory/adjust`

Body:

```json
{
  "variantId": "...",
  "quantity": 25,
  "note": "Dieu chinh kiem kho"
}
```

Rule:

- Quantity moi khong duoc am.
- Tao inventory neu variant active chua co.
- Quantity log la delta giua quantity moi va quantity cu.

Loi chinh: `INVALID_QUANTITY`, `VARIANT_NOT_FOUND`, `INVENTORY_NOT_FOUND`, `OUT_OF_STOCK`.

## 11. Admin Reports API

Controller: `AdminReportsController`

Base path: `/api/admin/reports`

Quyen: `Admin,Staff`

### GET `/api/admin/reports/revenue`

Query:

| Query | Ghi chu |
|---|---|
| `from` | Optional DateTime. |
| `to` | Optional DateTime. |
| `groupBy` | `day` hoac `month`, mac dinh `day`. |

Neu khong truyen range, mac dinh 30 ngay gan nhat.

Response `data`:

```json
{
  "from": "...",
  "to": "...",
  "totalRevenue": 1000000,
  "totalOrders": 1,
  "averageOrderValue": 1000000,
  "paidOrders": 1,
  "completedOrders": 0,
  "points": [
    {
      "period": "2026-05-30",
      "revenue": 1000000,
      "orders": 1
    }
  ]
}
```

### GET `/api/admin/reports/top-products`

Query:

| Query | Ghi chu |
|---|---|
| `from` | Optional DateTime. |
| `to` | Optional DateTime. |
| `take` | Mac dinh `10`, clamp `1..50`. |

Lay top product variant theo revenue, bo qua order `Cancelled`.

### GET `/api/admin/reports/low-stock`

Query:

| Query | Ghi chu |
|---|---|
| `threshold` | Optional; neu co thi dung threshold nay. |
| `take` | Mac dinh `50`, clamp `1..200`. |

Neu khong co `threshold`, lay item co `Quantity <= LowStockAlert`.

### GET `/api/admin/reports/revenue/export`

Query giong `/revenue`.

Tra file Excel:

```text
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Filename: techshop-revenue-<timestamp>.xlsx
```

Workbook co 2 sheet:

- `Summary`
- `Revenue`

## 12. Admin Users API

Controller: `AdminUsersController`

Base path: `/api/admin/users`

Quyen: `Admin`

### GET `/api/admin/users`

Query:

| Query | Ghi chu |
|---|---|
| `search` | Search email/fullName/phone. |
| `roleId` | Optional. |
| `active` | Optional bool. |
| `page` | Mac dinh `1`. |
| `pageSize` | Mac dinh `20`, clamp `1..100`. |

### GET `/api/admin/users/{id}`

Lay chi tiet user.

### POST `/api/admin/users`

Body:

```json
{
  "email": "staff@techshop.vn",
  "password": "Staff@123",
  "fullName": "Staff TechShop",
  "phone": "0900000000",
  "roleId": 2,
  "isActive": true
}
```

Rule:

- Email unique.
- RoleId phai ton tai.
- Password hash bang BCrypt.

### PUT `/api/admin/users/{id}`

Body:

```json
{
  "fullName": "Staff Updated",
  "phone": "0911111111",
  "avatarUrl": null,
  "roleId": 2,
  "isActive": true
}
```

Cap nhat profile, role, active flag.

### PATCH `/api/admin/users/{id}/status`

Body:

```json
{
  "isActive": false
}
```

Bat/tat user.

### PATCH `/api/admin/users/{id}/password`

Body:

```json
{
  "password": "New@123"
}
```

Hash password moi bang BCrypt.

### DELETE `/api/admin/users/{id}`

Soft delete user bang `IsActive = false`.

Loi chinh: `NOT_FOUND`, `EMAIL_EXISTS`, `ROLE_NOT_FOUND`.

## 13. Error Codes Hay Gap

| Error | Nhom | Y nghia |
|---|---|---|
| `EMAIL_EXISTS` | Auth/Admin users | Email da duoc dung. |
| `INVALID_CREDENTIALS` | Auth | Sai email/password hoac user inactive. |
| `INVALID_REFRESH_TOKEN` | Auth | Refresh token sai, bi revoke, hoac het han. |
| `NOT_FOUND` | Nhieu controller | Resource khong ton tai hoac khong thuoc user hien tai. |
| `SLUG_EXISTS` | Products | Product slug bi trung. |
| `EMPTY_FILE` | Products | File upload rong. |
| `INVALID_QUANTITY` | Cart/Inventory | Quantity khong hop le. |
| `VARIANT_NOT_FOUND` | Cart/Inventory | Variant khong ton tai hoac inactive. |
| `OUT_OF_STOCK` | Cart/Order/Inventory | Ton kho khong du. |
| `INVALID_COUPON` | Cart | Coupon khong hop le. |
| `MIN_ORDER_VALUE` | Cart | Cart chua dat gia tri toi thieu cua coupon. |
| `EMPTY_CART` | Orders | Cart user rong khi checkout. |
| `INVALID_CART` | Orders | Item trong cart bi loi relation/inventory. |
| `INVALID_STATUS` | Orders | Khong the huy don o status hien tai. |
| `ORDER_NOT_FOUND` | Payments | Order khong ton tai. |
| `INVALID_ORDER_STATUS` | Payments | Order khong the thanh toan. |
| `INVALID_SIGNATURE` | Payments | Callback payment sai chu ky. |
| `PAYMENT_NOT_FOUND` | Payments | Khong tim thay payment theo id/method. |
| `INVALID_DISCOUNT_TYPE` | Promotions | DiscountType khong phai `Percent`/`Fixed`. |
| `INVALID_DISCOUNT_VALUE` | Promotions | Gia tri discount khong hop le. |
| `INVALID_DATE_RANGE` | Promotions | `EndsAt` khong sau `StartsAt`. |
| `INVALID_RATING` | Reviews | Rating ngoai 1..5. |
| `ORDER_NOT_COMPLETED` | Reviews | User chua mua/xong don cho product do. |
| `ROLE_NOT_FOUND` | Admin users | RoleId khong ton tai. |
| `INVENTORY_NOT_FOUND` | Admin inventory | Chua co inventory de export. |

## 14. Thu Tu Test Thu Cong Goi Y

1. `POST /api/auth/login` customer.
2. `POST /api/auth/login` admin.
3. `GET /api/categories`.
4. `GET /api/brands`.
5. `GET /api/products`.
6. `GET /api/products/{slug}` lay `variantId`.
7. `POST /api/cart/items` bang customer token.
8. `POST /api/cart/apply-coupon`.
9. `POST /api/orders`.
10. `POST /api/payments/vnpay/create`.
11. Copy signature tu `paymentUrl`, goi `/api/payments/vnpay/callback`.
12. Admin goi `/api/admin/orders`, update tracking/status.
13. Customer tao review sau khi admin set order `Completed`.
14. Admin test promotion, reports, inventory, users.

Co the dung san:

- `Backend/TechShopApiTests.http`
- `Backend/TestFullApiFlow.ps1`
