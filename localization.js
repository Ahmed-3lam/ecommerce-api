const messages = {
  en: {
    // Auth messages
    login_success: "Login successful",
    registration_success: "Registration successful",
    invalid_credentials: "Invalid email or password",
    user_already_exists: "User already exists",
    email_password_required: "Email and password are required",
    name_email_password_required: "Name, email, and password are required",
    access_token_required: "Access token required",
    invalid_token: "Invalid or expired token",
    access_denied: "Access denied",
    profile_retrieved: "Profile retrieved successfully",
    profile_updated: "Profile updated successfully",
    user_not_found: "User not found",
    
    // Product messages
    products_retrieved: "Products retrieved successfully",
    product_retrieved: "Product details retrieved successfully",
    product_created: "Product created successfully",
    product_updated: "Product updated successfully",
    product_deleted: "Product deleted successfully",
    product_not_found: "Product not found",
    product_fields_required: "Name, description, price, and categoryId are required",
    
    // Category messages
    categories_retrieved: "Categories retrieved successfully",
    category_retrieved: "Category details retrieved successfully",
    category_not_found: "Category not found",
    
    // Banner messages
    banners_retrieved: "Banners retrieved successfully",
    banner_retrieved: "Banner details retrieved successfully",
    banner_created: "Banner created successfully",
    banner_updated: "Banner updated successfully",
    banner_deleted: "Banner deleted successfully",
    banner_not_found: "Banner not found",
    banner_fields_required: "Title, description, image, and link are required",
    
    // Cart messages
    cart_retrieved: "Cart retrieved successfully",
    item_added_to_cart: "Item added to cart successfully",
    cart_item_updated: "Cart item updated successfully",
    item_removed_from_cart: "Item removed from cart successfully",
    cart_item_not_found: "Cart item not found",
    product_id_required: "Product ID is required",
    valid_quantity_required: "Valid quantity is required",
    cart_is_empty: "Cart is empty",
    
    // Order messages
    order_placed: "Order placed successfully",
    order_retrieved: "Order details retrieved successfully",
    orders_retrieved: "Order history retrieved successfully",
    order_not_found: "Order not found",
    shipping_payment_required: "Shipping address and payment method are required",
    
    // General messages
    server_error: "Internal server error",
    health_check: "API is running smoothly"
  },
  
  ar: {
    // Auth messages
    login_success: "تم تسجيل الدخول بنجاح",
    registration_success: "تم التسجيل بنجاح",
    invalid_credentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    user_already_exists: "المستخدم موجود بالفعل",
    email_password_required: "البريد الإلكتروني وكلمة المرور مطلوبان",
    name_email_password_required: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة",
    access_token_required: "رمز الوصول مطلوب",
    invalid_token: "رمز غير صالح أو منتهي الصلاحية",
    access_denied: "تم رفض الوصول",
    profile_retrieved: "تم استرداد الملف الشخصي بنجاح",
    profile_updated: "تم تحديث الملف الشخصي بنجاح",
    user_not_found: "المستخدم غير موجود",
    
    // Product messages
    products_retrieved: "تم استرداد المنتجات بنجاح",
    product_retrieved: "تم استرداد تفاصيل المنتج بنجاح",
    product_created: "تم إنشاء المنتج بنجاح",
    product_updated: "تم تحديث المنتج بنجاح",
    product_deleted: "تم حذف المنتج بنجاح",
    product_not_found: "المنتج غير موجود",
    product_fields_required: "الاسم والوصف والسعر ومعرف الفئة مطلوبة",
    
    // Category messages
    categories_retrieved: "تم استرداد الفئات بنجاح",
    category_retrieved: "تم استرداد تفاصيل الفئة بنجاح",
    category_not_found: "الفئة غير موجودة",
    
    // Banner messages
    banners_retrieved: "تم استرداد البانرات بنجاح",
    banner_retrieved: "تم استرداد تفاصيل البانر بنجاح",
    banner_created: "تم إنشاء البانر بنجاح",
    banner_updated: "تم تحديث البانر بنجاح",
    banner_deleted: "تم حذف البانر بنجاح",
    banner_not_found: "البانر غير موجود",
    banner_fields_required: "العنوان والوصف والصورة والرابط مطلوبة",
    
    // Cart messages
    cart_retrieved: "تم استرداد السلة بنجاح",
    item_added_to_cart: "تم إضافة العنصر إلى السلة بنجاح",
    cart_item_updated: "تم تحديث عنصر السلة بنجاح",
    item_removed_from_cart: "تم إزالة العنصر من السلة بنجاح",
    cart_item_not_found: "عنصر السلة غير موجود",
    product_id_required: "معرف المنتج مطلوب",
    valid_quantity_required: "كمية صالحة مطلوبة",
    cart_is_empty: "السلة فارغة",
    
    // Order messages
    order_placed: "تم تقديم الطلب بنجاح",
    order_retrieved: "تم استرداد تفاصيل الطلب بنجاح",
    orders_retrieved: "تم استرداد تاريخ الطلبات بنجاح",
    order_not_found: "الطلب غير موجود",
    shipping_payment_required: "عنوان الشحن وطريقة الدفع مطلوبان",
    
    // General messages
    server_error: "خطأ في الخادم الداخلي",
    health_check: "واجهة برمجة التطبيقات تعمل بسلاسة"
  }
};

// Get localized message
const getMessage = (key, lang = 'en') => {
  const language = lang.toLowerCase();
  if (messages[language] && messages[language][key]) {
    return messages[language][key];
  }
  // Fallback to English if translation not found
  return messages.en[key] || key;
};

// Create standardized response
const createResponse = (status_code, data = null, messageKey, lang = 'en', customMessage = null) => {
  return {
    status_code,
    data,
    message: customMessage || getMessage(messageKey, lang)
  };
};

module.exports = {
  getMessage,
  createResponse
}; 