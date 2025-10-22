import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

// Convert nested object structure to array structure for backward compatibility
function convertDetailsRequiredToArray(detailsRequired: any): any[] {
  if (!detailsRequired) return [];

  // Handle old array format
  if (Array.isArray(detailsRequired)) {
    return detailsRequired;
  }

  // Handle empty object
  if (typeof detailsRequired === 'object' && Object.keys(detailsRequired).length === 0) {
    return [];
  }

  // Handle new nested object format
  if (typeof detailsRequired === 'object') {
    // Add secondApplicantDetails to valid categories
    const validCategoryNames = [
      'brokerDetails', 'companyDetails', 'propertyDetails', 'loanType',
      'leadApplicantDetails', 'secondApplicantDetails', 'applicantDetails',
      'loanDetails', 'financialDetails'
    ];

    return Object.entries(detailsRequired)
      .filter(([category, details]) => {
        // Filter out non-category fields like _id, detailRequired, etc.
        if (category.startsWith('_') || category === 'detailsRequired' || 
            !details || typeof details !== 'object' || Array.isArray(details)) {
          return false;
        }
        
        // Check if this is a known category name OR if it looks like a category with data points
        const isKnownCategory = validCategoryNames.includes(category);
        const hasDataPoints = Object.values(details).some(value => 
          value && typeof value === 'object' && !Array.isArray(value) && 
          (value.questionText || value.options || value.extraction_notes || value.extract_externally !== undefined)
        );
        
        return isKnownCategory || hasDataPoints;
      })
      .map(([category, details]) => ({
        category,
        detailRequired: Object.entries(details as Record<string, any>)
          .filter(([datapoint, config]) => {
            // Filter out non-datapoint fields
            return config && typeof config === 'object' && !Array.isArray(config) && !datapoint.startsWith('_');
          })
          .map(([datapoint, config]) => ({
            datapoint,
            id: datapoint,
            prev: config.prev || null,
            questionText: config.questionText || '',
            options: config.options || {},
            branchingRule: config.branchingRule || {},
            next_anyway: config.next_anyway || [],
            extract_only: config.extract_only || false,
            extract_externally: config.extract_externally || false,
            default_value: config.default_value || '',
            default_from_datapoint: config.default_from_datapoint || '',
            extraction_notes: config.extraction_notes || '',
            invalid_reason: config.invalid_reason || ''
          }))
      }));
  }
  
  return [];
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ clientId: string }> }
) {
  try {
    await connectDB();
    const params = await context.params;
    const { clientId } = params;
    console.log('Config API - Fetching client:', clientId);

    const client: any = await Client.findById(clientId).select('detailsRequired').lean();
    console.log('Config API - Client found:', !!client);
    console.log('Config API - Raw detailsRequired type:', typeof client?.detailsRequired);
    console.log('Config API - Raw detailsRequired keys:', client?.detailsRequired ? Object.keys(client.detailsRequired) : 'none');

    if (!client) {
      console.log('Config API - Client not found for ID:', clientId);
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Convert to array format for backward compatibility
    const convertedDetails = convertDetailsRequiredToArray(client.detailsRequired);
    console.log('Config API - Converted details count:', convertedDetails.length);
    console.log('Config API - Converted categories:', convertedDetails.map(c => c.category));
    console.log('Config API - First category details:', convertedDetails[0]?.detailRequired?.length || 0, 'datapoints');

    // Always return a valid response even if detailsRequired is empty
    return NextResponse.json({ detailsRequired: convertedDetails || [] });
  } catch (error) {
    console.error('Error fetching client config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client configuration' },
      { status: 500 }
    );
  }
}

// Convert array structure back to nested object structure
function convertArrayToDetailsRequired(categories: any[]): Record<string, Record<string, any>> {
  const result: Record<string, Record<string, any>> = {};
  
  if (!Array.isArray(categories)) return result;
  
  categories.forEach(category => {
    if (category.category && Array.isArray(category.detailRequired)) {
      result[category.category] = {};
      category.detailRequired.forEach((detail: any) => {
        if (detail.datapoint || detail.id) {
          const datapointKey = detail.datapoint || detail.id;
          const detailConfig: any = {};
          
          if (detail.questionText) detailConfig.questionText = detail.questionText;
          if (detail.options && Object.keys(detail.options).length > 0) detailConfig.options = detail.options;
          if (detail.branchingRule && Object.keys(detail.branchingRule).length > 0) detailConfig.branchingRule = detail.branchingRule;
          if (detail.extract_externally) detailConfig.extract_externally = detail.extract_externally;
          if (detail.default_from_datapoint) detailConfig.default_from_datapoint = detail.default_from_datapoint;
          if (detail.extraction_notes) detailConfig.extraction_notes = detail.extraction_notes;
          if (detail.prev) detailConfig.prev = detail.prev;
          if (detail.extract_only) detailConfig.extract_only = detail.extract_only;
          if (detail.default_value) detailConfig.default_value = detail.default_value;
          if (detail.invalid_reason) detailConfig.invalid_reason = detail.invalid_reason;
          if (detail.next_anyway && detail.next_anyway.length > 0) detailConfig.next_anyway = detail.next_anyway;
          
          result[category.category][datapointKey] = detailConfig;
        }
      });
    }
  });
  
  return result;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ clientId: string }> }) {
  try {
    await connectDB();
    const params = await context.params;
    const { clientId } = params;
    const data = await request.json();
    
    console.log('Config route - Incoming data:', JSON.stringify(data, null, 2));
    
    const updateData: any = {};
    
    if (data.detailsRequired !== undefined) {
      // Convert array format to nested object format for storage
      updateData.detailsRequired = convertArrayToDetailsRequired(data.detailsRequired);
    }
    
    console.log('Config route - Update data to be applied:', JSON.stringify(updateData, null, 2));
    
    const client = await Client.findByIdAndUpdate(clientId, { $set: updateData }, { new: true });
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    console.log('Config route - Updated client:', JSON.stringify(client, null, 2));
    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Error updating client config:', error);
    return NextResponse.json(
      { error: 'Failed to update client configuration' },
      { status: 500 }
    );
  }
} 