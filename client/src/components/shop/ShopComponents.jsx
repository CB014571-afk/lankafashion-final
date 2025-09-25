// Reusable components for shop and home pages
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { SHOP_STYLES, HOME_STYLES } from '../../constants/shopConstants';
import { formatPrice, truncateText, getProductImageUrl, calculateAverageRating } from '../../utils/shopUtils';

export const LoadingSpinner = ({ message = "Loading..." }) => (
  <div style={SHOP_STYLES.loadingContainer}>
    <div style={{ 
      display: 'inline-block',
      width: '30px',
      height: '30px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #e2b455',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p>{message}</p>
  </div>
);

export const ErrorMessage = ({ message, onRetry }) => (
  <div style={{ 
    background: '#ffebee', 
    color: '#c62828', 
    padding: '20px', 
    borderRadius: '5px',
    margin: '20px 0',
    textAlign: 'center'
  }}>
    <p>{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        style={{ 
          background: '#c62828', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Try Again
      </button>
    )}
  </div>
);

export const ShopFilters = ({ 
  categories, 
  shopNames, 
  selectedCategory, 
  selectedShop, 
  onCategoryChange, 
  onShopChange,
  onClearFilters 
}) => (
  <div style={SHOP_STYLES.filterContainer}>
    <div style={SHOP_STYLES.filterGroup}>
      <label>Filter by Category:</label>
      <select 
        value={selectedCategory} 
        onChange={onCategoryChange}
        style={SHOP_STYLES.select}
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
    
    <div style={SHOP_STYLES.filterGroup}>
      <label>Filter by Shop:</label>
      <select 
        value={selectedShop} 
        onChange={onShopChange}
        style={SHOP_STYLES.select}
      >
        <option value="">All Shops</option>
        {shopNames.map(shop => (
          <option key={shop} value={shop}>{shop}</option>
        ))}
      </select>
    </div>
    
    {(selectedCategory || selectedShop) && (
      <button 
        onClick={onClearFilters}
        style={{
          padding: '10px 20px',
          background: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          alignSelf: 'flex-end'
        }}
      >
        Clear Filters
      </button>
    )}
  </div>
);

export const ShopInfo = ({ shopInfo }) => (
  <div style={SHOP_STYLES.shopInfo}>
    <h2 style={SHOP_STYLES.sectionTitle}>{shopInfo.shopName}</h2>
    {shopInfo.description && <p>{shopInfo.description}</p>}
    {shopInfo.email && <p><strong>Email:</strong> {shopInfo.email}</p>}
    {shopInfo.contactNumber && <p><strong>Contact:</strong> {shopInfo.contactNumber}</p>}
  </div>
);

export const ProductCard = ({ product, onProductClick, showReviews = false }) => {
  const averageRating = calculateAverageRating(product.reviews || []);
  
  return (
    <div 
      style={SHOP_STYLES.productCard}
      onClick={() => onProductClick(product)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <img 
        src={getProductImageUrl(product)} 
        alt={product.name}
        style={SHOP_STYLES.productImage}
        onError={(e) => {
          e.currentTarget.src = '/placeholder-image.png';
        }}
      />
      <div style={SHOP_STYLES.productContent}>
        <h3 style={SHOP_STYLES.productName}>{product.name}</h3>
        <p style={SHOP_STYLES.productPrice}>{formatPrice(product.price)}</p>
        <p style={SHOP_STYLES.productDescription}>
          {truncateText(product.description, 80)}
        </p>
        
        {showReviews && product.reviews && product.reviews.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '10px' }}>
            <StarRating rating={parseFloat(averageRating)} readOnly />
            <span style={{ fontSize: '14px', color: '#666' }}>
              ({product.reviews.length} reviews)
            </span>
          </div>
        )}
        
        {product.category && (
          <span style={{
            background: '#e2b455',
            color: 'white',
            padding: '3px 8px',
            borderRadius: '10px',
            fontSize: '12px',
            marginTop: '10px',
            display: 'inline-block'
          }}>
            {product.category}
          </span>
        )}
      </div>
    </div>
  );
};

export const ProductGrid = ({ products, onProductClick, emptyMessage = "No products found." }) => {
  if (products.length === 0) {
    return (
      <div style={SHOP_STYLES.emptyState}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={SHOP_STYLES.productGrid}>
      {products.map(product => (
        <ProductCard 
          key={product._id} 
          product={product} 
          onProductClick={onProductClick}
          showReviews={true}
        />
      ))}
    </div>
  );
};

export const StarRating = ({ rating, onRatingChange, readOnly = false, size = 20 }) => {
  const [hover, setHover] = useState(null);

  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={index}
            size={size}
            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
            onClick={() => !readOnly && onRatingChange && onRatingChange(ratingValue)}
            onMouseEnter={() => !readOnly && setHover(ratingValue)}
            onMouseLeave={() => !readOnly && setHover(null)}
          />
        );
      })}
    </div>
  );
};

export const BestSellersSection = ({ bestSellers, onProductClick }) => {
  if (bestSellers.length === 0) return null;

  return (
    <div style={SHOP_STYLES.bestSellersSection}>
      <h2 style={SHOP_STYLES.sectionTitle}>🔥 Best Sellers</h2>
      <ProductGrid 
        products={bestSellers} 
        onProductClick={onProductClick}
        emptyMessage="No best sellers available."
      />
    </div>
  );
};

// Home page specific components
export const HeroSection = () => (
  <section style={HOME_STYLES.hero}>
    <h1 style={HOME_STYLES.title}>Welcome to LankaFashion</h1>
    <p style={HOME_STYLES.subtitle}>Empowering Sri Lankan Style - Shop Local. Shop Unique.</p>
    <Link to="/shop">
      <button 
        style={HOME_STYLES.ctaButton}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        🛍️ Start Shopping
      </button>
    </Link>
  </section>
);

export const FeaturesSection = () => (
  <section style={HOME_STYLES.features}>
    <h2 style={HOME_STYLES.sectionTitle}>Why Shop With Us?</h2>
    <div style={HOME_STYLES.featureGrid}>
      <div 
        style={HOME_STYLES.featureCard}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <h3 style={HOME_STYLES.featureTitle}>🌟 Unique Products</h3>
        <p style={HOME_STYLES.featureText}>Support local artisans & discover one-of-a-kind items.</p>
      </div>
      <div 
        style={HOME_STYLES.featureCard}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <h3 style={HOME_STYLES.featureTitle}>🚚 Islandwide Delivery</h3>
        <p style={HOME_STYLES.featureText}>Fast and reliable shipping all across Sri Lanka.</p>
      </div>
      <div 
        style={HOME_STYLES.featureCard}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <h3 style={HOME_STYLES.featureTitle}>💬 Friendly Support</h3>
        <p style={HOME_STYLES.featureText}>We're always here to help with your shopping needs.</p>
      </div>
    </div>
  </section>
);

export const CategoriesSection = () => (
  <section style={HOME_STYLES.categorySection}>
    <h2 style={HOME_STYLES.sectionTitle}>Popular Categories</h2>
    <div style={HOME_STYLES.categoryGrid}>
      {['👗 Sarees', '💍 Jewelry', '👚 Casual Wear', '🧵 Custom Orders'].map((category, index) => (
        <div 
          key={index}
          style={HOME_STYLES.categoryBox}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e2b455';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fef7f0';
            e.currentTarget.style.color = '#e2b455';
          }}
        >
          {category}
        </div>
      ))}
    </div>
  </section>
);