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

export async function getClientConfig(clientId: string): Promise<ClientConfig> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/${clientId}/config`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch client configuration');
  }

  return response.json();
} 