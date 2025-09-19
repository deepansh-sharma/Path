import Lab from "../models/Lab.js";
import pkg from "json2csv";
const { Parser } = pkg;

/**
 * @desc    Export all labs as a CSV file
 * @route   GET /api/export/labs
 * @access  Private (SuperAdmin)
 */
export const exportLabsAsCSV = async (req, res) => {
  try {
    // Fetch all lab data from the database
    const labs = await Lab.find({}).lean();

    if (!labs || labs.length === 0) {
      return res.status(404).json({ message: "No labs found to export." });
    }

    // Define the columns for your CSV report
    const fields = [
      { label: "Lab Name", value: "name" },
      { label: "Email", value: "email" },
      { label: "Owner", value: "ownerName" },
      {
        label: "Status",
        value: (row) => (row.isActive ? "Active" : "Inactive"),
      },
      { label: "Subscription", value: "subscription.plan" },
      { label: "Total Revenue", value: "analytics.totalRevenue" },
      { label: "Total Patients", value: "analytics.totalPatients" },
      { label: "City", value: "address.city" },
      { label: "Date Joined", value: "createdAt" },
    ];

    // This line should now work correctly
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(labs);

    res.header("Content-Type", "text/csv");
    res.attachment("labs-report.csv");
    return res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting labs:", error);
    return res
      .status(500)
      .json({ message: "Server error during file export." });
  }
};
