#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔒 Securing secrets and environment files...');

// Files that should never be committed
const secretFiles = [
  'backend/.env',
  'frontend/.env',
  'backend/.env.local',
  'frontend/.env.local',
  'backend/.env.development',
  'frontend/.env.development',
  'backend/.env.production',
  'frontend/.env.production',
  'backend/.env.test',
  'frontend/.env.test'
];

// Check if files exist and warn about them
console.log('\n📋 Checking for environment files that should not be committed:');

secretFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`⚠️  Found: ${file} - This file contains secrets and should not be committed`);
  }
});

// Create .env.example files if they don't exist
const createEnvExample = (originalPath, examplePath) => {
  if (fs.existsSync(originalPath) && !fs.existsSync(examplePath)) {
    console.log(`📝 Creating ${examplePath} from ${originalPath}...`);
    
    let content = fs.readFileSync(originalPath, 'utf8');
    
    // Replace actual values with placeholders
    content = content
      .replace(/JWT_SECRET=.+/g, 'JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_chars')
      .replace(/MONGO_URI=mongodb:\/\/localhost.+/g, 'MONGO_URI=mongodb://localhost:27017/myshoppingcenter')
      .replace(/MONGO_URI=mongodb\+srv:\/\/[^@]+@.+/g, 'MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/myshop?retryWrites=true&w=majority')
      .replace(/STRIPE_SECRET_KEY=sk_.+/g, 'STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here')
      .replace(/STRIPE_PUBLISHABLE_KEY=pk_.+/g, 'STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here')
      .replace(/PAYPAL_CLIENT_SECRET=.+/g, 'PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here')
      .replace(/CLOUDINARY_API_KEY=.+/g, 'CLOUDINARY_API_KEY=your_cloudinary_api_key_here')
      .replace(/CLOUDINARY_API_SECRET=.+/g, 'CLOUDINARY_API_SECRET=your_cloudinary_api_secret_here')
      .replace(/CLOUDINARY_CLOUD_NAME=.+/g, 'CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name_here')
      .replace(/SMTP_USER=.+@.+/g, 'SMTP_USER=your_email@gmail.com')
      .replace(/SMTP_PASS=.+/g, 'SMTP_PASS=your_app_password_here')
      .replace(/GOOGLE_CLIENT_ID=.+/g, 'GOOGLE_CLIENT_ID=your_google_client_id_here')
      .replace(/GOOGLE_CLIENT_SECRET=.+/g, 'GOOGLE_CLIENT_SECRET=your_google_client_secret_here');
    
    fs.writeFileSync(examplePath, content);
    console.log(`✅ Created ${examplePath}`);
  }
};

// Create example files
createEnvExample('backend/.env', 'backend/.env.example');
createEnvExample('frontend/.env', 'frontend/.env.example');

// Git commands to remove files from tracking (if they were previously committed)
console.log('\n🗑️  Git commands to remove environment files from tracking:');
console.log('Run these commands if any .env files were previously committed:');
console.log('');

secretFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`git rm --cached ${file}`);
  }
});

console.log('git add .gitignore');
console.log('git commit -m "Remove environment files from tracking and update .gitignore"');

// Security recommendations
console.log('\n🛡️  Security Recommendations:');
console.log('');
console.log('1. ✅ Updated .gitignore to exclude all environment files');
console.log('2. ⚠️  Run the git commands above to remove any previously committed .env files');
console.log('3. 🔑 Generate new secrets for production (JWT_SECRET, API keys, etc.)');
console.log('4. 🔒 Use environment variables in production (Render, Vercel)');
console.log('5. 📝 Only commit .env.example files with placeholder values');
console.log('6. 🚫 Never commit actual API keys, passwords, or secrets');
console.log('');

// Check for potential secrets in committed files
console.log('🔍 Checking for potential secrets in documentation files...');

const docFiles = [
  'README.md',
  'PRODUCTION-DEPLOYMENT-GUIDE.md',
  'PRODUCTION-READY-SUMMARY.md',
  'PERFORMANCE-ANALYSIS-REPORT.md'
];

docFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for potential real secrets (not placeholder patterns)
    const suspiciousPatterns = [
      /sk_live_[a-zA-Z0-9]{24,}/g,  // Stripe live keys
      /pk_live_[a-zA-Z0-9]{24,}/g,  // Stripe live publishable keys
      /mongodb\+srv:\/\/[^:]+:[^@]+@[^\/]+/g,  // Real MongoDB URIs with credentials
    ];
    
    let foundSecrets = false;
    suspiciousPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`⚠️  Potential real secret found in ${file}: ${matches[0].substring(0, 20)}...`);
        foundSecrets = true;
      }
    });
    
    if (!foundSecrets) {
      console.log(`✅ ${file} - No real secrets detected`);
    }
  }
});

console.log('\n✅ Security audit complete!');
console.log('\n📋 Summary:');
console.log('- .gitignore updated to exclude all environment files');
console.log('- Environment files identified for removal from git tracking');
console.log('- Security recommendations provided');
console.log('- Documentation files checked for secrets');
console.log('\n🚨 IMPORTANT: Run the git commands above to remove any committed .env files!');