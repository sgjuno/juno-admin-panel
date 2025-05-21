import ClientBasicInfoPageClient from './ClientBasicInfoPageClient';

export default function ClientBasicInfoPage({ params }: any) {
  return <ClientBasicInfoPageClient clientId={params.clientId} />;
} 