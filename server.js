const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { createResponse } = require('./localization');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Localization middleware
app.use((req, res, next) => {
  const acceptLanguage = req.headers['accept-language'] || 'en';
  const lang = acceptLanguage.includes('ar') ? 'ar' : 'en';
  req.lang = lang;
  next();
});

// Load data from db.json
let data = {};
try {
  const dbPath = path.join(__dirname, 'db.json');
  data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} catch (error) {
  console.error('Error loading db.json:', error);
  process.exit(1);
}

// Helper function to save data to db.json
const saveData = () => {
  try {
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(200).json(createResponse(401, null, 'access_token_required', req.lang));
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(200).json(createResponse(403, null, 'invalid_token', req.lang));
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ENDPOINTS ====================

// POST /login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(200).json(createResponse(400, null, 'email_password_required', req.lang));
    }

    const user = data.users.find(u => u.email === email);
    if (!user) {
      return res.status(200).json(createResponse(401, null, 'invalid_credentials', req.lang));
    }

    // For demo purposes, accept any password or check against bcrypt hash
    const isValidPassword = password === 'password' || await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(200).json(createResponse(401, null, 'invalid_credentials', req.lang));
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const responseData = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image
      }
    };

    res.status(200).json(createResponse(200, responseData, 'login_success', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// POST /register
app.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, image } = req.body;

    if (!name || !email || !password) {
      return res.status(200).json(createResponse(400, null, 'name_email_password_required', req.lang));
    }

    // Check if user already exists
    const existingUser = data.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(200).json(createResponse(409, null, 'user_already_exists', req.lang));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: data.users.length + 1,
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      image: image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      role: 'customer'
    };

    data.users.push(newUser);
    saveData();

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const responseData = {
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        image: newUser.image
      }
    };

    res.status(200).json(createResponse(201, responseData, 'registration_success', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// ==================== PRODUCT ENDPOINTS ====================

// GET /products
app.get('/products', (req, res) => {
  const { category, search, limit, page = 1 } = req.query;
  let products = [...data.products];

  // Filter by category
  if (category) {
    products = products.filter(p => p.categoryId == category);
  }

  // Search by name
  if (search) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Pagination
  const pageSize = parseInt(limit) || 10;
  const startIndex = (parseInt(page) - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedProducts = products.slice(startIndex, endIndex);

  const responseData = {
    products: paginatedProducts,
    pagination: {
      page: parseInt(page),
      limit: pageSize,
      total: products.length,
      pages: Math.ceil(products.length / pageSize)
    }
  };

  res.status(200).json(createResponse(200, responseData, 'products_retrieved', req.lang));
});

// GET /products/:id
app.get('/products/:id', (req, res) => {
  const product = data.products.find(p => p.id == req.params.id);
  if (!product) {
    return res.status(200).json(createResponse(404, null, 'product_not_found', req.lang));
  }
  res.status(200).json(createResponse(200, product, 'product_retrieved', req.lang));
});

// POST /products
app.post('/products', authenticateToken, (req, res) => {
  try {
    const { name, description, price, categoryId, image, stock, brand } = req.body;

    if (!name || !description || !price || !categoryId) {
      return res.status(200).json(createResponse(400, null, 'product_fields_required', req.lang));
    }

    const newProduct = {
      id: Math.max(...data.products.map(p => p.id)) + 1,
      name,
      description,
      price: parseFloat(price),
      categoryId: parseInt(categoryId),
      image: image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
      stock: parseInt(stock) || 0,
      rating: 0,
      reviews: 0,
      brand: brand || 'Generic',
      createdAt: new Date().toISOString()
    };

    data.products.push(newProduct);
    saveData();

    res.status(200).json(createResponse(201, newProduct, 'product_created', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// PUT /products/:id
app.put('/products/:id', authenticateToken, (req, res) => {
  try {
    const productIndex = data.products.findIndex(p => p.id == req.params.id);
    if (productIndex === -1) {
      return res.status(200).json(createResponse(404, null, 'product_not_found', req.lang));
    }

    const updatedProduct = {
      ...data.products[productIndex],
      ...req.body,
      id: data.products[productIndex].id // Prevent ID changes
    };

    data.products[productIndex] = updatedProduct;
    saveData();

    res.status(200).json(createResponse(200, updatedProduct, 'product_updated', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// DELETE /products/:id
app.delete('/products/:id', authenticateToken, (req, res) => {
  try {
    const productIndex = data.products.findIndex(p => p.id == req.params.id);
    if (productIndex === -1) {
      return res.status(200).json(createResponse(404, null, 'product_not_found', req.lang));
    }

    data.products.splice(productIndex, 1);
    saveData();

    res.status(200).json(createResponse(200, null, 'product_deleted', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// ==================== CATEGORY ENDPOINTS ====================

// GET /categories
app.get('/categories', (req, res) => {
  res.status(200).json(createResponse(200, data.categories, 'categories_retrieved', req.lang));
});

// GET /categories/:id
app.get('/categories/:id', (req, res) => {
  const category = data.categories.find(c => c.id == req.params.id);
  if (!category) {
    return res.status(200).json(createResponse(404, null, 'category_not_found', req.lang));
  }

  // Include products in this category
  const categoryProducts = data.products.filter(p => p.categoryId == category.id);
  
  const responseData = {
    ...category,
    products: categoryProducts
  };

  res.status(200).json(createResponse(200, responseData, 'category_retrieved', req.lang));
});

// ==================== BANNER ENDPOINTS ====================

// GET /banners
app.get('/banners', (req, res) => {
  const { position, active } = req.query;
  let banners = [...data.banners];

  // Filter by position
  if (position) {
    banners = banners.filter(b => b.position === position);
  }

  // Filter by active status
  if (active !== undefined) {
    const isActive = active === 'true';
    banners = banners.filter(b => b.isActive === isActive);
  }

  // Sort by priority
  banners.sort((a, b) => a.priority - b.priority);

  res.status(200).json(createResponse(200, banners, 'banners_retrieved', req.lang));
});

// GET /banners/:id
app.get('/banners/:id', (req, res) => {
  const banner = data.banners.find(b => b.id == req.params.id);
  if (!banner) {
    return res.status(200).json(createResponse(404, null, 'banner_not_found', req.lang));
  }
  res.status(200).json(createResponse(200, banner, 'banner_retrieved', req.lang));
});

// POST /banners
app.post('/banners', authenticateToken, (req, res) => {
  try {
    const { title, description, image, link, position, priority, isActive, startDate, endDate } = req.body;

    if (!title || !description || !image || !link) {
      return res.status(200).json(createResponse(400, null, 'banner_fields_required', req.lang));
    }

    const newBanner = {
      id: Math.max(...data.banners.map(b => b.id), 0) + 1,
      title,
      description,
      image,
      link,
      position: position || 'hero',
      priority: parseInt(priority) || 1,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || null,
      createdAt: new Date().toISOString()
    };

    data.banners.push(newBanner);
    saveData();

    res.status(200).json(createResponse(201, newBanner, 'banner_created', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// PUT /banners/:id
app.put('/banners/:id', authenticateToken, (req, res) => {
  try {
    const bannerIndex = data.banners.findIndex(b => b.id == req.params.id);
    if (bannerIndex === -1) {
      return res.status(200).json(createResponse(404, null, 'banner_not_found', req.lang));
    }

    const updatedBanner = {
      ...data.banners[bannerIndex],
      ...req.body,
      id: data.banners[bannerIndex].id // Prevent ID changes
    };

    data.banners[bannerIndex] = updatedBanner;
    saveData();

    res.status(200).json(createResponse(200, updatedBanner, 'banner_updated', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// DELETE /banners/:id
app.delete('/banners/:id', authenticateToken, (req, res) => {
  try {
    const bannerIndex = data.banners.findIndex(b => b.id == req.params.id);
    if (bannerIndex === -1) {
      return res.status(200).json(createResponse(404, null, 'banner_not_found', req.lang));
    }

    data.banners.splice(bannerIndex, 1);
    saveData();

    res.status(200).json(createResponse(200, null, 'banner_deleted', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// ==================== CART ENDPOINTS ====================

// GET /cart
app.get('/cart', authenticateToken, (req, res) => {
  const userCart = data.cart.filter(item => item.userId == req.user.userId);
  
  // Populate cart items with product details
  const cartWithProducts = userCart.map(item => {
    const product = data.products.find(p => p.id === item.productId);
    return {
      ...item,
      product: product || null
    };
  });

  const total = cartWithProducts.reduce((sum, item) => {
    return sum + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  const responseData = {
    items: cartWithProducts,
    total: Math.round(total * 100) / 100
  };

  res.status(200).json(createResponse(200, responseData, 'cart_retrieved', req.lang));
});

// POST /cart
app.post('/cart', authenticateToken, (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(200).json(createResponse(400, null, 'product_id_required', req.lang));
    }

    const product = data.products.find(p => p.id == productId);
    if (!product) {
      return res.status(200).json(createResponse(404, null, 'product_not_found', req.lang));
    }

    // Check if item already exists in cart
    const existingItemIndex = data.cart.findIndex(
      item => item.userId == req.user.userId && item.productId == productId
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      data.cart[existingItemIndex].quantity += parseInt(quantity);
    } else {
      // Add new item
      const newCartItem = {
        id: Math.max(...data.cart.map(c => c.id), 0) + 1,
        userId: req.user.userId,
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        addedAt: new Date().toISOString()
      };
      data.cart.push(newCartItem);
    }

    saveData();
    res.status(200).json(createResponse(201, null, 'item_added_to_cart', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// PUT /cart/:id
app.put('/cart/:id', authenticateToken, (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(200).json(createResponse(400, null, 'valid_quantity_required', req.lang));
    }

    const cartItemIndex = data.cart.findIndex(
      item => item.id == req.params.id && item.userId == req.user.userId
    );

    if (cartItemIndex === -1) {
      return res.status(200).json(createResponse(404, null, 'cart_item_not_found', req.lang));
    }

    data.cart[cartItemIndex].quantity = parseInt(quantity);
    saveData();

    res.status(200).json(createResponse(200, null, 'cart_item_updated', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// DELETE /cart/:id
app.delete('/cart/:id', authenticateToken, (req, res) => {
  try {
    const cartItemIndex = data.cart.findIndex(
      item => item.id == req.params.id && item.userId == req.user.userId
    );

    if (cartItemIndex === -1) {
      return res.status(200).json(createResponse(404, null, 'cart_item_not_found', req.lang));
    }

    data.cart.splice(cartItemIndex, 1);
    saveData();

    res.status(200).json(createResponse(200, null, 'item_removed_from_cart', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// ==================== ORDER ENDPOINTS ====================

// POST /orders
app.post('/orders', authenticateToken, (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !paymentMethod) {
      return res.status(200).json(createResponse(400, null, 'shipping_payment_required', req.lang));
    }

    // Get user's cart items
    const userCart = data.cart.filter(item => item.userId == req.user.userId);
    
    if (userCart.length === 0) {
      return res.status(200).json(createResponse(400, null, 'cart_is_empty', req.lang));
    }

    // Create order items with current prices
    const orderItems = userCart.map(item => {
      const product = data.products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product ? product.price : 0
      };
    });

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder = {
      id: Math.max(...data.orders.map(o => o.id), 0) + 1,
      userId: req.user.userId,
      items: orderItems,
      total: Math.round(total * 100) / 100,
      status: 'processing',
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    data.orders.push(newOrder);

    // Clear user's cart
    data.cart = data.cart.filter(item => item.userId != req.user.userId);

    saveData();

    res.status(200).json(createResponse(201, newOrder, 'order_placed', req.lang));
  } catch (error) {
    res.status(200).json(createResponse(500, null, 'server_error', req.lang));
  }
});

// GET /orders/:id
app.get('/orders/:id', authenticateToken, (req, res) => {
  const order = data.orders.find(o => o.id == req.params.id);
  
  if (!order) {
    return res.status(200).json(createResponse(404, null, 'order_not_found', req.lang));
  }

  // Check if user owns this order (or is admin)
  if (order.userId !== req.user.userId) {
    return res.status(200).json(createResponse(403, null, 'access_denied', req.lang));
  }

  // Populate order items with product details
  const orderWithProducts = {
    ...order,
    items: order.items.map(item => {
      const product = data.products.find(p => p.id === item.productId);
      return {
        ...item,
        product: product || null
      };
    })
  };

  res.status(200).json(createResponse(200, orderWithProducts, 'order_retrieved', req.lang));
});

// GET /orders/user/:userId
app.get('/orders/user/:userId', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.userId);

  // Check if user is requesting their own orders
  if (userId !== req.user.userId) {
    return res.status(200).json(createResponse(403, null, 'access_denied', req.lang));
  }

  const userOrders = data.orders.filter(o => o.userId === userId);

  // Populate orders with product details
  const ordersWithProducts = userOrders.map(order => ({
    ...order,
    items: order.items.map(item => {
      const product = data.products.find(p => p.id === item.productId);
      return {
        ...item,
        product: product || null
      };
    })
  }));

  res.status(200).json(createResponse(200, ordersWithProducts, 'orders_retrieved', req.lang));
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  const responseData = { 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  };
  res.status(200).json(createResponse(200, responseData, 'health_check', req.lang));
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 eCommerce API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API Documentation:`);
  console.log(`   Auth: POST /login, POST /register`);
  console.log(`   Products: GET /products, GET /products/:id, POST /products, PUT /products/:id, DELETE /products/:id`);
  console.log(`   Categories: GET /categories, GET /categories/:id`);
  console.log(`   Banners: GET /banners, GET /banners/:id, POST /banners, PUT /banners/:id, DELETE /banners/:id`);
  console.log(`   Cart: GET /cart, POST /cart, PUT /cart/:id, DELETE /cart/:id`);
  console.log(`   Orders: POST /orders, GET /orders/:id, GET /orders/user/:userId`);
}); 