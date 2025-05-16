'use client';

import React, { useState, useCallback, useMemo, useRef, useLayoutEffect, useEffect, JSX } from 'react';
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

// Helper to get all node positions
function useNodePositions(
  nodeRefs: React.MutableRefObject<Record<string, React.RefObject<HTMLDivElement>>>,
  containerRef: React.RefObject<HTMLDivElement>,
  zoom: number
) {
  const [positions, setPositions] = useState<Record<string, { left: number; top: number; width: number; height: number }>>({});

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPositions: Record<string, { left: number; top: number; width: number; height: number }> = {};
    Object.entries(nodeRefs.current).forEach(([id, ref]) => {
      if (ref && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        newPositions[id] = {
          left: (rect.left - containerRect.left) / zoom,
          top: (rect.top - containerRect.top) / zoom,
          width: rect.width / zoom,
          height: rect.height / zoom,
        };
      }
    });
    setPositions(newPositions);
  }, [nodeRefs, containerRef, zoom]);

  return positions;
}

interface DataPointNodeProps {
  detail: DetailRequired;
  category: string;
  onNodeClick: (detail: DetailRequired) => void;
  isHighlighted: boolean;
  nodeRef: React.RefObject<HTMLDivElement>;
}

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

const DataPointNode = ({ detail, category, onNodeClick, isHighlighted, nodeRef, clientId, refreshData, dataPoints }: DataPointNodeProps & { clientId: string, refreshData: () => void, dataPoints: string[] }) => {
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
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface NodeRefs {
  [key: string]: React.RefObject<HTMLDivElement>;
}

export default function DataPointVisualizer({ detailsRequired, clientId }: DataPointVisualizerProps) {
  const [zoom, setZoom] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);
  const [measuredHeights, setMeasuredHeights] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<NodeRefs>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [showDirect, setShowDirect] = useState(true);
  const [showOptions, setShowOptions] = useState(true);
  const [showNextAnyway, setShowNextAnyway] = useState(true);
  const [showBranching, setShowBranching] = useState(true);
  const [mouseSensitivity, setMouseSensitivity] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.2));

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
    if (!searchTerm) return detailsRequired;
    return detailsRequired.map(category => ({
      ...category,
      detailRequired: category.detailRequired.filter(detail =>
        detail.datapoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.questionText?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(category => category.detailRequired.length > 0);
  }, [detailsRequired, searchTerm]);

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

  // Get node positions (use drag positions if available)
  const nodePositions = useNodePositions(nodeRefs, containerRef, zoom);

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

  // SVG lines overlay
  const renderLines = () => {
    if (!containerRef.current) return null;
    const lines: JSX.Element[] = [];
    // Calculate SVG bounds
    const allX = Object.values(nodePositions).flatMap(pos => [pos.left, pos.left + pos.width]);
    const allY = Object.values(nodePositions).flatMap(pos => [pos.top, pos.top + pos.height]);
    const svgWidth = Math.max(1200, ...allX) + 100; // fallback min width
    const svgHeight = Math.max(800, ...allY) + 100; // fallback min height
    connections.forEach((conn, idx) => {
      if (
        (conn.type === 'prev' && !showDirect) ||
        (conn.type === 'options' && !showOptions) ||
        (conn.type === 'next_anyway' && !showNextAnyway) ||
        (conn.type === 'branching' && !showBranching)
      ) {
        return;
      }
      const fromPos = nodePositions[conn.from];
      const toPos = nodePositions[conn.to];
      if (!fromPos || !toPos) return;
      // Calculate direction
      const dx = toPos.left + toPos.width / 2 - (fromPos.left + fromPos.width / 2);
      const dy = toPos.top + toPos.height / 2 - (fromPos.top + fromPos.height / 2);
      let x1 = fromPos.left + fromPos.width / 2;
      let y1 = fromPos.top + fromPos.height / 2;
      let x2 = toPos.left + toPos.width / 2;
      let y2 = toPos.top + toPos.height / 2;
      // Connect to edge instead of center
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal: connect right edge to left edge
        x1 = dx > 0 ? fromPos.left + fromPos.width : fromPos.left;
        y1 = fromPos.top + fromPos.height / 2;
        x2 = dx > 0 ? toPos.left : toPos.left + toPos.width;
        y2 = toPos.top + toPos.height / 2;
      } else {
        // Vertical: connect bottom edge to top edge
        x1 = fromPos.left + fromPos.width / 2;
        y1 = dy > 0 ? fromPos.top + fromPos.height : fromPos.top;
        x2 = toPos.left + toPos.width / 2;
        y2 = dy > 0 ? toPos.top : toPos.top + toPos.height;
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

  // Dynamic auto-layout for each column
  useLayoutEffect(() => {
    const newMeasuredHeights: Record<string, number> = {};
    Object.entries(nodeRefs.current).forEach(([id, ref]) => {
      if (ref && ref.current) {
        newMeasuredHeights[id] = ref.current.offsetHeight;
      }
    });
    // Only update state if heights have changed
    const changed = Object.keys(newMeasuredHeights).some(
      (id) => measuredHeights[id] !== newMeasuredHeights[id]
    );
    if (changed) {
      setMeasuredHeights(newMeasuredHeights);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredCategories, nodePositions]);

  // Calculate dynamic y positions for each node in each column
  const getDynamicPositions = () => {
    const dynamicPositions: Record<string, { x: number; y: number }> = {};
    filteredCategories.forEach((category, colIdx) => {
      let y = 0;
      category.detailRequired.forEach((detail) => {
        dynamicPositions[detail.id] = {
          x: colIdx * 340,
          y,
        };
        y += (measuredHeights[detail.id] || 100) + 20; // 20px gap
      });
    });
    return dynamicPositions;
  };
  const dynamicPositions = getDynamicPositions();

  // Add a stub for refreshData
  const refreshData = () => {
    // TODO: Implement data refresh logic
  };

  // Auto-zoom to fit all nodes on first load
  useEffect(() => {
    // Only auto-zoom if there are nodes and a scroll container
    if (!scrollContainerRef.current || Object.keys(nodePositions).length === 0) return;
    const container = scrollContainerRef.current;
    const allX = Object.values(nodePositions).flatMap(pos => [pos.left, pos.left + pos.width]);
    const allY = Object.values(nodePositions).flatMap(pos => [pos.top, pos.top + pos.height]);
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
  }, [Object.keys(nodePositions).join(','), scrollContainerRef.current]);

  // Handle touchpad/mouse wheel zoom and pan
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    // Check if this is a touchpad gesture (deltaMode will be 0)
    if (e.deltaMode === 0) {
      // Touchpad gesture
      if (e.ctrlKey) {
        // Pinch to zoom
        const delta = e.deltaY;
        const zoomFactor = delta > 0 ? 1 - (0.1 * mouseSensitivity) : 1 + (0.1 * mouseSensitivity);
        const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 2);
        setZoom(newZoom);
      } else {
        // Two finger scroll to pan
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft += e.deltaX * mouseSensitivity;
          scrollContainerRef.current.scrollTop += e.deltaY * mouseSensitivity;
        }
      }
    } else {
      // Mouse wheel
      const delta = e.deltaY;
      const zoomFactor = delta > 0 ? 1 - (0.1 * mouseSensitivity) : 1 + (0.1 * mouseSensitivity);
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 2);
      setZoom(newZoom);
    }
  }, [zoom, mouseSensitivity]);

  // Handle mouse pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle click or Alt + Left click
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && scrollContainerRef.current) {
      const dx = (e.clientX - panStart.x) * mouseSensitivity;
      const dy = (e.clientY - panStart.y) * mouseSensitivity;
      scrollContainerRef.current.scrollLeft += dx;
      scrollContainerRef.current.scrollTop += dy;
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, panStart, mouseSensitivity]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Add wheel event listener with passive: false to allow preventDefault
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Input
            placeholder="Search data points..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        {/* Line toggles */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="toggle-direct" checked={showDirect} onCheckedChange={setShowDirect} />
            <label htmlFor="toggle-direct" className="text-xs">Direct</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="toggle-options" checked={showOptions} onCheckedChange={setShowOptions} />
            <label htmlFor="toggle-options" className="text-xs">Options</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="toggle-nextanyway" checked={showNextAnyway} onCheckedChange={setShowNextAnyway} />
            <label htmlFor="toggle-nextanyway" className="text-xs">Next Anyway</label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="toggle-branching" checked={showBranching} onCheckedChange={setShowBranching} />
            <label htmlFor="toggle-branching" className="text-xs">Branching</label>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="mouse-sensitivity" className="text-xs whitespace-nowrap">Mouse Sensitivity</label>
            <Slider
              id="mouse-sensitivity"
              min={0.1}
              max={2}
              step={0.1}
              value={[mouseSensitivity]}
              onValueChange={([value]) => setMouseSensitivity(value)}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Custom scrollable canvas with panning */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto bg-background"
        style={{ position: 'relative' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={containerRef}
          className="relative p-8"
          style={{
            minWidth: 2000,
            minHeight: 1500,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
          onClick={handleCanvasClick}
        >
          {renderLines()}
          <div className="flex gap-8 relative z-10">
            {filteredCategories.map((category, colIdx) => (
              <CategoryColumn
                key={category.category}
                category={category}
                details={category.detailRequired}
                onNodeClick={handleNodeClick}
                highlightedNode={highlightedNode}
                nodeRefs={nodeRefs}
                clientId={clientId}
                refreshData={refreshData}
              />
            ))}
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