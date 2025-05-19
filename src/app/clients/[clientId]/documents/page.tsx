import React from 'react';
 
export default function DocumentsPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  // ... rest of the component ...
} 