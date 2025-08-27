// apps/invoice-service/src/app/dto/invoice.dto.ts

export interface InvoiceItem {
  title: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface GenerateInvoiceDto {
  title: string;          // Invoice title
  headerInfo: string;     // Vendor/User or platform info
  items: InvoiceItem[];   // List of purchased items
  grandTotal: number;     // Final amount
  folder?: string;        // Cloudinary folder (default: 'invoices')
  filename?: string;      // Custom Cloudinary filename
  paymentLink?: string;   // Optional payment link
}
