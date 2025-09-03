import { Rect, Circle, Text, Transformer, Image } from 'react-konva';
import { useRef, useEffect, useState } from 'react';
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
}

// Image component to handle loading
const KonvaImage = ({ element, ...props }: { element: CanvasElement } & any) => {
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
  onTextEdit
}: CanvasRendererProps) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const [editingText, setEditingText] = useState('');

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

  const handleElementChange = (id: string) => (e: any) => {
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

    onElementUpdate(id, updates);
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
      onDragEnd: handleElementChange(element.id),
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
      {elements.map(renderElement)}
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