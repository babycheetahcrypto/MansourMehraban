import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const gradientAnimation = `
@keyframes gradient-x {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
`;

interface GamePopupProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const GamePopup: React.FC<GamePopupProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <>
      <style>{gradientAnimation}</style>
      <div className="fixed inset-0 flex items-center justify-center z-[70] bg-black bg-opacity-30 backdrop-blur-lg">
        <div className="bg-gradient-to-br from-gray-900/80 to-black/80 text-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 border border-gray-600/50 backdrop-blur-xl">
          <p className="text-2xl mb-6 text-center font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            {message}
          </p>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={onConfirm}
              className="w-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 hover:from-yellow-500 hover:via-red-600 hover:to-pink-600 text-white flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OK%203D%20ICON-2HrVEEuVo12rI3MGOURaLVkWB6Q5iF.png"
                alt="OK"
                width={24}
                height={24}
                className="w-6 h-6 relative z-10"
              />
              <span className="font-bold text-lg relative z-10">OK</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GamePopup;
