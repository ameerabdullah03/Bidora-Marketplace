import { Smartphone, Laptop, Headphones, Watch, Camera, Gamepad2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  count: number
  color: string
}

export default function Categories() {
  const categories: Category[] = [
    {
      id: 'phones',
      name: 'Phones & Tablets',
      icon: <Smartphone size={32} />,
      count: 5234,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'laptops',
      name: 'Laptops & Computers',
      icon: <Laptop size={32} />,
      count: 3891,
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'audio',
      name: 'Audio & Headphones',
      icon: <Headphones size={32} />,
      count: 2145,
      color: 'from-pink-400 to-pink-600'
    },
    {
      id: 'wearables',
      name: 'Wearables',
      icon: <Watch size={32} />,
      count: 1876,
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'cameras',
      name: 'Cameras & Photography',
      icon: <Camera size={32} />,
      count: 892,
      color: 'from-orange-400 to-orange-600'
    },
    {
      id: 'gaming',
      name: 'Gaming & Consoles',
      icon: <Gamepad2 size={32} />,
      count: 1543,
      color: 'from-red-400 to-red-600'
    }
  ]

  return (
    <section className="section-container">
      <h2 className="text-3xl font-bold text-dark-900 mb-4">Browse by Category</h2>
      <p className="text-dark-600 mb-12">Explore thousands of electronics across all popular categories</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            className="group card !p-6 text-center hover:scale-105 transition-transform duration-200"
          >
            <div className={`bg-gradient-to-br ${category.color} p-4 rounded-lg mb-4 inline-block text-white group-hover:scale-110 transition-transform`}>
              {category.icon}
            </div>
            <h3 className="font-semibold text-dark-900 text-sm mb-2">{category.name}</h3>
            <p className="text-xs text-dark-500">{category.count.toLocaleString()} items</p>
          </button>
        ))}
      </div>
    </section>
  )
}
