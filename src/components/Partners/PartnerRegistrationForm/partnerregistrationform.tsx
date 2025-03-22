"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { PartnerFormData } from "@/types";

interface PartnerFormProps {
  isEdit?: boolean;
  initialData: PartnerFormData; 
  closeForm: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ isEdit = false, initialData , closeForm }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    areas: [""],
    shift: { start: "", end: "" },
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

 
  useEffect(() => {
    if (isEdit && initialData) {
      setFormData(initialData);
    }
  }, [isEdit, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("shift.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        shift: { ...prev.shift, [field]: value },
      }));
    } else if (name === "status") {
      setFormData((prev) => ({ ...prev, status: value.toLowerCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAreaChange = (index: number, value: string) => {
    const updatedAreas = [...formData.areas];
    updatedAreas[index] = value;
    setFormData((prev) => ({ ...prev, areas: updatedAreas }));
  };

  const addAreaField = () => {
    setFormData((prev) => ({ ...prev, areas: [...prev.areas, ""] }));
  };

  const removeAreaField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      areas: prev.areas.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isEdit) {
        
        await axios.put(`/api/partners/${initialData._id}`, formData);
        setSuccess("Partner updated successfully!");
      } else {
      
        await axios.post("/api/partners", formData);
        setSuccess("Partner registered successfully!");
      
        setFormData({
          name: "",
          phone: "",
          email: "",
          areas: [""],
          shift: { start: "", end: "" },
          status: "active",
        });
      }
      closeForm();
    } catch (err) {
      console.log(err);
      setError("Failed to submit. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">
          {isEdit ? "Edit Partner" : "Register a Partner"}
        </h2>
        <button
          className="text-white px-4 py-1 bg-red-500 rounded-md hover:bg-red-600"
          onClick={closeForm}
        >
          Close
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Partner Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
        />

        {/* Areas Input */}
        <div>
          <label className="block text-gray-200 mb-1">Service Areas</label>
          {formData.areas.map((area, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder={`Area ${index + 1}`}
                value={area}
                onChange={(e) => handleAreaChange(index, e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
                required
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeAreaField(index)}
                  className="px-3 py-2 text-red-400 border border-red-400 rounded-lg hover:bg-red-500 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addAreaField}
            className="w-full mt-2 text-blue-400 border border-blue-400 rounded-lg py-2 hover:bg-blue-500 hover:text-white"
          >
            + Add Area
          </button>
        </div>

        {/* Status Dropdown */}
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Shift Timing Inputs */}
        <input
          type="text"
          name="shift.start"
          placeholder="Shift Start"
          value={formData.shift.start}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          name="shift.end"
          placeholder="Shift End"
          value={formData.shift.end}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-400"
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-500"
        >
          {isEdit ? (loading ? "Saving..." : "Save") : (loading ? "Registering..." : "Register Partner")}
        </button>
      </form>
    </div>
  );
};

export default PartnerForm;
