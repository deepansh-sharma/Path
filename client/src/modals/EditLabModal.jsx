import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { toast } from "../components/ui/Toast";
import api from "../lib/axios";

const EditLabModal = ({ lab, setShowModal, fetchLabs }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ownerName: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lab) {
      setFormData({
        name: lab.name || "",
        email: lab.email || "",
        ownerName: lab.ownerName || "",
        contact: lab.contact || "",
      });
    }
  }, [lab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/super-admin/labs/${lab._id}`, formData);
      toast.success("Lab updated successfully!");
      fetchLabs();
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update lab.");
    } finally {
      setLoading(false);
    }
  };

  if (!lab) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Edit {lab.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Lab Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Lab Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Owner Name"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />
          <Input
            label="Contact Number"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
          />
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLabModal;
