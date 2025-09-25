import React from "react";
import { HOME_STYLES } from "../constants/shopConstants";
import { 
  HeroSection, 
  FeaturesSection, 
  CategoriesSection 
} from "../components/shop/ShopComponents";

export default function Home() {
  return (
    <div style={HOME_STYLES.wrapper}>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
    </div>
  );
}