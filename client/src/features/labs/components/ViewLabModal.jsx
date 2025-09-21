import React from "react";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-md text-gray-900">{value || "N/A"}</p>
  </div>
);

const ViewLabModal = ({ lab, setShowModal }) => {
  if (!lab) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{lab.name}</h2>
          <Badge variant={lab.isActive ? "success" : "destructive"}>
            {lab.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Owner" value={lab.ownerName} />
          <DetailItem label="Email" value={lab.email} />
          <DetailItem label="Contact" value={lab.contact} />
          <DetailItem
            label="Location"
            value={`${lab.address?.city}, ${lab.address?.state}`}
          />
          <DetailItem
            label="Subscription Plan"
            value={lab.subscription?.plan}
          />
          <DetailItem
            label="Total Revenue"
            value={`₹${(lab.analytics?.totalRevenue || 0).toLocaleString()}`}
          />
          <DetailItem
            label="Total Patients"
            value={lab.analytics?.totalPatients || 0}
          />
          <DetailItem
            label="Last Active"
            value={new Date(lab.updatedAt).toLocaleString()}
          />
        </div>

        <div className="flex justify-end mt-8">
          <Button variant="outline" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewLabModal;
