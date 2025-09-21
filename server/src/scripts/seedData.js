import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { connectToDatabase } from "../config/db.js";

// Import all necessary models
import User from "../models/User.js";
import Lab from "../models/Lab.js";
import Patient from "../models/Patient.js";
import Sample from "../models/Sample.js";
import Report from "../models/Report.js";
import Test from "../models/Test.js";
import Invoice from "../models/Invoice.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectToDatabase();
    console.log("Database connected for seeding...");

    console.log("🧹 Clearing existing data...");
    await User.deleteMany({});
    await Lab.deleteMany({});
    await Patient.deleteMany({});
    await Sample.deleteMany({});
    await Report.deleteMany({});
    await Invoice.deleteMany({});
    await Test.deleteMany({});
    console.log("✅ Existing data cleared.");

    console.log("Creating super admin...");
    const superAdmin = await User.create({
      name: "Super Admin",
      email: "superadmin@pathologysaas.com",
      password: "Password@123",
      phone: "9876543210",
      role: "super_admin",
      isActive: true,
    });
    console.log(`✅ Super Admin created with ID: ${superAdmin._id}`);

    console.log("Creating a laboratory...");
    const lab = await Lab.create({
      name: "MediCare Diagnostics",
      owner: superAdmin._id,
      tenantId: `TID-${Date.now()}`,
      licenseNumber: `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
      contact: {
        phone: "1234567890",
        email: "contact@medicare.com",
      },
      address: {
        street: "123 Health St",
        city: "Wellness City",
        state: "Stateville",
        zipCode: "12345",
        country: "USA",
      },
      subscription: {
        plan: "premium",
        isActive: true,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        paymentStatus: "paid",
        billingCycle: "yearly",
        amount: 12000,
        currency: "USD",
      },
    });
    console.log(`✅ Lab created with ID: ${lab._id}`);

    console.log("Creating lab admin and staff...");
    const labAdmin = await User.create({
      name: "Dr. Emily Carter",
      email: "emily.carter@medicare.com",
      password: "Password@123",
      phone: "1112223333",
      role: "lab_admin",
      labId: lab._id,
      isActive: true,
    });

    const technician = await User.create({
      name: "John Doe",
      email: "john.doe@medicare.com",
      password: "Password@123",
      phone: "4445556666",
      role: "technician",
      labId: lab._id,
      isActive: true,
    });

    console.log("✅ Lab admin and staff created.");

    console.log("Creating patients...");
    const patient1 = await Patient.create({
      name: "Peter Jones",
      email: "peter.jones@email.com",
      phone: "1010101010",
      age: 45,
      gender: "Male",
      labId: lab._id,
      patientId: `PID-${Date.now()}-1`,
      address: {
        street: "456 Oak Ave",
        city: "Oakland",
        state: "California",
        zip: "94601",
        country: "USA",
      },
    });

    const patient2 = await Patient.create({
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "2020202020",
      age: 32,
      gender: "Female",
      labId: lab._id,
      patientId: `PID-${Date.now()}-2`,
      address: {
        street: "789 Pine St",
        city: "Pineville",
        state: "California",
        zip: "94602",
        country: "USA",
      },
    });
    console.log("✅ Patients created.");

    console.log("Creating test types...");
    const cbcTest = await Test.create({
      name: "Complete Blood Count (CBC)",
      code: "CBC",
      description: "Measures different components of blood.",
      labId: lab._id,
      category: "hematology",
      department: "clinical pathology",
      specimen: {
        type: "whole blood",
        container: "lavender-top tube (edta)",
        collectionInstructions: "Fasting not required.",
      },
      pricing: {
        basePrice: 250.0,
        currency: "INR",
      },
      turnaroundTime: {
        routine: {
          duration: 4,
          unit: "hours",
        },
      },
      createdBy: labAdmin._id,
    });

    const lipidTest = await Test.create({
      name: "Lipid Profile",
      code: "LIPID",
      description: "Measures cholesterol and triglycerides levels.",
      labId: lab._id,
      category: "biochemistry",
      department: "biochemistry",
      specimen: {
        type: "blood",
        container: "vacutainer",
        collectionInstructions: "12-hour fasting required.",
      },
      pricing: {
        basePrice: 400.0,
        currency: "INR",
      },
      turnaroundTime: {
        routine: {
          duration: 6,
          unit: "hours",
        },
      },
      createdBy: labAdmin._id,
    });
    console.log("✅ Test types created.");

    console.log("Creating sample, report, and invoice workflow...");
    
    // Create samples for both patients
    const sample1 = await Sample.create({
      patientId: patient1._id,
      labId: lab._id,
      sampleType: "Blood",
      collectedBy: technician._id,
      status: "completed",
      sampleId: `SID-${Date.now()}-1`,
      barcode: `BAR-${Date.now()}-1`,
      totalAmount: cbcTest.pricing.basePrice,
    });

    const sample2 = await Sample.create({
      patientId: patient2._id,
      labId: lab._id,
      sampleType: "Blood",
      collectedBy: technician._id,
      status: "completed",
      sampleId: `SID-${Date.now()}-2`,
      barcode: `BAR-${Date.now()}-2`,
      totalAmount: lipidTest.pricing.basePrice,
    });

    // Create reports for both samples
    const report1 = await Report.create({
      labId: lab._id,
      patientId: patient1._id,
      sampleId: sample1._id,
      testCategory: "hematology",
      generatedBy: technician._id,
      status: "approved",
      reportId: `RID-${Date.now()}-1`,
      reportNumber: `RNUM-${Date.now()}-1`,
      finalApproval: {
        approvedBy: labAdmin._id,
        approvedAt: new Date(),
      },
      results: [
        {
          testCode: "HGB",
          testName: "Hemoglobin",
          category: "hematology",
          value: "14.5",
          unit: "g/dL",
          referenceRange: {
            text: "13.5-17.5",
          },
          flag: "normal",
          performedBy: technician._id,
        },
        {
          testCode: "WBC",
          testName: "White Blood Cell Count",
          category: "hematology",
          value: "7500",
          unit: "cells/mcL",
          referenceRange: {
            text: "4500-11000",
          },
          flag: "normal",
          performedBy: technician._id,
        },
      ],
    });

    const report2 = await Report.create({
      labId: lab._id,
      patientId: patient2._id,
      sampleId: sample2._id,
      testCategory: "biochemistry",
      generatedBy: technician._id,
      status: "approved",
      reportId: `RID-${Date.now()}-2`,
      reportNumber: `RNUM-${Date.now()}-2`,
      finalApproval: {
        approvedBy: labAdmin._id,
        approvedAt: new Date(),
      },
      results: [
        {
          testCode: "CHOL",
          testName: "Total Cholesterol",
          category: "biochemistry",
          value: "180",
          unit: "mg/dL",
          referenceRange: {
            text: "<200",
          },
          flag: "normal",
          performedBy: technician._id,
        },
        {
          testCode: "TG",
          testName: "Triglycerides",
          category: "biochemistry",
          value: "120",
          unit: "mg/dL",
          referenceRange: {
            text: "<150",
          },
          flag: "normal",
          performedBy: technician._id,
        },
      ],
    });

    // Create invoices for both patients
    await Invoice.create({
      patientId: patient1._id,
      labId: lab._id,
      reportId: report1._id,
      totalAmount: cbcTest.pricing.basePrice,
      status: "paid",
      invoiceId: `INV-${Date.now()}-1`,
      invoiceNumber: `INVNUM-${Date.now()}-1`,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      generatedBy: labAdmin._id,
      subtotal: cbcTest.pricing.basePrice,
      paidAmount: cbcTest.pricing.basePrice,
      balanceAmount: 0,
      paymentStatus: "paid",
      customerInfo: {
        name: patient1.name,
        email: patient1.email,
        phone: patient1.phone,
        address: patient1.address,
      },
      payments: [
        {
          paymentId: `PAY-${Date.now()}-1`,
          amount: cbcTest.pricing.basePrice,
          paymentMethod: "cash",
          status: "completed",
          paidAt: new Date(),
        },
      ],
      items: [
        {
          testCode: cbcTest.code,
          testName: cbcTest.name,
          category: cbcTest.category,
          unitPrice: cbcTest.pricing.basePrice,
          quantity: 1,
          totalAmount: cbcTest.pricing.basePrice,
          sampleId: sample1._id,
          reportId: report1._id,
        },
      ],
    });

    await Invoice.create({
      patientId: patient2._id,
      labId: lab._id,
      reportId: report2._id,
      totalAmount: lipidTest.pricing.basePrice,
      status: "draft",
      invoiceId: `INV-${Date.now()}-2`,
      invoiceNumber: `INVNUM-${Date.now()}-2`,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      generatedBy: labAdmin._id,
      subtotal: lipidTest.pricing.basePrice,
      paidAmount: 0,
      balanceAmount: lipidTest.pricing.basePrice,
      paymentStatus: "unpaid",
      customerInfo: {
        name: patient2.name,
        email: patient2.email,
        phone: patient2.phone,
        address: patient2.address,
      },
      payments: [],
      items: [
        {
          testCode: lipidTest.code,
          testName: lipidTest.name,
          category: lipidTest.category,
          unitPrice: lipidTest.pricing.basePrice,
          quantity: 1,
          totalAmount: lipidTest.pricing.basePrice,
          sampleId: sample2._id,
          reportId: report2._id,
        },
      ],
    });

    console.log("✅ Workflow for both patients completed.");

    console.log("\n🌱 Database seeding completed successfully!");
    console.log("========================================");
    console.log("🔑 Default Password for all users: Password@123");
    console.log("========================================\n");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.disconnect();
    console.log("Database connection closed.");
  }
};

seedDatabase();
