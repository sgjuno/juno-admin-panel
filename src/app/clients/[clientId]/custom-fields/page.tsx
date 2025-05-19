import React from 'react';
import connectDB from '@/lib/mongodb';
import Client from '@/models/Client';

async function getClientCustomFields(clientId: string) {
  await connectDB();
  const client = await Client.findById(clientId).select('custom_fields companyName');
  return JSON.parse(JSON.stringify(client));
}

export default async function CustomFieldsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await React.use(params);
  const client = await getClientCustomFields(clientId);

  if (!client) {
    return <div className="text-red-500">Client not found.</div>;
  }

  const customFields = client.custom_fields || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Custom Fields for {client.companyName}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(customFields, null, 2)}</pre>
      </div>
    </div>
  );
} 