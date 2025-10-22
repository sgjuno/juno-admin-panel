import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ClientConfig {
  companyName: string;
  pocName: string;
  pocContact: string;
  emailDomain: string;
  clientCode: string;
  configurations: Record<string, string>;
}

interface DocumentUploaderProps {
  onConfigExtracted: (config: ClientConfig) => void;
  clientId?: string;
}

export default function DocumentUploader({ onConfigExtracted, clientId }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a valid document (PDF, Word, or Excel)');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProcessing(false);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (clientId) {
        formData.append('clientId', clientId);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/process-document', true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      };

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onConfigExtracted(data.config);
          setSuccess('Document processed successfully! Configuration extracted.');
          setFile(null);
        } else {
          let errorMessage = 'Failed to process document';
          try {
            const data = JSON.parse(xhr.responseText);
            errorMessage = data.error || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = xhr.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
      };

      xhr.onerror = () => {
        throw new Error('Network error occurred. Please check your connection and try again.');
      };

      xhr.send(formData);
      
      // Set processing state after upload completes
      setUploading(false);
      setProcessing(true);
    } catch (err: any) {
      setError(err.message || 'Failed to process document');
      setUploading(false);
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Upload Configuration Document</h3>
          </div>
          
          <div className="space-y-2">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={uploading || processing}
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: PDF, Word, Excel (max 10MB)
            </p>
          </div>

          {(uploading || processing) && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {uploading ? 'Uploading...' : 'Processing document...'}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading || processing}
            className="w-full"
          >
            {uploading || processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploading ? 'Uploading...' : 'Processing...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload and Process
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 