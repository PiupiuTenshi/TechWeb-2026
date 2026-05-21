import './ProductSpecsTable.css'

// ─── Brand-derived helpers ─────────────────────────────────────────────────────
function phoneChipset(brand) {
  switch (brand) {
    case 'iPhone':  return 'A19 Pro'
    case 'Samsung': return 'Snapdragon 8 Elite for Galaxy'
    case 'Xiaomi':  return 'Snapdragon 8 Gen 3'
    default:        return 'Snapdragon 7s Gen 3'
  }
}

function phoneOS(brand) {
  return brand === 'iPhone' ? 'iOS 26' : 'Android 15'
}

function phoneScreen(brand) {
  return brand === 'iPhone'
    ? 'Super Retina XDR'
    : brand === 'Samsung'
      ? 'Dynamic AMOLED 2X'
      : 'AMOLED'
}

function storageLabel(gb) {
  if (gb >= 1024) return (gb / 1024) + ' TB'
  return gb + ' GB'
}

// ─── Phone spec rows ───────────────────────────────────────────────────────────
function buildPhoneSpecs(product) {
  const { brand, storage, ram } = product
  return [
    { label: 'Kích thước màn hình', value: '6.9"' },
    { label: 'CPU',                 value: phoneChipset(brand), highlight: true },
    { label: 'Hệ điều hành',        value: phoneOS(brand) },
    { label: 'Bộ nhớ trong',        value: storageLabel(storage) },
    { label: 'RAM',                 value: ram + ' GB', highlight: true },
    { label: 'Camera chính',        value: '48MP' },
    { label: 'Camera phụ',          value: '12MP' },
    { label: 'Dung lượng pin',      value: '4685 mAh' },
    { label: 'Màu sắc',             value: 'Cam Vũ Trụ, Xanh Đậm, Bạc' },
    { label: 'Thẻ sim',             value: '1 Nano SIM & 1 eSIM' },
    { label: 'Sạc nhanh',           value: '45W' },
    { label: 'Hàng sản xuất',       value: brand },
    { label: 'Tình trạng SP',       value: 'New' },
    { label: 'Công nghệ màn hình',  value: phoneScreen(brand) },
    { label: 'Chống nước',          value: 'Có' },
    { label: 'Wifi',                value: 'Wifi 7' },
    { label: 'Kích thước, trọng lượng', value: 'Dài 163,4mm – Ngang 78mm – Dày 8,75mm – Nặng 231g' },
    { label: 'Bluetooth',           value: 'v6.0' },
    { label: 'Tính năng khác',      value: 'NFC' },
    { label: 'Chipset',             value: phoneChipset(brand) },
    { label: 'Dung lượng',          value: storageLabel(storage) },
    { label: 'Chất liệu',           value: 'Nhôm nguyên khối rèn nhiệt' },
    { label: 'Cổng kết nối/sạc',   value: 'Type-C' },
    { label: 'Hỗ trợ mạng',        value: '5G' },
  ]
}

// ─── Laptop spec rows ──────────────────────────────────────────────────────────
function buildLaptopSpecs(product) {
  const { storage, ram } = product
  const storageStr = storageLabel(storage)
  const ramStr = ram + 'GB (2×13MB SO-DIMM DDR5 4800MHz (2 slots, nâng cấp tối đa 32GB))'

  return [
    {
      label: 'CPU',
      value: 'Intel® Core™ i7-14650HX, 20C 8P + 12E / 28T, P-core 2.1/5.0GHz, E-core 1.5/3.8GHz, 28MB',
      highlight: true,
    },
    { label: 'RAM',           value: ramStr, highlight: true },
    {
      label: 'Ổ cứng',
      value: `TRì SSD M.2 2242 PCIe® 4.0×4 NVMe® — Up to two drives, 2× M.2 SSD + M.2 2242 SSD up to ${storageStr}`,
    },
    {
      label: 'Card đồ họa',
      value: 'NVIDIA® GeForce RTX™ 4070 8GB GDDR7, Boost Clock 2340MHz, TGP 165W, 790 AI TOPS',
      highlight: true,
    },
    {
      label: 'Màn hình',
      value: '15.6" WQHD (2560×1600) OLED 500nits glossy, 100% DCI-P3, 165Hz, Dolby Vision®, DisplayHDR™ True Black 500',
    },
    {
      label: 'Cổng giao tiếp',
      value:
        '2× USB-A (USB 5Gbps / USB 3.2 Gen 1)\n' +
        '1× USB-A (USB 10Gbps / USB 3.2 Gen 2), Always On\n' +
        '1× USB-C® (USB 10Gbps / USB 3.2 Gen 2), with USB PD 40–100W and DisplayPort™ 3.1\n' +
        '1× USB-C® (USB 10Gbps / USB 3.2 Gen 2), with DisplayPort™ 1.4\n' +
        '1× HDMI® 2.1, up to 8K/60Hz\n' +
        '1× Headphone / microphone combo jack (3.5mm)\n' +
        '1× Ethernet (RJ-45)\n' +
        '1× Power connector',
    },
    { label: 'Âm thanh',     value: '2× 2W hi-fi speakers, tuned by HARMAN, optimized with Nahimic Audio' },
    { label: 'Bàn phím',     value: 'Steamos RGB backlit, English' },
    { label: 'Finger Print', value: 'None' },
    { label: 'Chuẩn LAN',   value: '100/1000M (RJ-45)' },
    { label: 'Chuẩn WiFi',  value: 'Wi-Fi® 7, 802.11be 2×2' },
    { label: 'Bluetooth',    value: 'v5.4' },
    { label: 'Webcam',       value: '5.0MP with 4-shutter' },
    {
      label: 'Hệ điều hành',
      value: 'Windows 11 Home Single Language, English, Office Home 2024 + Lenovo® AI Now',
    },
    { label: 'Pin',           value: '80Wh, 240W Slim Tip (3-pin)' },
    { label: 'Trọng lượng',  value: 'Starting at 2.4 kg (4.76 lbs)' },
    { label: 'Màu sắc',      value: 'Eclipse Black' },
    { label: 'Chất liệu',    value: 'Aluminum (Top), PC ABS + 10% Talc (Bottom)' },
    { label: 'Kích thước',   value: '364.9 × 265.25 × 19.95–21.54 mm' },
    { label: 'Tính năng đặc biệt', value: 'AI Chip, AI Now' },
  ]
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * ProductSpecsTable
 *
 * Props:
 *   product {object} — the product object
 *   type    {('phone'|'laptop')}
 */
function ProductSpecsTable({ product, type }) {
  const rows = type === 'phone' ? buildPhoneSpecs(product) : buildLaptopSpecs(product)

  return (
    <section className="specs-section" aria-label="Thông tin sản phẩm">
      <h2 className="specs-section-title">Thông tin sản phẩm</h2>
      <p className="specs-subsection-title">Thông số kỹ thuật:</p>

      <table className="specs-table">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td className={`spec-label${row.highlight ? ' spec-label--highlight' : ''}`}>
                {row.label}
              </td>
              <td className="spec-value" style={{ whiteSpace: 'pre-line' }}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default ProductSpecsTable
