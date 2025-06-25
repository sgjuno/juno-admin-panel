import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { Document } from '@langchain/core/documents';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to extract text from different document types
async function extractTextFromDocument(filePath: string, fileType: string): Promise<string> {
  let loader;
  
  try {
    switch (fileType) {
      case 'application/pdf':
        loader = new PDFLoader(filePath);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        loader = new DocxLoader(filePath);
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        loader = new CSVLoader(filePath);
        break;
      default:
        throw new Error('Unsupported file type. Please upload a PDF, Word, or Excel document.');
    }

    const docs = await loader.load();
    if (!docs || docs.length === 0) {
      throw new Error('No content could be extracted from the document.');
    }
    return docs.map((doc: Document) => doc.pageContent).join('\n');
  } catch (error: any) {
    if (error.message.includes('d3-dsv')) {
      throw new Error('Failed to process Excel file. Please ensure the file is not corrupted.');
    }
    throw error;
  }
}

// Function to process text with AI
async function processWithAI(text: string): Promise<any> {
  try {
    const prompt = `Please analyze the following document and extract client configuration details. Return the information in the following JSON format:
    {
      "companyName": "string",
      "pocName": "string",
      "pocContact": "string",
      "emailDomain": "string",
      "clientCode": "string",
      "configurations": {
        "key1": "value1",
        "key2": "value2"
      }
    }

    Document text:
    ${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts client configuration details from documents. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return JSON.parse(content);
  } catch (error: any) {
    if (error.message.includes('JSON')) {
      throw new Error('Failed to parse AI response. Please try again.');
    }
    // Handle rate limit errors specifically
    if (error.code === 'rate_limit_exceeded') {
      const retryAfter = error.headers?.['retry-after'] || '60';
      throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  let filePath: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Create a temporary file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${uuidv4()}-${file.name}`;
    filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Extract text from document
    const text = await extractTextFromDocument(filePath, file.type);

    // Process with AI
    const config = await processWithAI(text);

    return NextResponse.json({ config });
  } catch (error: any) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process document' },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    if (filePath) {
      try {
        await unlink(filePath);
      } catch (error) {
        console.error('Error cleaning up temporary file:', error);
      }
    }
  }
} 