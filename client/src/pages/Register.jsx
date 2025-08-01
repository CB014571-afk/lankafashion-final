import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css"; // styling in common file

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: "buyer",
    name: "",
    email: "",
    password: "",
    shopName: "",
    designType: "",
    customizationOptions: {
      customSize: false,
      onDemand: false,
      uploadInspo: false,
    },
    description: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (
      name === "customSize" ||
      name === "onDemand" ||
      name === "uploadInspo"
    ) {
      setFormData((prev) => ({
        ...prev,
        customizationOptions: {
          ...prev.customizationOptions,
          [name]: checked,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      customizationOptions: Object.entries(formData.customizationOptions)
        .filter(([_, value]) => value)
        .map(([key]) => key),
    };

    try {
      const res = await axios.post("http://localhost:5000/api/users/register", payload);
      alert("Registered successfully!");
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Role:
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </label>

        <label>Name:
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>Email:
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label>Password:
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>

        {formData.role === "seller" && (
          <>
            <label>Shop Name:
              <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} />
            </label>

            <label>Type of Designs:
              <input type="text" name="designType" value={formData.designType} onChange={handleChange} />
            </label>

            <fieldset style={{ border: "1px solid #ccc", padding: "10px" }}>
              <legend>Customization Options</legend>
              <label><input type="checkbox" name="customSize" checked={formData.customizationOptions.customSize} onChange={handleChange} /> Custom Size</label>
              <label><input type="checkbox" name="onDemand" checked={formData.customizationOptions.onDemand} onChange={handleChange} /> Design on Demand</label>
              <label><input type="checkbox" name="uploadInspo" checked={formData.customizationOptions.uploadInspo} onChange={handleChange} /> Upload Inspirations</label>
            </fieldset>

            <label>Description/About Your Work:
              <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
            </label>
          </>
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
