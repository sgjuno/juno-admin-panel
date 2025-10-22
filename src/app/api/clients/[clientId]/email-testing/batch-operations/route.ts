import { NextRequest, NextResponse } from 'next/server';
import Client from '@/models/Client';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { EmailTestCase, EmailTestResult } from '@/types/Client';

interface BatchImportRequest {
  operation: 'import-test-cases' | 'export-test-cases' | 'bulk-execute';
  data?: any;
  format?: 'json' | 'csv';
  options?: {
    overwrite?: boolean;
    validateOnly?: boolean;
    batchSize?: number;
  };
}

interface BatchOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{
    index?: number;
    item?: any;
    error: string;
  }>;
  results?: any[];
}

// Utility functions for batch operations
function validateTestCase(testCase: any, index: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!testCase.name || typeof testCase.name !== 'string') {
    errors.push(`Test case ${index}: Missing or invalid 'name' field`);
  }

  if (!testCase.emailTemplate) {
    errors.push(`Test case ${index}: Missing 'emailTemplate' field`);
  } else {
    if (!testCase.emailTemplate.subject || typeof testCase.emailTemplate.subject !== 'string') {
      errors.push(`Test case ${index}: Missing or invalid 'emailTemplate.subject'`);
    }
    if (!testCase.emailTemplate.body || typeof testCase.emailTemplate.body !== 'string') {
      errors.push(`Test case ${index}: Missing or invalid 'emailTemplate.body'`);
    }
  }

  if (!testCase.expectedExtraction || typeof testCase.expectedExtraction !== 'object') {
    errors.push(`Test case ${index}: Missing or invalid 'expectedExtraction' field`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function parseCSVToTestCases(csvContent: string): any[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const testCases: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const testCase: any = {};

    headers.forEach((header, index) => {
      if (values[index]) {
        // Handle nested objects for email template and expected extraction
        if (header.startsWith('emailTemplate.')) {
          const field = header.split('.')[1];
          if (!testCase.emailTemplate) testCase.emailTemplate = {};
          testCase.emailTemplate[field] = values[index];
        } else if (header.startsWith('expectedExtraction.')) {
          const field = header.split('.')[1];
          if (!testCase.expectedExtraction) testCase.expectedExtraction = {};
          // Try to parse as number if it looks like one
          const numValue = parseFloat(values[index]);
          testCase.expectedExtraction[field] = isNaN(numValue) ? values[index] : numValue;
        } else if (header === 'metadata.difficulty') {
          if (!testCase.metadata) testCase.metadata = {};
          testCase.metadata.difficulty = values[index];
        } else {
          testCase[header] = values[index];
        }
      }
    });

    if (testCase.name) {
      testCases.push(testCase);
    }
  }

  return testCases;
}

function convertTestCasesToCSV(testCases: EmailTestCase[]): string {
  if (testCases.length === 0) return '';

  // Define standard headers
  const headers = [
    'name',
    'description',
    'category',
    'emailTemplate.subject',
    'emailTemplate.body',
    'metadata.difficulty'
  ];

  // Add dynamic headers for expected extraction fields
  const allExtractionFields = new Set<string>();
  testCases.forEach(tc => {
    if (tc.expectedExtraction) {
      Object.keys(tc.expectedExtraction).forEach(key => {
        allExtractionFields.add(`expectedExtraction.${key}`);
      });
    }
  });

  const finalHeaders = [...headers, ...Array.from(allExtractionFields)];

  // Create CSV content
  let csv = finalHeaders.map(h => `"${h}"`).join(',') + '\n';

  testCases.forEach(testCase => {
    const values: string[] = [];

    finalHeaders.forEach(header => {
      let value = '';

      if (header.startsWith('emailTemplate.')) {
        const field = header.split('.')[1];
        const templateValue = testCase.emailTemplate?.[field as keyof typeof testCase.emailTemplate];
        value = typeof templateValue === 'string' ? templateValue : JSON.stringify(templateValue || '');
      } else if (header.startsWith('expectedExtraction.')) {
        const field = header.split('.')[1];
        value = testCase.expectedExtraction?.[field] || '';
      } else if (header === 'metadata.difficulty') {
        value = testCase.metadata?.difficulty || '';
      } else {
        value = (testCase as any)[header] || '';
      }

      // Escape quotes and wrap in quotes
      values.push(`"${String(value).replace(/"/g, '""')}"`);
    });

    csv += values.join(',') + '\n';
  });

  return csv;
}

async function importTestCases(
  clientId: string,
  testCasesData: any[],
  options: { overwrite?: boolean; validateOnly?: boolean } = {}
): Promise<BatchOperationResult> {
  const result: BatchOperationResult = {
    success: false,
    processed: 0,
    failed: 0,
    errors: [],
    results: []
  };

  try {
    // Validate all test cases first
    const validationResults = testCasesData.map((testCase, index) =>
      validateTestCase(testCase, index)
    );

    const invalidItems = validationResults
      .map((validation, index) => ({ validation, index, item: testCasesData[index] }))
      .filter(({ validation }) => !validation.valid);

    if (invalidItems.length > 0) {
      result.errors = invalidItems.flatMap(({ validation, index, item }) =>
        validation.errors.map(error => ({ index, item, error }))
      );

      if (!options.validateOnly) {
        result.failed = invalidItems.length;
        return result;
      }
    }

    if (options.validateOnly) {
      result.success = true;
      result.processed = testCasesData.length - invalidItems.length;
      result.failed = invalidItems.length;
      return result;
    }

    // Process valid test cases
    const validTestCases = testCasesData.filter((_, index) =>
      validationResults[index].valid
    );

    const processedTestCases: EmailTestCase[] = validTestCases.map(testCase => ({
      ...testCase,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        difficulty: testCase.metadata?.difficulty || 'medium',
        successRate: 0,
        averageAccuracy: 0,
        ...testCase.metadata
      }
    }));

    // Update client document
    const updateOperation = options.overwrite
      ? {
          $set: {
            'emailTesting.testCases': processedTestCases,
            'emailTesting.isEnabled': true
          }
        }
      : {
          $push: {
            'emailTesting.testCases': { $each: processedTestCases }
          },
          $set: {
            'emailTesting.isEnabled': true
          }
        };

    await Client.findByIdAndUpdate(clientId, updateOperation);

    result.success = true;
    result.processed = processedTestCases.length;
    result.failed = invalidItems.length;
    result.results = processedTestCases;

  } catch (error) {
    console.error('Error importing test cases:', error);
    result.errors.push({ error: 'Database operation failed' });
  }

  return result;
}

async function exportTestCases(
  clientId: string,
  format: 'json' | 'csv' = 'json'
): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return { success: false, error: 'Client not found' };
    }

    const testCases = client.emailTesting?.testCases || [];

    if (format === 'csv') {
      const csvData = convertTestCasesToCSV(testCases);
      return { success: true, data: csvData };
    } else {
      return { success: true, data: JSON.stringify(testCases, null, 2) };
    }

  } catch (error) {
    console.error('Error exporting test cases:', error);
    return { success: false, error: 'Export operation failed' };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const requestData: BatchImportRequest = await request.json();
    const { clientId } = await params;

    // Validate client exists
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    switch (requestData.operation) {
      case 'import-test-cases': {
        if (!requestData.data) {
          return NextResponse.json(
            { error: 'No data provided for import' },
            { status: 400 }
          );
        }

        let testCasesData: any[];

        // Parse data based on format
        if (requestData.format === 'csv') {
          if (typeof requestData.data !== 'string') {
            return NextResponse.json(
              { error: 'CSV data must be provided as string' },
              { status: 400 }
            );
          }
          testCasesData = parseCSVToTestCases(requestData.data);
        } else {
          testCasesData = Array.isArray(requestData.data) ? requestData.data : [requestData.data];
        }

        const result = await importTestCases(
          clientId,
          testCasesData,
          requestData.options || {}
        );

        return NextResponse.json(result);
      }

      case 'export-test-cases': {
        const result = await exportTestCases(
          clientId,
          requestData.format || 'json'
        );

        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 500 }
          );
        }

        const filename = `test-cases-${clientId}-${Date.now()}.${requestData.format || 'json'}`;
        const contentType = requestData.format === 'csv'
          ? 'text/csv'
          : 'application/json';

        return new NextResponse(result.data, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`
          }
        });
      }

      case 'bulk-execute': {
        // This would typically queue multiple test cases for execution
        // For now, return a placeholder response
        return NextResponse.json({
          success: true,
          message: 'Bulk execution queued',
          queueId: uuidv4(),
          estimatedTime: '5-10 minutes'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Unknown operation' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in batch operations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const format = searchParams.get('format') as 'json' | 'csv' || 'json';

    if (operation === 'export-test-cases') {
      // Connect to MongoDB
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_URI!);
      }

      const result = await exportTestCases(clientId, format);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      const filename = `test-cases-${clientId}-${Date.now()}.${format}`;
      const contentType = format === 'csv' ? 'text/csv' : 'application/json';

      return new NextResponse(result.data, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    // Return available operations and their parameters
    return NextResponse.json({
      availableOperations: {
        'import-test-cases': {
          description: 'Import test cases from JSON or CSV',
          supportedFormats: ['json', 'csv'],
          options: ['overwrite', 'validateOnly', 'batchSize']
        },
        'export-test-cases': {
          description: 'Export test cases to JSON or CSV',
          supportedFormats: ['json', 'csv']
        },
        'bulk-execute': {
          description: 'Execute multiple test cases in batch',
          options: ['batchSize', 'parallelLimit']
        }
      },
      csvFormat: {
        requiredHeaders: [
          'name',
          'emailTemplate.subject',
          'emailTemplate.body',
          'expectedExtraction.*'
        ],
        optionalHeaders: [
          'description',
          'category',
          'metadata.difficulty'
        ],
        example: 'name,description,emailTemplate.subject,emailTemplate.body,expectedExtraction.loanAmount'
      }
    });

  } catch (error) {
    console.error('Error in batch operations GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}