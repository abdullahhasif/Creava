export interface CanvasElement {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  opacity?: number;
}

export interface EditorState {
  elements: CanvasElement[];
  selectedElementId: string | null;
  tool: 'select' | 'rectangle' | 'circle' | 'text' | 'image';
}

export interface LayerItem {
  id: string;
  name: string;
  type: CanvasElement['type'];
  visible: boolean;
}