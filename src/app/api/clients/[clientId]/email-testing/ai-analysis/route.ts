import { NextRequest, NextResponse } from 'next/server';
import Client from '@/models/Client';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface AIAnalysisRequest {
  testResultId: string;
  expectedExtraction: Record<string, any>;
  actualExtraction: Record<string, any>;
  analysisType: 'accuracy' | 'confidence' | 'comprehensive';
  includeRecommendations?: boolean;
}

interface ValidationResult {
  field: string;
  expected: any;
  actual: any;
  match: boolean;
  confidence: number;
  similarity: number;
  issues?: string[];
}

interface AIAnalysisResult {
  analysisId: string;
  testResultId: string;
  overallAccuracy: number;
  overallConfidence: number;
  fieldValidations: ValidationResult[];
  recommendations: string[];
  insights: {
    commonErrors: string[];
    patternAnalysis: string[];
    improvementAreas: string[];
  };
  performance: {
    processingTime: number;
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  };
  analyzedAt: Date;
}

// Utility functions for AI analysis
function calculateSimilarity(expected: any, actual: any): number {
  if (typeof expected !== typeof actual) {
    return 0;
  }

  if (typeof expected === 'string' && typeof actual === 'string') {
    return calculateStringSimilarity(expected.toString(), actual.toString());
  }

  if (typeof expected === 'number' && typeof actual === 'number') {
    const diff = Math.abs(expected - actual);
    const max = Math.max(Math.abs(expected), Math.abs(actual));
    return max === 0 ? 1 : Math.max(0, 1 - (diff / max));
  }

  if (typeof expected === 'boolean' && typeof actual === 'boolean') {
    return expected === actual ? 1 : 0;
  }

  // For arrays and objects, do a simple stringified comparison
  try {
    const expectedStr = JSON.stringify(expected);
    const actualStr = JSON.stringify(actual);
    return calculateStringSimilarity(expectedStr, actualStr);
  } catch {
    return 0;
  }
}

function calculateStringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;

  // Normalize strings for comparison
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

  const norm1 = normalize(str1);
  const norm2 = normalize(str2);

  if (norm1 === norm2) return 0.95;

  // Levenshtein distance based similarity
  const matrix: number[][] = [];
  const len1 = norm1.length;
  const len2 = norm2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (norm1[i - 1] === norm2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  const maxLen = Math.max(len1, len2);
  return Math.max(0, 1 - (matrix[len1][len2] / maxLen));
}

function identifyIssues(field: string, expected: any, actual: any, similarity: number): string[] {
  const issues: string[] = [];

  if (typeof expected !== typeof actual) {
    issues.push(`Type mismatch: expected ${typeof expected}, got ${typeof actual}`);
  }

  if (typeof expected === 'string' && typeof actual === 'string') {
    const expectedStr = expected.toString();
    const actualStr = actual.toString();

    if (similarity < 0.5) {
      issues.push('Low similarity between expected and actual text');
    }

    if (expectedStr.length > 0 && actualStr.length === 0) {
      issues.push('Missing extraction - no value found');
    }

    if (expectedStr.length === 0 && actualStr.length > 0) {
      issues.push('Unexpected extraction - value found when none expected');
    }

    if (Math.abs(expectedStr.length - actualStr.length) > expectedStr.length * 0.5) {
      issues.push('Significant length difference between expected and actual');
    }

    // Check for common patterns
    if (field.toLowerCase().includes('amount') || field.toLowerCase().includes('value')) {
      const expectedNums = expectedStr.match(/[\d,]+/g);
      const actualNums = actualStr.match(/[\d,]+/g);
      if (expectedNums && !actualNums) {
        issues.push('Numeric value not extracted properly');
      }
    }

    if (field.toLowerCase().includes('date')) {
      const dateRegex = /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}-\d{2}-\d{2}/;
      if (dateRegex.test(expectedStr) && !dateRegex.test(actualStr)) {
        issues.push('Date format not recognized correctly');
      }
    }

    if (field.toLowerCase().includes('email')) {
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      if (emailRegex.test(expectedStr) && !emailRegex.test(actualStr)) {
        issues.push('Email address not extracted correctly');
      }
    }
  }

  if (typeof expected === 'number' && typeof actual === 'number') {
    const diff = Math.abs(expected - actual);
    const threshold = Math.max(expected * 0.1, 1); // 10% or minimum 1

    if (diff > threshold) {
      issues.push(`Numeric value differs by ${diff.toFixed(2)} (expected: ${expected}, actual: ${actual})`);
    }
  }

  return issues;
}

function generateRecommendations(validations: ValidationResult[]): string[] {
  const recommendations: string[] = [];
  const lowAccuracyFields = validations.filter(v => v.similarity < 0.7);
  const failedExtractions = validations.filter(v => !v.match);

  if (failedExtractions.length > validations.length * 0.3) {
    recommendations.push('High failure rate detected. Consider reviewing extraction prompts and templates.');
  }

  if (lowAccuracyFields.length > 0) {
    const fieldNames = lowAccuracyFields.map(f => f.field).join(', ');
    recommendations.push(`Low accuracy fields (${fieldNames}) may need specialized extraction patterns.`);
  }

  // Check for patterns in failed fields
  const dateFields = failedExtractions.filter(v => v.field.toLowerCase().includes('date'));
  if (dateFields.length > 0) {
    recommendations.push('Date extraction issues detected. Consider implementing date-specific parsing logic.');
  }

  const numericFields = failedExtractions.filter(v =>
    v.field.toLowerCase().includes('amount') ||
    v.field.toLowerCase().includes('value') ||
    v.field.toLowerCase().includes('rate')
  );
  if (numericFields.length > 0) {
    recommendations.push('Numeric field extraction issues. Review number recognition patterns and currency handling.');
  }

  const addressFields = failedExtractions.filter(v => v.field.toLowerCase().includes('address'));
  if (addressFields.length > 0) {
    recommendations.push('Address extraction problems detected. Consider using specialized address parsing libraries.');
  }

  // Performance recommendations
  const avgConfidence = validations.reduce((sum, v) => sum + v.confidence, 0) / validations.length;
  if (avgConfidence < 0.8) {
    recommendations.push('Overall confidence is low. Consider retraining models or adjusting extraction parameters.');
  }

  return recommendations;
}

function generateInsights(validations: ValidationResult[]): {
  commonErrors: string[];
  patternAnalysis: string[];
  improvementAreas: string[];
} {
  const allIssues = validations.flatMap(v => v.issues || []);
  const issueFrequency = allIssues.reduce((acc, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const commonErrors = Object.entries(issueFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([error, count]) => `${error} (${count} occurrences)`);

  const patternAnalysis: string[] = [];

  // Analyze field types and their success rates
  const fieldTypes = ['date', 'amount', 'name', 'address', 'email'];
  fieldTypes.forEach(type => {
    const typeFields = validations.filter(v => v.field.toLowerCase().includes(type));
    if (typeFields.length > 0) {
      const successRate = typeFields.filter(v => v.match).length / typeFields.length;
      patternAnalysis.push(`${type} fields: ${(successRate * 100).toFixed(1)}% success rate`);
    }
  });

  const improvementAreas: string[] = [];

  // Identify specific improvement areas
  const lowConfidenceFields = validations
    .filter(v => v.confidence < 0.7)
    .map(v => v.field);

  if (lowConfidenceFields.length > 0) {
    improvementAreas.push(`Low confidence extractions: ${lowConfidenceFields.join(', ')}`);
  }

  const highSimilarityButNoMatch = validations.filter(v => v.similarity > 0.8 && !v.match);
  if (highSimilarityButNoMatch.length > 0) {
    improvementAreas.push('Some extractions are very close but not exact matches - consider adjusting matching thresholds');
  }

  return {
    commonErrors,
    patternAnalysis,
    improvementAreas
  };
}

async function performAIAnalysis(
  expectedExtraction: Record<string, any>,
  actualExtraction: Record<string, any>,
  analysisType: string
): Promise<Omit<AIAnalysisResult, 'analysisId' | 'testResultId' | 'analyzedAt'>> {
  const startTime = Date.now();

  // Get all unique field names from both expected and actual
  const allFields = new Set([
    ...Object.keys(expectedExtraction),
    ...Object.keys(actualExtraction)
  ]);

  const fieldValidations: ValidationResult[] = [];

  // Analyze each field
  for (const field of allFields) {
    const expected = expectedExtraction[field];
    const actual = actualExtraction[field];

    const similarity = calculateSimilarity(expected, actual);
    const match = similarity > 0.85; // Configurable threshold
    const confidence = Math.min(similarity * 1.1, 1.0); // Slightly boost confidence
    const issues = identifyIssues(field, expected, actual, similarity);

    fieldValidations.push({
      field,
      expected,
      actual,
      match,
      confidence,
      similarity,
      issues: issues.length > 0 ? issues : undefined
    });
  }

  // Calculate overall metrics
  const overallAccuracy = fieldValidations.filter(v => v.match).length / fieldValidations.length;
  const overallConfidence = fieldValidations.reduce((sum, v) => sum + v.confidence, 0) / fieldValidations.length;

  // Generate recommendations and insights
  const recommendations = generateRecommendations(fieldValidations);
  const insights = generateInsights(fieldValidations);

  const processingTime = Date.now() - startTime;

  return {
    overallAccuracy,
    overallConfidence,
    fieldValidations,
    recommendations,
    insights,
    performance: {
      processingTime,
      analysisDepth: analysisType as any
    }
  };
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

    const requestData: AIAnalysisRequest = await request.json();
    const { clientId } = await params;

    // Validate request
    if (!requestData.testResultId || !requestData.expectedExtraction || !requestData.actualExtraction) {
      return NextResponse.json(
        { error: 'Missing required fields: testResultId, expectedExtraction, actualExtraction' },
        { status: 400 }
      );
    }

    // Get client
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Perform AI analysis
    const analysis = await performAIAnalysis(
      requestData.expectedExtraction,
      requestData.actualExtraction,
      requestData.analysisType || 'comprehensive'
    );

    const analysisResult: AIAnalysisResult = {
      ...analysis,
      analysisId: uuidv4(),
      testResultId: requestData.testResultId,
      analyzedAt: new Date()
    };

    // Update client with AI analysis configuration
    await Client.findByIdAndUpdate(clientId, {
      $set: {
        'emailTesting.aiAnalysisConfig.enabled': true,
        'emailTesting.aiAnalysisConfig.lastAnalysis': new Date()
      }
    });

    return NextResponse.json({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Error performing AI analysis:', error);
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
    // Connect to MongoDB
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const testResultId = searchParams.get('testResultId');

    // Get client
    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // If specific test result requested, return its analysis
    if (testResultId) {
      const testResult = client.emailTesting?.testResults?.find(
        (result: any) => result.id === testResultId
      );

      if (!testResult) {
        return NextResponse.json(
          { error: 'Test result not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        testResult,
        aiAnalysisConfig: client.emailTesting?.aiAnalysisConfig || {}
      });
    }

    // Return AI analysis configuration and capabilities
    return NextResponse.json({
      aiAnalysisConfig: client.emailTesting?.aiAnalysisConfig || {
        enabled: false,
        validationThreshold: 0.85,
        autoRetryOnFailure: false
      },
      capabilities: {
        analysisTypes: ['accuracy', 'confidence', 'comprehensive'],
        supportedFieldTypes: ['text', 'number', 'date', 'email', 'address', 'boolean'],
        maxFieldsPerAnalysis: 50,
        averageProcessingTime: '2-5 seconds'
      },
      metrics: {
        totalAnalysesPerformed: 0, // Could be tracked in client document
        averageAccuracy: 0,
        commonIssues: []
      }
    });

  } catch (error) {
    console.error('Error fetching AI analysis data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}