import { Rect, Circle, Text, Transformer, Image, Line } from 'react-konva';
import { useRef, useEffect, useState } from 'react';
import React from 'react';
import { CanvasElement } from '@/types/editor';
import Konva from 'konva';
import useImage from 'use-image';

interface CanvasRendererProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onElementSelect: (id: string) => void;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onTextDoubleClick: (id: string) => void;
  isEditingText: string | null;
  onTextEdit: (id: string, text: string) => void;
  canvasSize: { width: number; height: number };
  stagePadding?: number;
}

// Smart guides configuration
const GUIDE_THRESHOLD = 10; // pixels within which to show guides
const GUIDE_COLOR = '#3B82F6'; // blue color for guides
const GUIDE_WIDTH = 1;

// Calculate alignment guides for an element being dragged
const calculateGuides = (
  draggedElement: CanvasElement,
  otherElements: CanvasElement[],
  canvasSize: { width: number; height: number },
  stagePadding: number
) => {
  const guides: Array<{ x1: number; y1: number; x2: number; y2: number; type: string }> = [];
  
  // Canvas center guides
  const canvasCenterX = stagePadding + canvasSize.width / 2;
  const canvasCenterY = stagePadding + canvasSize.height / 2;
  
  // Canvas edge guides
  const canvasLeft = stagePadding;
  const canvasRight = stagePadding + canvasSize.width;
  const canvasTop = stagePadding;
  const canvasBottom = stagePadding + canvasSize.height;
  
  // Check vertical alignment with canvas center
  if (Math.abs(draggedElement.x + draggedElement.width / 2 - canvasCenterX) < GUIDE_THRESHOLD) {
    guides.push({
      x1: canvasCenterX,
      y1: stagePadding - 50,
      x2: canvasCenterX,
      y2: stagePadding + canvasSize.height + 50,
      type: 'canvas-center-vertical'
    });
  }
  
  // Check horizontal alignment with canvas center
  if (Math.abs(draggedElement.y + draggedElement.height / 2 - canvasCenterY) < GUIDE_THRESHOLD) {
    guides.push({
      x1: stagePadding - 50,
      y1: canvasCenterY,
      x2: stagePadding + canvasSize.width + 50,
      y2: canvasCenterY,
      type: 'canvas-center-horizontal'
    });
  }
  
  // Check alignment with other elements
  otherElements.forEach(element => {
    if (element.id === draggedElement.id) return;
    
    // Vertical alignment (left edges)
    if (Math.abs(draggedElement.x - element.x) < GUIDE_THRESHOLD) {
      guides.push({
        x1: element.x,
        y1: Math.min(draggedElement.y, element.y) - 20,
        x2: element.x,
        y2: Math.max(draggedElement.y + draggedElement.height, element.y + element.height) + 20,
        type: 'element-left'
      });
    }
    
    // Vertical alignment (right edges)
    if (Math.abs((draggedElement.x + draggedElement.width) - (element.x + element.width)) < GUIDE_THRESHOLD) {
      guides.push({
        x1: element.x + element.width,
        y1: Math.min(draggedElement.y, element.y) - 20,
        x2: element.x + element.width,
        y2: Math.max(draggedElement.y + draggedElement.height, element.y + element.height) + 20,
        type: 'element-right'
      });
    }
    
    // Vertical alignment (center)
    if (Math.abs((draggedElement.x + draggedElement.width / 2) - (element.x + element.width / 2)) < GUIDE_THRESHOLD) {
      guides.push({
        x1: element.x + element.width / 2,
        y1: Math.min(draggedElement.y, element.y) - 20,
        x2: element.x + element.width / 2,
        y2: Math.max(draggedElement.y + draggedElement.height, element.y + element.height) + 20,
        type: 'element-center-vertical'
      });
    }
    
    // Horizontal alignment (top edges)
    if (Math.abs(draggedElement.y - element.y) < GUIDE_THRESHOLD) {
      guides.push({
        x1: Math.min(draggedElement.x, element.x) - 20,
        y1: element.y,
        x2: Math.max(draggedElement.x + draggedElement.width, element.x + element.width) + 20,
        y2: element.y,
        type: 'element-top'
      });
    }
    
    // Horizontal alignment (bottom edges)
    if (Math.abs((draggedElement.y + draggedElement.height) - (element.y + element.height)) < GUIDE_THRESHOLD) {
      guides.push({
        x1: Math.min(draggedElement.x, element.x) - 20,
        y1: element.y + element.height,
        x2: Math.max(draggedElement.x + draggedElement.width, element.x + element.width) + 20,
        y2: element.y + element.height,
        type: 'element-bottom'
      });
    }
    
    // Horizontal alignment (center)
    if (Math.abs((draggedElement.y + draggedElement.height / 2) - (element.y + element.height / 2)) < GUIDE_THRESHOLD) {
      guides.push({
        x1: Math.min(draggedElement.x, element.x) - 20,
        y1: element.y + element.height / 2,
        x2: Math.max(draggedElement.x + draggedElement.width, element.x + element.width) + 20,
        y2: element.y + element.height / 2,
        type: 'element-center-horizontal'
      });
    }
  });
  
  return guides;
};

// Image component to handle loading
const KonvaImage = ({ element, ...props }: { element: CanvasElement } & Omit<React.ComponentProps<typeof Image>, 'image'>) => {
  const [image] = useImage(element.src || '');
  
  return (
    <Image
      {...props}
      image={image}
      width={element.width}
      height={element.height}
    />
  );
};

export const CanvasRenderer = ({ 
  elements, 
  selectedElementId, 
  onElementSelect, 
  onElementUpdate,
  onTextDoubleClick,
  isEditingText,
  onTextEdit,
  canvasSize,
  stagePadding = 200
}: CanvasRendererProps) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const [editingText, setEditingText] = useState('');
  const [draggedElement, setDraggedElement] = useState<CanvasElement | null>(null);
  const [guides, setGuides] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; type: string }>>([]);

  useEffect(() => {
    if (transformerRef.current && selectedElementId) {
      const stage = transformerRef.current.getStage();
      const selectedNode = stage?.findOne(`#${selectedElementId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [selectedElementId]);

  const handleElementChange = (id: string) => (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const updates: Partial<CanvasElement> = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    // Handle size changes for rectangles and circles
    if (node.scaleX() !== 1 || node.scaleY() !== 1) {
      updates.width = Math.max(5, node.width() * node.scaleX());
      updates.height = Math.max(5, node.height() * node.scaleY());
      node.scaleX(1);
      node.scaleY(1);
    }

    // Update the element in real-time during drag
    const updatedElement = { ...elements.find(el => el.id === id)!, ...updates };
    
    // Calculate guides for the dragged element
    const newGuides = calculateGuides(updatedElement, elements, canvasSize, stagePadding);
    setGuides(newGuides);
    
    onElementUpdate(id, updates);
  };

  const handleDragStart = (id: string) => () => {
    const element = elements.find(el => el.id === id);
    if (element) {
      setDraggedElement(element);
    }
  };

  const handleDragEnd = (id: string) => () => {
    setDraggedElement(null);
    setGuides([]);
  };

  const handleDragMove = (id: string) => (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const updatedElement = { 
      ...elements.find(el => el.id === id)!, 
      x: node.x(), 
      y: node.y() 
    };
    
    // Calculate guides in real-time during drag
    const newGuides = calculateGuides(updatedElement, elements, canvasSize, stagePadding);
    setGuides(newGuides);
  };

  const renderElement = (element: CanvasElement) => {
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      rotation: element.rotation || 0,
      opacity: element.opacity || 1,
      onClick: () => onElementSelect(element.id),
      onTap: () => onElementSelect(element.id),
      onDragStart: handleDragStart(element.id),
      onDragMove: handleDragMove(element.id),
      onDragEnd: handleDragEnd(element.id),
      onTransformEnd: handleElementChange(element.id),
      draggable: true,
    };

    switch (element.type) {
      case 'rectangle':
        return (
          <Rect
            key={element.id}
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth || 0}
          />
        );

      case 'circle':
        return (
          <Circle
            key={element.id}
            {...commonProps}
            radius={Math.min(element.width, element.height) / 2}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth || 0}
          />
        );

      case 'text':
        if (isEditingText === element.id) {
          // Render an input for editing
          return (
            <Text
              key={element.id}
              {...commonProps}
              text={element.text || 'Text'}
              fontSize={element.fontSize || 16}
              fontFamily={element.fontFamily || 'Arial'}
              fill={element.fill}
              width={element.width}
              height={element.height}
              onDblClick={() => onTextDoubleClick(element.id)}
            />
          );
        }
        return (
          <Text
            key={element.id}
            {...commonProps}
            text={element.text || 'Text'}
            fontSize={element.fontSize || 16}
            fontFamily={element.fontFamily || 'Arial'}
            fill={element.fill}
            width={element.width}
            height={element.height}
            onDblClick={() => onTextDoubleClick(element.id)}
          />
        );

      case 'image':
        return (
          <KonvaImage
            key={element.id}
            element={element}
            {...commonProps}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Canvas background - shows the actual canvas bounds */}
      <Rect
        x={stagePadding}
        y={stagePadding}
        width={canvasSize.width}
        height={canvasSize.height}
        fill="white"
        stroke="#E5E7EB"
        strokeWidth={1}
        shadowColor="rgba(0,0,0,0.1)"
        shadowBlur={10}
        listening={false}
        perfectDrawEnabled={false}
      />
      {elements.map(renderElement)}
      
      {/* Smart Guides */}
      {guides.map((guide, index) => (
        <Line
          key={`guide-${index}`}
          x={guide.x1}
          y={guide.y1}
          points={[0, 0, guide.x2 - guide.x1, guide.y2 - guide.y1]}
          stroke={GUIDE_COLOR}
          strokeWidth={GUIDE_WIDTH}
          dash={[5, 5]}
          listening={false}
          perfectDrawEnabled={false}
        />
      ))}
      
      {selectedElementId && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          anchorStroke="#8B5CF6"
          anchorFill="#8B5CF6"
          anchorSize={8}
          borderStroke="#8B5CF6"
          borderDash={[3, 3]}
        />
      )}
    </>
  );
};