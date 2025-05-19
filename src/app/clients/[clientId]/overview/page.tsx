import React from 'react';
 
export default function OverviewPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  // ... rest of the component ...
} 