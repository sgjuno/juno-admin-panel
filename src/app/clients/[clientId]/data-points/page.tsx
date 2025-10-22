import { use } from 'react';
import DataPointVisualizer from '@/components/DataPointVisualizer';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';
import { getBaseUrl } from '@/lib/getBaseUrl';
import { cookies } from 'next/headers';

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

async function getClientConfig(clientId: string): Promise<ClientConfig | null> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    console.log('DataPoints - Fetching config for client:', clientId);
    console.log('DataPoints - Base URL:', getBaseUrl());
    const url = `${getBaseUrl()}/api/clients/${clientId}/config`;
    console.log('DataPoints - Full URL:', url);

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    });

    console.log('DataPoints - Response status:', response.status, response.statusText);

    if (!response.ok) {
      if (response.status === 404) {
        console.log('DataPoints - Client configuration not found (404)');
        return null;
      }
      throw new Error(`Failed to fetch client configuration: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('DataPoints - Received data:', JSON.stringify(data, null, 2));
    console.log('DataPoints - detailsRequired present?', !!data?.detailsRequired);
    console.log('DataPoints - detailsRequired length?', data?.detailsRequired?.length);

    return data;
  } catch (error) {
    console.error('DataPoints - Error fetching client config:', error);
    return null;
  }
}

export default async function DataPointsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  console.log('DataPoints Page - ClientId:', clientId);

  const clientConfig = await getClientConfig(clientId);
  console.log('DataPoints Page - Config received:', !!clientConfig);
  console.log('DataPoints Page - Config has detailsRequired:', !!clientConfig?.detailsRequired);
  console.log('DataPoints Page - detailsRequired is array:', Array.isArray(clientConfig?.detailsRequired));
  console.log('DataPoints Page - detailsRequired length:', clientConfig?.detailsRequired?.length);

  if (!clientConfig || !clientConfig.detailsRequired || clientConfig.detailsRequired.length === 0) {
    return (
      <div className="p-8">
        <Card className="p-6">
          <div>
            <p>No data points configuration found for this client.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Client ID: {clientId}<br/>
              Config loaded: {clientConfig ? 'Yes' : 'No'}<br/>
              Has detailsRequired: {clientConfig?.detailsRequired ? 'Yes' : 'No'}<br/>
              Array length: {clientConfig?.detailsRequired?.length || 0}
            </p>
          </div>
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