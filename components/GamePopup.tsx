import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react'; // Import 3D icons

interface GamePopupProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const GamePopup: React.FC<GamePopupProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[70] bg-black bg-opacity-50 backdrop-blur-md">
      <div className="bg-gradient-to-br from-gray-900/70 to-black/70 text-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 border border-gray-700/50 backdrop-blur-lg">
        <p className="text-xl mb-6 text-center">{message}</p>
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full text-white border-white hover:bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5 mr-2" /> Cancel
            </Button>
          )}
          <Button
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white flex items-center justify-center"
          >
            <Check className="w-5 h-5 mr-2" /> OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GamePopup;
