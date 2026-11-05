# Bidora - Pakistan's Electronics Marketplace

Pakistan's premier electronics marketplace combining classifieds and auctions. Buy, sell, and bid on electronics with confidence.

**Tagline**: Discover. Bid. Buy.

## 🚀 Features

### For Buyers
- Browse thousands of electronics listings
- Search and filter by category, price, condition
- Participate in timed auctions
- Direct messaging with sellers
- Secure transactions with buyer protection
- Ratings and reviews system

### For Sellers
- Create product listings with up to 5 images
- List products as fixed price or auction
- Manage orders and inventory
- Build seller reputation through ratings
- Seller verification badges
- Analytics dashboard

### Platform Features
- ✅ User authentication (email/password)
- ✅ Buyer and seller roles
- ✅ Product image uploads to cloud storage
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Row-Level Security (RLS) for data protection
- ✅ 6 electronics categories
- ✅ Auction bidding system
- ✅ Order management
- ✅ In-app messaging

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Lucide React** for icons
- **Vite** for bundling
- **Supabase JS Client** for backend

### Backend
- **Supabase PostgreSQL** database
- **Supabase Auth** for user authentication
- **Supabase Storage** for image uploads
- **Row-Level Security (RLS)** policies

### Deployment
- **Cloudflare Pages** (frontend)
- **Supabase** (backend, database, storage)

## 📁 Project Structure

```
Bidora/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          (SignUp, SignIn components)
│   │   │   ├── layout/        (Header, Footer)
│   │   │   └── marketplace/   (Hero, Categories, Products, Auctions)
│   │   ├── pages/
│   │   │   ├── Auth/          (Authentication page)
│   │   │   ├── SellerDashboard/
│   │   │   └── CreateListing/
│   │   ├── hooks/             (useAuth context)
│   │   ├── services/          (Supabase integration)
│   │   ├── App.tsx            (Main app with routing)
│   │   └── index.css          (Global styles)
│   ├── .env.local             (Supabase credentials - in .gitignore)
│   └── package.json
│
├── database/
│   ├── schema-simplified.sql  (10 database tables)
│   └── rls-policies.sql       (Security policies)
│
├── docs/                      (Documentation)
├── .gitignore                 (Git ignore rules)
└── README.md                  (This file)
```

## 🚀 Getting Started

### Prerequisites
- Node.js v24+ (includes npm)
- Git
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/Bidora-Marketplace.git
cd Bidora
```

2. **Install frontend dependencies**
```bash
cd frontend
npm install
```

3. **Set up environment variables**
Create `.env.local` in the `frontend/` directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get these from Supabase:**
- Go to your Supabase dashboard
- Select your project → Settings → API
- Copy Project URL and Anon Key

4. **Start development server**
```bash
npm run dev
```

Your app will be available at **http://localhost:5173**

## 📚 Database Setup

The canonical database schema is `database/schema.sql`. To set it up:

1. Open your Supabase dashboard
2. Go to **SQL Editor** → **New Query**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run**

**Tables created:**
- `categories` (6 electronics categories)
- `products` (seller listings)
- `product_images` (product photos)
- `auctions` (timed auctions)
- `bids` (auction bids)
- `orders` (transactions)
- `reviews` (ratings)
- `reports` (moderation)
- `conversations` (messaging)
- `messages` (in-app chat)

After creating the schema, apply `database/rls-policies.sql`. Do not use the legacy `schema-simplified.sql` for a new installation.

## 🔑 Key Features Explained

### Authentication
- Sign up as buyer or seller
- Email/password authentication via Supabase
- User context provides auth state globally
- Protected routes for dashboards and listings

### Product Listings
- Sellers create listings with title, description, price
- Upload up to 5 product images
- Select category and product condition
- Option to list as auction or fixed price
- Listings start in "pending" status (admin approval required)
- Images auto-uploaded to Supabase Storage

### Seller Dashboard
- View active listings count
- Track sales and revenue
- Manage auctions
- View incoming orders
- Access seller analytics

### Security
- Row-Level Security (RLS) on all database tables
- Users can only see approved products
- Sellers can only modify their own listings
- Orders only visible to buyer and seller
- Messages only visible to conversation participants

## 🧪 Testing

### Sign Up Flow
1. Click "Sign In" in header
2. Click "Create Account"
3. Fill in: Full Name, Email, Password
4. Select: Buy or Sell
5. Create account
6. Verify email link in Supabase dashboard

### Create Listing (Seller)
1. Sign in as seller
2. Click "New Listing" in header
3. Fill in product details
4. Upload 1-5 images
5. Submit
6. Listing appears in database with "pending" status

### Homepage
- Browse featured products
- View live auctions
- Search by category
- View seller info and ratings

## 📋 Sprint Roadmap

### Sprint 1 ✅ Complete
- Homepage with featured products and auctions
- Responsive design
- Brand identity (Bidora colors)

### Sprint 2 ✅ Complete
- Database (10 tables, RLS policies)
- User authentication (sign up/sign in)
- Seller dashboard
- Product listing form with image uploads
- User context and header integration

### Sprint 3 (Next)
- Admin panel for listing approval
- Connect homepage to real database products
- Product detail pages
- Auction bidding system
- Search and filter functionality
- Seller profiles and ratings

### Sprint 4+
- Messaging system
- Order management
- Payment integration (JazzCash, EasyPaisa, Bank Transfer)
- Courier integrations
- Admin moderation tools
- React Native mobile app

## 🔒 Security Notes

### Credentials
- **Never commit** `.env.local` (in .gitignore)
- **Never expose** service_role key
- Anon key is safe (limited permissions via RLS)
- Supabase database password is secure

### Database
- Row-Level Security (RLS) enabled
- All sensitive data protected by policies
- Users can only access their own data
- Approved products visible to all

### Frontend
- No sensitive data stored in localStorage
- Session managed by Supabase Auth
- CORS configured on Supabase

## 🤝 Contributing

This is a personal project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private. Please contact for licensing inquiries.

## 📧 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Contact: ameer@bidora.dev

## 🎯 Next Steps

1. **Test the app** at http://localhost:5173
2. **Create test accounts** (buyer and seller)
3. **Create test listings** with images
4. **Build Sprint 3 features** (admin panel, real product display)
5. **Deploy** frontend to Cloudflare Pages

## 📊 Metrics

**Current Status:**
- ✅ 10 database tables
- ✅ 10 React components
- ✅ 4 main pages (Home, Auth, Dashboard, CreateListing)
- ✅ Full authentication flow
- ✅ Image upload pipeline
- ✅ Responsive design
- ✅ Row-Level Security

**Goals (By Launch):**
- 100+ daily active users
- 500+ product listings
- 50+ daily transactions
- 4.5+ average seller rating
- Zero security incidents

---

**Built with ❤️ for Pakistan's tech community**

Bidora - Discover. Bid. Buy.
