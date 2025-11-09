export const products = [
  { id: 1, name: "Wireless Mouse", category: "Electronics", price: 29.99, stock: 45, threshold: 20, sku: "WM-001" },
  { id: 2, name: "USB-C Cable", category: "Electronics", price: 12.99, stock: 8, threshold: 15, sku: "UC-002" },
  { id: 3, name: "Notebook A5", category: "Stationery", price: 4.99, stock: 120, threshold: 30, sku: "NB-003" },
  { id: 4, name: "Blue Pen", category: "Stationery", price: 1.49, stock: 15, threshold: 50, sku: "BP-004" },
  { id: 5, name: "Desk Lamp", category: "Furniture", price: 45.99, stock: 12, threshold: 10, sku: "DL-005" },
  { id: 6, name: "Ergonomic Chair", category: "Furniture", price: 299.99, stock: 3, threshold: 5, sku: "EC-006" },
  { id: 7, name: "HD Webcam", category: "Electronics", price: 79.99, stock: 25, threshold: 15, sku: "HW-007" },
  { id: 8, name: "Whiteboard", category: "Office", price: 89.99, stock: 7, threshold: 8, sku: "WB-008" },
];

export const suppliers = [
  { id: 1, name: "TechSupply Co.", contact: "contact@techsupply.com", phone: "+1-555-0101", lastSupplied: "2024-11-01" },
  { id: 2, name: "Office Essentials Ltd", contact: "sales@officeessentials.com", phone: "+1-555-0202", lastSupplied: "2024-10-28" },
  { id: 3, name: "Furniture Direct", contact: "info@furnituredirect.com", phone: "+1-555-0303", lastSupplied: "2024-10-15" },
  { id: 4, name: "Gadget World", contact: "support@gadgetworld.com", phone: "+1-555-0404", lastSupplied: "2024-11-05" },
];

export const transactions = [
  { id: 1, productId: 2, productName: "USB-C Cable", quantity: -5, reason: "Sale", date: "2024-11-07", user: "John Doe" },
  { id: 2, productId: 4, productName: "Blue Pen", quantity: -20, reason: "Sale", date: "2024-11-07", user: "Jane Smith" },
  { id: 3, productId: 7, productName: "HD Webcam", quantity: 30, reason: "Purchase", date: "2024-11-06", user: "Admin" },
  { id: 4, productId: 1, productName: "Wireless Mouse", quantity: -8, reason: "Sale", date: "2024-11-06", user: "John Doe" },
  { id: 5, productId: 6, productName: "Ergonomic Chair", quantity: -2, reason: "Sale", date: "2024-11-05", user: "Jane Smith" },
  { id: 6, productId: 3, productName: "Notebook A5", quantity: 50, reason: "Purchase", date: "2024-11-05", user: "Admin" },
  { id: 7, productId: 8, productName: "Whiteboard", quantity: -1, reason: "Damage", date: "2024-11-04", user: "John Doe" },
  { id: 8, productId: 5, productName: "Desk Lamp", quantity: 15, reason: "Purchase", date: "2024-11-03", user: "Admin" },
];

export const alerts = [
  { id: 1, productId: 2, productName: "USB-C Cable", currentStock: 8, threshold: 15, suggestedOrder: 20, status: "Pending" },
  { id: 2, productId: 4, productName: "Blue Pen", currentStock: 15, threshold: 50, suggestedOrder: 50, status: "Pending" },
  { id: 3, productId: 6, productName: "Ergonomic Chair", currentStock: 3, threshold: 5, suggestedOrder: 10, status: "Pending" },
  { id: 4, productId: 8, productName: "Whiteboard", currentStock: 7, threshold: 8, suggestedOrder: 5, status: "Pending" },
];

export const categoryData = [
  { category: "Electronics", value: 157, stock: 78 },
  { category: "Stationery", value: 135, stock: 135 },
  { category: "Furniture", value: 15, stock: 15 },
  { category: "Office", value: 7, stock: 7 },
];

export const stockMovementData = [
  { month: "May", sales: 120, purchases: 150 },
  { month: "Jun", sales: 145, purchases: 100 },
  { month: "Jul", sales: 160, purchases: 180 },
  { month: "Aug", sales: 135, purchases: 120 },
  { month: "Sep", sales: 178, purchases: 200 },
  { month: "Oct", sales: 190, purchases: 150 },
  { month: "Nov", sales: 165, purchases: 170 },
];

export const inventoryValueData = [
  { category: "Electronics", value: 8450 },
  { category: "Stationery", value: 1520 },
  { category: "Furniture", value: 4350 },
  { category: "Office", value: 890 },
];
