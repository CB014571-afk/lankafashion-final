import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={styles.wrapper}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Welcome to LankaFashion</h1>
        <p style={styles.subtitle}>Empowering Sri Lankan Style - Shop Local. Shop Unique.</p>
        <Link to="/shop">
          <button style={styles.ctaButton}>🛍️ Start Shopping</button>
        </Link>
      </section>

      {/* Why Choose Us Section */}
      <section style={styles.features}>
        <h2 style={styles.sectionTitle}>Why Shop With Us?</h2>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>🌟 Unique Products</h3>
            <p style={styles.featureText}>Support local artisans & discover one-of-a-kind items.</p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>🚚 Islandwide Delivery</h3>
            <p style={styles.featureText}>Fast and reliable shipping all across Sri Lanka.</p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>💬 Friendly Support</h3>
            <p style={styles.featureText}>We’re always here to help with your shopping needs.</p>
          </div>
        </div>
      </section>

      {/* Category Tease */}
      <section style={styles.categorySection}>
        <h2 style={styles.sectionTitle}>Popular Categories</h2>
        <div style={styles.categoryGrid}>
          <div style={styles.categoryBox}>👗 Sarees</div>
          <div style={styles.categoryBox}>💍 Jewelry</div>
          <div style={styles.categoryBox}>👚 Casual Wear</div>
          <div style={styles.categoryBox}>🧵 Custom Orders</div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  wrapper: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#fffdfa", // lighter background
    paddingBottom: "40px",
  },
  hero: {
    backgroundColor: "#fffefa", // lighter than #ffe8cc
    textAlign: "center",
    padding: "60px 20px",
  },
  title: {
    fontSize: "2.8rem",
    fontWeight: "bold",
    color: "#cc6600",
  },
  subtitle: {
    fontSize: "1.2rem",
    color: "#333",
    marginTop: "10px",
  },
  ctaButton: {
    marginTop: "25px",
    backgroundColor: "#ff9933",
    color: "white",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
  },
  features: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "#fff9f0", // lighter peach
  },
  sectionTitle: {
    fontSize: "1.8rem",
    color: "#cc6600",
    marginBottom: "20px",
  },
  featureGrid: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "20px",
  },
  featureCard: {
    width: "280px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  featureTitle: {
    color: "#cc6600",
    fontSize: "1.2rem",
    marginBottom: "8px",
  },
  featureText: {
    color: "#555",
    fontSize: "0.95rem",
  },
  categorySection: {
    textAlign: "center",
    padding: "30px 20px",
    backgroundColor: "#fffefa", 
  },
  categoryGrid: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginTop: "15px",
  },
  categoryBox: {
    backgroundColor: "#fff4eb",
    color: "#cc6600",
    padding: "15px 25px",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "15px",
    border: "1px solid #ffd8a8",
  },
};
