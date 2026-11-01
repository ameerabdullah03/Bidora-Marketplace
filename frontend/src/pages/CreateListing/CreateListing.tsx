import { useState } from 'react'
import { Upload, X, AlertCircle } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'

interface ProductFormData {
  title: string
  description: string
  price: number
  category_id: number
  condition: 'new' | 'like_new' | 'excellent' | 'good' | 'fair'
  location: string
  is_auction: boolean
  stock_quantity: number
}

export default function CreateListing() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    category_id: 1,
    condition: 'new',
    location: 'Karachi',
    is_auction: false,
    stock_quantity: 1,
  })

  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const categories = [
    { id: 1, name: 'Phones & Tablets' },
    { id: 2, name: 'Laptops & Computers' },
    { id: 3, name: 'Audio & Headphones' },
    { id: 4, name: 'Wearables' },
    { id: 5, name: 'Cameras & Photography' },
    { id: 6, name: 'Gaming & Consoles' },
  ]

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'like_new', label: 'Like New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Limit to 5 images
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }

    setImages([...images, ...files])

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

    try {
      if (!user) throw new Error('Not authenticated')
      if (!formData.title.trim()) throw new Error('Title is required')
      if (!formData.description.trim()) throw new Error('Description is required')
      if (formData.price <= 0) throw new Error('Price must be greater than 0')
      if (images.length === 0) throw new Error('At least 1 image is required')

      // Create product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          category_id: formData.category_id,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          condition: formData.condition,
          location: formData.location,
          is_auction: formData.is_auction,
          stock_quantity: formData.stock_quantity,
          status: 'pending',
        })
        .select()

      if (productError) throw productError
      if (!productData || productData.length === 0) throw new Error('Failed to create product')

      const productId = productData[0].id

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const fileName = `${productId}/${Date.now()}-${i}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fileName)

        // Save image reference to database
        await supabase.from('product_images').insert({
          product_id: productId,
          image_url: publicUrlData.publicUrl,
          storage_path: fileName,
          display_order: i,
        })
      }

      setSuccess('✅ Listing created successfully! Pending admin approval.')
      setFormData({
        title: '',
        description: '',
        price: 0,
        category_id: 1,
        condition: 'new',
        location: 'Karachi',
        is_auction: false,
        stock_quantity: 1,
      })
      setImages([])
      setPreviewUrls([])

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/seller-dashboard'
      }, 2000)
    } catch (err: any) {
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark-900 mb-2">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Images Upload */}
          <div>
            <label className="block text-sm font-semibold text-dark-900 mb-2">
              Product Images (Max 5) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
              <Upload size={32} className="mx-auto text-gray-400 mb-3" />
              <label className="cursor-pointer">
                <span className="text-primary-600 font-medium hover:underline">
                  Click to upload
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
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
                      alt={`Preview ${idx}`}
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
