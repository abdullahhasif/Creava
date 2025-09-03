import { Square, Circle, Type, Download, MousePointer, Plus, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CanvasElement } from '@/types/editor';
import sample1 from '@/assets/sample1.jpg';
import sample2 from '@/assets/sample2.jpg';
import sample3 from '@/assets/sample3.jpg';
import sample4 from '@/assets/sample4.jpg';

interface ToolbarPanelProps {
  activeTool: string;
  onToolSelect: (tool: 'select' | 'rectangle' | 'circle' | 'text' | 'image') => void;
  onAddElement: (type: CanvasElement['type'], imageUrl?: string) => void;
  onExport: () => void;
}

export const ToolbarPanel = ({ 
  activeTool, 
  onToolSelect, 
  onAddElement, 
  onExport 
}: ToolbarPanelProps) => {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Select' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'image', icon: Image, label: 'Image' },
  ] as const;

  const sampleImages = [
    { src: sample1, name: 'Abstract' },
    { src: sample2, name: 'Landscape' },
    { src: sample3, name: 'Workspace' },
    { src: sample4, name: 'Tropical' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Tools</h2>
      
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          
          return (
            <Button
              key={tool.id}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              onClick={() => onToolSelect(tool.id as any)}
              className={`h-12 flex flex-col gap-1 ${
                isActive ? 'bg-tool-active text-primary-foreground' : 'hover:bg-tool-hover'
              }`}
            >
              <Icon size={16} />
              <span className="text-xs">{tool.label}</span>
            </Button>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Add</h3>
        <div className="space-y-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement('rectangle')}
            className="w-full justify-start gap-2"
          >
            <Plus size={14} />
            Add Rectangle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement('circle')}
            className="w-full justify-start gap-2"
          >
            <Plus size={14} />
            Add Circle
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddElement('text')}
            className="w-full justify-start gap-2"
          >
            <Plus size={14} />
            Add Text
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Sample Images</h3>
        <div className="grid grid-cols-2 gap-2">
          {sampleImages.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-pointer rounded-md overflow-hidden border border-editor-panel-border hover:border-primary transition-colors"
              onClick={() => onAddElement('image', image.src)}
            >
              <img
                src={image.src}
                alt={image.name}
                className="w-full h-16 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Plus size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center">
                {image.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Button
        onClick={onExport}
        className="w-full gap-2"
        variant="default"
      >
        <Download size={16} />
        Export PNG
      </Button>
    </div>
  );
};