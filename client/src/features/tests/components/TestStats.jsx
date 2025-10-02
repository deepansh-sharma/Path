import React from "react";
import { Card } from "../../../components/ui/Card";
import { FiActivity, FiUsers, FiDollarSign, FiTrendingUp } from "react-icons/fi";

const TestStats = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: "Total Tests",
      value: "156",
      change: "+12%",
      changeType: "positive",
      icon: FiActivity,
      color: "bg-blue-500"
    },
    {
      title: "Active Tests",
      value: "142",
      change: "+8%",
      changeType: "positive",
      icon: FiTrendingUp,
      color: "bg-green-500"
    },
    {
      title: "Test Categories",
      value: "24",
      change: "+2",
      changeType: "positive",
      icon: FiUsers,
      color: "bg-purple-500"
    },
    {
      title: "Avg. Test Price",
      value: "$45.50",
      change: "+5.2%",
      changeType: "positive",
      icon: FiDollarSign,
      color: "bg-yellow-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              <p className={`text-sm mt-1 ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change} from last month
              </p>
            </div>
            <div className={`p-3 rounded-full ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TestStats;