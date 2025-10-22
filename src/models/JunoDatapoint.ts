import mongoose from 'mongoose';

const junoDatapointSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  category: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [String],
  specificParsingRules: String,
  branchingRule: String, // Store as JSON string, will be parsed when used
}, { 
  timestamps: true,
  collection: 'junoDatapoints'
});

export default mongoose.models.JunoDatapoint || mongoose.model('JunoDatapoint', junoDatapointSchema); 