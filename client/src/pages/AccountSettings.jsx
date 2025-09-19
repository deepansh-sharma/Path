import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";

const AccountSettings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This is where users will manage account settings like passwords
              and notifications.
            </p>
            {/* Future content goes here */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AccountSettings;
