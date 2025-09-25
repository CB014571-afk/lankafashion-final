// Constants for shop and home pages
export const SHOP_STYLES = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#e2b455"
  },
  filterContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap"
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  select: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "20px"
  },
  productCard: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s",
    cursor: "pointer"
  },
  productImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover"
  },
  productContent: {
    padding: "15px"
  },
  productName: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#333"
  },
  productPrice: {
    fontSize: "16px",
    color: "#e2b455",
    fontWeight: "bold",
    marginBottom: "10px"
  },
  productDescription: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px"
  },
  shopInfo: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px"
  },
  bestSellersSection: {
    marginBottom: "30px"
  },
  sectionTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "50px"
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    color: "#666"
  }
};

export const HOME_STYLES = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#fef7f0"
  },
  hero: {
    textAlign: "center",
    padding: "80px 20px",
    background: "linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)",
    color: "#333"
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "20px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
  },
  subtitle: {
    fontSize: "1.2rem",
    marginBottom: "40px",
    opacity: 0.9
  },
  ctaButton: {
    padding: "15px 30px",
    fontSize: "1.1rem",
    backgroundColor: "#e2b455",
    color: "white",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    transition: "transform 0.2s"
  },
  features: {
    padding: "60px 20px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "2.5rem",
    marginBottom: "40px",
    color: "#333"
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "30px",
    marginTop: "40px"
  },
  featureCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    transition: "transform 0.3s"
  },
  featureTitle: {
    fontSize: "1.3rem",
    marginBottom: "15px",
    color: "#e2b455"
  },
  featureText: {
    color: "#666",
    lineHeight: "1.6"
  },
  categorySection: {
    padding: "60px 20px",
    backgroundColor: "white"
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    maxWidth: "800px",
    margin: "0 auto"
  },
  categoryBox: {
    padding: "30px",
    backgroundColor: "#fef7f0",
    borderRadius: "10px",
    textAlign: "center",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#e2b455",
    border: "2px solid #e2b455",
    cursor: "pointer",
    transition: "all 0.3s"
  }
};

export const PRODUCT_CATEGORIES = [
  'Sarees',
  'Jewelry',
  'Casual Wear',
  'Traditional Wear',
  'Accessories',
  'Custom Orders'
];

export const FILTER_OPTIONS = {
  ALL: '',
  CATEGORY: 'category',
  SHOP: 'shop'
};