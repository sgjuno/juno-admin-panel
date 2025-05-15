'use client';

import { use, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import RequiredDetailsVisualizer from '@/components/RequiredDetailsVisualizer';

interface DetailRequired {
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
}

interface Category {
  category: string;
  detailRequired: DetailRequired[];
}

export default function RequiredDetailsVisualizerPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = use(params);
  const [client, setClient] = useState<any>(null);
  const [detailsRequired, setDetailsRequired] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientRes = await fetch(`/api/clients/${clientId}`);
        const clientData = await clientRes.json();
        
        setClient(clientData);
        setDetailsRequired(clientData.detailsRequired || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertDescription>Client not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Required Details Visualizer for {client.companyName}</h1>
        <p className="text-muted-foreground">
          Visual representation of required details and their connections
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Flow Visualization</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <RequiredDetailsVisualizer detailsRequired={detailsRequired} />
        </CardContent>
      </Card>
    </div>
  );
} 