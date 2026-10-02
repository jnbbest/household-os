import { TaskOwnership, ExpenseItem, DocumentPointer, EmergencyInfo } from '../types/household';

export const DEFAULT_TASKS: TaskOwnership[] = [
  {
    id: "task-01",
    domain: "kitchen",
    title: "Weekly meal planning (Mon–Sun menu)",
    frequency: "weekly",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Menu finalized, ingredients checked, and communicated to cook/family on Sunday.",
    status: "pending"
  },
  {
    id: "task-02",
    domain: "kitchen",
    title: "Daily cook briefing & dish instructions",
    frequency: "daily",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Cook knows lunch and dinner dishes by 8:30 AM; veggies defrosted or chopped.",
    status: "completed"
  },
  {
    id: "task-03",
    domain: "kitchen",
    title: "Grocery & pantry restock (staples)",
    frequency: "weekly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Atta, rice, oil, spices, tea ordered before containers reach 20% mark.",
    status: "pending"
  },
  {
    id: "task-04",
    domain: "kitchen",
    title: "Fresh produce (veggies, fruit, milk)",
    frequency: "weekly",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Ordered on quick-commerce 2x/week and washed/stored in crisper drawer.",
    status: "completed"
  },
  {
    id: "task-05",
    domain: "kitchen",
    title: "Drinking water / RO purifier servicing",
    frequency: "monthly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Filters serviced on schedule, TDS checked, backup water jars filled.",
    status: "pending"
  },
  {
    id: "task-06",
    domain: "kitchen",
    title: "LPG gas cylinder booking & backup check",
    frequency: "as_needed",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Secondary cylinder connected and new refill booked within 24h.",
    status: "completed"
  },
  {
    id: "task-07",
    domain: "staff",
    title: "Maid attendance, punctuality & leaves",
    frequency: "daily",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Leaves marked in calendar; backup cleaning plan initiated if absent.",
    status: "completed"
  },
  {
    id: "task-08",
    domain: "staff",
    title: "Domestic staff salary calculations & UPI transfer",
    frequency: "monthly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Transferred on 1st–3rd via UPI with screenshot saved and advance deductions accounted for.",
    status: "pending"
  },
  {
    id: "task-09",
    domain: "staff",
    title: "Deep cleaning coordination (sofa, windows, kitchen)",
    frequency: "monthly",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Deep clean booked via Urban Company or domestic staff supervised.",
    status: "pending"
  },
  {
    id: "task-10",
    domain: "staff",
    title: "Garbage segregation & daily disposal",
    frequency: "daily",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Wet and dry waste segregated; bins placed outside by 8:30 AM.",
    status: "completed"
  },
  {
    id: "task-11",
    domain: "admin",
    title: "Rent & society maintenance transfer",
    frequency: "monthly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Transferred on 1st of month, receipt downloaded and filed.",
    status: "pending"
  },
  {
    id: "task-12",
    domain: "admin",
    title: "Utility bills (electricity, water, piped gas)",
    frequency: "monthly",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Autopay active or paid 5 days before due date to avoid late fee.",
    status: "completed"
  },
  {
    id: "task-13",
    domain: "admin",
    title: "Broadband wifi & mobile postpaid bills",
    frequency: "monthly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Autopay confirmed on credit card; zero downtime.",
    status: "completed"
  },
  {
    id: "task-14",
    domain: "admin",
    title: "Health & term insurance annual renewals",
    frequency: "monthly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Premium paid 15 days before grace period, 80D tax certificate saved.",
    status: "pending"
  },
  {
    id: "task-15",
    domain: "admin",
    title: "Vehicle insurance & annual maintenance service",
    frequency: "monthly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Insurance policy renewed; car/bike serviced at authorized center.",
    status: "pending"
  },
  {
    id: "task-16",
    domain: "admin",
    title: "Vehicle PUC (Pollution Check) & FASTag balance",
    frequency: "monthly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "PUC certificate active and stored in glovebox/DigiLocker; FASTag topped up > ₹1,000.",
    status: "completed"
  },
  {
    id: "task-17",
    domain: "repairs",
    title: "AC servicing & filter cleaning",
    frequency: "as_needed",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Technicians booked before summer heatwaves; filters washed quarterly.",
    status: "pending"
  },
  {
    id: "task-18",
    domain: "repairs",
    title: "Plumbing, leaks & electrical fixes",
    frequency: "as_needed",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Technician booked within 24h of noticing any dripping tap or faulty switch.",
    status: "pending"
  },
  {
    id: "task-19",
    domain: "repairs",
    title: "Appliance AMC & warranty tracking",
    frequency: "as_needed",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Invoice & warranty card logged; AMC renewed before expiry.",
    status: "completed"
  },
  {
    id: "task-20",
    domain: "laundry",
    title: "Washing machine cycles, drying & wardrobe sorting",
    frequency: "weekly",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Clothes washed, dried, and folded in respective cupboards.",
    status: "pending"
  },
  {
    id: "task-21",
    domain: "laundry",
    title: "Ironing / Dhobi pickup and delivery coordination",
    frequency: "weekly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Clothes counted, sent, received back, and paid on delivery.",
    status: "completed"
  },
  {
    id: "task-22",
    domain: "family",
    title: "Pediatrician / vet vaccines & health checkups",
    frequency: "as_needed",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Appointments scheduled 2 weeks in advance; vaccine card updated.",
    status: "pending"
  },
  {
    id: "task-23",
    domain: "family",
    title: "School / Activity fees & supplies",
    frequency: "monthly",
    primaryOwner: "Partner B",
    backupOwner: "Partner A",
    definitionOfDone: "Term fees paid before deadline; books and uniforms organized.",
    status: "completed"
  },
  {
    id: "task-24",
    domain: "family",
    title: "Guest arrival prep & fresh linens check",
    frequency: "as_needed",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Guest bedroom cleaned, fresh towels laid, toiletries stocked.",
    status: "completed"
  },
  {
    id: "task-25",
    domain: "family",
    title: "First aid box & medicine cabinet expiry audit",
    frequency: "monthly",
    primaryOwner: "Partner A",
    backupOwner: "Partner B",
    definitionOfDone: "Expired meds safely discarded; bandages, paracetamol, ORS restocked.",
    status: "pending"
  }
];

export const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: "exp-01", bucket: "Fixed", itemName: "Rent / Society Maintenance", amount: 45000, notes: "Due on 1st" },
  { id: "exp-02", bucket: "Fixed", itemName: "Cook Salary", amount: 10000, notes: "Transfer on 2nd" },
  { id: "exp-03", bucket: "Fixed", itemName: "Maid / Cleaning Staff Salary", amount: 6000, notes: "Transfer on 2nd" },
  { id: "exp-04", bucket: "Fixed", itemName: "Electricity & Piped Gas Bills", amount: 4500, notes: "Autopay active" },
  { id: "exp-05", bucket: "Fixed", itemName: "Broadband Wifi & Mobile Bills", amount: 2200, notes: "Autopay active" },
  { id: "exp-06", bucket: "Variable", itemName: "Groceries & Kitchen Staples", amount: 16000, notes: "Weekly shopping" },
  { id: "exp-07", bucket: "Variable", itemName: "Fresh Vegetables & Milk", amount: 6000, notes: "Quick commerce 2x/wk" },
  { id: "exp-08", bucket: "Variable", itemName: "Household Supplies & Toiletries", amount: 3500, notes: "Detergent, soap, etc." },
  { id: "exp-09", bucket: "Variable", itemName: "Repairs & Minor Maintenance", amount: 2500, notes: "Plumber/Electrician pool" }
];

export const DEFAULT_DOCUMENTS: DocumentPointer[] = [
  {
    id: "doc-01",
    documentName: "Passports (All Family Members)",
    category: "identity",
    physicalLocation: "Master Bedroom Shelf -> Blue Sleeve 1",
    digilockerSync: true,
    expiryDate: "2031-08-15",
    isEmergencyICE: false
  },
  {
    id: "doc-02",
    documentName: "Aadhaar & PAN Cards",
    category: "identity",
    physicalLocation: "Master Bedroom Shelf -> Blue Sleeve 2",
    digilockerSync: true,
    isEmergencyICE: false
  },
  {
    id: "doc-03",
    documentName: "Health Insurance Cards & Policy TPA",
    category: "medical",
    physicalLocation: "Master Bedroom Shelf -> Red Sleeve 1 (Front)",
    digilockerSync: true,
    expiryDate: "2027-04-30",
    isEmergencyICE: true
  },
  {
    id: "doc-04",
    documentName: "Vaccination & Blood Group Records",
    category: "medical",
    physicalLocation: "Master Bedroom Shelf -> Red Sleeve 2",
    digilockerSync: false,
    isEmergencyICE: true
  },
  {
    id: "doc-05",
    documentName: "Apartment Rental Deed / Title Agreement",
    category: "property",
    physicalLocation: "Study Cabinet -> Green Sleeve 1",
    digilockerSync: false,
    expiryDate: "2027-02-28",
    isEmergencyICE: false
  },
  {
    id: "doc-06",
    documentName: "Car / Bike Registration (RC Smart Card)",
    category: "vehicle",
    physicalLocation: "Vehicle Glovebox / Yellow Sleeve 1",
    digilockerSync: true,
    isEmergencyICE: false
  },
  {
    id: "doc-07",
    documentName: "Vehicle Insurance Policy & PUC Slip",
    category: "vehicle",
    physicalLocation: "Vehicle Glovebox / Yellow Sleeve 2",
    digilockerSync: true,
    expiryDate: "2027-01-15",
    isEmergencyICE: false
  },
  {
    id: "doc-08",
    documentName: "Marriage Certificate",
    category: "identity",
    physicalLocation: "Master Bedroom Shelf -> Blue Sleeve 3",
    digilockerSync: true,
    isEmergencyICE: false
  }
];

export const DEFAULT_EMERGENCY: EmergencyInfo = {
  primaryContactName: "Rahul Sharma (Partner)",
  primaryContactPhone: "+91 98765 43210",
  secondaryContactName: "Anita Sharma (Mother)",
  secondaryContactPhone: "+91 98111 22233",
  familyDoctorName: "Dr. K. Mehta (General Physician)",
  familyDoctorPhone: "+91 98222 33445",
  preferredHospital: "Fortis Hospital, Bannerghatta (ER: 080-66214444)",
  tpaHelpline: "1800-102-4488 (Medi Assist TPA)",
  healthInsurancePolicyNo: "HDFC ERGO Optima Secure #2828-9918-0012",
  bloodGroups: [
    { name: "Partner A", group: "O Positive (O+)" },
    { name: "Partner B", group: "B Positive (B+)" }
  ]
};
