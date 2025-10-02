import React from "react";
import { motion } from "framer-motion";
import { 
  FiEdit3, FiTrash2, FiCopy, FiEye, FiCheckCircle, FiXCircle, 
  FiClock, FiDollarSign, FiUsers, FiActivity, FiMoreVertical
} from "react-icons/fi";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Checkbox } from "../../../components/ui/Checkbox";
import Tooltip from "../../../components/ui/Tooltip";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { Pagination } from "../../../components/ui/Pagination";

const TestTable = ({
  tests,
  selectedTests,
  onSelectAll,
  onSelectTest,
  onEdit,
  onView,
  onDelete,
  onClone,
  onToggleStatus,
  viewMode = "table",
  totalPages,
  currentPage,
  onPageChange
}) => {
  const isAllSelected = tests.length > 0 && selectedTests.length === tests.length;
  const isIndeterminate = selectedTests.length > 0 && selectedTests.length < tests.length;

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { variant: "success", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      draft: { variant: "warning", label: "Draft" },
      pending_approval: { variant: "info", label: "Pending" },
      deprecated: { variant: "destructive", label: "Deprecated" }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      "single test": { variant: "outline", label: "Single" },
      "package": { variant: "info", label: "Package" },
      "panel": { variant: "success", label: "Panel" },
      "outsourced test": { variant: "warning", label: "Outsourced" },
      "profile": { variant: "secondary", label: "Profile" }
    };

    const config = categoryConfig[category] || categoryConfig["single test"];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatTurnaroundTime = (tat) => {
    if (!tat?.routine) return "N/A";
    return `${tat.routine.duration} ${tat.routine.unit}`;
  };

  const getActionMenuItems = (test) => [
    {
      label: "View Details",
      icon: FiEye,
      onClick: () => onView(test)
    },
    {
      label: "Edit Test",
      icon: FiEdit3,
      onClick: () => onEdit(test)
    },
    {
      label: "Clone Test",
      icon: FiCopy,
      onClick: () => onClone(test)
    },
    {
      label: test.status === "active" ? "Deactivate" : "Activate",
      icon: test.status === "active" ? FiXCircle : FiCheckCircle,
      onClick: () => onToggleStatus(test)
    },
    {
      label: "Delete Test",
      icon: FiTrash2,
      onClick: () => onDelete(test),
      className: "text-red-600 hover:text-red-700"
    }
  ];

  if (viewMode === "grid") {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tests.map((test) => (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <Checkbox
                  checked={selectedTests.includes(test._id)}
                  onChange={(checked) => onSelectTest(test._id, checked)}
                />
                <DropdownMenu
                  trigger={
                    <Button variant="ghost" size="sm">
                      <FiMoreVertical className="w-4 h-4" />
                    </Button>
                  }
                  items={getActionMenuItems(test)}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 truncate" title={test.name}>
                    {test.name}
                  </h3>
                  <p className="text-sm text-gray-500">{test.code}</p>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(test.status)}
                  {getCategoryBadge(test.category)}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FiActivity className="w-3 h-3" />
                    <span>{test.department}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiDollarSign className="w-3 h-3" />
                    <span>{formatPrice(test.pricing?.basePrice || 0)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiClock className="w-3 h-3" />
                    <span>{formatTurnaroundTime(test.turnaroundTime)}</span>
                  </div>
                </div>

                {test.parameters?.length > 0 && (
                  <div className="text-xs text-gray-500">
                    {test.parameters.length} parameter{test.parameters.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div className="p-6">
        <div className="space-y-2">
          {tests.map((test) => (
            <motion.div
              key={test._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedTests.includes(test._id)}
                  onChange={(checked) => onSelectTest(test._id, checked)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{test.name}</span>
                    <span className="text-sm text-gray-500">({test.code})</span>
                    {getStatusBadge(test.status)}
                    {getCategoryBadge(test.category)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                    <span>{test.department}</span>
                    <span>{formatPrice(test.pricing?.basePrice || 0)}</span>
                    <span>{formatTurnaroundTime(test.turnaroundTime)}</span>
                  </div>
                </div>
              </div>

              <DropdownMenu
                trigger={
                  <Button variant="ghost" size="sm">
                    <FiMoreVertical className="w-4 h-4" />
                  </Button>
                }
                items={getActionMenuItems(test)}
              />
            </motion.div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    );
  }

  // Default table view
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={onSelectAll}
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Test Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category & Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pricing
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Turnaround Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Parameters
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tests.map((test, index) => (
            <motion.tr
              key={test._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4">
                <Checkbox
                  checked={selectedTests.includes(test._id)}
                  onChange={(checked) => onSelectTest(test._id, checked)}
                />
              </td>

              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">{test.name}</div>
                  <div className="text-sm text-gray-500">{test.code}</div>
                  {test.description && (
                    <div className="text-xs text-gray-400 truncate max-w-xs" title={test.description}>
                      {test.description}
                    </div>
                  )}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="space-y-2">
                  {getCategoryBadge(test.category)}
                  <div className="text-sm text-gray-600 capitalize">
                    {test.department}
                  </div>
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="font-medium text-gray-900">
                    {formatPrice(test.pricing?.basePrice || 0)}
                  </div>
                  {test.pricing?.discountPrice && (
                    <div className="text-sm text-green-600">
                      Discount: {formatPrice(test.pricing.discountPrice)}
                    </div>
                  )}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-900">
                    {formatTurnaroundTime(test.turnaroundTime)}
                  </div>
                  {test.turnaroundTime?.urgent && (
                    <div className="text-xs text-orange-600">
                      Urgent: {test.turnaroundTime.urgent.duration} {test.turnaroundTime.urgent.unit}
                    </div>
                  )}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <FiActivity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {test.parameters?.length || 0}
                  </span>
                </div>
              </td>

              <td className="px-6 py-4">
                {getStatusBadge(test.status)}
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Tooltip content="View Details">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(test)}
                    >
                      <FiEye className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <Tooltip content="Edit Test">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(test)}
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </Button>
                  </Tooltip>

                  <DropdownMenu
                    trigger={
                      <Button variant="ghost" size="sm">
                        <FiMoreVertical className="w-4 h-4" />
                      </Button>
                    }
                    items={getActionMenuItems(test)}
                  />
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {tests.length === 0 && (
        <div className="text-center py-12">
          <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
          <p className="text-gray-600">
            Get started by creating your first test or adjusting your filters.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default TestTable;