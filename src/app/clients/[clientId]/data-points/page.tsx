import { use } from 'react';
import DataPointVisualizer from '@/components/DataPointVisualizer';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { getBaseUrl } from '@/lib/getBaseUrl';

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
  try {
    const response = await fetch(`${getBaseUrl()}/api/clients/${clientId}/config`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch client configuration: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching client config:', error);
    throw error;
  }
}

export default async function DataPointsPage({ params }: any) {
  const { clientId } = params;
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