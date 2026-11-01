import { useState, useEffect } from 'react'
import { Star, MapPin, Shield, MessageCircle } from 'lucide-react'
import { supabase } from '../../services/supabase'

interface ProductDetail {
  id: string
  title: string
  description: string
  price: number
  condition: string
  seller_id: string
  seller_name: string
  seller_rating: number
  seller_reviews: number
  category_id: number
  location: string
  rating: number
  total_reviews: number
  images: Array<{ image_url: string }>
  created_at: string
}

export default function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviewText, setReviewText] = useState('')

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          description,
          price,
          condition,
          seller_id,
          location,
          rating,
          total_reviews,
          created_at,
          category_id,
          images:product_images(image_url),
          profiles!seller_id(full_name, avg_rating, total_reviews)
        `)
        .eq('id', productId)
        .single()

      if (error) throw error
      const product = {
        ...data,
        seller_name: (data.profiles as any)?.full_name || 'Unknown',
        seller_rating: (data.profiles as any)?.avg_rating || 0,
        seller_reviews: (data.profiles as any)?.total_reviews || 0
      }
      setProduct(product)
    } catch (err) {
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading product...</div>
  if (!product) return <div className="text-center py-12">Product not found</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg overflow-hidden aspect-square">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImage]?.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  No image
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-teal-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.image_url} alt={`${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-2xl font-bold text-teal-600">Rs. {product.price.toLocaleString()}</p>
            </div>

            {/* Condition & Location */}
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Condition</p>
                <p className="font-semibold text-gray-900 capitalize">{product.condition}</p>
              </div>
              <div className="flex-1 bg-gray-100 p-4 rounded-lg flex items-center gap-2">
                <MapPin size={18} className="text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{product.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Seller Information</h3>
                <Shield size={20} className="text-blue-600" />
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700"><strong>Name:</strong> {product.seller_name}</p>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.round(product.seller_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">{product.seller_rating?.toFixed(1)} ({product.seller_reviews} reviews)</span>
                </div>
                <p className="text-gray-700"><strong>Member since:</strong> {new Date(product.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
                <MessageCircle size={20} />
                Contact Seller
              </button>
              <button className="flex-1 bg-gray-200 text-gray-900 hover:bg-gray-300 font-semibold py-3 rounded-lg transition-colors">
                Add to Favorites
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span>{product.rating?.toFixed(1)} ({product.total_reviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>

          {/* Write Review */}
          <div className="mb-8 pb-8 border-b">
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 mb-3"
              rows={4}
            />
            <button className="btn-primary">Post Review</button>
          </div>

          {/* Reviews List */}
          <div className="text-center text-gray-600">No reviews yet. Be the first to review!</div>
        </div>
      </div>
    </div>
  )
}
