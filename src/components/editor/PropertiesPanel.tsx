import { useState } from 'react';
import { CanvasElement } from '@/types/editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PropertiesPanelProps {
  element: CanvasElement | undefined;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export const PropertiesPanel = ({ element, onElementUpdate }: PropertiesPanelProps) => {
  const [colorInput, setColorInput] = useState(element?.fill || '#000000');

  if (!element) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm text-center">
          Select an element to edit its properties
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<CanvasElement>) => {
    onElementUpdate(element.id, updates);
  };

  const colorPresets = [
    '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', 
    '#3B82F6', '#F97316', '#84CC16', '#EC4899'
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Properties</h2>

        {/* Position & Size */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Position & Size</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="x" className="text-xs">X</Label>
              <Input
                id="x"
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => handleUpdate({ x: parseInt(e.target.value) || 0 })}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="y" className="text-xs">Y</Label>
              <Input
                id="y"
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => handleUpdate({ y: parseInt(e.target.value) || 0 })}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="width" className="text-xs">Width</Label>
              <Input
                id="width"
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => handleUpdate({ width: parseInt(e.target.value) || 1 })}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height" className="text-xs">Height</Label>
              <Input
                id="height"
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => handleUpdate({ height: parseInt(e.target.value) || 1 })}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Appearance */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Appearance</h3>
          
          {/* Fill Color */}
          <div className="space-y-2">
            <Label className="text-xs">Fill Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={element.fill || '#000000'}
                onChange={(e) => handleUpdate({ fill: e.target.value })}
                className="w-12 h-8 p-1 rounded"
              />
              <Input
                type="text"
                value={element.fill || '#000000'}
                onChange={(e) => handleUpdate({ fill: e.target.value })}
                placeholder="#000000"
                className="flex-1 h-8"
              />
            </div>
            <div className="grid grid-cols-4 gap-1">
              {colorPresets.map((color) => (
                <Button
                  key={color}
                  variant="outline"
                  size="sm"
                  className="h-8 p-0"
                  style={{ backgroundColor: color }}
                  onClick={() => handleUpdate({ fill: color })}
                />
              ))}
            </div>
          </div>

          {/* Stroke */}
          {element.type !== 'text' && (
            <>
              <div className="space-y-2">
                <Label className="text-xs">Stroke Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={element.stroke || '#000000'}
                    onChange={(e) => handleUpdate({ stroke: e.target.value })}
                    className="w-12 h-8 p-1 rounded"
                  />
                  <Input
                    type="text"
                    value={element.stroke || '#000000'}
                    onChange={(e) => handleUpdate({ stroke: e.target.value })}
                    placeholder="#000000"
                    className="flex-1 h-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Stroke Width</Label>
                <Slider
                  value={[element.strokeWidth || 0]}
                  onValueChange={([value]) => handleUpdate({ strokeWidth: value })}
                  max={20}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">{element.strokeWidth || 0}px</span>
              </div>
            </>
          )}

          {/* Opacity */}
          <div className="space-y-2">
            <Label className="text-xs">Opacity</Label>
            <Slider
              value={[element.opacity || 1]}
              onValueChange={([value]) => handleUpdate({ opacity: value })}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{Math.round((element.opacity || 1) * 100)}%</span>
          </div>
        </div>

        {/* Text Properties */}
        {element.type === 'text' && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Text</h3>
              <div className="space-y-2">
                <Label htmlFor="text" className="text-xs">Content</Label>
                <textarea
                  id="text"
                  value={element.text || ''}
                  onChange={(e) => handleUpdate({ text: e.target.value })}
                  placeholder="Enter text..."
                  className="w-full h-20 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                <Input
                  id="fontSize"
                  type="number"
                  value={element.fontSize || 16}
                  onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) || 16 })}
                  className="h-8"
                />
              </div>
            </div>
          </>
        )}

        {/* Image Properties */}
        {element.type === 'image' && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Image</h3>
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-xs">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={element.src || ''}
                  onChange={(e) => handleUpdate({ src: e.target.value })}
                  placeholder="Enter image URL..."
                  className="h-8"
                />
              </div>
              {element.src && (
                <div className="border border-editor-panel-border rounded-md overflow-hidden">
                  <img
                    src={element.src}
                    alt="Preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              )}
            </div>
          </>
        )}

        <Separator />

        {/* Transform */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Transform</h3>
          <div className="space-y-2">
            <Label className="text-xs">Rotation</Label>
            <Slider
              value={[element.rotation || 0]}
              onValueChange={([value]) => handleUpdate({ rotation: value })}
              max={360}
              min={0}
              step={1}
              className="w-full"
            />
            <span className="text-xs text-muted-foreground">{element.rotation || 0}°</span>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};