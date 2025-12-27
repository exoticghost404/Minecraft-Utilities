
import { LucideIcon } from 'lucide-react';

export enum EnchantmentType {
  NORMAL = 'NORMAL',
  CURSE = 'CURSE',
  TREASURE = 'TREASURE', 
}

export interface EnchantmentItem {
  id: string;
  name: string;
  maxLevel?: string; // e.g., "I-IV"
  type: EnchantmentType;
  description?: string;
}

export interface EnchantmentGroup {
  name: string; // e.g., "Helmet", "Sword"
  items: EnchantmentItem[];
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  groups: EnchantmentGroup[];
}

export type CheckedState = Record<string, boolean>;

// Best Loadouts Types
export interface LoadoutOption {
  name: string;
  level?: string;
  note?: string; // e.g., "Mutually exclusive with Mending"
  isChoice?: boolean; // If user has to pick one (e.g. Silk Touch vs Fortune)
}

export interface BestLoadout {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  enchantments: LoadoutOption[];
  alternatives?: string; // Text description of alternatives
}

// Notes Types
export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  color?: string; // Hex code or tailwind class identifier
  isPinned?: boolean;
}

// Brewing Types
export interface PotionRecipe {
  id: string;
  name: string;
  ingredients: string[];
  base: string; // usually "Awkward Potion" or "Water Bottle"
  effect: string;
  baseDuration?: string; // e.g. "3:00"
  modifiers: {
    extended?: boolean;
    level2?: boolean;
    splash?: boolean;
    lingering?: boolean;
  };
  incompatible?: string[];
}
