import React from 'react';
import { 
  Menu, 
  Save, 
  Download, 
  Share, 
  Undo, 
  Redo, 
  Crown,
  Settings,
  User,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  projectName?: string;
  onSave?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  projectName = "Untitled design",
  onSave,
  onExport,
  onShare,
  onUndo,
  onRedo
}) => {
  return (
    <div className="h-14 bg-gradient-to-r from-primary via-purple-500 to-pink-500 flex items-center justify-between px-4 text-white shadow-lg">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Menu Button */}
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-lg">C</span>
          </div>
          <span className="font-bold text-xl hidden sm:block">Creava</span>
        </div>

        {/* File Menu */}
        <div className="hidden md:flex items-center space-x-1">
          <button className="px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm">
            File
          </button>
          <button className="px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm">
            Edit
          </button>
          <button className="px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-sm">
            View
          </button>
        </div>
      </div>

      {/* Center Section - Project Name & Actions */}
      <div className="flex items-center space-x-3">
        {/* Undo/Redo */}
        <div className="hidden sm:flex items-center space-x-1">
          <button 
            onClick={onUndo}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button 
            onClick={onRedo}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>

        {/* Project Name */}
        <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
          <span className="text-sm font-medium max-w-32 sm:max-w-48 truncate">
            {projectName}
          </span>
          <ChevronDown size={16} />
        </div>

        {/* Save Button */}
        <button 
          onClick={onSave}
          className="hidden sm:flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
        >
          <Save size={16} />
          <span className="text-sm">Save</span>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Export Button */}
        <button 
          onClick={onExport}
          className="hidden sm:flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
        >
          <Download size={16} />
          <span className="text-sm">Export</span>
        </button>

        {/* Pro Badge */}
        <div className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-3 py-1 rounded-full text-xs font-semibold">
          <Crown size={14} />
          <span>Pro</span>
        </div>

        {/* Share Button */}
        <button 
          onClick={onShare}
          className="flex items-center space-x-2 bg-white text-primary hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Share size={16} />
          <span className="text-sm">Share</span>
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
          <button className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <User size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
