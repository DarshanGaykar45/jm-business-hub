/**
 * SECTION 2: REAL BUSINESS DATA (From Visiting Cards + Billboard)
 * Central Company Configuration for Jay Malhar Udyog Samuha
 */

const COMPANY_CONFIG = {
  groupName: "Jay Malhar Udyog Samuha",
  address: "Shriram Chowk, Pathre Budruk, Tal. Sinnar, Dist. Nashik",
  region: "Nashik & Sinnar Region, Maharashtra",
  contactPerson: "Abhishek Santosh Satav",
  proprietor: "Santosh Vaman Satav",
  primaryPhone: "9096547260",
  primaryWhatsapp: "9096547260",
  gstin: "[[GSTIN_PENDING]]",
  divisions: [
    {
      key: "construction",
      displayName: "Jay Malhar Construction",
      tagline: "Quality · Strength · Durability",
      proprietor: "Santosh Vaman Satav",
      contact: "Abhishek Santosh Satav",
      phones: ["9158494138", "9096547260"],
      whatsapp: "9096547260",
      description: "All types of murum (soil) compaction work at fair rates.",
      accentColor: "#F2A93B",
      prefix: "CONST",
      machines: [
        {
          name: "Tamping Rammer",
          id: "TR-001",
          specs: "3-5.5 HP, 80 kg weight, electric/petrol options",
          availability: "Available",
          rentalPrice: "₹1,200/day",
          depositRequired: "₹5,000",
          icon: "rammer"
        },
        {
          name: "Plate Compactor",
          id: "PC-001",
          specs: "5.5-6.5 HP, petrol/diesel/electric, 15-20 kN force",
          availability: "Available",
          rentalPrice: "₹1,500/day",
          depositRequired: "₹8,000",
          icon: "compactor"
        }
      ]
    },
    {
      key: "solar",
      displayName: "Sundatta Renewables",
      tagline: "Your Roof Your Power",
      contact: "Abhishek Satav",
      phones: ["7774855520", "9096547260"],
      whatsapp: "7774855520",
      description: "PM Surya Ghar Yojana approved solar installation.",
      accentColor: "#F59E0B",
      prefix: "SOLAR",
      subsidy: {
        lastUpdated: "2026-09-21",
        disclaimer: "Verify with official govt portal for latest rates.",
        schemes: [
          { capacity: "1 kW", subsidy: "₹30,000", warranty: "25 years" },
          { capacity: "2 kW", subsidy: "₹60,000", warranty: "25 years" },
          { capacity: "3-10 kW", subsidy: "₹78,000", warranty: "25 years" }
        ],
        generation: [
          { size: "1 kW", monthlyUnits: 120 },
          { size: "2 kW", monthlyUnits: 240 },
          { size: "3 kW", monthlyUnits: 360 },
          { size: "5 kW", monthlyUnits: 600 }
        ]
      },
      partners: ["Premier Energies", "Xwatt", "TATA", "Polycab", "Adani Solar", "Waaree"]
    },
    {
      key: "suppliers",
      displayName: "Jay Malhar Suppliers & Traders",
      tagline: "Quality Materials, Fair Prices",
      phones: ["[[PHONE_PENDING]]"],
      whatsapp: "9096547260",
      description: "Construction materials: crushing stones, sand, aggregates.",
      accentColor: "#8B6914",
      prefix: "SUPPL",
      materials: [
        { name: "Crushing Stones", unit: "Ton", availability: "In Stock", minOrder: "10 tons" },
        { name: "Sand (River/Coarse)", unit: "Cubic Feet", availability: "In Stock", minOrder: "100 cft" },
        { name: "Aggregates", unit: "Ton", availability: "In Stock", minOrder: "5 tons" }
      ]
    }
  ]
};

module.exports = COMPANY_CONFIG;
