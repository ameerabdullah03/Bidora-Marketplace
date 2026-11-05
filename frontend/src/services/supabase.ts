import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth functions
export const signUp = async (email: string, password: string, fullName: string) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
}

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session?.user
}

// Products
export const getProducts = async (limit = 20) => {
  return await supabase
    .from('products')
    .select('*, seller:users(id, full_name, rating)')
    .eq('status', 'approved')
    .limit(limit)
    .order('created_at', { ascending: false })
}

export const getProductById = async (id: string) => {
  return await supabase
    .from('products')
    .select('*, seller:users(*), images:product_images(*)')
    .eq('id', id)
    .single()
}

export const createProduct = async (productData: any) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  return await supabase.from('products').insert({
    ...productData,
    seller_id: user.id,
    status: 'pending',
  })
}

// Auctions
export const getAuctions = async (limit = 10) => {
  return await supabase
    .from('auctions')
    .select('*, product:products(*, seller:users(full_name, rating))')
    .eq('status', 'active')
    .limit(limit)
    .order('end_time', { ascending: true })
}

export const createAuction = async (auctionData: any) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  return await supabase.from('auctions').insert({
    ...auctionData,
    seller_id: user.id,
    status: 'active',
  })
}

export const placeBid = async (auctionId: string, amount: number) => {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not authenticated')

  return await supabase.rpc('place_auction_bid', {
    p_auction_id: auctionId,
    p_amount: amount,
  })
}
