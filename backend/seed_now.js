/**
 * seed_now.js — Run this ONCE to force all 6 departments + employees into MongoDB.
 * Usage: node seed_now.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const Department = require("./models/Department");
const Employee = require("./models/Employee");

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/AI-Grievance-DB";

const departments = [
  {
    departmentId: "DEPT-WAT-01",
    departmentName: "Water Supply Department",
    headOfficer: "Assistant Engineer",
    contact: "Phone: +91 11 2345 6701 | Email: watersupply@smartcity.gov.in | Location: Ground Floor, Civic Center",
    employees: 26,
    salary: "₹25,000 - ₹80,000",
    workingHours: "9 AM - 5 PM",
    sla: "24 Hours",
    complaints: 12,
    performance: 4.5,
    status: "Active"
  },
  {
    departmentId: "DEPT-ELE-02",
    departmentName: "Electricity Department",
    headOfficer: "Electrical Engineer",
    contact: "Phone: +91 11 2345 6702 | Email: electricity@smartcity.gov.in | Location: 1st Floor, Energy Bhawan",
    employees: 39,
    salary: "₹26,000 - ₹85,000",
    workingHours: "Office: 9 AM - 5 PM | Emergency: 24 Hours",
    sla: "12 Hours",
    complaints: 18,
    performance: 4.2,
    status: "Active"
  },
  {
    departmentId: "DEPT-ROD-03",
    departmentName: "Road and Transport Department",
    headOfficer: "Civil Engineer",
    contact: "Phone: +91 11 2345 6703 | Email: roadtransport@smartcity.gov.in | Location: 3rd Floor, Transport Annex",
    employees: 38,
    salary: "₹20,000 - ₹90,000",
    workingHours: "8 AM - 5 PM",
    sla: "7 Days",
    complaints: 9,
    performance: 4.0,
    status: "Active"
  },
  {
    departmentId: "DEPT-SAN-04",
    departmentName: "Sanitation Department",
    headOfficer: "Sanitary Officer",
    contact: "Phone: +91 11 2345 6704 | Email: sanitation@smartcity.gov.in | Location: Basement, Municipal Complex",
    employees: 60,
    salary: "₹18,000 - ₹75,000",
    workingHours: "Morning Shift: 6 AM - 2 PM | Evening Shift: 2 PM - 10 PM",
    sla: "24 Hours",
    complaints: 25,
    performance: 4.6,
    status: "Active"
  },
  {
    departmentId: "DEPT-HEA-05",
    departmentName: "Health Department",
    headOfficer: "Medical Officer",
    contact: "Phone: +91 11 2345 6705 | Email: health@smartcity.gov.in | Location: Smart City General Hospital",
    employees: 45,
    salary: "₹25,000 - ₹1,10,000",
    workingHours: "24/7 Operations",
    sla: "12 Hours",
    complaints: 15,
    performance: 4.8,
    status: "Active"
  },
  {
    departmentId: "DEPT-REV-06",
    departmentName: "Revenue Department",
    headOfficer: "Revenue Officer",
    contact: "Phone: +91 11 2345 6706 | Email: revenue@smartcity.gov.in | Location: 2nd Floor, Treasury Office",
    employees: 20,
    salary: "₹22,000 - ₹95,000",
    workingHours: "10 AM - 5 PM",
    sla: "48 Hours",
    complaints: 6,
    performance: 4.4,
    status: "Active"
  }
];

const firstNames = ["Raj","Amit","Sanjay","Anil","Sunil","Vijay","Vikram","Ramesh","Suresh","Karan","Rahul","Priya","Neha","Kiran","Deepak","Sandip","Arvind","Manoj","Ajay","Jyoti","Sunita","Rakesh","Ganesh","Dinesh","Mahesh","Sita","Gita","Radha","Mohan","Krishna"];
const lastNames  = ["Kumar","Sharma","Patel","Joshi","Deshmukh","Singh","Prabhu","Sinha","Patil","Dutt","Johar","Gadkari","Goyal","Gill","Pandya","Bumrah","Thackeray","Soman","Hegde","Kher","Trehan","Nair","Iyer","Rao","Reddy","Mehta","Chawla","Sen","Das","Banerjee"];
let nameIdx = 0;
const nextName = () => {
  const f = firstNames[nameIdx % firstNames.length];
  const l = lastNames[Math.floor(nameIdx / firstNames.length) % lastNames.length];
  nameIdx++;
  return `${f} ${l}`;
};

const deptRoles = {
  "Water Supply Department":  [
    { role:"Department Head", salary:80000, shift:"9 AM - 5 PM", count:1 },
    { role:"Engineer", salary:60000, shift:"9 AM - 5 PM", count:2 },
    { role:"Officer", salary:45000, shift:"9 AM - 5 PM", count:3 },
    { role:"Technician", salary:30000, shift:"9 AM - 5 PM", count:8 },
    { role:"Field Worker", salary:25000, shift:"9 AM - 5 PM", count:10 },
    { role:"Data Entry Operator", salary:25000, shift:"9 AM - 5 PM", count:2 }
  ],
  "Electricity Department": [
    { role:"Department Head", salary:85000, shift:"9 AM - 5 PM", count:2 },
    { role:"Officer", salary:50000, shift:"9 AM - 5 PM", count:4 },
    { role:"Technician", salary:35000, shift:"24 Hours Shift", count:8 },
    { role:"Field Worker", salary:27000, shift:"24 Hours Shift", count:22 },
    { role:"Data Entry Operator", salary:25000, shift:"9 AM - 5 PM", count:3 }
  ],
  "Road and Transport Department": [
    { role:"Department Head", salary:90000, shift:"8 AM - 5 PM", count:3 },
    { role:"Officer", salary:48000, shift:"8 AM - 5 PM", count:4 },
    { role:"Supervisor", salary:40000, shift:"8 AM - 5 PM", count:5 },
    { role:"Technician", salary:35000, shift:"8 AM - 5 PM", count:6 },
    { role:"Field Worker", salary:20000, shift:"8 AM - 5 PM", count:20 }
  ],
  "Sanitation Department": [
    { role:"Department Head", salary:75000, shift:"Morning Shift", count:2 },
    { role:"Supervisor", salary:38000, shift:"Evening Shift", count:5 },
    { role:"Field Worker", salary:18000, shift:"Morning Shift", count:53 }
  ],
  "Health Department": [
    { role:"Department Head", salary:110000, shift:"Rotational 24/7", count:2 },
    { role:"Officer", salary:40000, shift:"9 AM - 5 PM", count:10 },
    { role:"Technician", salary:40000, shift:"Rotational 24/7", count:13 },
    { role:"Field Worker", salary:25000, shift:"9 AM - 5 PM", count:20 }
  ],
  "Revenue Department": [
    { role:"Department Head", salary:95000, shift:"10 AM - 5 PM", count:2 },
    { role:"Officer", salary:50000, shift:"10 AM - 5 PM", count:3 },
    { role:"Data Entry Operator", salary:30000, shift:"10 AM - 5 PM", count:5 },
    { role:"Field Worker", salary:25000, shift:"10 AM - 5 PM", count:10 }
  ]
};

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to MongoDB:", MONGO_URL);

  // Wipe existing departments and employees
  await Department.deleteMany({});
  await Employee.deleteMany({});
  console.log("🗑️  Cleared old departments and employees");

  // Drop unique indexes to prevent conflicts, then re-insert
  await Department.insertMany(departments);
  console.log(`✅ Inserted ${departments.length} departments:`);
  departments.forEach(d => console.log(`   - ${d.departmentName} (${d.departmentId})`));

  // Build employees for all 6 departments
  const employeesToInsert = [];
  for (const dept of departments) {
    const roles = deptRoles[dept.departmentName] || [];
    const prefix = dept.departmentId.split("-")[1];
    let empCount = 1;
    for (const r of roles) {
      for (let i = 0; i < r.count; i++) {
        const idNum = String(empCount).padStart(3, "0");
        employeesToInsert.push({
          employeeId: `EMP-${prefix}-${idNum}`,
          name: nextName(),
          department: dept.departmentName,
          role: r.role,
          salary: r.salary,
          shift: r.shift,
          availability: "Available",
          performance: Math.floor(Math.random() * 2) + 4
        });
        empCount++;
      }
    }
  }
  await Employee.insertMany(employeesToInsert);
  console.log(`✅ Inserted ${employeesToInsert.length} employees across all departments`);

  await mongoose.disconnect();
  console.log("\n🎉 Database seeding complete! Refresh the admin dashboard to see all 6 departments.");
}

main().catch(err => {
  console.error("❌ Seeding failed:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
