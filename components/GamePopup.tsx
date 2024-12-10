import React from 'react';
import { Button } from '@/components/ui/button';

interface GamePopupProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const GamePopup: React.FC<GamePopupProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[70] bg-black bg-opacity-50">
      <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <p className="text-lg mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button onClick={onCancel} variant="outline" className="text-white border-white">
              Cancel
            </Button>
          )}
          <Button onClick={onConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
            OK
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GamePopup;
