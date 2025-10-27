export interface PurchaseOrder {
  id: string;
  poNumber: string;
  issueDate: string;
  dueDate?: string;
  supplier?: {
    company: string;
  };
  projectName: string;
  projectID: string;
  products: Array<{
    itemName: string;
    imageURL?: string;
    dimensions?: string;
    QTY: number;
    amount: string;
  }>;
  companyName: string;
  companyAddress: string;
  clientAddress: string;
  note?: string;
}
