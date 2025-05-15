import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  pocName: { type: String, required: true },
  pocContact: { type: String, required: true },
  type: {
    type: String,
    enum: ['BROKER', 'LENDER'],
    required: true
  },
  website: { type: String },
  companyName: { type: String, required: true },
  companyNumber: { type: String },
  address: { type: String },
  country: { type: String },
  isActive: { type: Boolean, default: true },
  onboardedAt: Number,
  carFinanceDomain: { type: Boolean, default: false },
  propertyFinanceDomain: { type: Boolean, default: false },
  smeFinanceDomain: { type: Boolean, default: false },
  clientCode: {
    type: String,
    required: true,
    unique: true
  },
  ruleCriteria: {
    minimumCompanyAge: {
      minimumAge: Number
    },
    loanAmountRequired: {
      lowerBound: Number,
      upperBound: Number
    }
  },
  detailsRequired: [{
    category: String,
    detailRequired: [{
      datapoint: String,
      id: String,
      prev: String,
      questionText: String,
      options: mongoose.Schema.Types.Mixed,
      branchingRule: mongoose.Schema.Types.Mixed,
      next_anyway: [String],
      extract_only: Boolean,
      extract_externally: Boolean,
      default_value: String,
      default_from_datapoint: String,
      extraction_notes: String,
      invalid_reason: String
    }]
  }],
  adminEmail: [String],
  unified: {
    messaging: String,
    crm: [{
      app: String,
      connectionId: String,
      isActive: Boolean,
      updatedDate: Number,
      apiKey: String
    }]
  },
  enquireEmail: String,
  emailAction: String,
  emailDomain: { type: String, required: true, unique: true },
  custom_fields: [{
    custom_field_name: String,
    normilized_field_name: String,
    custom_field_id: String
  }],
  responsePrompts: {
    generalCase: String,
    noNextQuestionsCase: String,
    irrelevantCase: String
  },
  formEmail: [String],
  nylasGrantId: String,
  followUpConfig: {
    isActive: Boolean,
    configType: String,
    flatGapInterval: [Number],
    noOfFollowUps: Number
  },
  irrelevancyConfig: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

export default mongoose.models.Client || mongoose.model('Client', clientSchema); 