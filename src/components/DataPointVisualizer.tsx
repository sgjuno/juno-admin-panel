'use client';

import React, { useState, useCallback, useMemo, useRef, useLayoutEffect, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, Search, Info, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Pencil } from 'lucide-react';
import { DataPointEditDialog } from './required-details/DataPointEditDialog';
import { useEffect as useIsomorphicLayoutEffect } from 'react';
import { Slider } from '@/components/ui/slider';

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

interface DataPointVisualizerProps {
  detailsRequired: Category[];
  clientId: string;
}

const CATEGORY_COLORS = {
  loanType: '#4F46E5', // Indigo
  leadApplicantDetails: '#059669', // Emerald
  companyDetails: '#DC2626', // Red
  securityDetails: '#D97706', // Amber
  brokerDetails: '#7C3AED', // Violet
  guarantorDetails: '#EC4899', // Pink
  assetDetails: '#2563EB', // Blue
  supplierDetails: '#16A34A', // Green
  itemDetails: '#9333EA', // Purple
  pscDetails: '#EA580C', // Orange
  decisionDetails: '#0891B2', // Cyan
};

function OptionsConfigurator({ 
  value, 
  onChange, 
  dataPoints 
}: { 
  value: any, 
  onChange: (value: any) => void,
  dataPoints: string[]
}) {
  const [configType, setConfigType] = useState<'simple' | 'mapping' | 'numeric' | 'complex'>(
    Array.isArray(value) ? 'simple' : 
    typeof value === 'object' && Object.values(value).some(v => Array.isArray(v)) ? 'mapping' :
    typeof value === 'object' && Object.keys(value).every(k => !isNaN(Number(k))) ? 'numeric' :
    'complex'
  );

  const [simpleOptions, setSimpleOptions] = useState<string[]>(Array.isArray(value) ? value : []);
  const [mappingOptions, setMappingOptions] = useState<{ [key: string]: string[] }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );
  const [numericOptions, setNumericOptions] = useState<{ [key: string]: string[] }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );
  const [complexOptions, setComplexOptions] = useState<{ [key: string]: string }>(
    typeof value === 'object' && !Array.isArray(value) ? value : {}
  );

  // ... (rest of OptionsConfigurator logic from required-details/page.tsx) ...

  return (
    <div>Options Configurator UI here (copy full JSX from required-details/page.tsx)</div>
  );
}

const DataPointNode = ({ detail, category, onNodeClick, isHighlighted, nodeRef, clientId, refreshData, dataPoints, onLayoutChange }: DataPointNodeProps & { clientId: string, refreshData: () => void, dataPoints: string[], onLayoutChange?: () => void }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Save handler for dialog
  const handleSave = async (updatedDetail: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Fetch latest detailsRequired
      const resGet = await fetch(`/api/clients/${clientId}`);
      const clientData = await resGet.json();
      if (!resGet.ok || !clientData.detailsRequired) throw new Error('Failed to fetch client data');
      // Find and update the relevant data point
      const updatedDetailsRequired = clientData.detailsRequired.map((cat: any) => ({
        ...cat,
        detailRequired: cat.detailRequired.map((d: any) =>
          d.id === detail.id ? { ...d, ...updatedDetail } : d
        )
      }));
      // PUT the updated array
      const resPut = await fetch(`/api/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detailsRequired: updatedDetailsRequired }),
      });
      if (!resPut.ok) throw new Error('Failed to update data point');
      setSuccess(true);
      setEditOpen(false);
      refreshData();
      onLayoutChange && onLayoutChange();
    } catch (e: any) {
      setError(e.message || 'Error updating data point');
    } finally {
      setLoading(false);
    }
  };

  const hasOptions = detail.options && Object.keys(detail.options).length > 0;
  const hasBranching = detail.branchingRule && Object.keys(detail.branchingRule).length > 0;
  const hasNextAnyway = detail.next_anyway && detail.next_anyway.length > 0;

  return (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-4 rounded-lg border ${
        isHighlighted ? 'ring-2 ring-primary' : ''
      }`}
      style={{ backgroundColor: `${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}10` }}
      onClick={e => { e.stopPropagation(); onNodeClick(detail); }}
    >
      {/* Edit button */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 z-10"
        aria-label="Edit detail"
        onClick={e => { e.stopPropagation(); setEditOpen(true); }}
      >
        <Pencil className="w-4 h-4 text-muted-foreground" />
      </Button>
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-sm truncate">{detail.id}</h3>
          {detail.datapoint && (
            <div className="text-xs text-muted-foreground truncate">{detail.datapoint}</div>
          )}
          <div className="flex items-center gap-2 flex-nowrap mt-1">
            {detail.extract_only && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><Info className="w-4 h-4 text-muted-foreground" /></span>
                  </TooltipTrigger>
                  <TooltipContent>Extract Only</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {detail.extract_externally && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><ExternalLink className="w-4 h-4 text-muted-foreground" /></span>
                  </TooltipTrigger>
                  <TooltipContent>External Extraction</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {detail.default_value && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span><CheckCircle className="w-4 h-4 text-muted-foreground" /></span>
                  </TooltipTrigger>
                  <TooltipContent>Default Value: {detail.default_value}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        
        {detail.questionText && (
          <p className="text-xs text-muted-foreground">{detail.questionText}</p>
        )}

        <div className="flex flex-wrap gap-1">
          {hasOptions && <Badge variant="secondary">Options</Badge>}
          {hasBranching && <Badge variant="secondary">Branching</Badge>}
          {hasNextAnyway && <Badge variant="secondary">Next Anyway</Badge>}
        </div>

        {hasOptions && (
          <div className="mt-2 text-xs">
            <strong>Options:</strong>
            <ul className="list-disc list-inside">
              {Object.entries(detail.options!).map(([key, value]) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Shared Edit Dialog */}
      <DataPointEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        detail={detail}
        clientId={clientId}
        onSave={handleSave}
        onCancel={() => setEditOpen(false)}
        dataPoints={dataPoints}
      />
    </motion.div>
  );
};

interface CategoryColumnProps {
  category: Category;
  details: DetailRequired[];
  onNodeClick: (detail: DetailRequired) => void;
  highlightedNode: string | null;
  nodeRefs: React.MutableRefObject<Record<string, React.RefObject<HTMLDivElement>>>;
  clientId: string;
  refreshData: () => void;
}

const CategoryColumn = ({ category, details, onNodeClick, highlightedNode, nodeRefs, clientId, refreshData }: CategoryColumnProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <div className="flex flex-col min-w-[300px]">
      <div
        className="flex items-center justify-between p-2 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ backgroundColor: `${CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS]}20` }}
      >
        <h2 className="font-semibold">{category.category}</h2>
        <Button variant="ghost" size="sm">
          {isExpanded ? '−' : '+'}
        </Button>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col gap-y-4 p-4"
          >
            {details.map((detail) => {
              if (!nodeRefs.current[detail.id]) {
                nodeRefs.current[detail.id] = React.createRef<HTMLDivElement>();
              }
              return (
                <DataPointNode
                  key={detail.id}
                  detail={detail}
                  category={category.category}
                  onNodeClick={onNodeClick}
                  isHighlighted={highlightedNode === detail.id}
                  nodeRef={nodeRefs.current[detail.id]}
                  clientId={clientId}
                  refreshData={refreshData}
                  dataPoints={details.map(d => d.id)}
                  onLayoutChange={() => setLayoutVersion(v => v + 1)}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 1. Add ResizeObserver logic for each card
function useCardHeights(nodeRefs, filteredCategories, setMeasuredHeights, setAllMeasured) {
  useEffect(() => {
    const observers: Record<string, ResizeObserver> = {};
    const newMeasuredHeights: Record<string, number> = {};
    let allHaveHeight = true;
    filteredCategories.forEach(category => {
      category.detailRequired.forEach(detail => {
        const ref = nodeRefs.current[detail.id];
        if (ref && ref.current) {
          const update = () => {
            const h = ref.current ? ref.current.offsetHeight : 0;
            newMeasuredHeights[detail.id] = h;
            if (!h || h < 40) allHaveHeight = false;
            setMeasuredHeights(heights => ({ ...heights, [detail.id]: h }));
            setAllMeasured(Object.values(newMeasuredHeights).every(val => val && val > 40));
          };
          observers[detail.id] = new window.ResizeObserver(update);
          observers[detail.id].observe(ref.current);
          // Initial measure
          update();
        } else {
          allHaveHeight = false;
        }
      });
    });
    setAllMeasured(allHaveHeight);
    return () => {
      Object.values(observers).forEach(obs => obs.disconnect());
    };
  }, [filteredCategories, nodeRefs, setMeasuredHeights, setAllMeasured]);
}

// 1. Helper to check if all cards have valid heights
function allCardsMeasured(filteredCategories, measuredHeights) {
  const missing = [];
  for (const category of filteredCategories) {
    for (const detail of category.detailRequired) {
      const h = measuredHeights[detail.id];
      if (!h || h < 40) {
        missing.push(detail.id);
      }
    }
  }
  if (missing.length > 0) {
    console.log('Waiting for these cards to be measured:', missing);
    console.log('Current measuredHeights:', measuredHeights);
    return false;
  }
  return true;
}

export default function DataPointVisualizer({ detailsRequired, clientId }: DataPointVisualizerProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, React.RefObject<HTMLDivElement>>>({});
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDirectDependencies, setShowDirectDependencies] = useState(true);
  const [showOptionBasedBranching, setShowOptionBasedBranching] = useState(true);
  const [showNextAnyway, setShowNextAnyway] = useState(true);
  const [showExtractOnly, setShowExtractOnly] = useState(true);
  const [showExtractExternally, setShowExtractExternally] = useState(true);
  const [showDefaultValue, setShowDefaultValue] = useState(true);
  const [measuredHeights, setMeasuredHeights] = useState<Record<string, number>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [allMeasured, setAllMeasured] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [sensitivity, setSensitivity] = useState(1);

  // Handle zoom with trackpad/mouse wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const pointXBeforeZoom = (mouseX - position.x) / zoom;
      const pointYBeforeZoom = (mouseY - position.y) / zoom;
      const delta = (e.deltaY > 0 ? -0.1 : 0.1) * sensitivity;
      const newZoom = Math.max(0.2, Math.min(2, zoom + delta));
      const pointXAfterZoom = (mouseX - position.x) / newZoom;
      const pointYAfterZoom = (mouseY - position.y) / newZoom;
      const newPosition = {
        x: position.x + (pointXAfterZoom - pointXBeforeZoom) * newZoom,
        y: position.y + (pointYAfterZoom - pointYBeforeZoom) * newZoom
      };
      setZoom(newZoom);
      setPosition(newPosition);
    } else {
      e.preventDefault();
      setPosition(pos => ({
        x: pos.x - e.deltaX * sensitivity,
        y: pos.y - e.deltaY * sensitivity
      }));
    }
  }, [zoom, position, sensitivity]);

  // Handle pan with mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    container.addEventListener('wheel', wheelHandler, { passive: false });
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);

    return () => {
      container.removeEventListener('wheel', wheelHandler);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [handleWheel, handleMouseUp]);

  const handleNodeClick = useCallback((detail: DetailRequired) => {
    setHighlightedNode(detail.id);
  }, []);

  // Unselect when clicking on canvas background
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only unselect if the click is directly on the canvas, not on a card
    if (e.target === e.currentTarget) {
      setHighlightedNode(null);
    }
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery) return detailsRequired;
    return detailsRequired.map(category => ({
      ...category,
      detailRequired: category.detailRequired.filter(detail =>
        detail.datapoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        detail.questionText?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.detailRequired.length > 0);
  }, [detailsRequired, searchQuery]);

  // Build a flat map of all nodes by id
  const allNodes: { [id: string]: DetailRequired & { category: string } } = useMemo(() => {
    const map: { [id: string]: DetailRequired & { category: string } } = {};
    filteredCategories.forEach(cat => {
      cat.detailRequired.forEach(detail => {
        map[detail.id] = { ...detail, category: cat.category };
      });
    });
    return map;
  }, [filteredCategories]);

  // Calculate dynamic y positions for each node in each column
  const getDynamicPositions = () => {
    const dynamicPositions: Record<string, { x: number; y: number }> = {};
    filteredCategories.forEach((category, colIdx) => {
      let y = 56; // leave space for header
      category.detailRequired.forEach((detail) => {
        dynamicPositions[detail.id] = {
          x: colIdx * 340,
          y,
        };
        const h = measuredHeights[detail.id];
        y += (h && h > 40 ? h : 100) + 20;
      });
    });
    return dynamicPositions;
  };
  const dynamicPositions = getDynamicPositions();

  // Build all connections
  interface Connection {
    from: string;
    to: string;
    type: 'prev' | 'options' | 'next_anyway' | 'branching';
  }
  const connections: Connection[] = useMemo(() => {
    const conns: Connection[] = [];
    Object.values(allNodes).forEach((detail) => {
      // prev (solid)
      if (detail.prev && allNodes[detail.prev]) {
        conns.push({
          from: detail.prev,
          to: detail.id,
          type: 'prev',
        });
      }
      // options (dashed)
      if (detail.options) {
        Object.values(detail.options).forEach(optVal => {
          if (Array.isArray(optVal)) {
            optVal.forEach(targetId => {
              if (allNodes[targetId]) {
                conns.push({ from: detail.id, to: targetId, type: 'options' });
              }
            });
          } else if (typeof optVal === 'string' && allNodes[optVal]) {
            conns.push({ from: detail.id, to: optVal, type: 'options' });
          }
        });
      }
      // next_anyway (dotted)
      if (detail.next_anyway) {
        detail.next_anyway.forEach(targetId => {
          if (allNodes[targetId]) {
            conns.push({ from: detail.id, to: targetId, type: 'next_anyway' });
          }
        });
      }
      // branchingRule (purple custom dash)
      if (detail.branchingRule) {
        Object.values(detail.branchingRule).forEach(targets => {
          if (Array.isArray(targets)) {
            targets.forEach(targetId => {
              if (allNodes[targetId]) {
                conns.push({ from: detail.id, to: targetId, type: 'branching' });
              }
            });
          } else if (typeof targets === 'string' && allNodes[targets]) {
            conns.push({ from: detail.id, to: targets, type: 'branching' });
          }
        });
      }
    });
    return conns;
  }, [allNodes]);

  // SVG lines overlay (use dynamicPositions)
  const renderLines = () => {
    const lines: JSX.Element[] = [];
    // Calculate SVG bounds
    const allX = Object.values(dynamicPositions).flatMap(pos => [pos.x, pos.x + 300]);
    const allY = Object.values(dynamicPositions).flatMap(pos => [pos.y, pos.y + 100]);
    const svgWidth = Math.max(1200, ...allX) + 100; // fallback min width
    const svgHeight = Math.max(800, ...allY) + 100; // fallback min height
    connections.forEach((conn, idx) => {
      if (
        (conn.type === 'prev' && !showDirectDependencies) ||
        (conn.type === 'options' && !showOptionBasedBranching) ||
        (conn.type === 'next_anyway' && !showNextAnyway) ||
        (conn.type === 'branching' && !showExtractOnly)
      ) {
        return;
      }
      const fromPos = dynamicPositions[conn.from];
      const toPos = dynamicPositions[conn.to];
      if (!fromPos || !toPos) return;
      // Calculate direction
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      let x1 = fromPos.x + 150; // center of card (300px width)
      let y1 = fromPos.y + 50;  // center of card (100px height)
      let x2 = toPos.x + 150;
      let y2 = toPos.y + 50;
      // Connect to edge instead of center
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal: connect right edge to left edge
        x1 = dx > 0 ? fromPos.x + 300 : fromPos.x;
        y1 = fromPos.y + 50;
        x2 = dx > 0 ? toPos.x : toPos.x + 300;
        y2 = toPos.y + 50;
      } else {
        // Vertical: connect bottom edge to top edge
        x1 = fromPos.x + 150;
        y1 = dy > 0 ? fromPos.y + 100 : fromPos.y;
        x2 = toPos.x + 150;
        y2 = dy > 0 ? toPos.y : toPos.y + 100;
      }
      let stroke = '#6366f1';
      let strokeDasharray = '';
      let marker = 'url(#arrowhead-blue)';
      if (conn.type === 'options') {
        strokeDasharray = '6,4';
        stroke = '#f59e42';
        marker = 'url(#arrowhead-orange)';
      } else if (conn.type === 'next_anyway') {
        strokeDasharray = '2,4';
        stroke = '#10b981';
        marker = 'url(#arrowhead-green)';
      } else if (conn.type === 'branching') {
        strokeDasharray = '4,2,2,2';
        stroke = '#a21caf'; // purple
        marker = 'url(#arrowhead-purple)';
      }
      const isHighlighted =
        highlightedNode && (conn.from === highlightedNode || conn.to === highlightedNode);
      lines.push(
        <line
          key={idx}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={stroke}
          strokeWidth={isHighlighted ? 3 : 2}
          strokeDasharray={strokeDasharray}
          markerEnd={marker}
          opacity={highlightedNode && !isHighlighted ? 0.2 : 1}
        />
      );
    });
    return (
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{ zIndex: 1 }}
        width={svgWidth}
        height={svgHeight}
      >
        <defs>
          <marker id="arrowhead-blue" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 8 4, 0 8" fill="#6366f1" />
          </marker>
          <marker id="arrowhead-orange" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 8 4, 0 8" fill="#f59e42" />
          </marker>
          <marker id="arrowhead-green" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 8 4, 0 8" fill="#10b981" />
          </marker>
          <marker id="arrowhead-purple" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto" markerUnits="strokeWidth">
            <polygon points="0 0, 8 4, 0 8" fill="#a21caf" />
          </marker>
        </defs>
        {lines}
      </svg>
    );
  };

  // Calculate default positions for nodes if not dragged
  const getDefaultPosition = (colIdx: number, nodeIdx: number) => ({
    x: colIdx * 340, // 300px min width + 40px gap
    y: nodeIdx * 120 // 100px card height + 20px gap
  });

  // 1. Build a stable dependency string of all card IDs
  const allCardIds = filteredCategories.flatMap(cat => cat.detailRequired.map(d => d.id)).join(',');

  // 2. useLayoutEffect: keep re-measuring until all heights are valid
  useLayoutEffect(() => {
    let frame: number;
    function measureAndCheck() {
      const newMeasuredHeights: Record<string, number> = {};
      let allHaveHeight = true;
      Object.entries(nodeRefs.current).forEach(([id, ref]) => {
        if (ref && ref.current) {
          const h = ref.current.offsetHeight;
          newMeasuredHeights[id] = h;
          if (!h || h < 40) allHaveHeight = false;
        } else {
          allHaveHeight = false;
        }
      });
      const changed = Object.keys(newMeasuredHeights).some(
        (id) => measuredHeights[id] !== newMeasuredHeights[id]
      );
      if (changed) {
        setMeasuredHeights(newMeasuredHeights);
      }
      setAllMeasured(allHaveHeight);
      if (!allHaveHeight) {
        frame = requestAnimationFrame(measureAndCheck);
      }
    }
    frame = requestAnimationFrame(measureAndCheck);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allCardIds, measuredHeights, layoutVersion]);

  // Auto-zoom to fit all nodes on first load
  useEffect(() => {
    // Only auto-zoom if there are nodes and a scroll container
    if (!scrollContainerRef.current || Object.keys(dynamicPositions).length === 0) return;
    const container = scrollContainerRef.current;
    const allX = Object.values(dynamicPositions).flatMap(pos => [pos.x, pos.x + 300]);
    const allY = Object.values(dynamicPositions).flatMap(pos => [pos.y, pos.y + 100]);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const viewWidth = container.clientWidth;
    const viewHeight = container.clientHeight;
    if (contentWidth > 0 && contentHeight > 0 && viewWidth > 0 && viewHeight > 0) {
      const zoomX = viewWidth / (contentWidth + 80); // add some padding
      const zoomY = viewHeight / (contentHeight + 80);
      const fitZoom = Math.min(zoomX, zoomY, 1); // never zoom in more than 1x
      setZoom(fitZoom);
    }
    // Only run on first load or when node positions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Object.keys(dynamicPositions).join(','), scrollContainerRef.current]);

  // Add a stub for refreshData
  const refreshData = () => {
    // TODO: Implement data refresh logic
  };

  // 1. Add ResizeObserver logic for each card
  useCardHeights(nodeRefs, filteredCategories, setMeasuredHeights, setAllMeasured);

  const layoutReady = allCardsMeasured(filteredCategories, measuredHeights);

  // 2. Measurement phase: render all cards in a hidden container, measure, then show layout
  useEffect(() => {
    if (allCardsMeasured(filteredCategories, measuredHeights)) {
      setAllMeasured(true);
    } else {
      setAllMeasured(false);
    }
  }, [filteredCategories, measuredHeights]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search data points..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {detailsRequired.map(category => (
                <SelectItem key={category.category} value={category.category}>{category.category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="toggle-direct" checked={showDirectDependencies} onCheckedChange={setShowDirectDependencies} />
            <label htmlFor="toggle-direct" className="text-xs">Direct</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="toggle-options" checked={showOptionBasedBranching} onCheckedChange={setShowOptionBasedBranching} />
            <label htmlFor="toggle-options" className="text-xs">Options</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="toggle-nextanyway" checked={showNextAnyway} onCheckedChange={setShowNextAnyway} />
            <label htmlFor="toggle-nextanyway" className="text-xs">Next Anyway</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="toggle-branching" checked={showExtractOnly} onCheckedChange={setShowExtractOnly} />
            <label htmlFor="toggle-branching" className="text-xs">Branching</label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Sensitivity</span>
            <Slider
              min={0.5}
              max={3}
              step={0.1}
              value={[sensitivity]}
              onValueChange={([v]) => setSensitivity(v)}
              className="w-32"
            />
            <span className="text-xs w-8 text-right">{sensitivity.toFixed(1)}x</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(0.2, zoom - 0.1))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Custom scrollable canvas with panning */}
      <div 
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-background"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            width: 'max-content',
            height: 'max-content',
          }}
          onClick={handleCanvasClick}
        >
          {renderLines()}
          <div className="relative z-10">
            {filteredCategories.map((category, colIdx) => {
              const x = colIdx * 340;
              return (
                <div
                  key={category.category + '-header'}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: 0,
                    width: 300,
                    height: 48,
                    zIndex: 20,
                    background: 'rgba(255,255,255,0.85)',
                    padding: '8px 16px',
                    borderRadius: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    border: `2px solid ${CATEGORY_COLORS[category.category as keyof typeof CATEGORY_COLORS]}20`,
                    fontWeight: 600,
                    fontSize: '1rem',
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {category.category}
                </div>
              );
            })}
            {!allMeasured && (
              <>
                {/* Hidden measurement container */}
                <div style={{ position: 'absolute', left: -9999, top: 0, visibility: 'hidden', pointerEvents: 'none' }}>
                  {filteredCategories.map((category, colIdx) => (
                    <div key={category.category + '-measure'}>
                      {category.detailRequired.map((detail) => {
                        if (!nodeRefs.current[detail.id]) {
                          nodeRefs.current[detail.id] = React.createRef<HTMLDivElement>();
                        }
                        return (
                          <div
                            key={detail.id}
                            ref={el => {
                              nodeRefs.current[detail.id].current = el;
                              if (el) {
                                const h = el.offsetHeight;
                                setMeasuredHeights(heights =>
                                  heights[detail.id] !== h ? { ...heights, [detail.id]: h } : heights
                                );
                              }
                            }}
                            style={{ width: 300, marginBottom: 20 }}
                          >
                            <DataPointNode
                              detail={detail}
                              category={category.category}
                              onNodeClick={() => {}}
                              isHighlighted={false}
                              nodeRef={nodeRefs.current[detail.id]}
                              clientId={clientId}
                              refreshData={() => {}}
                              dataPoints={category.detailRequired.map(d => d.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Loading overlay */}
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-background/60">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
                  <span className="ml-4 text-primary font-semibold">Measuring layout…</span>
                </div>
              </>
            )}
            {allMeasured && (
              filteredCategories.map((category, colIdx) => (
                <React.Fragment key={category.category}>
                  {category.detailRequired.map((detail, nodeIdx) => {
                    const pos = dynamicPositions[detail.id];
                    if (!pos) return null;
                    if (!nodeRefs.current[detail.id]) {
                      nodeRefs.current[detail.id] = React.createRef<HTMLDivElement>();
                    }
                    return (
                      <div
                        key={detail.id}
                        ref={nodeRefs.current[detail.id]}
                        style={{
                          position: 'absolute',
                          left: pos.x,
                          top: pos.y,
                          width: 300,
                          height: measuredHeights[detail.id] || 100,
                        }}
                      >
                        <DataPointNode
                          detail={detail}
                          category={category.category}
                          onNodeClick={handleNodeClick}
                          isHighlighted={highlightedNode === detail.id}
                          nodeRef={nodeRefs.current[detail.id]}
                          clientId={clientId}
                          refreshData={refreshData}
                          dataPoints={category.detailRequired.map(d => d.id)}
                          onLayoutChange={() => setLayoutVersion(v => v + 1)}
                        />
                      </div>
                    );
                  })}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
        {/* Floating Legend Button & Card */}
        <button
          className="fixed bottom-6 right-6 z-50 bg-background border shadow-md rounded-full p-2 hover:bg-muted transition-all"
          aria-label="Show legend"
          onClick={() => setLegendOpen((v) => !v)}
        >
          <Info className="w-5 h-5 text-primary" />
        </button>
        {legendOpen && (
          <Card className="fixed bottom-20 right-6 z-50 p-3 rounded-xl shadow-lg border w-72 text-xs bg-background/95 backdrop-blur-sm">
            <div className="font-semibold mb-2 flex items-center gap-2 text-sm">
              <Info className="w-4 h-4 text-primary" /> Legend
              <button
                className="ml-auto text-muted-foreground hover:text-primary"
                aria-label="Close legend"
                onClick={() => setLegendOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-0.5 bg-primary" />
                <span>Direct Dependencies</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-0.5 border-b border-dashed border-primary" />
                <span>Option-based Branching</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-0.5 border-b border-dotted border-primary" />
                <span>Next Anyway</span>
              </div>
            </div>
            <div className="mb-1 font-medium">Icons</div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Info className="w-3 h-3 text-muted-foreground" />
                <span>Extract Only</span>
              </div>
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
                <span>External Extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-muted-foreground" />
                <span>Default Value</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 