// Stub for PDF generation; integrate real service later
export async function generatePdfPlaceholder({ type, data }) {
  // In production, generate real PDF and upload to S3/Cloudinary
  return `https://placeholder.local/${type}/${Date.now()}.pdf`;
}
