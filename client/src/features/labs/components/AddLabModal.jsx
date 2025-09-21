import React, { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { toast } from "../../../components/ui/Toast";
import api from "../../../utils/axios";

const AddLabModal = ({ setShowModal, fetchLabs }) => {
  const [labName, setLabName] = useState("");
  const [labEmail, setLabEmail] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/super-admin/labs", {
        name: labName,
        email: labEmail,
        ownerName,
        password,
      });
      toast.success("Lab added successfully!");
      fetchLabs(); // Refresh the labs list
      setShowModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add lab.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Add New Lab</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Lab Name"
            value={labName}
            onChange={(e) => setLabName(e.target.value)}
            placeholder="Enter lab name"
            required
          />
          <Input
            label="Lab Email"
            type="email"
            value={labEmail}
            onChange={(e) => setLabEmail(e.target.value)}
            placeholder="Enter lab email"
            required
          />
          <Input
            label="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Enter owner's name"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            required
          />
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Lab"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLabModal;
