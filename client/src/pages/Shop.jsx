import React, { useState, useEffect, useMemo } from "react";
import API from "../services/api";
import AddToCartModal from "../components/AddToCartModal";
import "./Shop.css";
import { FaStar } from "react-icons/fa";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [shopName, setShopName] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [shopNames, setShopNames] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [visibleReviewProductId, setVisibleReviewProductId] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [expandedReviews, setExpandedReviews] = useState({});

  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem("username") || "Current User";

  const fetchProducts = async () => {
    try {
      setLoading(true);
      if (shopName) {
        try {
          const res = await API.get(`/api/shops/${encodeURIComponent(shopName.trim())}`);
          setProducts(res.data.products || []);
          setShopInfo({
            shopName: res.data.shopName,
            description: res.data.description || "",
            email: res.data.email || "",
            contactNumber: res.data.contactNumber || "",
          });
        } catch (err) {
          if (err.response?.status === 404) {
            setProducts([]);
            setShopInfo(null);
          }
          throw err;
        }
      } else {
        try {
          const query = [];
          if (category) query.push(`category=${encodeURIComponent(category)}`);
          const url = query.length > 0 ? `/api/products?${query.join('&')}` : '/api/products';
          const res = await API.get(url);
          setProducts(res.data);
          setShopInfo(null);
        } catch (err) {
          setProducts([]);
          setShopInfo(null);
          throw err;
        }
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
      setShopInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndShops = async () => {
    try {
      const res = await API.get("/api/products/meta");
      setCategories(res.data.categories || []);
      setShopNames(res.data.shopNames || []);
    } catch (err) {
      console.error("Error fetching categories and shops:", err);
      setCategories([]);
      setShopNames([]);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const res = await API.get('/api/seller/best-seller');
      console.log('Best seller API response:', res.data);
      setBestSellers([res.data]);
    } catch (err) {
      console.error("Error fetching best sellers:", err);
      if (err.response?.status === 404) {
        console.log("No best seller found - this is normal for empty database");
      }
      setBestSellers([]);
    }
  };

  const fetchRecentlyViewed = async () => {
    if (!token) {
      return;
    }
    try {
      const res = await API.get('/api/users/recently-viewed', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Extract the product IDs from the response
      const viewedProducts = res.data.recentlyViewed || [];
      setRecentlyViewed(viewedProducts.map(product => product._id));
    } catch (err) {
      console.error("Error fetching recently viewed:", err);
      setRecentlyViewed([]);
    }
  };

  // Fetch reviews for all products
  const fetchAllReviews = async () => {
    try {
      const res = await API.get("/api/products/reviews");
      setReviews(res.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, shopName]);

  useEffect(() => {
    fetchCategoriesAndShops();
    fetchAllReviews();
    fetchBestSellers(); // Call this independently of products
    fetchRecentlyViewed();
  }, []);

  // Update recently viewed when products change
  useEffect(() => {
    if (products && products.length > 0 && token) {
      fetchRecentlyViewed();
    }
  }, [products, token]);

  // Add review to backend
  const handleSubmit = async (e, productId) => {
    e.preventDefault();
    if (!rating || !reviewText.trim()) {
      alert("Please add a rating and comment");
      return;
    }
    try {
      const res = await API.post(
        `/api/products/${productId}/reviews`,
        { rating, text: reviewText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews([res.data, ...reviews]);
      setRating(0);
      setReviewText("");
      setVisibleReviewProductId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting review");
    }
  };

  // Delete review from backend
  const handleDeleteReview = async (reviewId) => {
    try {
      // Find the productId for this review
      const review = reviews.find((r) => r._id === reviewId);
      if (!review) return alert("Review not found");
      const productId = review.productId;
      await API.delete(`/api/products/${productId}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  // Function to handle product view
  const handleViewProduct = async (product) => {
    setSelectedProduct(product);
    if (!token) return;
    try {
      await API.post('/api/users/recently-viewed', { productId: product._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecentlyViewed();
    } catch (err) {
      // ignore error
    }
  };

  // Sort products: most recently viewed first
  const sortedProducts = useMemo(() => {
    const recentlyViewedArray = Array.isArray(recentlyViewed) ? recentlyViewed : [];
    const productsArray = Array.isArray(products) ? products : [];
    
    return [
      ...recentlyViewedArray
        .map(id => productsArray.find(p => p._id === id))
        .filter(Boolean),
      ...productsArray.filter(p => !recentlyViewedArray.includes(p._id))
    ];
  }, [recentlyViewed, products]);

  return (
    <div className="shop-container">
      <h2 className="shop-title">🛍️ Browse Products</h2>

      <div className="filter-bar">
        <select
          value={shopName}
          onChange={(e) => {
            setShopName(e.target.value.trim());
            // Do not setCategory here to avoid triggering both useEffects
          }}
        >
          <option value="">All Shops</option>
          {shopNames.map((name, i) => (
            <option key={i} value={name.trim()}>
              {name.trim()}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            // Do not setShopName here to avoid triggering both useEffects
          }}
        >
          <option value="">All Categories</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setCategory("");
            setShopName("");
            setShopInfo(null);
            // Do not call fetchProducts directly; useEffect will handle it
          }}
        >
          Reset
        </button>
      </div>

      {shopInfo && (
        <div className="shop-description">
          <h3>{shopInfo.shopName}</h3>
          <p>{shopInfo.description}</p>
          {shopInfo.email && (
            <p>
              <strong>Email:</strong> {shopInfo.email}
            </p>
          )}
          {shopInfo.contactNumber && (
            <p>
              <strong>Contact:</strong> {shopInfo.contactNumber}
            </p>
          )}
        </div>
      )}

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="product-grid">
          {sortedProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            sortedProducts.map((product, idx) => (
              <div key={product._id} className="product-card">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="product-image"
                  />
                )}
                {(() => {
                  // Show bestseller badge if seller matches the best seller
                  const shouldShowBestSeller = bestSellers.length > 0 && 
                    bestSellers[0]._id && 
                    (bestSellers[0]._id.toString() === (product.seller?._id || product.seller)?.toString());
                  
                  // Debug logging
                  if (bestSellers.length > 0 && idx === 0) {
                    console.log('Best seller check:', {
                      bestSellerId: bestSellers[0]._id,
                      productSellerId: product.seller?._id || product.seller,
                      shouldShow: shouldShowBestSeller,
                      productName: product.name
                    });
                  }
                  
                  return shouldShowBestSeller && (
                      <div className="best-seller-badge">⭐ TOP SELLER ⭐</div>
                    );
                })()}
                {recentlyViewed.includes(product._id) && idx === 0 && (
                  <div className="recently-viewed-label" style={{ background: '#fff700', color: '#333', fontWeight: 'bold', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '6px' }}>
                    Recently Viewed
                  </div>
                )}
                <h3 className="product-title">{product.name}</h3>
                <p><strong>Rs:</strong> {product.price}</p>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Shop:</strong> {product.shopName || "Unknown"}</p>
                <p className="desc">{product.description}</p>

                <div className="btn-wrapper">
                  <button className="cart-btn" onClick={() => handleViewProduct(product)}>
                    🛒 Add to Cart
                  </button>
                  <button
                    className="review-btn"
                    onClick={() =>
                      setVisibleReviewProductId(
                        visibleReviewProductId === product._id ? null : product._id
                      )
                    }
                  >
                    ⭐ Rate & Review
                  </button>
                </div>

                {visibleReviewProductId === product._id && (
                  <div className="review-section">
                    <div className="star-rating">
                      {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                          <label key={starValue}>
                            <input
                              type="radio"
                              name="rating"
                              value={starValue}
                              onClick={() => setRating(starValue)}
                            />
                            <FaStar
                              className="star"
                              color={starValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                              onMouseEnter={() => setHover(starValue)}
                              onMouseLeave={() => setHover(null)}
                            />
                          </label>
                        );
                      })}
                    </div>

                    <textarea
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />

                    <button onClick={(e) => handleSubmit(e, product._id)}>Submit Review</button>

                    {/* Reviews List */}
                    {(() => {
                      const productReviews = reviews.filter((r) => r.productId === product._id);
                      const showAll = expandedReviews[product._id];
                      const reviewsToShow = showAll ? productReviews : productReviews.slice(0, 2);

                      return (
                        <div className="review-list">
                          {reviewsToShow.length === 0 && <div>No reviews yet.</div>}
                          {reviewsToShow.map((r) => (
                            <div key={r._id} className="latest-review">
                              <strong>{r.userName || r.user}</strong> rated {r.rating}⭐
                              <p>{r.text}</p>
                              {/* Debug info for troubleshooting */}
                              <div style={{fontSize: '10px', color: '#888'}}>
                                (review.userId: {r.userId}, my userId: {localStorage.getItem('userId')})
                              </div>
                              {/* Show delete button for current user's reviews */}
                              {(r.userId === localStorage.getItem('userId') || r.user === localStorage.getItem('userId')) && (
                                <button
                                  className="delete-review-btn"
                                  onClick={() => handleDeleteReview(r._id)}
                                  style={{ color: "red", marginLeft: 8, cursor: "pointer" }}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ))}
                          {productReviews.length > 2 && !showAll && (
                            <button
                              className="show-more-btn"
                              onClick={() =>
                                setExpandedReviews((prev) => ({
                                  ...prev,
                                  [product._id]: true,
                                }))
                              }
                              style={{ marginTop: 6 }}
                            >
                              Show more reviews
                            </button>
                          )}
                          {showAll && productReviews.length > 2 && (
                            <button
                              className="show-less-btn"
                              onClick={() =>
                                setExpandedReviews((prev) => ({
                                  ...prev,
                                  [product._id]: false,
                                }))
                              }
                              style={{ marginTop: 6 }}
                            >
                              Show less
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {selectedProduct && (
        <AddToCartModal
          product={{
            name: selectedProduct.name,
            image: selectedProduct.images?.[0],
            shopName: selectedProduct.shopName,
            price: selectedProduct.price,
            _id: selectedProduct._id,
            sellerId: selectedProduct.seller?._id || selectedProduct.seller,
          }}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}