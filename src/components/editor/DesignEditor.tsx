import { useState, useRef, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import Konva from 'konva';
import { CanvasElement, EditorState } from '@/types/editor';
import { ToolbarPanel } from './ToolbarPanel';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasRenderer } from './CanvasRenderer';
import { useWindowSize } from '@/hooks/use-window-size';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';

// Compute canvas size responsively based on available viewport area
// Maintains a 4:5 (width:height) aspect ratio and accounts for sidebars and padding
const getCanvasSize = (viewportWidth: number, viewportHeight: number) => {
  const LEFT_SIDEBAR_WIDTH = 320; // w-80
  const RIGHT_SIDEBAR_WIDTH = 320; // w-80
  const MAIN_PADDING = 32; // p-8 (2rem)

  const availableWidth = Math.max(
    240,
    viewportWidth - LEFT_SIDEBAR_WIDTH - RIGHT_SIDEBAR_WIDTH - MAIN_PADDING * 2
  );
  const availableHeight = Math.max(240, viewportHeight - MAIN_PADDING * 2);

  const aspect = 4 / 5; // width / height
  // Fit the canvas into available box while preserving aspect
  const widthLimitedByHeight = availableHeight * aspect;
  const width = Math.min(availableWidth, widthLimitedByHeight);
  const height = Math.round(width / aspect);

  return { width: Math.round(width), height };
};

export const DesignEditor = () => {
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const [isEditingText, setIsEditingText] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    elements: [],
    selectedElementId: null,
    tool: 'select'
  });
  
  const stageRef = useRef<Konva.Stage>(null);
  const canvasSize = getCanvasSize(windowWidth, windowHeight);
  const STAGE_PADDING = 2000; // generous free space around canvas

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.1;

  const zoomIn = () => setZoom(z => Math.min(MAX_ZOOM, parseFloat((z + ZOOM_STEP).toFixed(2))))
  const zoomOut = () => setZoom(z => Math.max(MIN_ZOOM, parseFloat((z - ZOOM_STEP).toFixed(2))))
  const zoomReset = () => setZoom(1)

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (!isMod) return;
      if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomIn(); }
      if (e.key === '-') { e.preventDefault(); zoomOut(); }
      if (e.key === '0') { e.preventDefault(); zoomReset(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const addElement = (type: CanvasElement['type'], imageUrl?: string, position?: Vector2d) => {
    // For tool-based placement, position should be relative to the visible canvas center
    // For click-based placement, position is already in stage coordinates
    let pos: Vector2d;
    
    if (position) {
      // Click-based placement - position is already in stage coordinates
      pos = position;
    } else {
      // Tool-based placement - center in the visible canvas area
      pos = { x: STAGE_PADDING + canvasSize.width / 2, y: STAGE_PADDING + canvasSize.height / 2 };
    }
    
    
    let newElement: CanvasElement | null = null;

    switch (type) {
      case 'rectangle':
        newElement = {
          id: generateId(),
          type: 'rectangle',
          x: pos.x,
          y: pos.y,
          width: 100,
          height: 80,
          fill: '#8B5CF6',
          stroke: '#7C3AED',
          strokeWidth: 2,
        };
        break;
      case 'circle':
        newElement = {
          id: generateId(),
          type: 'circle',
          x: pos.x,
          y: pos.y,
          width: 100,
          height: 100,
          fill: '#F59E0B',
          stroke: '#D97706',
          strokeWidth: 2,
        };
        break;
      case 'text':
        newElement = {
          id: generateId(),
          type: 'text',
          x: pos.x,
          y: pos.y,
          width: 200,
          height: 40,
          text: 'Sample Text',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#1F2937',
        };
        break;
      case 'image':
        newElement = {
          id: generateId(),
          type: 'image',
          x: pos.x,
          y: pos.y,
          width: 150,
          height: 150,
          src: imageUrl || '',
        };
        break;
      default:
        return;
    }

    if (newElement) {
      setEditorState(prev => ({
        ...prev,
        elements: [...prev.elements, newElement!],
        selectedElementId: newElement!.id,
        tool: 'select'
      }));

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added to canvas`);
    }
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      if (editorState.tool !== 'select') {
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) {
          if (editorState.tool === 'image') {
            // For image tool, we don't add on click - user should use the sample images
            setEditorState(prev => ({ ...prev, tool: 'select' }));
          } else {
            addElement(editorState.tool, undefined, pos);
          }
        }
      } else {
        setEditorState(prev => ({ ...prev, selectedElementId: null }));
        setIsEditingText(null);
      }
    }
  };

  const handleElementSelect = (id: string) => {
    setEditorState(prev => ({ ...prev, selectedElementId: id }));
    setIsEditingText(null);
  };

  const handleTextDoubleClick = (id: string) => {
    setIsEditingText(id);
  };

  const handleTextEdit = (id: string, newText: string) => {
    updateElement(id, { text: newText });
    setIsEditingText(null);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  };

  const deleteElement = (id: string) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
      selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId
    }));
    toast.success('Element deleted');
  };

  const exportCanvas = () => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'design.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Design exported successfully!');
    }
  };

  const selectedElement = editorState.elements.find(el => el.id === editorState.selectedElementId);

  return (
    <div className="h-screen bg-editor-background flex">
      {/* Left Sidebar - Tools & Layers */}
      <div className="w-80 bg-editor-panel border-r border-editor-panel-border flex flex-col">
        <ToolbarPanel 
          activeTool={editorState.tool}
          onToolSelect={(tool) => setEditorState(prev => ({ ...prev, tool }))}
          onAddElement={addElement}
          onExport={exportCanvas}
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={zoomReset}
        />
        <LayersPanel 
          elements={editorState.elements}
          selectedElementId={editorState.selectedElementId}
          onElementSelect={handleElementSelect}
          onElementDelete={deleteElement}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <div 
          className="relative"
          style={{ width: canvasSize.width, height: canvasSize.height }}
        >
          {/* Large workspace stage to allow free placement outside the canvas */}
          {(() => {
            const stageWidth = canvasSize.width + STAGE_PADDING * 2;
            const stageHeight = canvasSize.height + STAGE_PADDING * 2;
            const stageStyle = { position: 'absolute' as const, top: -STAGE_PADDING, left: -STAGE_PADDING };
            
            console.log('Stage dimensions:', { stageWidth, stageHeight, stageStyle, canvasSize, STAGE_PADDING });
            
            return (
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            style={stageStyle}
            scaleX={zoom}
            scaleY={zoom}
            onClick={handleStageClick}
            onTap={handleStageClick}
          >
            <Layer>
              <CanvasRenderer
                elements={editorState.elements}
                selectedElementId={editorState.selectedElementId}
                onElementSelect={handleElementSelect}
                onElementUpdate={updateElement}
                onTextDoubleClick={handleTextDoubleClick}
                isEditingText={isEditingText}
                onTextEdit={handleTextEdit}
                canvasSize={canvasSize}
                stagePadding={STAGE_PADDING}
              />
            </Layer>
          </Stage>
            );
          })()}
        </div>
      </div>

      {/* Right Sidebar - Properties */}
      <div className="w-80 bg-editor-panel border-l border-editor-panel-border">
        <PropertiesPanel 
          element={selectedElement}
          onElementUpdate={updateElement}
        />
      </div>
    </div>
  );
};