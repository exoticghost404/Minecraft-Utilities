import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Category,CheckedState } from '../types';
import { EnchantmentRow } from './EnchantmentRow';

interface CategorySectionProps {
  category: Category;
  checkedState: CheckedState;
  onToggleItem: (id: string) => void;
  searchQuery: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  checkedState,
  onToggleItem,
  searchQuery,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Filter items based on search query
  const filteredGroups = category.groups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  if (filteredGroups.length === 0) return null;

  // Calculate progress for this category
  const totalItems = filteredGroups.reduce((acc, group) => acc + group.items.length, 0);
  const checkedItems = filteredGroups.reduce((acc, group) => 
    acc + group.items.filter(item => checkedState[item.id]).length, 0
  );
  const progress = Math.round((checkedItems / totalItems) * 100);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm mb-6">
      {/* Header */}
      <div 
        className="p-4 bg-zinc-800/80 backdrop-blur-sm border-b border-zinc-700/50 flex items-center justify-between cursor-pointer hover:bg-zinc-800 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-950 rounded-lg text-emerald-400 border border-zinc-800 shadow-inner">
            <category.icon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">{category.name}</h2>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="w-16 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{checkedItems}/{totalItems}</span>
            </div>
          </div>
        </div>
        <button className="text-zinc-400 hover:text-white">
          {isCollapsed ? <ChevronDown /> : <ChevronUp />}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-6">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.name + groupIndex}>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 ml-1">
                {group.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.items.map((item) => (
                  <EnchantmentRow
                    key={item.id}
                    item={item}
                    isChecked={!!checkedState[item.id]}
                    onToggle={onToggleItem}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
