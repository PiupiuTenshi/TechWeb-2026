# TechShop Backend Database And Business Flows

Tai lieu nay giai thich database model va cac luong nghiep vu chinh cua backend
TechShop theo code hien tai. Neu can tra cuu endpoint, doc
`docs/BACKEND_API_REFERENCE.md`. Neu can tra cuu tung file, doc
`docs/BACKEND_STRUCTURE.md`.

## 1. Tong Quan Domain

Backend xoay quanh 7 mien chinh:

| Mien | Bang/entity | Chuc nang |
|---|---|---|
| Auth/User | `Roles`, `Users`, `RefreshTokens`, `Addresses` | Tai khoan, quyen, refresh token, dia chi. |
| Catalog | `Categories`, `Products`, `ProductImages`, `ProductVariants`, `Specifications` | Danh muc, san pham, anh, bien the, thong so. |
| Cart | `Carts`, `CartItems`, `Coupons` | Gio hang guest/user, item theo variant, ma giam gia. |
| Order | `Orders`, `OrderItems`, `OrderStatusLogs` | Don hang, snapshot item, lich su trang thai. |
| Payment | `Payments` | COD/VNPay/Momo, trang thai thanh toan, transaction code. |
| Promotion | `Promotions`, `PromotionProducts` | Chuong trinh khuyen mai va product duoc gan. |
| Inventory/Review | `Inventory`, `InventoryLogs`, `Reviews` | Ton kho theo variant, log kho, danh gia san pham. |

## 2. Entity Map

### Auth/User

`Role`

- Primary key: `RoleId`.
- Unique: `RoleName`.
- Role seed: `Admin`, `Staff`, `Customer`.

`User`

- Primary key: `UserId` GUID.
- Unique: `Email`.
- Password luu bang `PasswordHash`, hash bang BCrypt.
- Co `RoleId`, `IsActive`, timestamps.
- Navigation: `Role`, `RefreshTokens`, `Addresses`, `Carts`.

`RefreshToken`

- Gan voi `UserId`.
- Co `Token`, `ExpiresAt`, `IsRevoked`, `CreatedAt`.
- Login tao token moi; refresh revoke token cu va tao replacement.

`Address`

- Dia chi giao hang theo user.
- Hien tai order API dang nhan dia chi dang text, chua dung `AddressId`.

### Catalog

`Category`

- Primary key: `CategoryId`.
- Unique: `Slug`.
- Ho tro category cha/con bang `ParentId`.
- `IsActive` de an category.

`Product`

- Primary key: `ProductId` GUID.
- Unique: `Slug`.
- Gia chinh: `BasePrice`; gia sale optional: `SalePrice`.
- `Brand`, `ThumbnailUrl`, `Tags`, `IsFeatured`, `IsActive`.
- Navigation: `Category`, `Images`, `Variants`, `Specifications`, `Reviews`.

`ProductImage`

- Anh thuoc product.
- `SortOrder` dung de sap xep gallery.

`ProductVariant`

- Bien the san pham.
- Unique: `SKU`.
- Thuoc product, co `Color`, `RAM`, `Storage`, `PriceOffset`, `IsActive`.
- Moi variant co the co 1 `Inventory`.

`Specification`

- Key-value thong so ky thuat theo product.
- `SortOrder` dung de hien thi.

### Cart/Coupon

`Cart`

- Co the gan voi `UserId` neu user da dang nhap.
- Co the gan voi `SessionId` neu guest.
- Co optional `CouponId`.
- Navigation: `Items`, `Coupon`.

`CartItem`

- Thuoc cart va tro toi `VariantId`.
- `Quantity` la so luong trong gio.

`Coupon`

- Unique: `Code`.
- `DiscountType`: `Percent` hoac `Fixed`.
- `DiscountValue`, `MinOrderValue`, `MaxDiscount`.
- `UsageLimit`, `UsedCount`, `StartsAt`, `ExpiresAt`, `IsActive`.

### Order/Payment

`Order`

- Thuoc `UserId`.
- Status mac dinh `Pending`.
- Luu thong tin giao hang denormalized: `ReceiverName`, `Phone`, `ShippingAddress`.
- Tien: `Subtotal`, `DiscountTotal`, `ShippingFee`, `GrandTotal`.
- Optional `TrackingCode`, `Note`.
- Navigation: `Items`, `StatusLogs`, `Payment`.

`OrderItem`

- Snapshot tai thoi diem dat hang.
- Luu `ProductName`, `VariantInfo`, `Quantity`, `UnitPrice`, `Subtotal`.
- Van giu `VariantId` de lien he inventory/report.

`OrderStatusLog`

- Lich su thay doi status.
- Co `OldStatus`, `NewStatus`, `Note`, `ChangedBy`, `ChangedAt`.

`Payment`

- Unique: `OrderId` theo `AppDbContext`.
- `Method`: `COD`, `VNPay`, `Momo`.
- `Status`: `Pending`, `Paid`, `Failed`.
- Co `Amount`, `TransactionCode`, `GatewayResponse`, `PaidAt`, `RefundedAt`, `RefundNote`.

### Promotion/Inventory/Review

`Promotion`

- `DiscountType`: `Percent` hoac `Fixed`.
- `StartsAt`, `EndsAt`, `IsActive`.
- Navigation: `Products` thong qua `PromotionProduct`.

`PromotionProduct`

- Bang noi promotion-product.

`Inventory`

- Bang duoc map ten singular `Inventory`.
- Unique: `VariantId`.
- Luu `Quantity`, `LowStockAlert`, `UpdatedAt`.

`InventoryLog`

- Luu moi thay doi ton kho.
- `ChangeType`: `Import`, `Export`, `Adjust`, `SaleDeduct`, `CancelReturn`.
- `Quantity` co the duong hoac am.
- Optional `CreatedBy`.

`Review`

- Thuoc product va user.
- Optional `OrderId`.
- Rating 1..5.
- `IsVisible = false` khi tao moi, public API chi lay visible review.

## 3. Relationship Va Delete Rules

`AppDbContext` dat mac dinh moi foreign key la `DeleteBehavior.Restrict`.
Dieu nay giup tranh xoa day chuyen ngoai y muon.

Cascade delete chi bat cho:

- `Cart -> CartItems`: xoa cart thi xoa cart items.
- `Order -> OrderItems`: xoa order thi xoa order items.
- `Order -> OrderStatusLogs`: xoa order thi xoa status logs.

Cac rule dang chu y:

- `Category.ParentId` la self-reference, delete restrict.
- `User.RoleId` delete restrict.
- `InventoryLog.CreatedBy` delete restrict.
- `OrderStatusLog.ChangedBy` delete restrict.
- `Payment.OrderId` unique, moi order toi da mot payment row.

## 4. Index Va Constraint Quan Trong

Unique indexes:

| Entity | Field |
|---|---|
| `Role` | `RoleName` |
| `Category` | `Slug` |
| `User` | `Email` |
| `Coupon` | `Code` |
| `Product` | `Slug` |
| `ProductVariant` | `SKU` |
| `Inventory` | `VariantId` |
| `Payment` | `OrderId` |

Decimal precision:

- Tat ca property `decimal` va `decimal?` duoc set precision `18,2`.

## 5. Seed Data

`DbSeeder.Seed(context)` chay khi app start. Neu bang da co data thi bo qua nhom
tuong ung.

Thu tu seed:

1. Roles.
2. Categories.
3. Users.
4. Products + variants + inventory + images + specs.
5. Coupon.
6. Promotion.

Tai khoan seed:

| Email | Password | Role |
|---|---|---|
| `admin@techshop.vn` | `Admin@123` | Admin |
| `test@techshop.vn` | `Test@123` | Customer |

San pham seed moi san pham co:

- 1 variant `*-STD`.
- 1 inventory quantity `20`.
- 1 image thumbnail.
- 2 specs: `Brand`, `Warranty`.

## 6. Auth Flow

### Dang Ky

```mermaid
flowchart TD
    FE[Frontend] --> Register[POST /api/auth/register]
    Register --> Normalize[Normalize email lowercase]
    Normalize --> CheckEmail[Check Users.Email unique]
    CheckEmail --> Role[Find Customer role]
    Role --> Hash[Hash password BCrypt]
    Hash --> Save[Save User]
    Save --> Response[ApiResponse user dto]
```

Ket qua:

- User moi co role `Customer`.
- Password khong luu plain text.
- Register khong tao token; frontend can login rieng neu muon vao session.

### Dang Nhap

```mermaid
flowchart TD
    FE[Frontend] --> Login[POST /api/auth/login]
    Login --> FindUser[Find active user + role]
    FindUser --> Verify[BCrypt verify password]
    Verify --> Jwt[Generate JWT access token]
    Jwt --> Refresh[Create refresh token]
    Refresh --> SaveToken[Save RefreshTokens]
    SaveToken --> Response[accessToken + refreshToken + user]
```

JWT claims:

- `NameIdentifier`: `UserId`.
- `Email`: email.
- `Name`: full name.
- `Role`: `Admin`, `Staff`, `Customer`.

### Refresh Token

```mermaid
flowchart TD
    FE[Frontend] --> RefreshApi[POST /api/auth/refresh]
    RefreshApi --> FindToken[Find token + user + role]
    FindToken --> Validate[Not revoked and not expired]
    Validate --> Revoke[Revoke old token]
    Revoke --> Replacement[Create replacement token]
    Replacement --> Save[Save changes]
    Save --> Response[new accessToken + new refreshToken]
```

Refresh token duoc rotate, nen frontend phai luu token moi sau moi lan refresh.

### Logout

Logout chi revoke refresh token duoc gui len. Access token cu se het han theo
expiry JWT.

## 7. Product Browse Flow

```mermaid
flowchart TD
    FE[Frontend] --> Categories[GET /api/categories]
    FE --> Brands[GET /api/brands]
    FE --> ProductList[GET /api/products]
    ProductList --> Filters[category/brand/minPrice/maxPrice/sort/page]
    Filters --> Products[(Products)]
    Products --> ProductListDto[ProductListItemDto]
    FE --> ProductDetail[GET /api/products/slug]
    ProductDetail --> Product[(Product)]
    Product --> Images[(ProductImages)]
    Product --> Variants[(ProductVariants)]
    Variants --> Inventory[(Inventory)]
    Product --> Specs[(Specifications)]
    Product --> Reviews[(Reviews visible)]
```

Rule chinh:

- Frontend list/detail nen dung product `slug` cho route detail.
- Product list chi lay `IsActive = true`.
- Product detail chi lay active product va active variants.
- Stock nam o `Inventory.Quantity` theo variant.
- Gia hien thi cua variant = `(SalePrice ?? BasePrice) + PriceOffset`.

## 8. Cart Flow

### Guest Cart

```mermaid
flowchart TD
    FE[Frontend guest] --> CartApi[GET /api/cart]
    CartApi --> Header{Co X-Session-Id?}
    Header -->|Co| FindGuest[Find cart by SessionId]
    Header -->|Khong| NewSession[Create GUID SessionId]
    NewSession --> CreateCart[Create Cart]
    CreateCart --> ReturnHeader[Return X-Session-Id]
    FindGuest --> Response[Cart response]
    ReturnHeader --> Response
```

Frontend can luu `X-Session-Id` va gui lai trong request cart sau.

### User Cart

```mermaid
flowchart TD
    FE[Frontend logged in] --> CartApi[Cart endpoints + JWT]
    CartApi --> Claims[Read NameIdentifier]
    Claims --> FindUserCart[Find cart by UserId]
    FindUserCart --> CreateIfMissing[Create if missing]
    CreateIfMissing --> Response[Cart response]
```

Hien chua co logic merge guest cart vao user cart sau login.

### Add Item

```mermaid
flowchart TD
    Add[POST /api/cart/items] --> ValidateQty[Quantity > 0]
    ValidateQty --> Variant[Load active variant + inventory]
    Variant --> Stock[Check stock]
    Stock --> Cart[GetOrCreateCart]
    Cart --> Existing{Item exists?}
    Existing -->|Co| Increase[Increase quantity]
    Existing -->|Khong| Insert[Insert CartItem]
    Increase --> Save[Save]
    Insert --> Save
    Save --> Response[MapCart]
```

## 9. Coupon Flow

```mermaid
flowchart TD
    Apply[POST /api/cart/apply-coupon] --> Cart[Get current cart]
    Cart --> Subtotal[Calculate subtotal]
    Subtotal --> Coupon[Find coupon by uppercase code]
    Coupon --> Validate[Active, date valid, usage available]
    Validate --> MinOrder[Subtotal >= MinOrderValue]
    MinOrder --> Attach[Set Cart.CouponId]
    Attach --> Response[MapCart with discount]
```

Discount:

- `Percent`: `subtotal * DiscountValue / 100`.
- `Fixed`: `DiscountValue`.
- Neu co `MaxDiscount`, discount bi gioi han bang max.

## 10. Checkout COD Flow

```mermaid
flowchart TD
    FE[Frontend] --> CreateOrder[POST /api/orders]
    CreateOrder --> Auth[JWT required]
    Auth --> LoadCart[Load user cart + coupon + items + variants + inventory]
    LoadCart --> Empty{Cart empty?}
    Empty -->|Yes| EmptyErr[EMPTY_CART]
    Empty -->|No| Tx[Begin transaction]
    Tx --> ValidateItems[Validate variant/product/inventory]
    ValidateItems --> Stock[Check stock]
    Stock --> Snapshot[Create OrderItems snapshot]
    Snapshot --> Deduct[Deduct Inventory]
    Deduct --> Log[InventoryLog SaleDeduct]
    Log --> Totals[Calculate subtotal/discount/grandTotal]
    Totals --> Status[OrderStatusLog Pending]
    Status --> Payment[Payment COD Pending]
    Payment --> Coupon[Increment coupon UsedCount]
    Coupon --> ClearCart[Remove CartItems and coupon]
    ClearCart --> Save[Save + Commit]
    Save --> Email[Email confirmation mock]
    Email --> Response[Order detail]
```

Dieu quan trong:

- Order khong nhan product list tu body, ma lay tu cart hien tai.
- `OrderItem` la snapshot, giu gia va ten san pham tai thoi diem dat.
- Tru kho va tao order nam trong transaction.
- `ShippingFee` hien mac dinh `0`.

## 11. Cancel Order Flow

```mermaid
flowchart TD
    FE[Frontend] --> Cancel[PATCH /api/orders/id/cancel]
    Cancel --> Auth[JWT required]
    Auth --> LoadOrder[Load order]
    LoadOrder --> Owner{Order belongs to user?}
    Owner -->|No| NotFound[NOT_FOUND]
    Owner -->|Yes| Status{Completed or Cancelled?}
    Status -->|Yes| Invalid[INVALID_STATUS]
    Status -->|No| Tx[Begin transaction]
    Tx --> SetCancelled[Set order Cancelled]
    SetCancelled --> StatusLog[OrderStatusLog]
    StatusLog --> ReturnStock[Return each item stock]
    ReturnStock --> InventoryLog[InventoryLog CancelReturn]
    InventoryLog --> Commit[Save + Commit]
    Commit --> Email[Email status changed mock]
```

Cancel chi chan `Completed` va `Cancelled`; cac status khac co the bi huy.

## 12. Payment Mock Flow

### Tao Payment URL

```mermaid
flowchart TD
    FE[Frontend] --> Create[POST /api/payments/vnpay/create or momo/create]
    Create --> Auth[JWT required]
    Auth --> Order[Load order + payment]
    Order --> Status{Cancelled or Completed?}
    Status -->|Yes| Invalid[INVALID_ORDER_STATUS]
    Status -->|No| Reset[Set payment Method/Pending/Amount]
    Reset --> Service[PaymentGatewayService.CreatePaymentUrl]
    Service --> Hmac[Create HMAC signature]
    Hmac --> Url[Return returnUrl with query params]
```

Payment URL mock co query params:

- `paymentId`
- `method`
- `status=Success`
- `transactionCode`
- `signature`

### Callback

```mermaid
flowchart TD
    Callback[POST /api/payments/gateway/callback] --> Verify[Verify HMAC signature]
    Verify -->|Invalid| InvalidSig[INVALID_SIGNATURE]
    Verify -->|Valid| Payment[Load payment by id + method]
    Payment --> Normalize[Success/Paid, Failed/Failed, else/Pending]
    Normalize --> UpdatePayment[Update payment status]
    UpdatePayment --> Paid{Paid and order Pending?}
    Paid -->|Yes| SetOrderPaid[Set order Paid + status log]
    Paid -->|No| SaveOnly[Save payment]
    SetOrderPaid --> Save[Save]
    SaveOnly --> Save
    Save --> Email[Email payment result mock]
```

Day la mock gateway, chua goi cong VNPay/Momo that.

## 13. Admin Order Flow

Admin/staff co the:

- List order toan he thong, filter status.
- Cap nhat status bat ky qua `/api/admin/orders/{id}/status`.
- Cap nhat tracking code qua `/api/admin/orders/{id}/tracking`.

Khi update status:

```mermaid
flowchart TD
    Admin --> Patch[PATCH /api/admin/orders/id/status]
    Patch --> Auth[Role Admin or Staff]
    Auth --> Load[Load order]
    Load --> Update[Set Status]
    Update --> Log[OrderStatusLog ChangedBy admin/staff]
    Log --> Email[Email status changed mock]
```

Hien controller chua validate state transition, nen client/admin UI can can than
khi cho chon status.

## 14. Inventory Flow

Inventory chi theo `ProductVariant`, khong theo product tong.

### Import

```mermaid
flowchart TD
    Admin --> Import[POST /api/admin/inventory/import]
    Import --> Validate[Quantity > 0]
    Validate --> Variant[Variant active?]
    Variant --> Inventory[Get or create inventory]
    Inventory --> Add[Quantity += input]
    Add --> Log[InventoryLog Import positive]
```

### Export

```mermaid
flowchart TD
    Admin --> Export[POST /api/admin/inventory/export]
    Export --> Validate[Quantity > 0]
    Validate --> Inventory[Find inventory]
    Inventory --> Stock[Quantity enough?]
    Stock --> Subtract[Quantity -= input]
    Subtract --> Log[InventoryLog Export negative]
```

### Adjust

```mermaid
flowchart TD
    Admin --> Adjust[PATCH /api/admin/inventory/adjust]
    Adjust --> Validate[New quantity >= 0]
    Validate --> Inventory[Get or create inventory]
    Inventory --> Delta[delta = new - old]
    Delta --> Set[Set quantity]
    Set --> Log[InventoryLog Adjust delta]
```

Reports va low stock deu dua vao `Inventory.Quantity` va `LowStockAlert`.

## 15. Promotion Flow

```mermaid
flowchart TD
    Admin --> Create[POST /api/promotions]
    Create --> Validate[Validate type/value/date]
    Validate --> ProductIds[Distinct ProductIds]
    ProductIds --> ActiveProducts[Keep active products only]
    ActiveProducts --> Save[Save Promotion + PromotionProducts]
    Public --> Active[GET /api/promotions/active]
    Active --> Now[IsActive and StartsAt <= now <= EndsAt]
    Now --> Response[PromotionDto with products]
```

Khi update promotion:

- Validate nhu create.
- Remove tat ca `PromotionProducts` cu.
- Add lai product active tu `productIds` moi.

Delete promotion la soft delete: set `IsActive = false`.

## 16. Review Flow

```mermaid
flowchart TD
    User --> Review[POST /api/reviews]
    Review --> Rating[Validate rating 1..5]
    Rating --> Completed[Find completed order by user containing product]
    Completed -->|No| Reject[ORDER_NOT_COMPLETED]
    Completed -->|Yes| Save[Save Review IsVisible=false]
    Public --> Get[GET /api/products/id/reviews]
    Get --> Visible[Only IsVisible=true]
```

Y nghia:

- User chi review san pham da mua trong don `Completed`.
- Review moi chua public ngay vi `IsVisible = false`.
- Hien chua co API admin de duyet/an review.

## 17. Reports Flow

### Revenue

```mermaid
flowchart TD
    Admin --> Revenue[GET /api/admin/reports/revenue]
    Revenue --> Range[Normalize range, default last 30 days]
    Range --> Orders[Orders in range and not Cancelled]
    Orders --> Group[Group by day or month]
    Group --> Metrics[totalRevenue, totalOrders, AOV, paid/completed counts]
```

`BuildRevenueReport` tinh doanh thu tu `Order.GrandTotal`.

### Top Products

```mermaid
flowchart TD
    Admin --> Top[GET /api/admin/reports/top-products]
    Top --> Items[OrderItems whose order not Cancelled and in range]
    Items --> Group[Group by VariantId, ProductName, VariantInfo]
    Group --> Sort[Sort by Revenue desc]
```

### Low Stock

```mermaid
flowchart TD
    Admin --> Low[GET /api/admin/reports/low-stock]
    Low --> Threshold{threshold provided?}
    Threshold -->|Yes| Custom[Quantity <= threshold]
    Threshold -->|No| Alert[Quantity <= LowStockAlert]
    Custom --> Sort[Order by Quantity]
    Alert --> Sort
```

### Excel Export

`GET /api/admin/reports/revenue/export` dung ClosedXML tao workbook co:

- Sheet `Summary`: range, total revenue, total orders, average order value.
- Sheet `Revenue`: period, revenue, orders.

## 18. Trang Thai Va Gia Tri Enum Dang Dung

Code hien dung string thay vi enum.

Order status dang thay trong flow:

- `Pending`
- `Paid`
- `Completed`
- `Cancelled`

Payment method:

- `COD`
- `VNPay`
- `Momo`

Payment status:

- `Pending`
- `Paid`
- `Failed`

Inventory change type:

- `Import`
- `Export`
- `Adjust`
- `SaleDeduct`
- `CancelReturn`

Discount type:

- `Percent`
- `Fixed`

Role:

- `Admin`
- `Staff`
- `Customer`

## 19. Noi Nen Can Than Khi Sua

- Auth role nam trong JWT claim. Neu doi role name, phai dong bo seed, admin UI va `[Authorize(Roles = ...)]`.
- `RoleId` seed dang duoc code suy luan trong `AuthController.GenerateJwtToken` neu user.Role null: `1 -> Admin`, `2 -> Staff`, con lai `Customer`.
- `DbSeeder` bat exception va chi `Console.WriteLine`, nen loi seed co the bi bo qua khi start.
- `CartController.AddToCart` check stock theo quantity request, chua check tong quantity sau khi cong item cu.
- `CartController.UpdateItem` chua check stock khi doi quantity.
- Payment callback public nhung co HMAC signature; `Payment:CallbackSecret` can duoc bao ve khi deploy.
- Product upload chua validate extension/content-type, chi reject file rong.
- Review public chi hien `IsVisible = true`, nhung chua co API duyet review.
- Admin order status update chua validate transition.
- Secret va SQL password dang nam trong `appsettings.json`; production phai dua sang secret manager/env.

## 20. Lenh Lam Viec Voi Database

Restore/build:

```bash
dotnet restore Backend/api.csproj
dotnet build Backend/api.csproj
```

Apply migration:

```bash
dotnet ef database update --project Backend/api.csproj --startup-project Backend/api.csproj
```

Tao migration moi khi sua model:

```bash
dotnet ef migrations add <MigrationName> --project Backend/api.csproj --startup-project Backend/api.csproj
```

Kiem tra pending model changes neu EF CLI ho tro:

```bash
dotnet ef migrations has-pending-model-changes --project Backend/api.csproj --startup-project Backend/api.csproj
```

Chay backend local:

```bash
dotnet run --project Backend/api.csproj --urls http://localhost:5000
```
