export type UserRole = "admin" | "supplier";
export type AppView = "dashboard" | "projects" | "files" | "quotations" | "messages" | "shipping" | "ai";
export type ProjectStatus = "Inquiry" | "Technical Review" | "Quotation" | "Contract" | "Production" | "Shipping" | "Delivered";
export type Currency = "EUR" | "PLN" | "USD";

export type DemoUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  company: string;
  position: string;
};

export type Project = {
  id: number;
  name: string;
  client: string;
  city: string;
  country: string;
  reference: string;
  supplier: string;
  status: ProjectStatus;
  value: number;
  currency: Currency;
  units: number;
  area: number;
  system: string;
  owner: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentCategory = "Architecture" | "Window schedule" | "Acoustics" | "Technical" | "Quotation" | "Calculation" | "Communication" | "Other";
export type DocumentStatus = "Available" | "Needs review" | "Reviewed";
export type DocumentItem = {
  id: number;
  projectId: number;
  name: string;
  category: DocumentCategory;
  fileType: string;
  folder: string;
  status: DocumentStatus;
  source: "Internal Team" | "Hansen";
  uploadedBy: string;
  uploadedAt: string;
  previewUrl?: string;
};

export type QuotationStatus = "Draft" | "Sent" | "Under review" | "Approved";
export type Quotation = {
  id: number;
  projectId: number;
  number: string;
  date: string;
  amount: number;
  currency: Currency;
  status: QuotationStatus;
  leadTime: string;
  deliveryTerms: string;
  validity: string;
  profileSystem: string;
  hardware: string;
  securityLevel: string;
};

export type ShipmentStatus = "Planning" | "Production" | "Ready" | "In transit" | "Delivered";
export type Shipment = {
  id: number;
  projectId: number;
  status: ShipmentStatus;
  plannedDispatch: string;
  eta: string;
  carrier: string;
  trackingNumber: string;
  deliveryAddress: string;
  notes: string;
  progress: number;
  updatedBy: string;
  updatedAt: string;
};

export type ShipmentHistory = {
  id: number;
  shipmentId: number;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
};

export type Message = {
  id: number;
  projectId: number;
  authorRole: UserRole;
  author: string;
  text: string;
  createdAt: string;
};

export type Activity = {
  id: number;
  projectId: number;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
};
