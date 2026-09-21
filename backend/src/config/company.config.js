/**
 * Central Company Configuration
 * Client: Jay Malhar Udyog Samuha
 * Contact Person: Mr. Abhishek Satav
 * 
 * CRITICAL DISCIPLINE:
 * Never invent client data (addresses, phone numbers, emails, GST, bank details, awards, statistics).
 * Values marked as [[PENDING]] are intended for client review and replacement.
 * Business 3 is strictly "Jay Malhar Suppliers & Traders" across all records and interfaces.
 */

module.exports = {
  groupName: "Jay Malhar Udyog Samuha",
  tagline: "Reliable Construction Equipments, Renewable Solar Energy & Premium Building Material Supply",
  contactPerson: "Mr. Abhishek Satav",
  phone: "[[CLIENT_PHONE_PENDING]]",
  email: "[[CLIENT_EMAIL_PENDING]]",
  address: "[[CLIENT_ADDRESS_PENDING]]",
  region: "Maharashtra, India",
  gstin: "[[GSTIN_PENDING]]",
  pan: "[[PAN_PENDING]]",
  bank: {
    name: "[[PENDING]]",
    accountNumber: "[[PENDING]]",
    ifsc: "[[PENDING]]",
    branch: "[[PENDING]]"
  },
  operatingHours: "Monday to Saturday: 8:00 AM – 8:00 PM | Sunday: On Call",
  divisions: [
    {
      key: "construction",
      name: "Jay Malhar Construction Equipments",
      shortName: "JM Construction Equipments",
      badge: "Heavy Machinery & Rentals",
      description: "Comprehensive construction equipment rentals, heavy soil compressors, machinery availability, return tracking, and on-site servicing.",
      accentColor: "#D97706", // Amber / Saffron
      prefix: "JM-CE"
    },
    {
      key: "solar",
      name: "Sundatta Renewables",
      shortName: "Sundatta Renewables",
      badge: "Clean Solar Energy",
      description: "Residential, commercial, and agricultural solar rooftop installations, tier-1 panel systems, net metering, and government subsidy assistance.",
      accentColor: "#059669", // Solar Green / Emerald
      prefix: "SR"
    },
    {
      key: "suppliers",
      name: "Jay Malhar Suppliers & Traders",
      shortName: "JM Suppliers & Traders",
      badge: "Materials & Logistics",
      description: "High-grade crushing stones, washed sand, construction aggregates, raw materials, volume estimation, and prompt site dispatch.",
      accentColor: "#4B5563", // Industrial Stone Grey
      prefix: "JM-ST"
    }
  ]
};
