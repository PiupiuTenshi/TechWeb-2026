import CategoryCard from './CategoryCard'
import './CategoryCard.css'

import imgGaming   from '../../assets/laptop_gaming.webp'
import imgAI       from '../../assets/laptop_AI.webp'
import imgVanPhong from '../../assets/laptop_van_phong.webp'
import imgMongNhe  from '../../assets/laptop_mong_nhe.webp'
import imgCamUng   from '../../assets/laptop_cam_ung.webp'
import imgDoHoa    from '../../assets/laptop_do_hoa.webp'

const LAPTOP_CATEGORIES = [
  { key: 'gaming',    label: 'Gaming',    image: imgGaming   },
  { key: 'ai',        label: 'Laptop AI', image: imgAI       },
  { key: 'van-phong', label: 'Văn phòng', image: imgVanPhong },
  { key: 'mong-nhe',  label: 'Mỏng nhẹ', image: imgMongNhe  },
  { key: 'cam-ung',   label: 'Cảm ứng',  image: imgCamUng   },
  { key: 'do-hoa',    label: 'Đồ hoạ',   image: imgDoHoa    },
]

/**
 * CategoryCardList — "Chọn theo nhu cầu" section for the laptop page.
 *
 * Props:
 *   activeCategory   {string}
 *   onCategoryChange {function}
 */
function CategoryCardList({ activeCategory, onCategoryChange }) {
  return (
    <div className="category-card-list" aria-label="Chọn theo nhu cầu">
      {LAPTOP_CATEGORIES.map(cat => (
        <CategoryCard
          key={cat.key}
          imageSrc={cat.image}
          label={cat.label}
          isActive={activeCategory === cat.key}
          onClick={() => onCategoryChange(activeCategory === cat.key ? '' : cat.key)}
          id={`category-card-${cat.key}`}
        />
      ))}
    </div>
  )
}

export default CategoryCardList
