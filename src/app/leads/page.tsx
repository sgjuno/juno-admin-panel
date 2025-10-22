import React, { Suspense } from 'react';
import LeadsTable from '@/components/LeadsTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function LeadsPage() {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading leads...</div>}>
            <LeadsTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
} 