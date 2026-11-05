import { useState, useEffect } from 'react'
import { Star, MapPin, Shield, MessageCircle, Heart, Share2, Check, AlertCircle, Copy, Image as ImageIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface ProductReview {
  id: number
  rating: number
  content: string | null
  created_at: string
  reviewer: { full_name: string } | null
}

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
  const { user } = useAuth()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteMessage, setFavoriteMessage] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [productId])

  useEffect(() => {
    if (!user) {
      setIsFavorite(false)
      return
    }
    supabase.from('favorites').select('product_id').eq('user_id', user.id).eq('product_id', productId).maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('Error checking favorite:', error)
        setIsFavorite(Boolean(data))
      })
  }, [productId, user?.id])

  const toggleFavorite = async () => {
    setFavoriteMessage('')
    if (!user) {
      setFavoriteMessage('Sign in to save this listing.')
      return
    }
    const result = isFavorite
      ? await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', productId)
      : await supabase.from('favorites').insert({ user_id: user.id, product_id: productId })
    if (result.error) {
      setFavoriteMessage(result.error.message)
      return
    }
    setIsFavorite(!isFavorite)
  }

  const copyProductLink = async () => {
    try {
      const link = new URL(`/product?id=${encodeURIComponent(productId)}`, window.location.origin).toString()
      await navigator.clipboard.writeText(link)
      setShareMessage('Listing link copied')
      window.setTimeout(() => setShareMessage(''), 2500)
    } catch {
      setShareMessage('Could not copy this link. Check browser permissions and try again.')
    }
  }

  const shareProduct = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product?.title || 'Bidora listing', url })
      else {
        await navigator.clipboard.writeText(url)
        setShareMessage('Link copied')
        window.setTimeout(() => setShareMessage(''), 2000)
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) setShareMessage('Could not share this link.')
    }
  }

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, content, created_at, reviewer:public_profiles!reviews_reviewer_id_fkey(full_name)')
      .eq('product_id', productId)
      .eq('is_seller_review', true)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching reviews:', error)
      return
    }
    setReviews((data || []) as unknown as ProductReview[])
  }

  const submitReview = async () => {
    setReviewError('')
    setReviewSuccess('')
    if (!user) {
      setReviewError('Sign in to review a purchase.')
      return
    }
    if (!reviewText.trim()) {
      setReviewError('Write a short review before posting.')
      return
    }
    setReviewLoading(true)
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('product_id', productId)
        .eq('order_status', 'delivered')
        .limit(1)
        .maybeSingle()
      if (orderError) throw orderError
      if (!order) throw new Error('Reviews are available after your order is marked delivered.')

      const { error: insertError } = await supabase.from('reviews').insert({
        order_id: order.id,
        reviewer_id: user.id,
        reviewed_user_id: product?.seller_id,
        product_id: productId,
        rating: reviewRating,
        content: reviewText.trim(),
        is_seller_review: true,
      })
      if (insertError) throw insertError
      setReviewText('')
      setReviewSuccess('Thanks, your review has been posted.')
      await fetchReviews()
      await fetchProduct()
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Could not post your review.')
    } finally {
      setReviewLoading(false)
    }
  }

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
          seller:public_profiles!products_seller_id_fkey(full_name, rating, total_reviews)
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
                    <ImageIcon size={48} aria-hidden="true" />
                  </div>
                )}

                {/* Condition Badge */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-4 left-4 bg-bidora-ink text-white px-3 py-2 rounded-sm font-bold text-sm"
                >
                  {product.condition}
                </motion.div>

                {/* Action Buttons Overlay */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFavorite}
                    aria-label={isFavorite ? 'Remove from saved listings' : 'Save listing'}
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
                    onClick={shareProduct}
                    aria-label="Share listing"
                    className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    <Share2 size={20} className="text-gray-600" />
                  </motion.button>
                </div>
                {favoriteMessage && <p role="status" className="absolute top-16 right-4 rounded bg-white px-3 py-2 text-sm shadow">{favoriteMessage}</p>}
                {shareMessage && <p role="status" className="absolute top-28 right-4 rounded bg-white px-3 py-2 text-sm shadow">{shareMessage}</p>}
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
                        alt={`${product.title}, image ${idx + 1}`}
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
              <p className="text-3xl font-bold text-bidora-ink">Rs {product.price.toLocaleString()}</p>
              <button type="button" onClick={copyProductLink} className="mt-5 inline-flex items-center gap-2 border border-bidora-ink/20 px-3 py-2 text-sm font-semibold hover:bg-bidora-paper"><Copy size={15} /> Copy listing link</button>
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
            <div className="flex gap-1 mb-3" role="group" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setReviewRating(rating)}
                  aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                  className="p-1"
                >
                  <Star size={22} className={rating <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell other buyers about this product..."
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none"
              rows={4}
            />
            {reviewError && <p className="mt-2 text-sm text-red-600" role="alert">{reviewError}</p>}
            {reviewSuccess && <p className="mt-2 text-sm text-green-700" role="status">{reviewSuccess}</p>}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={submitReview}
              disabled={reviewLoading}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              <Check size={16} className="inline mr-2" />
              {reviewLoading ? 'Posting…' : 'Post Review'}
            </motion.button>
          </motion.div>

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-600 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
              <Star size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-semibold">No reviews yet</p>
              <p className="text-sm mt-1">Reviews are available after a completed delivery.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-gray-900">{review.reviewer?.full_name || 'Buyer'}</p>
                    <time className="text-xs text-gray-500" dateTime={review.created_at}>
                      {new Date(review.created_at).toLocaleDateString('en-PK')}
                    </time>
                  </div>
                  <div className="flex gap-0.5 my-2" aria-label={`${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={15} className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{review.content}</p>
                </article>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
