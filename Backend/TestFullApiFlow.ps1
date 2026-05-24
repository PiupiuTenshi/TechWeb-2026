$ErrorActionPreference = "Stop"

$baseUrl = if ($env:TECHSHOP_API_URL) { $env:TECHSHOP_API_URL.TrimEnd("/") } else { "http://localhost:5000" }
$apiUrl = "$baseUrl/api"
$stamp = Get-Date -Format "yyyyMMddHHmmss"

function Invoke-TechShopApi {
    param(
        [string]$Method,
        [string]$Path,
        [object]$Body = $null,
        [string]$Token = $null,
        [string]$Accept = "application/json"
    )

    $headers = @{ Accept = $Accept }
    if ($Token) {
        $headers.Authorization = "Bearer $Token"
    }

    $uri = "$apiUrl$Path"
    if ($Body -ne $null) {
        $json = $Body | ConvertTo-Json -Depth 12
        return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body $json -ContentType "application/json"
    }

    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
}

function Assert-Success {
    param([object]$Response, [string]$Name)
    if ($null -eq $Response -or $Response.success -ne $true) {
        throw "$Name failed: $($Response | ConvertTo-Json -Depth 10)"
    }
    Write-Host "[PASS] $Name"
}

Write-Host "Testing TechShop API at $apiUrl"

$customerLogin = Invoke-TechShopApi POST "/auth/login" @{
    email = "test@techshop.vn"
    password = "Test@123"
}
Assert-Success $customerLogin "customer login"
$customerToken = $customerLogin.data.accessToken

$adminLogin = Invoke-TechShopApi POST "/auth/login" @{
    email = "admin@techshop.vn"
    password = "Admin@123"
}
Assert-Success $adminLogin "admin login"
$adminToken = $adminLogin.data.accessToken

$categories = Invoke-TechShopApi GET "/categories"
Assert-Success $categories "categories"
$categoryId = $categories.data[0].categoryId

$brands = Invoke-TechShopApi GET "/brands"
Assert-Success $brands "brands"

$products = Invoke-TechShopApi GET "/products?page=1&pageSize=10&sort=newest"
Assert-Success $products "products"
if ($products.data.Count -eq 0) { throw "products returned no data" }

$detail = Invoke-TechShopApi GET "/products/$($products.data[0].slug)"
Assert-Success $detail "product detail"
$variantId = $detail.data.variants[0].variantId
$productId = $detail.data.productId

$createdProduct = Invoke-TechShopApi POST "/products" @{
    categoryId = $categoryId
    name = "API Flow Laptop $stamp"
    slug = "api-flow-laptop-$stamp"
    brand = "TechShop"
    description = "Created by TestFullApiFlow.ps1"
    basePrice = 19990000
    salePrice = 17990000
    thumbnailUrl = "/images/api-flow-laptop-$stamp.webp"
    tags = "api,flow"
    isFeatured = $false
    variants = @(@{
        sku = "API-FLOW-$stamp"
        color = "Black"
        ram = "16GB"
        storage = "512GB"
        priceOffset = 0
        quantity = 10
    })
    images = @(@{
        imageUrl = "/images/api-flow-laptop-$stamp.webp"
        altText = "API Flow Laptop"
        sortOrder = 0
    })
    specifications = @(@{
        specKey = "CPU"
        specValue = "Intel Core i5"
        sortOrder = 1
    })
} $adminToken
Assert-Success $createdProduct "create product"
$createdProductId = $createdProduct.data.productId

$updatedProduct = Invoke-TechShopApi PUT "/products/$createdProductId" @{
    categoryId = $categoryId
    name = "API Flow Laptop Updated $stamp"
    slug = "api-flow-laptop-$stamp"
    brand = "TechShop"
    description = "Updated by TestFullApiFlow.ps1"
    basePrice = 19990000
    salePrice = 16990000
    thumbnailUrl = "/images/api-flow-laptop-$stamp.webp"
    tags = "api,flow,updated"
    isFeatured = $true
    isActive = $true
} $adminToken
Assert-Success $updatedProduct "update product"

$cart = Invoke-TechShopApi POST "/cart/items" @{
    variantId = $variantId
    quantity = 1
} $customerToken
Assert-Success $cart "add cart item"

$cart = Invoke-TechShopApi PUT "/cart/items/$($cart.data.items[0].cartItemId)" @{
    quantity = 2
} $customerToken
Assert-Success $cart "update cart item"

$coupon = Invoke-TechShopApi POST "/cart/apply-coupon" @{
    code = "TECHSHOP10"
} $customerToken
Assert-Success $coupon "apply coupon"

$order = Invoke-TechShopApi POST "/orders" @{
    receiverName = "TechShop API Flow"
    phone = "0900000000"
    shippingAddress = "123 Test Street, Quan 1, TP HCM"
    note = "Created by TestFullApiFlow.ps1"
} $customerToken
Assert-Success $order "create order"
$orderId = $order.data.orderId

$orders = Invoke-TechShopApi GET "/orders" $null $customerToken
Assert-Success $orders "my orders"

$orderDetail = Invoke-TechShopApi GET "/orders/$orderId" $null $customerToken
Assert-Success $orderDetail "order detail"

$payment = Invoke-TechShopApi POST "/payments/vnpay/create" @{
    orderId = $orderId
    returnUrl = "http://localhost:5173/payment-result"
} $customerToken
Assert-Success $payment "create vnpay payment"

$paymentUrl = [uri]$payment.data.paymentUrl
$query = [System.Web.HttpUtility]::ParseQueryString($paymentUrl.Query)
$paymentCallback = Invoke-TechShopApi POST "/payments/vnpay/callback" @{
    paymentId = $payment.data.paymentId
    status = "Success"
    transactionCode = $payment.data.transactionCode
    gatewayResponse = "Automated full-flow callback"
    signature = $query["signature"]
}
Assert-Success $paymentCallback "vnpay callback"

$adminOrders = Invoke-TechShopApi GET "/admin/orders?page=1&pageSize=20" $null $adminToken
Assert-Success $adminOrders "admin orders"

$tracking = Invoke-TechShopApi PUT "/admin/orders/$orderId/tracking" @{
    trackingCode = "TS-FLOW-$stamp"
} $adminToken
Assert-Success $tracking "admin update tracking"

$status = Invoke-TechShopApi PATCH "/admin/orders/$orderId/status" @{
    status = "Completed"
    note = "Completed by TestFullApiFlow.ps1"
} $adminToken
Assert-Success $status "admin update order status"

$review = Invoke-TechShopApi POST "/reviews" @{
    productId = $productId
    orderId = $orderId
    rating = 5
    title = "API full-flow review"
    body = "Created by TestFullApiFlow.ps1"
} $customerToken
Assert-Success $review "create review"

$activePromotions = Invoke-TechShopApi GET "/promotions/active"
Assert-Success $activePromotions "active promotions"

$promotion = Invoke-TechShopApi POST "/promotions" @{
    name = "API Flow Promotion $stamp"
    discountType = "Percent"
    discountValue = 12
    startsAt = "2026-05-21T00:00:00Z"
    endsAt = "2026-06-21T00:00:00Z"
    isActive = $true
    productIds = @($productId)
} $adminToken
Assert-Success $promotion "create promotion"
$promotionId = $promotion.data.promotionId

$promotionUpdate = Invoke-TechShopApi PUT "/promotions/$promotionId" @{
    name = "API Flow Promotion Updated $stamp"
    discountType = "Fixed"
    discountValue = 500000
    startsAt = "2026-05-21T00:00:00Z"
    endsAt = "2026-06-21T00:00:00Z"
    isActive = $true
    productIds = @($productId)
} $adminToken
Assert-Success $promotionUpdate "update promotion"

$promotionDelete = Invoke-TechShopApi DELETE "/promotions/$promotionId" $null $adminToken
Assert-Success $promotionDelete "delete promotion"

$revenue = Invoke-TechShopApi GET "/admin/reports/revenue?groupBy=day" $null $adminToken
Assert-Success $revenue "admin revenue report"

$topProducts = Invoke-TechShopApi GET "/admin/reports/top-products?take=10" $null $adminToken
Assert-Success $topProducts "admin top products"

$lowStock = Invoke-TechShopApi GET "/admin/reports/low-stock?take=50" $null $adminToken
Assert-Success $lowStock "admin low stock report"

$inventory = Invoke-TechShopApi GET "/admin/inventory?page=1&pageSize=20" $null $adminToken
Assert-Success $inventory "admin inventory"

$import = Invoke-TechShopApi POST "/admin/inventory/import" @{
    variantId = $variantId
    quantity = 5
    note = "Import by TestFullApiFlow.ps1"
} $adminToken
Assert-Success $import "inventory import"

$export = Invoke-TechShopApi POST "/admin/inventory/export" @{
    variantId = $variantId
    quantity = 1
    note = "Export by TestFullApiFlow.ps1"
} $adminToken
Assert-Success $export "inventory export"

$adjust = Invoke-TechShopApi PATCH "/admin/inventory/adjust" @{
    variantId = $variantId
    quantity = 25
    note = "Adjust by TestFullApiFlow.ps1"
} $adminToken
Assert-Success $adjust "inventory adjust"

$logs = Invoke-TechShopApi GET "/admin/inventory/logs?page=1&pageSize=20" $null $adminToken
Assert-Success $logs "inventory logs"

$users = Invoke-TechShopApi GET "/admin/users?page=1&pageSize=20" $null $adminToken
Assert-Success $users "admin users"

$newUser = Invoke-TechShopApi POST "/admin/users" @{
    email = "flow-user-$stamp@techshop.vn"
    password = "User@123"
    fullName = "Flow User $stamp"
    phone = "0911111111"
    roleId = 3
    isActive = $true
} $adminToken
Assert-Success $newUser "admin create user"
$newUserId = $newUser.data.userId

$userUpdate = Invoke-TechShopApi PUT "/admin/users/$newUserId" @{
    fullName = "Flow User Updated $stamp"
    phone = "0922222222"
    avatarUrl = $null
    roleId = 3
    isActive = $true
} $adminToken
Assert-Success $userUpdate "admin update user"

$password = Invoke-TechShopApi PATCH "/admin/users/$newUserId/password" @{
    password = "User@456"
} $adminToken
Assert-Success $password "admin change user password"

$disable = Invoke-TechShopApi PATCH "/admin/users/$newUserId/status" @{
    isActive = $false
} $adminToken
Assert-Success $disable "admin disable user"

$productDelete = Invoke-TechShopApi DELETE "/products/$createdProductId" $null $adminToken
Assert-Success $productDelete "delete created product"

Write-Host "Full API flow completed successfully."
