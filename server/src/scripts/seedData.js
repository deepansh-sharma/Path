import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToDatabase } from "../config/db.js";

// Load environment variables
dotenv.config();

console.log("🚀 Seed script started...");
import Lab from "../models/Lab.js";
import User from "../models/User.js";
import Inventory from "../models/Inventory.js";
import Equipment from "../models/Equipment.js";
import Appointment from "../models/Appointment.js";
import AuditLog from "../models/AuditLog.js";
import BackupJob from "../models/BackupJob.js";
import Test from "../models/Test.js";
import Department from "../models/Department.js";
import { hashPassword } from "../utils/password.js";

// Sample data for seeding
const sampleLabs = [
  {
    name: "Central Pathology Lab",
    ownerName: "Dr. Sarah Johnson",
    email: "admin@centralpatholab.com",
    contact: "5550123456",
    address: {
      street: "123 Medical Center Drive",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
    licenseNumber: "CPL-2024-001",
    tenantId: "central-patho-lab",
    subscription: {
      plan: "premium",
      status: "active",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      maxUsers: 50,
      maxSamples: 10000,
    },
    features: {
      canPatientRegistration: true,
      canSampleTracking: true,
      canReportGeneration: true,
      canInventoryManagement: true,
      canAppointmentScheduling: true,
      canAuditLogs: true,
      canBackupRecovery: true,
      canAdvancedAnalytics: true,
      canMultiLocation: true,
      canCustomReports: true,
    },
    branding: {
      logoUrl: "https://example.com/logo.png",
      reportHeaderText:
        "Central Pathology Laboratory - Excellence in Diagnostics",
    },
  },
  {
    name: "Metro Diagnostic Center",
    ownerName: "Dr. Michael Chen",
    email: "admin@metrodiagnostic.com",
    contact: "5550456789",
    address: {
      street: "456 Healthcare Boulevard",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
    licenseNumber: "MDC-2024-002",
    tenantId: "metro-diagnostic",
    subscription: {
      plan: "standard",
      status: "active",
      startDate: new Date("2024-02-01"),
      endDate: new Date("2024-12-31"),
      maxUsers: 25,
      maxSamples: 5000,
    },
    features: {
      canPatientRegistration: true,
      canSampleTracking: true,
      canReportGeneration: true,
      canInventoryManagement: true,
      canAppointmentScheduling: true,
      canAuditLogs: false,
      canBackupRecovery: false,
      canAdvancedAnalytics: false,
      canMultiLocation: false,
      canCustomReports: false,
    },
    branding: {
      logoUrl: "https://example.com/metro-logo.png",
      reportHeaderText: "Metro Diagnostic Center - Your Health Partner",
    },
  },
];

const sampleUsers = [
  {
    name: "Super Admin",
    email: "superadmin@pathocloud.com",
    password: "password123",
    phone: "5550000000",
    role: "super_admin",
    tenantId: "superadmin",
    isActive: true,
    profile: {
      firstName: "Super",
      lastName: "Admin",
    },
  },
  {
    name: "Dr. Sarah Johnson",
    email: "admin@centralpatholab.com",
    password: "password123",
    phone: "5550123456",
    role: "lab_admin",
    tenantId: "central-patho-lab",
    isActive: true,
    profile: {
      firstName: "Sarah",
      lastName: "Johnson",
      specialization: "Pathology",
      licenseNumber: "MD-12345",
    },
  },
  {
    name: "John Smith",
    email: "john.smith@centralpatholab.com",
    password: "password123",
    phone: "5550124567",
    role: "technician",
    tenantId: "central-patho-lab",
    isActive: true,
    profile: {
      firstName: "John",
      lastName: "Smith",
      department: "Hematology",
    },
  },
  {
    name: "Dr. Michael Chen",
    email: "admin@metrodiagnostic.com",
    password: "password123",
    phone: "5550456789",
    role: "lab_admin",
    tenantId: "metro-diagnostic",
    isActive: true,
    profile: {
      firstName: "Michael",
      lastName: "Chen",
      specialization: "Clinical Chemistry",
      licenseNumber: "MD-67890",
    },
  },
  {
    name: "Emily Davis",
    email: "emily.davis@metrodiagnostic.com",
    password: "password123",
    phone: "5550457890",
    role: "receptionist",
    tenantId: "metro-diagnostic",
    isActive: true,
    profile: {
      firstName: "Emily",
      lastName: "Davis",
    },
  },
];

const sampleDepartments = [
  {
    name: "Hematology",
    code: "HEMA",
    description: "Blood and blood-related disorders analysis",
    type: "clinical",
    category: "hematology",
    staff: {
      capacity: {
        maximum: 10,
      },
    },
    location: {
      building: "Main Building",
      floor: "2nd Floor",
      room: "Room 201-205",
      phone: "5550201234",
      email: "hematology@centralpatholab.com",
    },
    workingHours: {
      monday: { start: "08:00", end: "17:00", isOpen: true },
      tuesday: { start: "08:00", end: "17:00", isOpen: true },
      wednesday: { start: "08:00", end: "17:00", isOpen: true },
      thursday: { start: "08:00", end: "17:00", isOpen: true },
      friday: { start: "08:00", end: "17:00", isOpen: true },
      saturday: { start: "09:00", end: "13:00", isOpen: true },
      sunday: { start: "00:00", end: "00:00", isOpen: false },
    },
    services: [
      {
        name: "Complete Blood Count",
        description: "CBC test",
        isActive: true,
        turnaroundTime: { routine: 24, urgent: 4, stat: 1 },
        cost: 50,
      },
      {
        name: "Blood Smear",
        description: "Blood smear examination",
        isActive: true,
        turnaroundTime: { routine: 48, urgent: 8, stat: 2 },
        cost: 75,
      },
      {
        name: "Coagulation Studies",
        description: "Blood clotting tests",
        isActive: true,
        turnaroundTime: { routine: 24, urgent: 4, stat: 1 },
        cost: 100,
      },
      {
        name: "Bone Marrow Analysis",
        description: "Bone marrow examination",
        isActive: true,
        turnaroundTime: { routine: 72, urgent: 24, stat: 8 },
        cost: 300,
      },
    ],
    budget: {
      annual: {
        allocated: 250000,
        spent: 0,
        remaining: 250000,
      },
    },
    notifications: {
      email: "hematology@centralpatholab.com",
      sms: "5550201234",
    },
    tenantId: "central-patho-lab",
  },
  {
    name: "Clinical Chemistry",
    code: "CHEM",
    description: "Chemical analysis of blood and body fluids",
    type: "clinical",
    category: "biochemistry",
    staff: {
      capacity: {
        maximum: 15,
      },
    },
    location: {
      building: "Main Building",
      floor: "1st Floor",
      room: "Room 101-110",
      phone: "5550101234",
      email: "chemistry@centralpatholab.com",
    },
    workingHours: {
      monday: { start: "07:00", end: "19:00", isOpen: true },
      tuesday: { start: "07:00", end: "19:00", isOpen: true },
      wednesday: { start: "07:00", end: "19:00", isOpen: true },
      thursday: { start: "07:00", end: "19:00", isOpen: true },
      friday: { start: "07:00", end: "19:00", isOpen: true },
      saturday: { start: "08:00", end: "16:00", isOpen: true },
      sunday: { start: "10:00", end: "14:00", isOpen: true },
    },
    services: [
      {
        name: "Liver Function Tests",
        description: "LFT panel",
        isActive: true,
        turnaroundTime: { routine: 24, urgent: 4, stat: 1 },
        cost: 80,
      },
      {
        name: "Kidney Function Tests",
        description: "RFT panel",
        isActive: true,
        turnaroundTime: { routine: 24, urgent: 4, stat: 1 },
        cost: 70,
      },
      {
        name: "Lipid Profile",
        description: "Cholesterol and lipid tests",
        isActive: true,
        turnaroundTime: { routine: 24, urgent: 4, stat: 1 },
        cost: 60,
      },
      {
        name: "Glucose Tests",
        description: "Blood sugar tests",
        isActive: true,
        turnaroundTime: { routine: 2, urgent: 1, stat: 0.5 },
        cost: 30,
      },
    ],
    budget: {
      annual: {
        allocated: 400000,
        spent: 0,
        remaining: 400000,
      },
    },
    notifications: {
      email: "chemistry@centralpatholab.com",
      sms: "5550101234",
    },
    tenantId: "central-patho-lab",
  },
  {
    name: "Microbiology",
    code: "MICRO",
    description: "Bacterial, viral, and fungal infection diagnosis",
    type: "clinical",
    category: "microbiology",
    staff: {
      capacity: {
        maximum: 8,
      },
    },
    location: {
      building: "Lab Building",
      floor: "3rd Floor",
      room: "Room 301-308",
      phone: "5550301234",
      email: "microbiology@metrodiagnostic.com",
    },
    workingHours: {
      monday: { start: "08:00", end: "18:00", isOpen: true },
      tuesday: { start: "08:00", end: "18:00", isOpen: true },
      wednesday: { start: "08:00", end: "18:00", isOpen: true },
      thursday: { start: "08:00", end: "18:00", isOpen: true },
      friday: { start: "08:00", end: "18:00", isOpen: true },
      saturday: { start: "09:00", end: "15:00", isOpen: true },
      sunday: { start: "00:00", end: "00:00", isOpen: false },
    },
    services: [
      {
        name: "Culture & Sensitivity",
        description: "Bacterial culture and sensitivity",
        isActive: true,
        turnaroundTime: { routine: 72, urgent: 48, stat: 24 },
        cost: 120,
      },
      {
        name: "Gram Staining",
        description: "Gram stain examination",
        isActive: true,
        turnaroundTime: { routine: 2, urgent: 1, stat: 0.5 },
        cost: 25,
      },
      {
        name: "Antibiotic Susceptibility",
        description: "Antibiotic resistance testing",
        isActive: true,
        turnaroundTime: { routine: 48, urgent: 24, stat: 12 },
        cost: 90,
      },
      {
        name: "Viral PCR",
        description: "Viral detection by PCR",
        isActive: true,
        turnaroundTime: { routine: 48, urgent: 24, stat: 8 },
        cost: 200,
      },
    ],
    budget: {
      annual: {
        allocated: 300000,
        spent: 0,
        remaining: 300000,
      },
    },
    notifications: {
      email: "microbiology@metrodiagnostic.com",
      sms: "5550301234",
    },
    tenantId: "metro-diagnostic",
  },
];

const sampleTests = [
  {
    name: "Complete Blood Count (CBC)",
    code: "CBC001",
    category: "hematology",
    type: "panel",
    description:
      "Comprehensive blood cell analysis including RBC, WBC, and platelet counts",
    methodology: "automated",
    specimen: {
      type: "blood",
      volume: { amount: 3.0, unit: "ml" },
      container: "edta",
      preparation: "No special preparation required",
    },
    parameters: [
      {
        name: "Hemoglobin",
        code: "HGB",
        unit: "g/dL",
        referenceRange: { min: 12.0, max: 16.0 },
      },
      {
        name: "Hematocrit",
        code: "HCT",
        unit: "%",
        referenceRange: { min: 36.0, max: 48.0 },
      },
      {
        name: "RBC Count",
        code: "RBC",
        unit: "million/μL",
        referenceRange: { min: 4.2, max: 5.4 },
      },
      {
        name: "WBC Count",
        code: "WBC",
        unit: "thousand/μL",
        referenceRange: { min: 4.5, max: 11.0 },
      },
      {
        name: "Platelet Count",
        code: "PLT",
        unit: "thousand/μL",
        referenceRange: { min: 150, max: 450 },
      },
    ],
    pricing: {
      basePrice: 25.0,
      urgentPrice: 40.0,
      currency: "USD",
    },
    turnaroundTime: {
      routine: { duration: 120 },
      urgent: { duration: 60 },
    },
    qualityControl: {
      required: true,
      frequency: "daily",
    },
    active: true,
    tenantId: "central-patho-lab",
  },
  {
    name: "Liver Function Panel",
    code: "LFT001",
    category: "biochemistry",
    type: "panel",
    description: "Comprehensive liver function assessment",
    methodology: "automated",
    specimen: {
      type: "serum",
      volume: { amount: 2.0, unit: "ml" },
      container: "plain",
      preparation: "8-12 hour fasting recommended",
    },
    parameters: [
      {
        name: "ALT",
        code: "ALT",
        unit: "U/L",
        referenceRange: { min: 7, max: 56 },
      },
      {
        name: "AST",
        code: "AST",
        unit: "U/L",
        referenceRange: { min: 10, max: 40 },
      },
      {
        name: "Bilirubin Total",
        code: "TBIL",
        unit: "mg/dL",
        referenceRange: { min: 0.2, max: 1.2 },
      },
      {
        name: "Alkaline Phosphatase",
        code: "ALP",
        unit: "U/L",
        referenceRange: { min: 44, max: 147 },
      },
    ],
    pricing: {
      basePrice: 35.0,
      urgentPrice: 55.0,
      currency: "USD",
    },
    turnaroundTime: {
      routine: { duration: 180 },
      urgent: { duration: 90 },
    },
    qualityControl: {
      required: true,
      frequency: "daily",
    },
    active: true,
    tenantId: "central-patho-lab",
  },
  {
    name: "Urine Culture",
    code: "UC001",
    category: "microbiology",
    type: "culture",
    description: "Bacterial culture and antibiotic sensitivity testing",
    methodology: "culture",
    specimen: {
      type: "urine",
      volume: { amount: 10.0, unit: "ml" },
      container: "sterile",
      preparation: "Clean catch midstream urine",
    },
    parameters: [
      {
        name: "Bacterial Growth",
        code: "BGROWTH",
        unit: "CFU/mL",
        referenceRange: { min: 0, max: 100000 },
      },
      {
        name: "Organism Identification",
        code: "ORGID",
        unit: "text",
        referenceRange: {},
      },
      {
        name: "Antibiotic Sensitivity",
        code: "ABSENS",
        unit: "text",
        referenceRange: {},
      },
    ],
    pricing: {
      basePrice: 45.0,
      urgentPrice: 70.0,
      currency: "USD",
    },
    turnaroundTime: {
      routine: { duration: 2880 },
      urgent: { duration: 1440 },
    },
    qualityControl: {
      required: true,
      frequency: "weekly",
    },
    active: true,
    tenantId: "metro-diagnostic",
  },
];

const sampleInventory = [
  {
    name: "EDTA Blood Collection Tubes",
    category: "consumables",
    sku: "BCT-EDTA-001",
    description: "3mL EDTA tubes for blood collection",
    manufacturer: "BD Vacutainer",
    supplier: {
      name: "Medical Supply Co.",
      contact: "555-0100",
      email: "orders@medicalsupply.com",
    },
    unit: "pieces",
    currentStock: 500,
    minStockLevel: 100,
    maxStockLevel: 1000,
    unitPrice: 0.75,
    currency: "USD",
    location: {
      building: "Main Building",
      room: "Storage Room A",
      shelf: "A-1",
    },
    expiryDate: new Date("2025-12-31"),
    batchNumber: "BCT240101",
    tenantId: "central-patho-lab",
  },
  {
    name: "Reagent Kit - Liver Function",
    category: "reagents",
    sku: "RK-LFT-002",
    description: "Complete reagent kit for liver function tests",
    manufacturer: "Roche Diagnostics",
    supplier: {
      name: "Lab Reagents Inc.",
      contact: "555-0200",
      email: "sales@labreagents.com",
    },
    unit: "boxes",
    currentStock: 25,
    minStockLevel: 5,
    maxStockLevel: 50,
    unitPrice: 125.0,
    currency: "USD",
    location: {
      building: "Main Building",
      room: "Reagent Storage",
      shelf: "R-3",
    },
    expiryDate: new Date("2024-08-15"),
    batchNumber: "RK240201",
    tenantId: "central-patho-lab",
  },
  {
    name: "Disposable Pipette Tips",
    category: "consumables",
    sku: "PT-1000-003",
    description: "1000μL disposable pipette tips",
    manufacturer: "Eppendorf",
    supplier: {
      name: "Scientific Equipment Ltd.",
      contact: "555-0300",
      email: "info@sciequip.com",
    },
    unit: "pieces",
    currentStock: 2000,
    minStockLevel: 500,
    maxStockLevel: 5000,
    unitPrice: 0.05,
    currency: "USD",
    location: {
      building: "Lab Building",
      room: "General Storage",
      shelf: "G-2",
    },
    expiryDate: new Date("2026-06-30"),
    batchNumber: "PT240115",
    tenantId: "metro-diagnostic",
  },
];

const sampleEquipment = [
  {
    name: "Automated Hematology Analyzer",
    model: "XN-1000",
    manufacturer: "Sysmex",
    serialNumber: "SYS-XN1000-2024-001",
    category: "analyzer",
    status: "operational",
    purchaseDate: new Date("2023-06-15"),
    warrantyExpiry: new Date("2026-06-15"),
    purchasePrice: 85000,
    location: {
      department: "hematology",
      building: "Main Building",
      room: "Hematology Lab",
    },
    specifications: {
      throughput: "100 samples/hour",
      parameters: "CBC, Diff, Retic",
      sampleVolume: "175μL",
    },
    maintenance: {
      lastDate: new Date("2024-01-15"),
      nextDueDate: new Date("2024-04-15"),
      frequency: "quarterly",
    },
    calibration: {
      lastDate: new Date("2024-01-01"),
      nextDueDate: new Date("2024-07-01"),
      frequency: "semi_annual",
    },
    tenantId: "central-patho-lab",
  },
  {
    name: "Clinical Chemistry Analyzer",
    model: "Cobas c311",
    manufacturer: "Roche Diagnostics",
    serialNumber: "ROC-C311-2024-002",
    category: "analyzer",
    status: "operational",
    purchaseDate: new Date("2023-09-20"),
    warrantyExpiry: new Date("2026-09-20"),
    purchasePrice: 120000,
    location: {
      department: "biochemistry",
      building: "Main Building",
      room: "Chemistry Lab",
    },
    specifications: {
      throughput: "300 tests/hour",
      parameters: "Clinical Chemistry",
      sampleVolume: "2-35μL",
    },
    maintenance: {
      lastDate: new Date("2024-01-10"),
      nextDueDate: new Date("2024-04-10"),
      frequency: "quarterly",
    },
    calibration: {
      lastDate: new Date("2024-01-05"),
      nextDueDate: new Date("2024-04-05"),
      frequency: "quarterly",
    },
    tenantId: "central-patho-lab",
  },
  {
    name: "Microscope - Research Grade",
    model: "BX53",
    manufacturer: "Olympus",
    serialNumber: "OLY-BX53-2024-003",
    category: "microscope",
    status: "operational",
    purchaseDate: new Date("2024-01-10"),
    warrantyExpiry: new Date("2027-01-10"),
    purchasePrice: 15000,
    location: {
      department: "microbiology",
      building: "Lab Building",
      room: "Microbiology Lab",
    },
    specifications: {
      magnification: "40x-1000x",
      illumination: "LED",
      camera: "Digital imaging",
    },
    maintenance: {
      lastDate: new Date("2024-01-10"),
      nextDueDate: new Date("2024-07-10"),
      frequency: "semi-annual",
    },
    calibration: {
      lastDate: new Date("2024-01-10"),
      nextDueDate: new Date("2025-01-10"),
      frequency: "annual",
    },
    tenantId: "metro-diagnostic",
  },
];

const sampleAppointments = [
  {
    patientName: "Alice Johnson",
    patientEmail: "alice.johnson@email.com",
    patientPhone: "5551001234",
    patientAge: 35,
    patientGender: "female",
    appointmentDate: new Date("2024-01-25"),
    timeSlot: {
      start: "09:00",
      end: "09:30",
    },
    type: "sample_collection",
    status: "scheduled",
    priority: "normal",
    estimatedDuration: 30,
    notes: "Annual health checkup",
    referralDoctor: "Dr. Smith",
    paymentMethod: "insurance",
    paymentAmount: 150.0,
    tenantId: "central-patho-lab",
  },
  {
    patientName: "Robert Brown",
    patientEmail: "robert.brown@email.com",
    patientPhone: "5551002345",
    patientAge: 42,
    patientGender: "male",
    appointmentDate: new Date("2024-01-25"),
    timeSlot: {
      start: "10:00",
      end: "10:45",
    },
    type: "emergency",
    status: "confirmed",
    priority: "high",
    estimatedDuration: 45,
    notes: "Follow-up for abnormal liver function",
    referralDoctor: "Dr. Wilson",
    paymentMethod: "card",
    paymentAmount: 200.0,
    tenantId: "central-patho-lab",
  },
  {
    patientName: "Maria Garcia",
    patientEmail: "maria.garcia@email.com",
    patientPhone: "5551003456",
    patientAge: 28,
    patientGender: "female",
    appointmentDate: new Date("2024-01-26"),
    timeSlot: {
      start: "14:00",
      end: "14:30",
    },
    type: "sample_collection",
    status: "scheduled",
    priority: "normal",
    estimatedDuration: 30,
    notes: "Pregnancy screening tests",
    referralDoctor: "Dr. Martinez",
    paymentMethod: "cash",
    paymentAmount: 120.0,
    tenantId: "metro-diagnostic",
  },
];

const sampleBackupJobs = [
  {
    name: "Daily Database Backup",
    description: "Automated daily backup of all laboratory databases",
    type: "database_only",
    enabled: true,
    schedule: {
      frequency: "daily",
      time: "02:00",
      timezone: "America/New_York",
    },
    source: {
      databases: [
        { name: "pathocloud_main", size: 1024000 },
        { name: "pathocloud_reports", size: 512000 },
        { name: "pathocloud_audit", size: 256000 },
      ],
      totalSize: 1792000,
    },
    destination: {
      type: "s3",
      path: "s3://pathocloud-backups/daily/",
      credentials: {
        encrypted: true,
      },
    },
    compression: {
      enabled: true,
      algorithm: "gzip",
      level: 6,
    },
    encryption: {
      enabled: true,
      algorithm: "AES-256",
    },
    retentionPolicy: {
      keepDaily: 30,
      keepWeekly: 12,
      keepMonthly: 12,
      keepYearly: 5,
    },
    notifications: {
      onSuccess: {
        enabled: false,
        recipients: ["admin@centralpatholab.com"],
      },
      onFailure: {
        enabled: true,
        recipients: ["admin@centralpatholab.com"],
      },
    },
    priority: "high",
    maxExecutionTime: 3600,
    tenantId: "central-patho-lab",
  },
  {
    name: "Weekly File System Backup",
    description: "Weekly backup of report files and documents",
    type: "files_only",
    enabled: true,
    schedule: {
      frequency: "weekly",
      dayOfWeek: 0,
      time: "01:00",
      timezone: "America/Los_Angeles",
    },
    source: {
      files: [{ path: "/var/lab/reports/", recursive: true, size: 2048000 }],
      totalSize: 2048000,
    },
    destination: {
      type: "local",
      path: "//backup-server/lab-backups/weekly/",
      credentials: {
        encrypted: true,
      },
    },
    compression: {
      enabled: true,
      algorithm: "gzip",
      level: 5,
    },
    encryption: {
      enabled: false,
    },
    retentionPolicy: {
      keepWeekly: 8,
      keepMonthly: 6,
    },
    notifications: {
      onSuccess: {
        enabled: true,
        recipients: ["admin@metrodiagnostic.com"],
      },
      onFailure: {
        enabled: true,
        recipients: ["admin@metrodiagnostic.com"],
      },
    },
    priority: "normal",
    maxExecutionTime: 7200,
    tenantId: "metro-diagnostic",
  },
];

const sampleAuditLogs = [
  {
    logId: "AUDIT001",
    action: "user_login",
    resource: "authentication",
    timestamp: new Date("2024-01-24T08:30:00Z"),
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "low",
    category: "security",
    riskLevel: "low",
    tenantId: "central-patho-lab",
  },
  {
    logId: "AUDIT002",
    action: "patient_created",
    resource: "patient",
    timestamp: new Date("2024-01-24T09:15:00Z"),
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    severity: "medium",
    category: "patient_care",
    riskLevel: "medium",
    complianceStandard: "HIPAA",
    tenantId: "central-patho-lab",
  },
  {
    logId: "AUDIT003",
    action: "security_data_export",
    resource: "reports",
    timestamp: new Date("2024-01-24T14:20:00Z"),
    ipAddress: "192.168.1.102",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    severity: "high",
    category: "laboratory",
    riskLevel: "high",
    complianceStandard: "HIPAA",
    tenantId: "metro-diagnostic",
  },
];

// Seed function
async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    console.log(
      "📡 Connecting to database:",
      process.env.MONGODB_URI.replace(/\/\/.*@/, "//***:***@")
    );

    // Connect to database
    await connectToDatabase();
    console.log("✅ Connected to database");

    // Clear existing data (optional - comment out in production)
    console.log("🧹 Clearing existing data...");
    await Promise.all([
      Lab.deleteMany({}),
      User.deleteMany({}),
      Department.deleteMany({}),
      Test.deleteMany({}),
      Inventory.deleteMany({}),
      Equipment.deleteMany({}),
      Appointment.deleteMany({}),
      BackupJob.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log("✅ Existing data cleared");

    // Seed Labs
    console.log("🏥 Seeding labs...");
    const createdLabs = await Lab.insertMany(sampleLabs);
    console.log(`✅ Created ${createdLabs.length} labs`);
    let password = await hashPassword("password123");
    // console.log(passwordHash);
    // Seed Users with hashed passwords and lab assignments
    console.log("👥 Seeding users...");
    const usersWithPasswords = await Promise.all(
      sampleUsers.map(async (user) => {
        const userData = {
          ...user,
          password: password,
        };

        // Assign labId for non-super_admin users
        if (user.role !== "super_admin") {
          const lab = createdLabs.find((lab) => lab.tenantId === user.tenantId);
          if (lab) {
            userData.labId = lab._id;
          }
        }

        return userData;
      })
    );
    const createdUsers = await User.insertMany(usersWithPasswords);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Seed Departments with lab assignments
    console.log("🏢 Seeding departments...");
    const departmentsWithLabIds = sampleDepartments.map((dept) => {
      const lab = createdLabs.find((lab) => lab.tenantId === dept.tenantId);
      const adminUser = createdUsers.find(
        (user) => user.tenantId === dept.tenantId && user.role === "lab_admin"
      );
      // Fallback to any user from the same tenant if no admin found
      const fallbackUser = createdUsers.find(
        (user) => user.tenantId === dept.tenantId
      );

      return {
        ...dept,
        labId: lab ? lab._id : null,
        createdBy: adminUser
          ? adminUser._id
          : fallbackUser
          ? fallbackUser._id
          : createdUsers[0]._id,
      };
    });
    const createdDepartments = await Department.insertMany(
      departmentsWithLabIds
    );
    console.log(`✅ Created ${createdDepartments.length} departments`);

    // Update departments with head users
    const hemaUser = createdUsers.find(
      (u) => u.email === "john.smith@centralpatholab.com"
    );
    const chemUser = createdUsers.find(
      (u) => u.email === "admin@centralpatholab.com"
    );
    const microUser = createdUsers.find(
      (u) => u.email === "emily.davis@metrodiagnostic.com"
    );

    if (hemaUser) {
      await Department.findOneAndUpdate(
        { code: "HEMA" },
        { head: hemaUser._id }
      );
    }
    if (chemUser) {
      await Department.findOneAndUpdate(
        { code: "CHEM" },
        { head: chemUser._id }
      );
    }
    if (microUser) {
      await Department.findOneAndUpdate(
        { code: "MICRO" },
        { head: microUser._id }
      );
    }

    // Seed Tests with department references
    console.log("🧪 Seeding tests...");
    const testsWithDepts = sampleTests.map((test) => {
      // Map category to department enum value
      let departmentValue;
      if (test.category === "hematology") departmentValue = "hematology";
      else if (test.category === "biochemistry")
        departmentValue = "biochemistry";
      else if (test.category === "microbiology")
        departmentValue = "microbiology";
      else departmentValue = "general";

      // Find appropriate lab based on tenant
      const lab = createdLabs.find((l) => l.tenantId === test.tenantId);

      // Find appropriate user for createdBy
      const adminUser = createdUsers.find(
        (u) => u.tenantId === test.tenantId && u.role === "lab_admin"
      );
      const fallbackUser = createdUsers.find(
        (u) => u.tenantId === test.tenantId
      );

      return {
        ...test,
        department: departmentValue,
        labId: lab ? lab._id : null,
        createdBy: adminUser
          ? adminUser._id
          : fallbackUser
          ? fallbackUser._id
          : createdUsers[0]._id,
      };
    });
    const createdTests = await Test.insertMany(testsWithDepts);
    console.log(`✅ Created ${createdTests.length} tests`);

    // Seed Inventory
    console.log("📦 Seeding inventory...");
    const inventoryWithRefs = sampleInventory.map((inventory) => {
      // Find the lab for this tenant
      const lab = createdLabs.find((l) => l.tenantId === inventory.tenantId);

      // Find a user for createdBy (prefer lab admin, then any user from same tenant)
      const labAdmin = createdUsers.find(
        (u) => u.tenantId === inventory.tenantId && u.role === "lab_admin"
      );
      const tenantUser = createdUsers.find(
        (u) => u.tenantId === inventory.tenantId
      );
      const fallbackUser = createdUsers[0]; // First user as ultimate fallback

      return {
        ...inventory,
        labId: lab?._id,
        createdBy: labAdmin?._id || tenantUser?._id || fallbackUser?._id,
      };
    });
    const createdInventory = await Inventory.insertMany(inventoryWithRefs);
    console.log(`✅ Created ${createdInventory.length} inventory items`);

    // Seed Equipment with department references
    console.log("🔧 Seeding equipment...");
    const equipmentWithRefs = sampleEquipment.map((equipment) => {
      // Find the lab for this tenant
      const lab = createdLabs.find((l) => l.tenantId === equipment.tenantId);

      // Find a user for createdBy (prefer lab admin, then any user from same tenant)
      const labAdmin = createdUsers.find(
        (u) => u.tenantId === equipment.tenantId && u.role === "lab_admin"
      );
      const tenantUser = createdUsers.find(
        (u) => u.tenantId === equipment.tenantId
      );
      const fallbackUser = createdUsers[0]; // First user as ultimate fallback

      return {
        ...equipment,
        labId: lab?._id,
        createdBy: labAdmin?._id || tenantUser?._id || fallbackUser?._id,
      };
    });
    const createdEquipment = await Equipment.insertMany(equipmentWithRefs);
    console.log(`✅ Created ${createdEquipment.length} equipment items`);

    // Seed Appointments with test and staff references
    console.log("📅 Seeding appointments...");
    const appointmentsWithRefs = sampleAppointments.map(
      (appointment, index) => {
        // Find the lab for this tenant
        const lab = createdLabs.find(
          (l) => l.tenantId === appointment.tenantId
        );

        // Find tests for this tenant
        const tests = createdTests
          .filter((t) => t.tenantId === appointment.tenantId)
          .slice(0, 2)
          .map((t) => ({
            testId: t._id,
            name: t.name,
            code: t.code,
            price: 100,
            estimatedDuration: 30,
          }));

        // Find staff for this tenant
        const staff = createdUsers
          .filter(
            (u) => u.tenantId === appointment.tenantId && u.role !== "lab_admin"
          )
          .slice(0, 1);

        // Find a user for createdBy (prefer lab admin, then any user from same tenant)
        const labAdmin = createdUsers.find(
          (u) => u.tenantId === appointment.tenantId && u.role === "lab_admin"
        );
        const tenantUser = createdUsers.find(
          (u) => u.tenantId === appointment.tenantId
        );
        const fallbackUser = createdUsers[0]; // First user as ultimate fallback

        const dept = createdDepartments.find(
          (d) => d.tenantId === appointment.tenantId
        );

        return {
          ...appointment,
          appointmentId: `APT-${appointment.tenantId.toUpperCase()}-${String(
            index + 1
          ).padStart(4, "0")}`,
          patient:
            createdUsers.find((u) => u.tenantId === appointment.tenantId)
              ?._id || fallbackUser?._id,
          patientInfo: {
            name: appointment.patientName,
            phone: appointment.patientPhone,
            email: appointment.patientEmail,
            age: appointment.patientAge,
            gender: appointment.patientGender,
          },
          tests,
          assignedStaff: {
            primary: staff[0]?._id || fallbackUser?._id,
            secondary: [],
          },
          department: dept?.category || "general",
          room: "Room 101",
          duration: appointment.estimatedDuration || 30,
          payment: {
            amount: {
              total: appointment.paymentAmount || 0,
              paid: 0,
              pending: appointment.paymentAmount || 0,
            },
            method: appointment.paymentMethod,
          },
          labId: lab?._id,
          createdBy: labAdmin?._id || tenantUser?._id || fallbackUser?._id,
        };
      }
    );
    const createdAppointments = await Appointment.insertMany(
      appointmentsWithRefs
    );
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    // Seed Backup Jobs
    console.log("💾 Seeding backup jobs...");
    const backupJobsWithRefs = sampleBackupJobs.map((job, index) => {
      // Find the lab for this tenant
      const lab = createdLabs.find((l) => l.tenantId === job.tenantId);

      // Find a user for createdBy (prefer lab admin, then any user from same tenant)
      const labAdmin = createdUsers.find(
        (u) => u.tenantId === job.tenantId && u.role === "lab_admin"
      );
      const tenantUser = createdUsers.find((u) => u.tenantId === job.tenantId);
      const fallbackUser = createdUsers[0]; // First user as ultimate fallback

      return {
        ...job,
        jobId: `BKP-${job.tenantId.toUpperCase()}-${String(index + 1).padStart(
          4,
          "0"
        )}`,
        labId: lab?._id,
        createdBy: labAdmin?._id || tenantUser?._id || fallbackUser?._id,
      };
    });
    const createdBackupJobs = await BackupJob.insertMany(backupJobsWithRefs);
    console.log(`✅ Created ${createdBackupJobs.length} backup jobs`);

    // Seed Audit Logs with user references
    console.log("📋 Seeding audit logs...");
    const auditLogsWithRefs = sampleAuditLogs.map((log) => {
      const lab =
        createdLabs.find((l) => l.tenantId === log.tenantId) || createdLabs[0];
      const labAdmin = createdUsers.find(
        (u) => u.role === "lab_admin" && u.tenantId === log.tenantId
      );
      const tenantUser = createdUsers.find((u) => u.tenantId === log.tenantId);
      const fallbackUser = createdUsers[0];

      return {
        ...log,
        labId: lab._id,
        user: {
          id: labAdmin?._id || tenantUser?._id || fallbackUser._id,
          name: labAdmin?.name || tenantUser?.name || fallbackUser.name,
          email: labAdmin?.email || tenantUser?.email || fallbackUser.email,
          role: labAdmin?.role || tenantUser?.role || fallbackUser.role,
          ipAddress: log.ipAddress || "192.168.1.100",
          userAgent: log.userAgent,
        },
        target: {
          type:
            log.resource === "authentication"
              ? "system"
              : log.resource === "patient"
              ? "patient"
              : "report",
          id:
            log.resource === "authentication"
              ? undefined
              : new mongoose.Types.ObjectId(),
          name: log.resource,
        },
        description: `User ${log.action} performed on ${log.resource}`,
      };
    });
    const createdAuditLogs = await AuditLog.insertMany(auditLogsWithRefs);
    console.log(`✅ Created ${createdAuditLogs.length} audit logs`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Labs: ${createdLabs.length}`);
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Departments: ${createdDepartments.length}`);
    console.log(`   Tests: ${createdTests.length}`);
    console.log(`   Inventory Items: ${createdInventory.length}`);
    console.log(`   Equipment: ${createdEquipment.length}`);
    console.log(`   Appointments: ${createdAppointments.length}`);
    console.log(`   Backup Jobs: ${createdBackupJobs.length}`);
    console.log(`   Audit Logs: ${createdAuditLogs.length}`);

    console.log("\n🔑 Default Login Credentials:");
    console.log("   Super Admin: superadmin@pathocloud.com / password123");
    console.log(
      "   Lab Admin (Central): admin@centralpatholab.com / password123"
    );
    console.log(
      "   Lab Admin (Metro): admin@metrodiagnostic.com / password123"
    );
    console.log("   Technician: john.smith@centralpatholab.com / password123");
    console.log(
      "   Receptionist: emily.davis@metrodiagnostic.com / password123"
    );
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run seeding - execute the function directly
console.log("🎯 Executing seed database function...");
seedDatabase()
  .then(() => {
    console.log("✅ Seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding process failed:", error);
    process.exit(1);
  });

export default seedDatabase;
export {
  sampleLabs,
  sampleUsers,
  sampleDepartments,
  sampleTests,
  sampleInventory,
  sampleEquipment,
  sampleAppointments,
  sampleBackupJobs,
  sampleAuditLogs,
};
