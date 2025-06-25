export interface Client {
  _id?: string;
  pocName: string;
  pocContact: string;
  type: 'BROKER' | 'LENDER';
  website: string;
  companyName: string;
  companyNumber: string;
  address: string;
  country: string;
  isActive: boolean;
  carFinanceDomain: boolean;
  propertyFinanceDomain: boolean;
  smeFinanceDomain: boolean;
  clientCode: string;
  emailDomain: string;
  onboardedAt?: number;
} 