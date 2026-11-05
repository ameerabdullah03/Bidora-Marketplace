import { useState, useEffect } from 'react'
import { Star, MapPin, Shield, MessageCircle, Heart, Share2, Check, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
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
  const [isFavorite, setIsFavorite] = useState(false)

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
          seller:users!products_seller_id_fkey(full_name, rating, total_reviews)
        `)
        .eq('id', productId)
        .single()

      if (error) throw error
      const product = {
        ...data,
        seller_name: (data.seller as any)?.full_name || 'Unknown',
        seller_rating: (data.seller as any)?.rating || 0,
        seller_reviews: (data.seller as any)?.total_reviews || 0
      }
      setProduct(product)
    } catch (err) {
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </motion.div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white p-12 rounded-2xl shadow-lg"
        >
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-900 text-xl font-semibold">Product not found</p>
          <p className="text-gray-600 mt-2">This product may have been removed or is no longer available.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = '/search'}
            className="mt-6 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg"
          >
            Back to Search
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
        >
          {/* Gallery - Left Column */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                layoutId="main-image"
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-square shadow-lg"
              >
                {product.images && product.images.length > 0 ? (
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={product.images[selectedImage]?.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">📷</span>
                  </div>
                )}

                {/* Condition Badge */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm"
                >
                  {product.condition}
                </motion.div>

                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Heart
                      size={20}
                      className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Share2 size={20} className="text-gray-600" />
                  </motion.button>
                </div>
              </motion.div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <motion.div layout className="grid grid-cols-4 gap-3">
                  {product.images.map((img, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? 'border-teal-600 shadow-lg'
                          : 'border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${idx}`}
                        className="w-full h-full object-cover hover:scale-110 transition-transform"
                      />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Details - Right Column */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Title & Price */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 line-clamp-3">
                {product.title}
              </h1>
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent"
              >
                Rs. {product.price.toLocaleString()}
              </motion.p>
            </div>

            {/* Info Cards */}
            <div className="space-y-3">
              {/* Location */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex items-center gap-3"
              >
                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-900">{product.location}</p>
                </div>
              </motion.div>

              {/* Rating */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Product Rating</p>
                  <span className="font-bold text-gray-900">{product.rating?.toFixed(1)}</span>
                </div>
                <div className="flex gap-1 items-center">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Star
                        size={16}
                        className={i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </motion.div>
                  ))}
                  <span className="text-xs text-gray-600 ml-2">({product.total_reviews} reviews)</span>
                </div>
              </motion.div>
            </div>

            {/* Seller Info Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/50 rounded-2xl p-6 shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Shield size={18} className="text-teal-600" />
                  Seller Information
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Seller Name</p>
                  <p className="font-semibold text-gray-900">{product.seller_name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Seller Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.round(product.seller_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {product.seller_rating?.toFixed(1)} ({product.seller_reviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-teal-200/50">
                  <p className="text-xs text-gray-600">
                    Member since {new Date(product.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = `/messages?seller=${product.seller_id}&product=${product.id}`}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                <MessageCircle size={20} />
                Contact Seller
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = `/checkout?id=${product.id}`}
                className="w-full px-6 py-4 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
              >
                Buy Now
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Description Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 bg-white rounded-2xl shadow-md p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-2xl shadow-md p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviews & Feedback</h2>

          {/* Write Review */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 pb-8 border-b border-gray-200"
          >
            <label className="block text-sm font-semibold text-gray-900 mb-3">Share your experience</label>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell other buyers about this product..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
              rows={4}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              <Check size={16} className="inline mr-2" />
              Post Review
            </motion.button>
          </motion.div>

          {/* Reviews List */}
          <div className="text-center py-12 text-gray-600 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
            <Star size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-semibold">No reviews yet</p>
            <p className="text-sm mt-1">Be the first to review this product!</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
