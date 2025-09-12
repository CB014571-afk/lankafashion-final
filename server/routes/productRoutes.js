
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, requireRole } = require("../middleware");

// Delete a review from a product (only by the review's owner)
router.delete("/:productId/reviews/:reviewId", auth, async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Debug log
    console.log('Attempting to delete review:', {
      reviewId,
      reviewUser: review.user,
      currentUser: req.user._id
    });
    // Allow delete if review.user is missing, or matches current user (string/ObjectId)
    const reviewUser = review.user ? review.user.toString() : null;
    const currentUser = req.user._id.toString();
    if (reviewUser && reviewUser !== currentUser) {
      return res.status(403).json({ message: `Not authorized to delete this review. reviewUser: ${reviewUser}, currentUser: ${currentUser}` });
    }

  product.reviews.pull({ _id: reviewId });
  await product.save();
  res.json({ message: "Review deleted" });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all reviews for all products

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort("-createdAt").populate({
      path: "seller",
      select: "_id shopName"
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/mine", auth, requireRole("seller"), async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort("-createdAt");
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", auth, requireRole("seller"), async (req, res) => {
  try {
    const { name, description, price, category, shopName, images } = req.body;
    const finalShopName = shopName || req.user.shopName;

    const product = await Product.create({
      seller: req.user._id,
      shopName: finalShopName,
      name,
      description,
      price,
      category,
      images: Array.isArray(images) ? images : [],
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id([0-9a-fA-F]{24})", auth, requireRole("seller"), async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, shopName } = req.query;
    const query = {};

    if (keyword) query.name = { $regex: keyword, $options: "i" };
    if (category) query.category = category;
    if (shopName) query.shopName = shopName;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query).sort("-createdAt").populate({
      path: "seller",
      select: "_id shopName"
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/meta", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const shopNames = await Product.distinct("shopName");
    res.json({ categories, shopNames });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


//product review one

router.post("/:id/reviews", auth, async (req, res) => {
  const { rating, text } = req.body;

  const product = await Product.findById(req.params.id);

  // Check if product exists and reviews is an array
  if (!product || !Array.isArray(product.reviews)) {
    return res.status(404).json({ message: "Product not found or reviews missing" });
  }


  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    text,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.averageRating =
    product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

  await product.save();
  // Return the new review with user info for immediate frontend display
  const newReview = product.reviews[product.reviews.length - 1];
  res.status(201).json({
    ...newReview.toObject(),
    userName: req.user.name,
    userId: req.user._id,
    productId: product._id
  });
});

// Get all reviews for all products (or filter by product if you want)
router.get("/reviews", async (req, res) => {
  try {
    // Populate user name for each review
    const products = await Product.find({}, "reviews").populate("reviews.user", "name");
    const allReviews = [];
    products.forEach(product => {
      if (Array.isArray(product.reviews)) {
        product.reviews.forEach(r => {
          const reviewObj = r.toObject();
          allReviews.push({
            ...reviewObj,
            userName: reviewObj.user && reviewObj.user.name ? reviewObj.user.name : reviewObj.user,
            userId: reviewObj.user && reviewObj.user._id ? reviewObj.user._id.toString() : (typeof reviewObj.user === 'string' ? reviewObj.user : undefined),
            productId: product._id
          });
        });
      }
    });
    res.json(allReviews);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
