import { useState, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Vector2d } from 'konva/lib/types';
import { CanvasElement, EditorState } from '@/types/editor';
import { ToolbarPanel } from './ToolbarPanel';
import { LayersPanel } from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import { CanvasRenderer } from './CanvasRenderer';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';

export const DesignEditor = () => {
  const [isEditingText, setIsEditingText] = useState<string | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    elements: [],
    selectedElementId: null,
    tool: 'select'
  });
  
  const stageRef = useRef<any>(null);
  const canvasSize = { width: 800, height: 600 };

  const addElement = (type: CanvasElement['type'], imageUrl?: string, position?: Vector2d) => {
    const pos = position || { x: 100, y: 100 };
    let newElement: CanvasElement;

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

    setEditorState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id,
      tool: 'select'
    }));

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added to canvas`);
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
  <div className="h-screen bg-editor-background flex" style={{ overflow: 'visible' }}>
      {/* Left Sidebar - Tools & Layers */}
      <div className="w-80 bg-editor-panel border-r border-editor-panel-border flex flex-col">
        <ToolbarPanel 
          activeTool={editorState.tool}
          onToolSelect={(tool) => setEditorState(prev => ({ ...prev, tool }))}
          onAddElement={addElement}
          onExport={exportCanvas}
        />
        <LayersPanel 
          elements={editorState.elements}
          selectedElementId={editorState.selectedElementId}
          onElementSelect={handleElementSelect}
          onElementDelete={deleteElement}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div 
          className="bg-editor-canvas shadow-xl rounded-lg overflow-hidden"
          style={{ width: canvasSize.width, height: canvasSize.height }}
        >
          <Stage
            ref={stageRef}
            width={canvasSize.width}
            height={canvasSize.height}
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
              />
            </Layer>
          </Stage>
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