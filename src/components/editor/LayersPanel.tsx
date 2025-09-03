import { Eye, EyeOff, Trash2, Square, Circle, Type, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CanvasElement } from '@/types/editor';

interface LayersPanelProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onElementSelect: (id: string) => void;
  onElementDelete: (id: string) => void;
}

export const LayersPanel = ({ 
  elements, 
  selectedElementId, 
  onElementSelect, 
  onElementDelete 
}: LayersPanelProps) => {
  const getElementIcon = (type: CanvasElement['type']) => {
    switch (type) {
      case 'rectangle':
        return Square;
      case 'circle':
        return Circle;
      case 'text':
        return Type;
      case 'image':
        return Image;
      default:
        return Square;
    }
  };

  const getElementName = (element: CanvasElement) => {
    if (element.type === 'text' && element.text) {
      return element.text.length > 15 ? `${element.text.substring(0, 15)}...` : element.text;
    }
    return `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${elements.filter(e => e.type === element.type).indexOf(element) + 1}`;
  };

  return (
    <div className="flex-1 p-4 flex flex-col">
      <h2 className="text-lg font-semibold text-foreground mb-4">Layers</h2>
      
      {elements.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm text-center">
            No elements yet.<br />
            Start by adding shapes or text to your canvas.
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {elements.slice().reverse().map((element) => {
              const Icon = getElementIcon(element.type);
              const isSelected = selectedElementId === element.id;
              
              return (
                <div
                  key={element.id}
                  className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-tool-active text-primary-foreground' 
                      : 'hover:bg-tool-hover'
                  }`}
                  onClick={() => onElementSelect(element.id)}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-sm truncate">
                    {getElementName(element)}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                    >
                      <Eye size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onElementDelete(element.id);
                      }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};