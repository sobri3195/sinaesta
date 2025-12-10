
import React from 'react';
import { User } from '../types';

interface WatermarkProps {
  user: User;
}

const Watermark: React.FC<WatermarkProps> = ({ user }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex flex-wrap gap-24 p-12 opacity-5 select-none" aria-hidden="true">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="transform -rotate-45 text-sm font-bold text-gray-900 whitespace-nowrap">
          {user.name} • {user.id} • {new Date().toLocaleDateString()}
        </div>
      ))}
    </div>
  );
};

export default Watermark;
