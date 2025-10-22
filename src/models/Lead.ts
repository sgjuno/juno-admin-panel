import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  threadId: string;
  status: string;
  clientId: any;
  clientCode: string;
  details: any[];
  isActive: boolean;
  dashboardMetadata?: any;
  createdAt: number;
  updatedAt: number;
  emailThread?: any[];
  eSignature?: any[];
  summaryThreadId?: string;
  propertyEnrichmentData?: any;
  summaryEmail?: string;
  pipedrive_company_id?: string;
  pipedrive_lead_id?: string;
}

const LeadSchema: Schema = new Schema({
  threadId: { type: String, required: true },
  status: { type: String, required: true },
  clientId: { type: Schema.Types.Mixed, required: true },
  clientCode: { type: String, required: true },
  details: { type: [Schema.Types.Mixed], required: true },
  isActive: { type: Boolean, required: true },
  dashboardMetadata: { type: Schema.Types.Mixed },
  createdAt: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
  emailThread: { type: [Schema.Types.Mixed] },
  eSignature: { type: [Schema.Types.Mixed] },
  summaryThreadId: { type: String },
  propertyEnrichmentData: { type: Schema.Types.Mixed },
  summaryEmail: { type: String },
  pipedrive_company_id: { type: String },
  pipedrive_lead_id: { type: String },
});

export default mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema); 