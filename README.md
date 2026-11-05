# Bidora - Pakistan's Electronics Marketplace

An electronics marketplace for Pakistan combining fixed-price listings and timed auctions.

**Tagline**: Discover. Bid. Buy.

## 🚀 Features

### For Buyers
- Browse approved electronics listings
- Search and filter by category, price, condition
- Participate in timed auctions
- Direct messaging with sellers
- Cash-on-delivery order flow with seller fulfillment and buyer delivery confirmation
- Ratings and reviews system

### For Sellers
- Create product listings with up to 5 images
- List products as fixed price or auction
- Manage orders and inventory
- Build seller reputation through ratings
- Seller dashboard with live listings, auctions, orders, and rating totals

### Platform Features
- ✅ User authentication (email/password)
- ✅ Buyer and seller roles
- ✅ Product image uploads to cloud storage
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Row-Level Security (RLS) for data protection
- ✅ 6 electronics categories
- ✅ Transaction-safe auction bidding and winner checkout
- ✅ Order management
- ✅ In-app messaging
- ✅ Verified-purchase reviews and saved listings
- ⏳ JazzCash, EasyPaisa, and card gateways (disabled until merchant setup)

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
│   ├── schema.sql             (canonical schema, 13 tables)
│   ├── schema-simplified.sql  (legacy reference)
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
git clone https://github.com/ameerabdullah03/Bidora-Marketplace.git
cd Bidora-Marketplace
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
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

**Get these from Supabase:**
- Go to your Supabase dashboard
- Select your project → Settings → API
- Copy Project URL and Anon Key

4. **Set up Supabase**
Follow [`DATABASE_SETUP.md`](DATABASE_SETUP.md). For a fresh project, apply `database/schema.sql` then `database/rls-policies.sql`; for an existing canonical installation, follow the migration path in that guide. Never run the legacy simplified schema over live data.

5. **Start development server**
```bash
npm run dev
```

Your app will be available at **http://localhost:5173**

## 📚 Database Setup

See [`DATABASE_SETUP.md`](DATABASE_SETUP.md) for the safe fresh-install and existing-project paths. A new project needs both `database/schema.sql` and `database/rls-policies.sql` applied in that order.

**Tables created:**
- `users` (marketplace profiles tied to Supabase Auth)
- `admins` (trusted moderators)
- `favorites` (saved listings)
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

Do not use the legacy `schema-simplified.sql` for a new installation. Follow [`ADMIN_SETUP.md`](ADMIN_SETUP.md) to grant the first administrator after the database is ready.

## 🔑 Key Features Explained

### Authentication
- Sign up as buyer or seller
- Email/password authentication via Supabase
- User context provides auth state globally
- Seller and admin pages check account/session access before enabling their actions

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
- Database (13 tables, RLS policies)
- User authentication (sign up/sign in)
- Seller dashboard
- Product listing form with image uploads
- User context and header integration

### Sprint 3 ✅ Complete
- Admin panel for listing approval
- Connect homepage to real database products
- Product detail pages
- Auction bidding system
- Search and filter functionality
- Seller profiles and ratings

### Sprint 4 ✅ Core flows complete; external integrations pending
- Messaging system
- Order management
- Cash-on-delivery ordering and order fulfillment
- Payment gateways (JazzCash, EasyPaisa, cards) require merchant credentials and server callbacks
- Courier integrations and mobile apps are future work

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

## 🚀 Remaining launch setup

1. Apply the correct SQL path in [`DATABASE_SETUP.md`](DATABASE_SETUP.md), create the `listing-images` bucket, configure auth redirects, and provision an administrator.
2. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` locally and in the hosting environment.
3. Run buyer, seller, auction, messaging, order, and admin acceptance checks with real Supabase accounts.
4. Configure hosting and deploy the frontend.
5. Integrate a payment provider through trusted server callbacks before enabling online payments. Email and SMS notifications also need provider configuration.

## 📊 Metrics

**Current Status:**
- Core marketplace, seller, admin, auction, checkout, and messaging pages are implemented
- Frontend TypeScript and Vite production build pass; route-based code splitting keeps the entry chunk below 500 KB
- Cash-on-delivery order flow is implemented; online payment gateways are pending
- Live Supabase migration/setup, storage bucket creation, first-admin provisioning, real-account acceptance checks, and hosting configuration remain deployment steps

**Goals (By Launch):**
- 100+ daily active users
- 500+ product listings
- 50+ daily transactions
- 4.5+ average seller rating
- Zero security incidents

---

**Built with ❤️ for Pakistan's tech community**

Bidora - Discover. Bid. Buy.
