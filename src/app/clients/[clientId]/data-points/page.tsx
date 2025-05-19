import { use } from 'react';
import DataPointVisualizer from '@/components/DataPointVisualizer';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface ClientConfig {
  detailsRequired: Array<{
    category: string;
    detailRequired: Array<{
      datapoint: string;
      id: string;
      prev: string | null;
      questionText?: string;
      options?: Record<string, string[] | string | null>;
      branchingRule?: Record<string, string[] | string>;
      next_anyway?: string[];
      extract_only?: boolean;
      extract_externally?: boolean;
      default_value?: string;
      default_from_datapoint?: string;
      extraction_notes?: string;
      invalid_reason?: string;
    }>;
  }>;
}

async function getClientConfig(clientId: string): Promise<ClientConfig> {
  // Get the base URL from the environment or use a default
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/clients/${clientId}/config`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch client configuration');
  }

  return response.json();
}

export default async function DataPointsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await React.use(params);
  const clientConfig = await getClientConfig(clientId);

  if (!clientConfig) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <div>No configuration found for this client.</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <DataPointVisualizer
        detailsRequired={clientConfig.detailsRequired}
        clientId={clientId}
      />
    </div>
  );
} 