import { DesignEditor } from '@/components/editor/DesignEditor';
import Navbar from '@/components/navbar/Navbar';
import { toast } from 'sonner';

const Index = () => {
  const handleSave = () => {
    toast.success('Project saved successfully!');
    // Implement save functionality
  };

  const handleExport = () => {
    toast.success('Project exported successfully!');
    // Implement export functionality
  };

  const handleShare = () => {
    toast.success('Share link copied to clipboard!');
    // Implement share functionality
  };

  const handleUndo = () => {
    toast.info('Undo action performed');
    // Implement undo functionality
  };

  const handleRedo = () => {
    toast.info('Redo action performed');
    // Implement redo functionality
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar 
        projectName="My Creava Design"
        onSave={handleSave}
        onExport={handleExport}
        onShare={handleShare}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />
      <div className="flex-1">
        <DesignEditor />
      </div>
    </div>
  );
};

export default Index;
