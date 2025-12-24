import React, { useState } from 'react';
import { Check, Skull, Gem, Info } from 'lucide-react';
import { EnchantmentItem, EnchantmentType } from '../types';

interface EnchantmentRowProps {
  item: EnchantmentItem;
  isChecked: boolean;
  onToggle: (id: string) => void;
}

export const EnchantmentRow: React.FC<EnchantmentRowProps> = ({ item, isChecked, onToggle }) => {
  const [showInfo, setShowInfo] = useState(false);
  const isCurse = item.type === EnchantmentType.CURSE;
  const isTreasure = item.type === EnchantmentType.TREASURE;

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(!showInfo);
  };

  return (
    <div className="flex flex-col">
      <div
        onClick={() => onToggle(item.id)}
        className={`
          group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 border relative z-10
          ${isChecked 
            ? 'bg-green-900/20 border-green-800/50' 
            : 'bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600'
          }
        `}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Checkbox Graphic */}
          <div
            className={`
              w-6 h-6 rounded flex items-center justify-center transition-colors border shrink-0
              ${isChecked
                ? 'bg-green-600 border-green-500 text-white'
                : 'bg-zinc-900 border-zinc-600 group-hover:border-zinc-500'
              }
            `}
          >
            {isChecked && <Check size={16} strokeWidth={3} />}
          </div>

          {/* Text Content */}
          <div className="flex flex-col">
            <span
              className={`
                font-medium text-sm sm:text-base flex items-center gap-2
                ${isChecked ? 'text-zinc-400 line-through' : 'text-zinc-100'}
                ${isCurse && !isChecked ? 'text-red-400' : ''}
                ${isTreasure && !isChecked ? 'text-cyan-400' : ''}
              `}
            >
              {item.name}
              {isCurse && <Skull size={14} className="text-red-500/80" />}
              {isTreasure && <Gem size={14} className="text-cyan-500/80" />}
            </span>
            {item.maxLevel && (
              <span className={`text-xs ${isChecked ? 'text-zinc-600' : 'text-zinc-500'}`}>
                Level: {item.maxLevel}
              </span>
            )}
          </div>
        </div>

        {/* Info Button */}
        {item.description && (
          <button
            onClick={handleInfoClick}
            className={`
              ml-2 p-1.5 rounded-md transition-colors
              ${showInfo ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50'}
            `}
            title="Info"
          >
            <Info size={18} />
          </button>
        )}
      </div>

      {/* Description Panel */}
      {showInfo && item.description && (
        <div className="mx-2 mt-[-4px] p-3 pb-4 pt-4 bg-zinc-900 border-x border-b border-zinc-800 rounded-b-lg text-sm text-zinc-400 animate-in slide-in-from-top-2 duration-200 relative z-0">
          <p className="leading-relaxed pl-9 border-l-2 border-emerald-500/30">
            {item.description}
          </p>
        </div>
      )}
    </div>
  );
};