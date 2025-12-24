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
  note?: string;
  isChoice?: boolean;
}

export interface BestLoadout {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  enchantments: LoadoutOption[];
  alternatives?: string;
}

// Notes Types
export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
  color?: string;
  isPinned?: boolean;
}