# 🔒 Security Guide - Protecting Your Secrets

## 🚨 CRITICAL: Remove Environment Files from Git

Your environment files contain secrets and should **NEVER** be committed to version control. Run these commands immediately:

```bash
# Remove environment files from git tracking
git rm --cached backend/.env
git rm --cached frontend/.env
git rm --cached backend/.env.production
git rm --cached frontend/.env.production

# Commit the changes
git add .gitignore
git commit -m "Remove environment files from tracking and update .gitignore"

# Push to remove from remote repository
git push
```

## 📁 Files Protected by .gitignore

The updated `.gitignore` now protects:

### Environment Files
- `*.env*` (all environment files)
- `backend/.env*`
- `frontend/.env*`
- `.env.local`, `.env.production`, `.env.development`, `.env.test`

### Sensitive Configuration
- `config/secrets.js`
- `config/production.js`
- SSL certificates (`*.pem`, `*.key`, `*.crt`)
- Upload directories (`uploads/`)

### Development Files
- `node_modules/`
- Build outputs (`dist/`, `build/`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)

## 🔑 Environment Variables Security

### Development (.env.example)
Use `.env.example` files with placeholder values:

```env
# ❌ NEVER commit real values like this:
JWT_SECRET=myshop_super_secret_jwt_key_2024_production_ready_secure_token_32_chars_minimum

# ✅ Always use placeholders in .example files:
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_chars
```

### Production Secrets
For production, use platform environment variables:

#### Render (Backend)
Set in Render Dashboard > Environment:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/myshop
JWT_SECRET=YOUR_SECURE_32_CHARACTER_SECRET
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_LIVE_KEY
```

#### Vercel (Frontend)
Set in Vercel Dashboard > Settings > Environment Variables:
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY
```

## 🛡️ Security Best Practices

### 1. Strong Secrets Generation
```bash
# Generate strong JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator (ensure HTTPS)
# https://generate-secret.vercel.app/32
```

### 2. Environment Separation
- **Development**: Use `.env` (never commit)
- **Production**: Use platform environment variables
- **Examples**: Use `.env.example` (safe to commit)

### 3. API Keys Security
- Use test keys in development
- Use live keys only in production
- Rotate keys regularly
- Monitor usage for suspicious activity

### 4. Database Security
- Use strong passwords (16+ characters)
- Enable IP whitelisting
- Use connection strings with authentication
- Regular backups with encryption

## 🔍 Security Audit Checklist

### Before Deployment:
- [ ] All `.env` files added to `.gitignore`
- [ ] No real secrets in committed files
- [ ] Strong JWT secret generated
- [ ] Production database secured
- [ ] API keys are production-ready
- [ ] CORS configured for production domains only

### After Deployment:
- [ ] Change default admin password
- [ ] Test authentication flows
- [ ] Verify rate limiting works
- [ ] Check HTTPS is enforced
- [ ] Monitor for security alerts

## 🚨 What to Do If Secrets Are Compromised

### If you accidentally committed secrets:

1. **Immediately rotate all exposed secrets**:
   - Generate new JWT secret
   - Regenerate API keys (Stripe, PayPal, etc.)
   - Change database passwords

2. **Remove from git history**:
   ```bash
   # Remove file from all git history (DANGEROUS - backup first!)
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch backend/.env' --prune-empty --tag-name-filter cat -- --all
   
   # Force push to rewrite remote history
   git push origin --force --all
   ```

3. **Update all deployments** with new secrets

4. **Monitor for unauthorized access**

## 📋 Environment Variables Reference

### Required for Production:
```env
# Backend (Render)
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=32_character_minimum_secret
FRONTEND_URL=https://your-app.vercel.app

# Frontend (Vercel)  
VITE_API_URL=https://your-backend.onrender.com/api
```

### Optional (Payment Processing):
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

### Optional (Features):
```env
# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Image Upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🔗 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)

## 📞 Emergency Contacts

If you suspect a security breach:
1. Immediately rotate all secrets
2. Check access logs for suspicious activity
3. Contact your hosting providers (Render, Vercel)
4. Consider professional security audit

---

**Remember**: Security is not a one-time setup - it's an ongoing process. Regularly review and update your security practices.