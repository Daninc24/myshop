# MyShop - E-commerce Platform

A modern, production-ready e-commerce platform built with React, Node.js, and MongoDB.

## Features

- 🛍️ **Product Management** - Complete product catalog with categories, images, and inventory
- 🛒 **Shopping Cart** - Persistent cart with real-time updates
- 💳 **Payment Integration** - Stripe, PayPal, and M-Pesa support
- 👤 **User Management** - Authentication, profiles, and wishlists
- 📊 **Admin Dashboard** - Comprehensive admin panel for store management
- 📱 **Responsive Design** - Mobile-first design with PWA support
- 🔍 **Advanced Search** - Smart search with filters and recommendations
- 📈 **Analytics** - Built-in analytics and reporting
- 🚀 **Performance Optimized** - Fast loading with lazy loading and caching

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Helmet** for SEO
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Cloudinary** for image management
- **Stripe/PayPal** for payments

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myshop
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. **Environment Setup**
   
   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5002/api
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   VITE_GA_ID=your_google_analytics_id_here
   ```
   
   **Backend (.env)**
   ```env
   NODE_ENV=development
   PORT=5002
   FRONTEND_URL=http://localhost:5173
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=your_super_secret_jwt_key_here
   CLOUDINARY_API_KEY=your_cloudinary_api_key_here
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   PAYPAL_CLIENT_ID=your_paypal_client_id_here
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
   ```

4. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5002/api
   - Admin Panel: http://localhost:5173/admin

## Production Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Connect your repository to your preferred platform
2. Set environment variables
3. Configure MongoDB connection
4. Deploy

## Project Structure

```
myshop/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   └── public/             # Static assets
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # MongoDB models
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
│   └── uploads/            # File uploads
└── README.md
```

## Key Features

### User Features
- **Product Browsing** - Browse products by category, search, and filters
- **Shopping Cart** - Add/remove items, quantity management
- **Wishlist** - Save products for later
- **User Profile** - Manage personal information and orders
- **Order Tracking** - Track order status and history
- **Reviews & Ratings** - Product reviews and ratings system

### Admin Features
- **Product Management** - Add, edit, delete products
- **Category Management** - Organize products by categories
- **Order Management** - Process and track orders
- **User Management** - Manage customer accounts
- **Analytics Dashboard** - Sales reports and insights
- **Inventory Management** - Stock tracking and alerts

### Technical Features
- **SEO Optimized** - Meta tags, structured data, sitemap
- **Performance** - Lazy loading, image optimization, caching
- **Security** - JWT authentication, input validation, rate limiting
- **Mobile Responsive** - Works on all device sizes
- **PWA Ready** - Progressive Web App capabilities
- **Error Handling** - Comprehensive error boundaries and logging

## Configuration

### Branding
Update the branding configuration in `frontend/src/config/branding.js`:
```javascript
export const BRAND_CONFIG = {
  name: 'Your Brand Name',
  tagline: 'Your Brand Tagline',
  email: 'info@yourbrand.com',
  // ... other branding settings
};
```

### Sections
Configure page sections in `frontend/src/config/sections.js`:
```javascript
export const SECTIONS_CONFIG = {
  hero: {
    enabled: true,
    title: 'Your Hero Title',
    // ... other section settings
  },
  // ... other sections
};
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order status (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@myshop.com or create an issue in the repository.

## Changelog

### v1.0.0 (Production Ready)
- Cleaned up all hardcoded data and test content
- Removed development-specific configurations
- Updated branding to generic "MyShop"
- Optimized for production deployment
- Enhanced security and performance
- Comprehensive documentation
