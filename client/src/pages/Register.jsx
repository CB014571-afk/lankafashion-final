import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";   // ✅ use the single shared axios client
import "../index.css";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "buyer", // default role
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
    const { name, value, checked, type } = e.target;
    if (name === "customSize" || name === "onDemand" || name === "uploadInspo") {
      setFormData((prev) => ({
        ...prev,
        customizationOptions: { ...prev.customizationOptions, [name]: checked },
      }));
    } else if (
      type === "select-one" ||
      type === "text" ||
      type === "email" ||
      type === "password" ||
      type === "textarea"
    ) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const saveAuth = ({ token, user }) => {
    if (!token || !user) return;
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("name", user.name);
    localStorage.setItem("userId", user._id);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const redirectByRole = (role) => {
    if (role === "seller") navigate("/seller");
    else if (role === "supplier") navigate("/supplier-dashboard");
    else if (role === "driver") navigate("/driver-dashboard");
    else navigate("/buyer-orders");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare payload
    const basePayload = {
      role: formData.role,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
    };

    // For seller and supplier roles, include extra fields
    if (formData.role === "seller" || formData.role === "supplier") {
      basePayload.shopName = formData.shopName.trim();
      basePayload.designType = formData.designType.trim();
      basePayload.customizationOptions = Object.entries(formData.customizationOptions)
        .filter(([_, v]) => v)
        .map(([k]) => k);
      basePayload.description = formData.description.trim();
    }

    console.log("Register payload:", basePayload);

    try {
      // ✅ consistent path with other components
      const reg = await API.post("/api/users/register", basePayload);
      alert("Registered successfully!");

      let { token, user } = reg.data || {};
      if (!token || !user) {
        const login = await API.post("/api/users/login", {
          email: formData.email,
          password: formData.password,
        });
        token = login.data?.token;
        user = login.data?.user;
      }

      saveAuth({ token, user });
      redirectByRole(user?.role || formData.role);
    } catch (err) {
      console.error("Register error:", JSON.stringify(err.response?.data, null, 2));
      alert(`Registration failed: ${err.response?.data?.message || err.message}`);
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
            <option value="supplier">Supplier</option>
            <option value="driver">Driver</option>
          </select>
        </label>

        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </label>

        {(formData.role === "seller" || formData.role === "supplier") && (
          <>
            <label>
              Shop Name:
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
              />
            </label>

            <label>
              Type of Designs:
              <input
                type="text"
                name="designType"
                value={formData.designType}
                onChange={handleChange}
              />
            </label>

            <fieldset style={{ border: "1px solid #ccc", padding: 10 }}>
              <legend>Customization Options</legend>
              <label>
                <input
                  type="checkbox"
                  name="customSize"
                  checked={formData.customizationOptions.customSize}
                  onChange={handleChange}
                />{" "}
                Custom Size
              </label>
              <label>
                <input
                  type="checkbox"
                  name="onDemand"
                  checked={formData.customizationOptions.onDemand}
                  onChange={handleChange}
                />{" "}
                Design on Demand
              </label>
              <label>
                <input
                  type="checkbox"
                  name="uploadInspo"
                  checked={formData.customizationOptions.uploadInspo}
                  onChange={handleChange}
                />{" "}
                Upload Inspirations
              </label>
            </fieldset>

            <label>
              Description/About Your Work:
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </label>
          </>
        )}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
