export interface GenerateInvoiceDto {
  orderId: string;
  userId: string;
  vendorId: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  pdfBuffer: Buffer; // Buffer of invoice PDF
}
