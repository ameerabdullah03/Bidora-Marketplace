import { useState } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useCategories } from '../../hooks/useCategories'

interface ProductFormData {
  title: string
  description: string
  price: number
  category_id: number
  condition: 'new' | 'like_new' | 'excellent' | 'good' | 'fair'
  location: string
  is_auction: boolean
  auction_duration_days: number
  stock_quantity: number
}

export default function CreateListing() {
  const { user } = useAuth()
  const { categories, loading: categoriesLoading } = useCategories()
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    category_id: 0,
    condition: 'new',
    location: 'Karachi',
    is_auction: false,
    auction_duration_days: 3,
    stock_quantity: 1,
  })

  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    e.currentTarget.value = ''

    // Limit to 5 images
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }

    const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
    const invalidFile = files.find((file) => !allowedImageTypes.has(file.type) || file.size > 10 * 1024 * 1024)
    if (invalidFile) {
      setError(`${invalidFile.name} must be a PNG, JPEG, or WebP image no larger than 10 MB.`)
      return
    }

    setError('')
    setImages((current) => [...current, ...files])

    // Create preview URLs
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrls((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setPreviewUrls(previewUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    let createdProductId: string | null = null
    const uploadedPaths: string[] = []

    try {
      if (!user) throw new Error('Not authenticated')
      if (!formData.title.trim()) throw new Error('Title is required')
      if (!formData.description.trim()) throw new Error('Description is required')
      if (!categories.some(category => category.id === formData.category_id)) throw new Error('Choose an available category before submitting')
      if (!Number.isFinite(formData.price) || formData.price <= 0) throw new Error('Enter a valid price greater than 0')
      if (images.length === 0) throw new Error('At least 1 image is required')

      // Create product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          category_id: formData.category_id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: formData.price,
          condition: formData.condition,
          location: formData.location,
          is_auction: formData.is_auction,
          stock_quantity: formData.stock_quantity,
          status: 'pending',
        })
        .select()

      if (productError) throw productError
      if (!productData || productData.length === 0) throw new Error('Listing limit reached. Please wait before creating another listing.')

      const productId = productData[0].id
      createdProductId = productId

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.slice('image/'.length)
        const fileName = `${productId}/${Date.now()}-${i}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file, { contentType: file.type, upsert: false })

        if (uploadError) throw uploadError
        uploadedPaths.push(fileName)

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName)

        // Save image reference to database
        const { error: imageRecordError } = await supabase.from('product_images').insert({
          product_id: productId,
          image_url: publicUrlData.publicUrl,
          storage_path: fileName,
          display_order: i,
        })

        if (imageRecordError) throw imageRecordError
      }

      if (formData.is_auction) {
        const startsAt = new Date()
        const endsAt = new Date(startsAt.getTime() + formData.auction_duration_days * 24 * 60 * 60 * 1000)
        const { error: auctionError } = await supabase.from('auctions').insert({
          product_id: productId,
          seller_id: user.id,
          starting_price: formData.price,
          current_bid: 0,
          minimum_increment: 1000,
          start_time: startsAt.toISOString(),
          end_time: endsAt.toISOString(),
          status: 'active',
        })

        if (auctionError) throw auctionError
      }

      createdProductId = null

      setSuccess('Listing created successfully. Pending admin approval. Pending admin approval.')
      setFormData({
        title: '',
        description: '',
        price: 0,
        category_id: 0,
        condition: 'new',
        location: 'Karachi',
        is_auction: false,
        auction_duration_days: 3,
        stock_quantity: 1,
      })
      setImages([])
      setPreviewUrls([])

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (err: any) {
      if (createdProductId) {
        const imageDelete = await supabase.from('product_images').delete().eq('product_id', createdProductId)
        const storageDelete = uploadedPaths.length
          ? await supabase.storage.from('listing-images').remove(uploadedPaths)
          : { error: null }
        const productDelete = await supabase.from('products').delete().eq('id', createdProductId)
        if (imageDelete.error || storageDelete.error || productDelete.error) {
          console.error('Could not fully clean up failed listing:', imageDelete.error || storageDelete.error || productDelete.error)
        }
      }
      setError(err.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-dark-900">Create New Listing</h1>
          <p className="text-dark-600 mt-1">Add a new product to your inventory</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">
              Product Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., iPhone 15 Pro Max - 256GB - Black"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bidora-ink"
              maxLength={255}
            />
            <p className="text-xs text-dark-500 mt-1">{formData.title.length}/255</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product in detail. Include condition, features, and any defects..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bidora-ink"
              maxLength={2000}
            />
            <p className="text-xs text-dark-500 mt-1">{formData.description.length}/2000</p>
          </div>

          {/* Grid: Category, Price, Condition */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                required
                disabled={categoriesLoading || categories.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bidora-ink"
              >
                <option value={0} disabled>{categoriesLoading ? 'Loading categories...' : 'Select a category'}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Price (PKR) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                placeholder="0"
                min="0"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bidora-ink"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bidora-ink"
              >
                {conditions.map((cond) => (
                  <option key={cond.value} value={cond.value}>
                    {cond.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Karachi, Lahore"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bidora-ink"
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">
              Product Images (Max 5) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-bidora-ink transition-colors">
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <label className="cursor-pointer">
                <span className="text-bidora-ink font-medium hover:underline">
                  Click to upload
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={images.length >= 5}
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, WebP up to 10MB each
              </p>
            </div>

            {/* Preview Images */}
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Uploaded product image preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-start gap-3 border border-gray-200 p-4 text-sm leading-6 text-gray-700">
            <input type="checkbox" required className="mt-1 accent-bidora-ink" />
            <span>I confirm that I own or have permission to use every image and item description submitted with this listing.</span>
          </label>

          {/* Auction Option */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_auction}
                onChange={(e) => setFormData({ ...formData, is_auction: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-dark-700">
                List this as an auction instead of fixed price
              </span>
            </label>
            {formData.is_auction && (
              <div className="mt-4 max-w-xs">
                <label className="block text-sm font-semibold text-dark-900 mb-2" htmlFor="auction-duration">
                  Auction duration
                </label>
                <select
                  id="auction-duration"
                  value={formData.auction_duration_days}
                  onChange={(e) => setFormData({ ...formData, auction_duration_days: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bidora-ink"
                >
                  {[1, 3, 5, 7].map((days) => (
                    <option key={days} value={days}>{days} {days === 1 ? 'day' : 'days'}</option>
                  ))}
                </select>
                <p className="text-xs text-dark-500 mt-1">Bids must increase by at least Rs. 1,000.</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 btn-secondary py-2 font-semibold"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary py-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating Listing...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
