#!/usr/bin/env node

/**
 * Environment Setup Script for MyShopping Center
 * This script helps you configure environment variables for deployment
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

console.log('🔧 MyShopping Center Environment Setup');
console.log('=====================================\n');

// Generate a secure JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Create .env file content
const envContent = `# ========================================
# MYSHOPPING CENTER BACKEND ENVIRONMENT
# ========================================

# ========================================
# SERVER CONFIGURATION
# ========================================
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# ========================================
# DATABASE CONFIGURATION
# ========================================
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/myshoppingcenter

# ========================================
# JWT CONFIGURATION
# ========================================
JWT_SECRET=${jwtSecret}

# ========================================
# EMAIL CONFIGURATION (SMTP)
# ========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_FROM=your_email@gmail.com

# ========================================
# PAYMENT GATEWAYS
# ========================================

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here

# M-Pesa Configuration (for mobile money payments)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key_here
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret_here
MPESA_SHORTCODE=your_mpesa_shortcode_here
MPESA_PASSKEY=your_mpesa_passkey_here

# ========================================
# GOOGLE OAUTH CONFIGURATION
# ========================================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ========================================
# SECURITY CONFIGURATION
# ========================================
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File upload limits
MAX_FILE_SIZE=5242880
MAX_FILES=5

# ========================================
# PRODUCTION CONFIGURATION
# ========================================
DEBUG=false

# ========================================
# DEPLOYMENT NOTES
# ========================================
# 1. Replace all placeholder values with actual credentials
# 2. For Render.com deployment, add these as environment variables
# 3. For MongoDB Atlas, use your connection string
# 4. For Gmail SMTP, use App Passwords
# 5. JWT_SECRET has been auto-generated for security
`;

// Write to .env file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envContent);

console.log('✅ Generated .env file with secure JWT secret');
console.log('📝 File location:', envPath);
console.log('\n🔑 Generated JWT Secret:', jwtSecret);
console.log('\n📋 Next Steps:');
console.log('1. Update the .env file with your actual credentials');
console.log('2. For Render.com deployment, add these as environment variables');
console.log('3. Never commit the .env file to version control');
console.log('4. Test your deployment with the updated configuration');
console.log('\n⚠️  Important: Replace all placeholder values before deploying!'); 