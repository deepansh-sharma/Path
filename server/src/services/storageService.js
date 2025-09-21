import AWS from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

// Configure AWS S3
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_S3_BUCKET_NAME;

class StorageService {
  // Upload file to S3
  async uploadFile(file, folder = "uploads") {
    try {
      const key = `${folder}/${Date.now()}-${file.originalname}`;

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "private", // Files are private by default
      };

      const result = await s3.upload(params).promise();

      return {
        success: true,
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket,
      };
    } catch (error) {
      console.error("File upload failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload PDF report
  async uploadReport(pdfBuffer, patientId, reportId) {
    try {
      const key = `reports/${patientId}/${reportId}-${Date.now()}.pdf`;

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        ACL: "private",
      };

      const result = await s3.upload(params).promise();

      return {
        success: true,
        url: result.Location,
        key: result.Key,
      };
    } catch (error) {
      console.error("Report upload failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Upload PDF invoice
  async uploadInvoice(pdfBuffer, patientId, invoiceId) {
    try {
      const key = `invoices/${patientId}/${invoiceId}-${Date.now()}.pdf`;

      const params = {
        Bucket: bucketName,
        Key: key,
        Body: pdfBuffer,
        ContentType: "application/pdf",
        ACL: "private",
      };

      const result = await s3.upload(params).promise();

      return {
        success: true,
        url: result.Location,
        key: result.Key,
      };
    } catch (error) {
      console.error("Invoice upload failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate signed URL for private file access
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
        Expires: expiresIn, // URL expires in 1 hour by default
      };

      const url = await s3.getSignedUrlPromise("getObject", params);

      return {
        success: true,
        url,
      };
    } catch (error) {
      console.error("Signed URL generation failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Delete file from S3
  async deleteFile(key) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      };

      await s3.deleteObject(params).promise();

      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error("File deletion failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Configure multer for S3 uploads
  getMulterS3Config(folder = "uploads") {
    return multer({
      storage: multerS3({
        s3: s3,
        bucket: bucketName,
        acl: "private",
        key: function (req, file, cb) {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(
            null,
            `${folder}/${uniqueSuffix}${path.extname(file.originalname)}`
          );
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        // Allow only specific file types
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = allowedTypes.test(
          path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error("Only images, PDFs, and documents are allowed"));
        }
      },
    });
  }

  // Get file info
  async getFileInfo(key) {
    try {
      const params = {
        Bucket: bucketName,
        Key: key,
      };

      const result = await s3.headObject(params).promise();

      return {
        success: true,
        contentType: result.ContentType,
        contentLength: result.ContentLength,
        lastModified: result.LastModified,
        etag: result.ETag,
      };
    } catch (error) {
      console.error("Get file info failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new StorageService();
