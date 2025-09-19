import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";

const ProfileSettings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This is where users will be able to manage their profile
              information.
            </p>
            {/* Future content goes here */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
