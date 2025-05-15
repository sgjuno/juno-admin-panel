import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowDown, ArrowUpRight } from 'lucide-react';

interface DetailRequired {
  datapoint: string;
  id: string;
  prev: string | null;
  questionText?: string;
  options?: any;
  branchingRule?: any;
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

interface RequiredDetailsVisualizerProps {
  detailsRequired: Category[];
}

const RequiredDetailsVisualizer: React.FC<RequiredDetailsVisualizerProps> = ({ detailsRequired }) => {
  // Create a map of all datapoints for quick lookup
  const datapointMap = new Map<string, DetailRequired>();
  detailsRequired.forEach(category => {
    category.detailRequired.forEach(detail => {
      datapointMap.set(detail.id, detail);
    });
  });

  // Function to render a single datapoint node
  const renderDatapointNode = (detail: DetailRequired) => {
    const hasBranching = detail.branchingRule && Object.keys(detail.branchingRule).length > 0;
    const hasOptions = detail.options && Object.keys(detail.options).length > 0;
    const hasNextAnyway = detail.next_anyway && detail.next_anyway.length > 0;

    return (
      <div key={detail.id} className="relative">
        <Card className="p-4 mb-4 min-w-[200px] max-w-[300px]">
          <div className="space-y-2">
            <div className="font-semibold text-sm">{detail.datapoint}</div>
            {detail.questionText && (
              <div className="text-xs text-muted-foreground">{detail.questionText}</div>
            )}
            <div className="flex flex-wrap gap-1">
              {detail.extract_only && <Badge variant="secondary">Extract Only</Badge>}
              {detail.extract_externally && <Badge variant="secondary">External</Badge>}
              {hasBranching && <Badge variant="outline">Branching</Badge>}
              {hasOptions && <Badge variant="outline">Options</Badge>}
            </div>
          </div>
        </Card>
        
        {/* Render connections */}
        <div className="relative">
          {hasBranching && (
            <div className="ml-4 pl-4 border-l-2 border-dashed">
              {Object.entries(detail.branchingRule).map(([condition, nextDatapoints]) => (
                <div key={condition} className="mb-4">
                  <div className="text-xs text-muted-foreground mb-2">{condition}</div>
                  {Array.isArray(nextDatapoints) ? (
                    nextDatapoints.map((nextId) => {
                      const nextDetail = datapointMap.get(nextId);
                      return nextDetail ? (
                        <div key={nextId} className="ml-4">
                          <ArrowRight className="inline-block w-4 h-4 text-muted-foreground" />
                          {renderDatapointNode(nextDetail)}
                        </div>
                      ) : null;
                    })
                  ) : (
                    <div className="ml-4">
                      <ArrowRight className="inline-block w-4 h-4 text-muted-foreground" />
                      {renderDatapointNode(datapointMap.get(nextDatapoints as string)!)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasNextAnyway && (
            <div className="ml-4 pl-4 border-l-2 border-dashed">
              <div className="text-xs text-muted-foreground mb-2">Next Anyway</div>
              {detail.next_anyway.map((nextId) => {
                const nextDetail = datapointMap.get(nextId);
                return nextDetail ? (
                  <div key={nextId} className="ml-4">
                    <ArrowUpRight className="inline-block w-4 h-4 text-muted-foreground" />
                    {renderDatapointNode(nextDetail)}
                  </div>
                ) : null;
              })}
            </div>
          )}

          {hasOptions && (
            <div className="ml-4 pl-4 border-l-2 border-dashed">
              <div className="text-xs text-muted-foreground mb-2">Options</div>
              {Object.entries(detail.options).map(([option, nextId]) => (
                <div key={option} className="mb-2">
                  <div className="text-xs text-muted-foreground">{option}</div>
                  {nextId && (
                    <div className="ml-4">
                      <ArrowDown className="inline-block w-4 h-4 text-muted-foreground" />
                      {renderDatapointNode(datapointMap.get(nextId as string)!)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="p-4">
        {detailsRequired.map((category) => (
          <div key={category.category} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{category.category}</h3>
            <div className="space-y-4">
              {category.detailRequired
                .filter(detail => !detail.prev) // Start with root nodes
                .map(detail => renderDatapointNode(detail))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default RequiredDetailsVisualizer; 