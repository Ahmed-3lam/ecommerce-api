# 🛍️ eCommerce REST API

> **A complete fake eCommerce REST API with authentication, products, cart, orders, and multi-language support**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Quick Installation](#-quick-installation)
- [API Testing with Postman](#-api-testing-with-postman)
- [API Documentation](#-api-documentation)
- [Sample Data](#-sample-data)
- [Response Format](#-response-format)
- [Localization](#-localization)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

- 🔐 **JWT Authentication** (Login/Register)
- 📦 **Products Management** (CRUD operations)
- 🏷️ **Categories** (Read operations)
- 🎯 **Banners/Promotions** (CRUD operations)
- 🛒 **Shopping Cart** (CRUD operations)
- 📋 **Orders Management** (Create/Read)
- 🌍 **Multi-language Support** (English/Arabic)
- 📊 **Standardized Response Format**
- 🔍 **Search & Filtering**
- 📄 **Pagination Support**
- ⚡ **Always HTTP 200 Status** (Error codes in response body)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)
- **Postman** (for API testing) - [Download here](https://www.postman.com/downloads/)

### Check Your Installation
```bash
node --version    # Should show v18+ 
npm --version     # Should show 6+
```

## 🚀 Quick Installation

### Step 1: Get the Code
```bash
# Option A: Clone the repository (if using Git)
git clone <repository-url>
cd ecommerce-api

# Option B: Download and extract the ZIP file
# Then navigate to the extracted folder
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Server
```bash
node server.js
```

You should see:
```
🚀 eCommerce API server running on port 3000
📱 Health check: http://localhost:3000/health
📝 API Documentation:
   Auth: POST /login, POST /register
   Products: GET /products, GET /products/:id, POST /products, PUT /products/:id, DELETE /products/:id
   Categories: GET /categories, GET /categories/:id
   Banners: GET /banners, GET /banners/:id, POST /banners, PUT /banners/:id, DELETE /banners/:id
   Cart: GET /cart, POST /cart, PUT /cart/:id, DELETE /cart/:id
   Orders: POST /orders, GET /orders/:id, GET /orders/user/:userId
```

### Step 4: Test the Server

**Option A: Quick Test (Recommended)**
```bash
npm test
```

This will run our automated test script that verifies all endpoints are working correctly.

**Option B: Manual Test**
Open your browser and visit: `http://localhost:3000/health`

You should see:
```json
{
  "status_code": 200,
  "data": {
    "status": "API is running",
    "timestamp": "2024-01-08T10:30:00.000Z",
    "version": "1.0.0"
  },
  "message": "Server is healthy"
}
```

## 📬 API Testing with Postman

### Option 1: Import Ready-Made Collection

1. **Download the Collection**: Look for `ecommerce-api.postman_collection.json` in the project folder
2. **Open Postman**
3. **Import Collection**: 
   - Click "Import" → "Upload Files" 
   - Select `ecommerce-api.postman_collection.json`
4. **Set Environment Variables**:
   - Base URL: `http://localhost:3000`
   - Token: (will be auto-set after login)

### Option 2: Manual Setup

1. **Create New Collection** in Postman called "eCommerce API"
2. **Set Base URL**: `http://localhost:3000`
3. **Follow the API examples below**

### Quick Test Sequence

#### 1. Health Check
```
GET http://localhost:3000/health
```

#### 2. Login (Get Authentication Token)
```
POST http://localhost:3000/login
Content-Type: application/json
Accept-Language: en

{
  "email": "john@example.com",
  "password": "password"
}
```

**Copy the `token` from response for authenticated requests**

#### 3. Get Products
```
GET http://localhost:3000/products
Accept-Language: en
```

#### 4. Get User's Cart (Requires Auth)
```
GET http://localhost:3000/cart
Accept-Language: en
Authorization: Bearer YOUR_TOKEN_HERE
```

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/login` | User login | ❌ |
| `POST` | `/register` | User registration | ❌ |

### 👤 Profile Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/profile` | Get user profile | ✅ |
| `PUT` | `/profile` | Update user profile | ✅ |

### 📦 Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/products` | Get all products (with filtering) | ❌ |
| `GET` | `/products/:id` | Get product by ID | ❌ |
| `POST` | `/products` | Create new product | ✅ |
| `PUT` | `/products/:id` | Update product | ✅ |
| `DELETE` | `/products/:id` | Delete product | ✅ |

### 🏷️ Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/categories` | Get all categories | ❌ |
| `GET` | `/categories/:id` | Get category with products | ❌ |

### 🎯 Banner Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/banners` | Get all banners (with filtering) | ❌ |
| `GET` | `/banners/:id` | Get banner by ID | ❌ |
| `POST` | `/banners` | Create new banner | ✅ |
| `PUT` | `/banners/:id` | Update banner | ✅ |
| `DELETE` | `/banners/:id` | Delete banner | ✅ |

### 🛒 Cart Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/cart` | Get user's cart items | ✅ |
| `POST` | `/cart` | Add item to cart | ✅ |
| `PUT` | `/cart/:id` | Update cart item quantity | ✅ |
| `DELETE` | `/cart/:id` | Remove item from cart | ✅ |

### 📋 Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/orders` | Create new order | ✅ |
| `GET` | `/orders/:id` | Get order by ID | ✅ |
| `GET` | `/orders/user/:userId` | Get user's orders | ✅ |

## 🧪 Sample Data

### Test Users
| Email | Password | Role |
|-------|----------|------|
| `john@example.com` | `password` | Customer |
| `jane@example.com` | `password` | Customer |

### Product Categories
1. **Electronics** - Phones, Laptops, etc.
2. **Clothing** - Shoes, Jeans, etc.
3. **Home & Garden** - Coffee makers, etc.
4. **Books** - Novels, etc.

### Sample Products
- iPhone 15 Pro ($999.99)
- Samsung Galaxy S24 ($899.99)
- MacBook Air M3 ($1299.99)
- Nike Air Max 270 ($149.99)
- And more...

## 📊 Response Format

All API responses follow this standardized format:

### Success Response
```json
{
  "status_code": 200,
  "data": {
    // Actual response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "status_code": 401,
  "data": null,
  "message": "Invalid email or password"
}
```

### Important: HTTP Status Always 200
- **All HTTP responses return status `200 OK`**
- **Check `status_code` in response body** for actual result
- This prevents client-side HTTP error handling issues

## 🌍 Localization

The API supports English and Arabic localization.

### Usage
Add the `Accept-Language` header to your requests:

```bash
# English (default)
Accept-Language: en

# Arabic
Accept-Language: ar
```

### Examples

**English Response:**
```json
{
  "status_code": 200,
  "data": {...},
  "message": "Login successful"
}
```

**Arabic Response:**
```json
{
  "status_code": 200,
  "data": {...},
  "message": "تم تسجيل الدخول بنجاح"
}
```

## 🔍 Advanced Usage Examples

### Product Filtering
```
GET /products?category=1&search=iphone&limit=5&page=1
```

### Banner Filtering
```
GET /banners?position=hero&active=true
```

### Authenticated Requests
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 node server.js
```

#### 2. npm install Fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. JWT Token Expired
```json
{
  "status_code": 403,
  "message": "Invalid or expired token"
}
```
**Solution:** Login again to get a new token

#### 4. Can't Connect from Mobile/Flutter
**Update Base URL:**
- **Android Emulator:** `http://10.0.2.2:3000`
- **iOS Simulator:** `http://localhost:3000`
- **Physical Device:** `http://YOUR_COMPUTER_IP:3000`

### Getting Your Computer's IP
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

## 📝 File Structure

```
ecommerce-api/
├── server.js                          # Main server file
├── db.json                           # Database (JSON file)
├── localization.js                   # Language translations
├── test-api.js                       # API test script
├── package.json                      # Dependencies
├── LICENSE                           # MIT License
├── README.md                         # This file
├── ecommerce-api.postman_collection.json # Postman collection
└── node_modules/                     # Dependencies (auto-generated)
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file (optional):
```env
PORT=3000
JWT_SECRET=your-secret-key-here
```

### Default Configuration
- **Port:** 3000
- **JWT Secret:** "fallback-secret-key"
- **JWT Expiry:** 24 hours
- **Default Language:** English

## 🚀 Deployment Options

### Local Development
```bash
node server.js
```

### Deploy to Render (Recommended)

**Render** is a modern cloud platform that makes deployment simple and free for small projects.

#### Step 1: Prepare Your Repository
1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

#### Step 2: Deploy on Render
1. **Go to [Render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name:** `ecommerce-api` (or your preferred name)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free` (for testing/development)

#### Step 3: Set Environment Variables
In Render dashboard, add these environment variables:
- `NODE_ENV` = `production`
- `JWT_SECRET` = `your-secure-random-secret-key-here`
- `PORT` = `10000` (Render's default)

#### Step 4: Deploy
- Click **"Create Web Service"**
- Render will automatically build and deploy your API
- Your API will be available at: `https://your-service-name.onrender.com`

#### Step 5: Test Your Deployment
```bash
# Test health endpoint
curl https://your-service-name.onrender.com/health

# Test login
curl -X POST https://your-service-name.onrender.com/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password"}'
```

#### Important Notes for Render:
- ✅ **Free tier limitations:** Service may sleep after 15 minutes of inactivity
- ✅ **Custom domains:** Available on paid plans
- ✅ **HTTPS:** Automatically provided
- ✅ **Auto-deploys:** Triggered on git push
- ✅ **Health checks:** Built-in via `/health` endpoint

### Alternative: Production (with PM2)
```bash
npm install -g pm2
pm2 start server.js --name "ecommerce-api"
```

### Using nodemon (Auto-restart)
```bash
npm install -g nodemon
nodemon server.js
```

## 📞 Support & Contributing

### Need Help?
1. Check the [Troubleshooting](#-troubleshooting) section
2. Ensure your Node.js version is 18+
3. Verify the server is running on port 3000
4. Test with the health endpoint first

### Contributing
1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 Quick Start Summary

1. **Install Node.js 18+**
2. **Run:** `npm install`
3. **Run:** `node server.js`
4. **Test:** `npm test` (or visit `http://localhost:3000/health`)
5. **Login:** POST to `/login` with `john@example.com` / `password`
6. **Use the token** for authenticated endpoints

**Happy coding! 🚀** 