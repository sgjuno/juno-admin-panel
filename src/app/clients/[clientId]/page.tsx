import ClientBasicInfoPageClient from './ClientBasicInfoPageClient';

export default async function ClientBasicInfoPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = await params;
  return <ClientBasicInfoPageClient clientId={clientId} />;
} 