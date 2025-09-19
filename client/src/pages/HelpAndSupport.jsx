import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";

const HelpAndSupport = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <Card>
          <CardHeader>
            <CardTitle>Get Help</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              This page will contain FAQs, support articles, and contact
              information.
            </p>
            {/* Future content goes here */}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HelpAndSupport;
