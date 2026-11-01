import { Heart, Star } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image: string
  rating: number
  reviews: number
  seller: string
  isNew: boolean
}

export default function FeaturedProducts() {
  const products: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 189999,
      image: '📱',
      rating: 4.8,
      reviews: 342,
      seller: 'TechHub Store',
      isNew: true
    },
    {
      id: '2',
      name: 'MacBook Pro 16"',
      price: 449999,
      image: '💻',
      rating: 4.9,
      reviews: 198,
      seller: 'Elite Electronics',
      isNew: false
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5',
      price: 34999,
      image: '🎧',
      rating: 4.7,
      reviews: 567,
      seller: 'Audio Paradise',
      isNew: false
    },
    {
      id: '4',
      name: 'iPad Air 12.9"',
      price: 129999,
      image: '📲',
      rating: 4.6,
      reviews: 289,
      seller: 'Apple Authorized',
      isNew: true
    },
    {
      id: '5',
      name: 'Samsung Galaxy S24',
      price: 149999,
      image: '📱',
      rating: 4.7,
      reviews: 421,
      seller: 'Samsung Direct',
      isNew: true
    },
    {
      id: '6',
      name: 'DJI Mini 4 Pro',
      price: 89999,
      image: '🚁',
      rating: 4.8,
      reviews: 234,
      seller: 'Drone Hub',
      isNew: false
    },
    {
      id: '7',
      name: 'Google Pixel 8 Pro',
      price: 139999,
      image: '📱',
      rating: 4.6,
      reviews: 312,
      seller: 'Google Store',
      isNew: false
    },
    {
      id: '8',
      name: 'Dell XPS 15',
      price: 299999,
      image: '💻',
      rating: 4.7,
      reviews: 156,
      seller: 'Premium Tech',
      isNew: false
    }
  ]

  return (
    <section className="section-container bg-white">
      <h2 className="text-3xl font-bold text-dark-900 mb-4">Featured Listings</h2>
      <p className="text-dark-600 mb-12">Check out our most popular electronics right now</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="card !p-0 overflow-hidden hover:shadow-xl transition-all duration-200 group cursor-pointer">
            {/* Product Image */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center h-40 relative overflow-hidden group-hover:scale-105 transition-transform">
              <span className="text-5xl">{product.image}</span>
              {product.isNew && (
                <span className="absolute top-3 right-3 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  NEW
                </span>
              )}
              <button className="absolute top-3 left-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                <Heart size={16} className="text-dark-400 hover:text-red-500" />
              </button>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-dark-900 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-semibold text-dark-900">{product.rating}</span>
                </div>
                <span className="text-xs text-dark-500">({product.reviews})</span>
              </div>

              {/* Price */}
              <div className="mb-3">
                <p className="text-xl font-bold text-primary-600">
                  Rs. {product.price.toLocaleString()}
                </p>
              </div>

              {/* Seller */}
              <p className="text-xs text-dark-500 mb-4">by {product.seller}</p>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 btn-secondary text-sm py-2 px-3">
                  View
                </button>
                <button className="flex-1 btn-primary text-sm py-2 px-3">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <button className="btn-primary px-8 py-3">
          View All Products
        </button>
      </div>
    </section>
  )
}
