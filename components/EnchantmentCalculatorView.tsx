import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Calculator, Plus, Book, AlertCircle, Check, Lock, Unlock, RefreshCw, Minus, Search, Trash2, Timer, Hammer } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface EnchantmentCalculatorViewProps {
  onBack: () => void;
}

const ITEM_TYPES = [
  'Helmet', 'Chestplate', 'Leggings', 'Boots', 'Turtle Shell',
  'Sword', 'Pickaxe', 'Axe', 'Shovel', 'Hoe', 
  'Bow', 'Crossbow', 'Trident', 'Mace', 'Spear', 'Shield',
  'Fishing Rod', 'Shears', 'Flint and Steel', 'Brush', 
  'Elytra', 'Carrot/Warped Fungus Stick', 'Pumpkin',
  'Book'
];

/**
 * Enchantment Data with Multipliers (Sacrifice = Book)
 * Based on https://minecraft.wiki/w/Anvil_mechanics#Enchantment_multiplier
 */
interface EnchantData {
  levelMax: number;
  weight: number; // Multplier when sacrifice is a Book
  incompatible: string[];
  items: string[];
}

const ENCHANTMENT_DATA: Record<string, EnchantData> = {
  // Armor
  protection: { levelMax: 4, weight: 1, incompatible: ["blast_protection", "fire_protection", "projectile_protection"], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
  fire_protection: { levelMax: 4, weight: 1, incompatible: ["blast_protection", "protection", "projectile_protection"], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
  feather_falling: { levelMax: 4, weight: 1, incompatible: [], items: ["boots"] },
  blast_protection: { levelMax: 4, weight: 2, incompatible: ["fire_protection", "protection", "projectile_protection"], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
  projectile_protection: { levelMax: 4, weight: 1, incompatible: ["protection", "blast_protection", "fire_protection"], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
  respiration: { levelMax: 3, weight: 2, incompatible: [], items: ["helmet", "turtle_shell"] },
  aqua_affinity: { levelMax: 1, weight: 2, incompatible: [], items: ["helmet", "turtle_shell"] },
  thorns: { levelMax: 3, weight: 4, incompatible: [], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
  depth_strider: { levelMax: 3, weight: 2, incompatible: ["frost_walker"], items: ["boots"] },
  frost_walker: { levelMax: 2, weight: 2, incompatible: ["depth_strider"], items: ["boots"] },
  soul_speed: { levelMax: 3, weight: 4, incompatible: [], items: ["boots"] },
  swift_sneak: { levelMax: 3, weight: 4, incompatible: [], items: ["leggings"] },

  // Weapons
  sharpness: { levelMax: 5, weight: 1, incompatible: ["bane_of_arthropods", "smite", "density", "breach"], items: ["sword", "axe", "spear"] },
  smite: { levelMax: 5, weight: 1, incompatible: ["bane_of_arthropods", "sharpness", "density", "breach"], items: ["sword", "axe", "mace", "spear"] },
  bane_of_arthropods: { levelMax: 5, weight: 1, incompatible: ["smite", "sharpness", "density", "breach"], items: ["sword", "axe", "mace", "spear"] },
  knockback: { levelMax: 2, weight: 1, incompatible: [], items: ["sword", "spear"] },
  fire_aspect: { levelMax: 2, weight: 2, incompatible: [], items: ["sword", "mace", "spear"] },
  looting: { levelMax: 3, weight: 2, incompatible: [], items: ["sword", "spear"] },
  sweeping_edge: { levelMax: 3, weight: 2, incompatible: [], items: ["sword"] },
   
  // Ranged
  power: { levelMax: 5, weight: 1, incompatible: [], items: ["bow"] },
  punch: { levelMax: 2, weight: 2, incompatible: [], items: ["bow"] },
  flame: { levelMax: 1, weight: 2, incompatible: [], items: ["bow"] },
  infinity: { levelMax: 1, weight: 4, incompatible: ["mending"], items: ["bow"] },
  luck_of_the_sea: { levelMax: 3, weight: 2, incompatible: [], items: ["fishing_rod"] },
  lure: { levelMax: 3, weight: 2, incompatible: [], items: ["fishing_rod"] },
  loyalty: { levelMax: 3, weight: 1, incompatible: ["riptide"], items: ["trident"] },
  impaling: { levelMax: 5, weight: 2, incompatible: [], items: ["trident"] },
  riptide: { levelMax: 3, weight: 2, incompatible: ["channeling", "loyalty"], items: ["trident"] },
  channeling: { levelMax: 1, weight: 4, incompatible: ["riptide"], items: ["trident"] },
  multishot: { levelMax: 1, weight: 2, incompatible: ["piercing"], items: ["crossbow"] },
  piercing: { levelMax: 4, weight: 1, incompatible: ["multishot"], items: ["crossbow"] },
  quick_charge: { levelMax: 3, weight: 1, incompatible: [], items: ["crossbow"] },

  // Tools
  efficiency: { levelMax: 5, weight: 1, incompatible: [], items: ["pickaxe", "shovel", "axe", "hoe", "shears"] },
  silk_touch: { levelMax: 1, weight: 4, incompatible: ["fortune"], items: ["pickaxe", "shovel", "axe", "hoe", "shears"] },
  fortune: { levelMax: 3, weight: 2, incompatible: ["silk_touch"], items: ["pickaxe", "shovel", "axe", "hoe"] },

  // Universal
  unbreaking: { levelMax: 3, weight: 1, incompatible: [], items: ["helmet", "chestplate", "leggings", "boots", "pickaxe", "shovel", "axe", "sword", "hoe", "brush", "fishing_rod", "bow", "shears", "flint_and_steel", "carrot_on_a_stick", "warped_fungus_on_a_stick", "shield", "elytra", "trident", "turtle_shell", "crossbow", "mace", "spear"] },
  mending: { levelMax: 1, weight: 2, incompatible: ["infinity"], items: ["helmet", "chestplate", "leggings", "boots", "pickaxe", "shovel", "axe", "sword", "hoe", "brush", "fishing_rod", "bow", "shears", "flint_and_steel", "carrot_on_a_stick", "warped_fungus_on_a_stick", "shield", "elytra", "trident", "turtle_shell", "crossbow", "mace", "spear"] },
  curse_of_binding: { levelMax: 1, weight: 4, incompatible: [], items: ["helmet", "chestplate", "leggings", "boots", "elytra", "pumpkin", "turtle_shell"] },
  curse_of_vanishing: { levelMax: 1, weight: 4, incompatible: [], items: ["helmet", "chestplate", "leggings", "boots", "pickaxe", "shovel", "axe", "sword", "hoe", "brush", "fishing_rod", "bow", "shears", "flint_and_steel", "carrot_on_a_stick", "warped_fungus_on_a_stick", "shield", "elytra", "pumpkin", "trident", "turtle_shell", "crossbow", "mace", "spear"] },

  // 1.21 Mace & Spear
  density: { levelMax: 5, weight: 1, incompatible: ["breach", "smite", "bane_of_arthropods", "sharpness"], items: ["mace"] },
  breach: { levelMax: 4, weight: 2, incompatible: ["density", "smite", "bane_of_arthropods", "sharpness"], items: ["mace"] },
  wind_burst: { levelMax: 3, weight: 2, incompatible: [], items: ["mace"] },
  lunge: { levelMax: 3, weight: 1, incompatible: [], items: ["spear"] }
};

const normalizeItemType = (type: string): string => {
  const t = type.toLowerCase();
  if (t.includes('turtle')) return 'turtle_shell';
  if (t.includes('carrot')) return 'carrot_on_a_stick';
  if (t.includes('flint')) return 'flint_and_steel';
  if (t.includes('fishing')) return 'fishing_rod';
  return t.replace(/\s+/g, '_').replace(/[\/]/g, '_');
};

const getMaxLevelNumber = (maxLevelRange?: string) => {
  if (!maxLevelRange) return 1;
  const parts = maxLevelRange.split(/[–-]/); 
  const roman = parts[parts.length - 1];
  const map: Record<string, number> = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5 };
  return map[roman] || 1;
};

const getDisplayLevel = (level: number) => {
  const map: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
  return map[level] || `${level}`;
};

const getPrettyName = (id: string) => {
  for (const cat of CATEGORIES) {
    for (const group of cat.groups) {
      const item = group.items.find(i => i.id === id);
      if (item) return item.name;
    }
  }
  return id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// --- ALGORITHM IMPLEMENTATION (OPTIMIZED BITMASK DP) ---

let ID_LIST: Record<string, number> = {};
let ENCHANTMENT2WEIGHT: number[] = [];

// Initialize static data
const initializeSolverData = () => {
  ID_LIST = {};
  ENCHANTMENT2WEIGHT = [];
  let id = 0;
  for (const key in ENCHANTMENT_DATA) {
    ID_LIST[key] = id;
    ENCHANTMENT2WEIGHT[id] = ENCHANTMENT_DATA[key].weight;
    id++;
  }
};
initializeSolverData();

const MAXIMUM_MERGE_LEVELS = 39;

class MergeLevelsTooExpensiveError extends Error {
  constructor(message = 'merge levels is above maximum allowed') {
    super(message);
    this.name = 'MergeLevelsTooExpensiveError';
  }
}

const experience = (level: number) => {
  if (level === 0) return 0;
  if (level <= 16) return level * level + 6 * level;
  if (level <= 31) return 2.5 * level * level - 40.5 * level + 360;
  return 4.5 * level * level - 162.5 * level + 2220;
};

class item_obj {
  i: string | number;
  e: number[]; // Array of Enchantment IDs
  c: any;      // Composition/History for reconstruction
  w: number;   // Work Value (Prior Penalty Uses)
  l: number;   // Accumulated Enchantment Cost
  x: number;   // Total XP Cost
  display: string;

  constructor(name: string | number, value: number = 0, id: number[] = [], display: string = '') {
    this.i = name;
    this.e = id;
    this.c = {};
    this.w = 0;
    this.l = value;
    this.x = 0;
    this.display = display;
  }
}

const stripBookWrapper = (name: string): string => {
  if (name.startsWith('Book (') && name.endsWith(')')) {
    return name.slice(6, -1);
  }
  return name;
};

class MergeEnchants extends item_obj {
  constructor(left: item_obj, right: item_obj) {
    const penaltyA = Math.pow(2, left.w) - 1;
    const penaltyB = Math.pow(2, right.w) - 1;
    const enchant_cost = right.l; 
    
    const merge_cost = penaltyA + penaltyB + enchant_cost;
    
    if (merge_cost > MAXIMUM_MERGE_LEVELS) {
      throw new MergeLevelsTooExpensiveError();
    }
    
    const new_value = left.l + right.l;
    let display = "Book";
    const rightContent = stripBookWrapper(right.display);
    
    if (left.i === 'item') {
      if (left.display.includes('(') && left.display.endsWith(')')) {
        display = left.display.slice(0, -1) + `, ${rightContent})`;
      } else {
        display = `${left.display} (${rightContent})`;
      }
    } else {
      const leftContent = stripBookWrapper(left.display);
      display = `Book (${leftContent}, ${rightContent})`;
    }

    // Call parent constructor
    super(left.i, new_value, left.e.concat(right.e), display);
    
    this.w = Math.max(left.w, right.w) + 1;
    this.x = left.x + right.x + experience(merge_cost);
    this.c = { 
      L: left.c, 
      R: right.c, 
      l: merge_cost, 
      w: this.w, 
      v: this.l,
      leftDisplay: left.display,
      rightDisplay: right.display
    };
  }
}

// Count set bits in an integer (Hamming Weight)
function countSetBits(n: number): number {
  let count = 0;
  while (n > 0) {
    n &= (n - 1);
    count++;
  }
  return count;
}

// Compare two items and return the 'better' one based on Anvil mechanics
// Returns true if item1 is better than or equal to item2
function isBetterOrEqual(item1: item_obj, item2: item_obj): boolean {
  // If work penalty is lower, it's generally better
  if (item1.w < item2.w) return true;
  if (item1.w > item2.w) return false;
  
  // If work penalty is same, check XP cost
  if (item1.x < item2.x) return true;
  if (item1.x > item2.x) return false;

  // If XP is same, check Level cost
  return item1.l <= item2.l;
}

function getInstructions(comb: any): any[] {
  let instructions: any[] = [];
  if (comb.L || comb.R) {
    if (comb.L && comb.L.l !== undefined) instructions = instructions.concat(getInstructions(comb.L));
    if (comb.R && comb.R.l !== undefined) instructions = instructions.concat(getInstructions(comb.R));
    const cost = comb.l;
    const xp = experience(cost);
    const work = Math.max(comb.L.w, comb.R.w) + 1;
    const priorPenalty = Math.pow(2, work) - 1;
    instructions.push({ 
      left: comb.leftDisplay, 
      right: comb.rightDisplay, 
      cost: cost, 
      xp: xp, 
      priorWork: priorPenalty 
    });
  }
  return instructions;
}

/**
 * Main Solver Logic
 * Uses Bottom-Up DP with Bitmasks
 */
function processCalculation(itemType: string, enchants: [string, number][], mode: 'levels' | 'prior_work') {
  // 1. Prepare Base Objects
  const enchant_objs: item_obj[] = [];
  
  enchants.forEach(([name, level]) => {
    const id = ID_LIST[name];
    const weight = ENCHANTMENT2WEIGHT[id];
    const val = level * weight;
    const display = `Book (${getPrettyName(name)} ${getDisplayLevel(level)})`;
    const obj = new item_obj('book', val, [id], display);
    obj.c = { I: id, l: obj.l, w: obj.w };
    enchant_objs.push(obj);
  });

  if (enchant_objs.length === 0) return null;

  // 2. Identify Target Item
  let base_item: item_obj;
  const isBookOnly = itemType === 'book';
  let initialItems: item_obj[] = [...enchant_objs];

  if (!isBookOnly) {
     const formattedItemName = itemType.charAt(0).toUpperCase() + itemType.slice(1).replace(/_/g, ' ');
     base_item = new item_obj('item', 0, [], formattedItemName);
     base_item.c = { I: 'item', l: 0, w: 0 };
     initialItems = [base_item, ...enchant_objs];
  }

  const N = initialItems.length;
  // Limit check: if too many enchants, bitmask might overflow (JS bitwise ops are 32-bit).
  // Minecraft usually has max ~10-15 enchants, so 2^15 is safe for 32-bit int.
  const LIMIT = 1 << N; 

  // DP State: dp[mask] = Record<WorkPenalty, item_obj>
  // We keep the best item for each WorkPenalty at this mask.
  const dp: Array<Record<number, item_obj>> = new Array(LIMIT).fill(null).map(() => ({}));

  // 3. Initialize DP with single items
  for (let i = 0; i < N; i++) {
    const mask = 1 << i;
    const item = initialItems[i];
    dp[mask][item.w] = item;
  }

  // 4. Iterate by set size (k)
  // We only iterate sizes 2 to N.
  for (let k = 2; k <= N; k++) {
    // Iterate all masks
    for (let mask = 0; mask < LIMIT; mask++) {
      if (countSetBits(mask) !== k) continue;

      // Iterate submasks to split this mask into Left (s) and Right (mask ^ s)
      // Optimization: We only need to check s where countSetBits(s) is approx k/2
      // This enforces the "Balanced Tree" strategy which is optimal for Anvil mechanics.
      
      const subsetSize = Math.floor(k / 2);
      
      // Iterate submasks: s = (s - 1) & mask
      for (let s = (mask - 1) & mask; s > 0; s = (s - 1) & mask) {
        
        // Pruning: Only allow balanced splits. 
        const sBits = countSetBits(s);
        // We check if the split is roughly equal (e.g. 5 items -> 2+3, 4 items -> 2+2)
        // This is crucial for performance and finding optimal tree depth.
        if (sBits !== subsetSize && sBits !== (k - subsetSize)) continue;

        const other = mask ^ s;
        if (s > other) continue; // Symmetry check: A+B is same set as B+A

        const leftCandidates = dp[s];
        const rightCandidates = dp[other];

        if (!leftCandidates || !rightCandidates) continue;

        // Try merging every valid candidate from Left with Right
        for (const lwStr in leftCandidates) {
          const leftItem = leftCandidates[lwStr];
          for (const rwStr in rightCandidates) {
            const rightItem = rightCandidates[rwStr];

            // Try A + B
            try {
              const res = new MergeEnchants(leftItem, rightItem);
              const existing = dp[mask][res.w];
              if (!existing || isBetterOrEqual(res, existing)) {
                dp[mask][res.w] = res;
              }
            } catch (e) { /* Too expensive */ }

            // Try B + A (Order matters for cost: target + sacrifice)
            try {
              const res = new MergeEnchants(rightItem, leftItem);
              const existing = dp[mask][res.w];
              if (!existing || isBetterOrEqual(res, existing)) {
                dp[mask][res.w] = res;
              }
            } catch (e) { /* Too expensive */ }
          }
        }
      }
    }
  }

  // 5. Retrieve result
  const finalMask = LIMIT - 1;
  const finalCandidates = dp[finalMask];
  
  let best: item_obj | null = null;
  let min_cost = Infinity;

  for (const w in finalCandidates) {
    const itm = finalCandidates[w];
    // Filter: If we are not making a book, the result must preserve the item type
    // (MergeEnchants logic usually handles this, but safe to check)
    if (!isBookOnly && itm.i === 'book') continue;

    const cost = mode === 'levels' ? itm.x : itm.w;
    if (cost < min_cost) {
      min_cost = cost;
      best = itm;
    }
  }

  if (!best) return null;

  const instructions = getInstructions(best.c);
  let totalLevels = 0;
  instructions.forEach(step => totalLevels += step.cost);
  
  return { item: best, instructions, maxLevels: totalLevels, maxXp: best.x };
}

// --- VIEW COMPONENT ---

const ItemStepRenderer: React.FC<{ text: string }> = ({ text }) => {
  const isBook = text.startsWith('Book');
  const match = text.match(/^([^(]+)(?:\((.*)\))?$/);
  const itemName = match?.[1].trim() || text;
  const enchantsStr = match?.[2] || '';
  const enchants = enchantsStr ? enchantsStr.split(',').map(s => s.trim()) : [];
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center gap-2">
        {isBook ? <Book size={16} className="text-blue-400" /> : <Hammer size={16} className="text-amber-500" />}
        <span className="font-bold text-zinc-100 text-sm tracking-tight">{itemName}</span>
      </div>
      {enchants.length > 0 && (
        <div className="pl-6 space-y-0.5 border-l border-zinc-800/50 ml-2">
          {enchants.map((e, idx) => (
            <div key={idx} className="text-xs text-zinc-400 font-medium flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              {e}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const EnchantmentCalculatorView: React.FC<EnchantmentCalculatorViewProps> = ({ onBack }) => {
  const [selectedItemType, setSelectedItemType] = useState<string>(ITEM_TYPES[0]);
  const [selectedEnchants, setSelectedEnchants] = useState<Map<string, number>>(new Map());
  const [allowIncompatible, setAllowIncompatible] = useState<boolean>(false);
  const [optimizationMode, setOptimizationMode] = useState<'levels' | 'prior_work'>('levels');
  const [enchantSearchQuery, setEnchantSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [solution, setSolution] = useState<any | null>(null);
  const [calcTime, setCalcTime] = useState<number>(0);
  const calcTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredItemTypes = useMemo(() => {
      if (!itemSearchQuery) return ITEM_TYPES;
      return ITEM_TYPES.filter(t => t.toLowerCase().includes(itemSearchQuery.toLowerCase()));
  }, [itemSearchQuery]);

  const availableEnchantments = useMemo(() => {
    const typeKey = normalizeItemType(selectedItemType);
    const allChecklistItems = CATEGORIES.flatMap(cat => cat.groups.flatMap(g => g.items));
    
    const matchedEnchants = allChecklistItems.filter(item => {
        const data = ENCHANTMENT_DATA[item.id];
        if (!data) return false;
        if (typeKey === 'book') return true;
        return data.items.includes(typeKey);
    });

    const unique = new Map();
    matchedEnchants.forEach(e => unique.set(e.id, e));
    return Array.from(unique.values()).filter(e => e.name.toLowerCase().includes(enchantSearchQuery.toLowerCase()));
  }, [selectedItemType, enchantSearchQuery]);

  const areConflicting = (a: string, b: string): boolean => {
    if (a === b) return false;
    const dataA = ENCHANTMENT_DATA[a];
    const dataB = ENCHANTMENT_DATA[b];
    return (dataA?.incompatible.includes(b)) || (dataB?.incompatible.includes(a)) || false;
  };

  const isEnchantDisabled = (id: string) => {
    if (allowIncompatible || selectedEnchants.has(id)) return false;
    for (const selectedId of selectedEnchants.keys()) {
        if (areConflicting(id, selectedId)) return true;
    }
    return false;
  };

  const toggleEnchant = (id: string, maxLevel: number) => {
    const newMap = new Map(selectedEnchants);
    if (newMap.has(id)) newMap.delete(id);
    else newMap.set(id, maxLevel);
    setSelectedEnchants(newMap);
    setSolution(null);
  };

  const updateLevel = (id: string, newLevel: number) => {
      const newMap = new Map(selectedEnchants);
      newMap.set(id, newLevel);
      setSelectedEnchants(newMap);
      setSolution(null);
  };

  const runSolver = () => {
    if (selectedEnchants.size === 0) return;
    setIsCalculating(true);
    // Reduced timeout to 50ms as solver is now much faster
    setTimeout(() => {
        const startTime = performance.now();
        try {
            const enchantsArray: [string, number][] = Array.from(selectedEnchants.entries());
            const type = selectedItemType.toLowerCase().includes('book') ? 'book' : selectedItemType;
            const result = processCalculation(type, enchantsArray, optimizationMode);
            setSolution(result);
        } catch (e) {
            console.error("Solver error:", e);
            setSolution(null);
        }
        const endTime = performance.now();
        setCalcTime(Math.round(endTime - startTime));
        setIsCalculating(false);
    }, 50);
  };

  useEffect(() => {
    if (calcTimerRef.current) clearTimeout(calcTimerRef.current);
    if (selectedEnchants.size === 0) {
        setSolution(null);
        setIsCalculating(false);
        return;
    }
    // Faster debounce
    calcTimerRef.current = setTimeout(() => {
        runSolver();
    }, 200);
    return () => { if (calcTimerRef.current) clearTimeout(calcTimerRef.current); };
  }, [selectedEnchants, selectedItemType, optimizationMode]);

  const finalEnchantsList = useMemo(() => {
      if (!solution) return [];
      const match = solution.item.display.match(/^([^(]+)(?:\((.*)\))?$/);
      const enchantsStr = match?.[2] || '';
      return enchantsStr ? enchantsStr.split(',').map((s: string) => s.trim()) : [];
  }, [solution]);

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Menu
          </button>
          <div className="flex items-center gap-3">
             <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
               <Calculator className="text-amber-400" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                 Anvil Calculator
               </h1>
               <p className="text-xs text-zinc-400">Precision DP Solver • Java 1.21 Mechanics</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col h-[280px]">
                <div className="mb-3">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Search size={12} /> Target Item
                    </label>
                    <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Search items..." 
                          value={itemSearchQuery} 
                          onChange={(e) => setItemSearchQuery(e.target.value)} 
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all placeholder-zinc-700" 
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex flex-wrap gap-2 content-start">
                        {filteredItemTypes.map(type => (
                            <button key={type} onClick={() => { setSelectedItemType(type); setSelectedEnchants(new Map()); setEnchantSearchQuery(''); setSolution(null); }} className={`px-2 py-1.5 rounded text-[11px] font-bold transition-all border ${selectedItemType === type ? 'bg-amber-600 text-white border-amber-600 shadow shadow-amber-900/50' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'}`}>{type}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col h-[500px]">
                 <div className="flex flex-col gap-3 mb-3 shrink-0">
                    <div className="flex justify-between items-center">
                        <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                           <Book size={12} /> Enchantments
                        </label>
                        {selectedEnchants.size > 0 && (
                            <button onClick={() => { setSelectedEnchants(new Map()); setSolution(null); }} className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"><Trash2 size={12} /> Clear</button>
                        )}
                    </div>
                    <button onClick={() => setAllowIncompatible(!allowIncompatible)} className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all border ${allowIncompatible ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20' : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'}`}>
                        {allowIncompatible ? <Unlock size={14} /> : <Lock size={14} />}
                        {allowIncompatible ? 'Allow Incompatible' : 'Strict Mode'}
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                        <input type="text" placeholder="Filter enchants..." value={enchantSearchQuery} onChange={(e) => setEnchantSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 transition-colors placeholder-zinc-700" />
                    </div>
                 </div>
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                    {availableEnchantments.length === 0 ? (
                        <div className="text-center text-zinc-600 text-sm py-4">No results.</div>
                    ) : (
                        availableEnchantments.map(ench => {
                            const active = selectedEnchants.has(ench.id);
                            const currentLevel = selectedEnchants.get(ench.id);
                            const disabled = isEnchantDisabled(ench.id);
                            const maxLevel = ENCHANTMENT_DATA[ench.id]?.levelMax || getMaxLevelNumber(ench.maxLevel);
                            return (
                                <div key={ench.id} className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all mb-1 ${active ? 'bg-amber-500/10 border-amber-500/30' : disabled ? 'bg-zinc-950/30 border-zinc-800/30 cursor-not-allowed opacity-50' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'}`}>
                                    <button onClick={() => !disabled && toggleEnchant(ench.id, maxLevel)} disabled={disabled} className={`flex-1 flex items-center gap-2 text-left ${active ? 'text-amber-100' : disabled ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${active ? 'bg-amber-500 border-amber-400 text-black' : 'border-zinc-600'}`}>{active && <Check size={10} strokeWidth={4} />}</div>
                                        <span>{ench.name}</span>
                                    </button>
                                    {active && maxLevel > 1 && currentLevel !== undefined && (
                                        <div className="flex items-center gap-1 bg-zinc-900 rounded border border-zinc-700 ml-2">
                                            <button onClick={() => updateLevel(ench.id, Math.max(1, currentLevel - 1))} disabled={currentLevel <= 1} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"><Minus size={12} /></button>
                                            <span className="w-6 text-center text-xs font-mono text-amber-400 font-bold">{getDisplayLevel(currentLevel)}</span>
                                            <button onClick={() => updateLevel(ench.id, Math.min(maxLevel, currentLevel + 1))} disabled={currentLevel >= maxLevel} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"><Plus size={12} /></button>
                                        </div>
                                    )}
                                    {active && maxLevel === 1 && <span className="text-xs text-amber-500/70 font-mono ml-2">I</span>}
                                    {disabled && !active && <AlertCircle size={14} className="text-zinc-700 ml-2" />}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 min-h-[600px] relative overflow-hidden flex flex-col shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Calculator size={240} /></div>
                <div className="relative z-10 flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                                <Book size={20} className="text-amber-500" />
                                {solution ? 'Optimal calculation path' : 'Optimization Result'}
                            </h2>
                            {solution && <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1"><Timer size={12} /> Computed in {calcTime < 1 ? '< 1' : calcTime} ms</p>}
                        </div>
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2">Optimize:</span>
                            <button onClick={() => setOptimizationMode('levels')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${optimizationMode === 'levels' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>Levels/XP</button>
                            <button onClick={() => setOptimizationMode('prior_work')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${optimizationMode === 'prior_work' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}>Prior Work</button>
                        </div>
                    </div>

                    {isCalculating && (
                        <div className="flex flex-col items-center justify-center h-[400px] text-amber-400">
                            <RefreshCw size={48} className="mb-4 animate-spin text-amber-500" />
                            <p className="font-bold tracking-widest uppercase text-xs">Finding optimal path...</p>
                        </div>
                    )}

                    {solution && !isCalculating && (
                         <div className="flex items-center justify-between bg-zinc-950/80 p-5 rounded-xl border border-zinc-700/50 mb-8 animate-in fade-in zoom-in-95 duration-500 shadow-xl">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Total Levels:</span>
                                <span className="text-4xl font-black text-emerald-400 tabular-nums">{solution.maxLevels}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">XP Requirement</div>
                                <div className="text-xl font-mono font-bold text-zinc-200">{solution.maxXp.toLocaleString()}</div>
                            </div>
                         </div>
                    )}

                    {!isCalculating && !solution && (
                        <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            {selectedEnchants.size > 0 ? (
                                <div className="text-center px-4">
                                    <AlertCircle size={48} className="mx-auto mb-4 text-red-500/50" />
                                    <p className="font-medium text-zinc-300">Too many enchants or conflict.</p>
                                    <p className="text-sm mt-1">Item will likely exceed the "Too Expensive!" 39-level limit.</p>
                                </div>
                            ) : (
                                <>
                                    <Plus size={48} className="mb-4 opacity-20" />
                                    <p>Select enchantments to calculate the optimal path.</p>
                                </>
                            )}
                        </div>
                    )}

                    {solution && !isCalculating && (
                        <div className="space-y-6 pb-4">
                            {solution.instructions.map((step: any, index: number) => (
                                <div key={index} className="group relative bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-600 transition-all animate-in slide-in-from-bottom-3 fade-in duration-500" style={{animationDelay: `${index * 80}ms`}}>
                                    <div className="flex flex-col md:flex-row md:items-stretch min-h-[100px]">
                                        <div className="w-full md:w-12 bg-zinc-800/50 flex items-center justify-center font-black text-zinc-500 border-b md:border-b-0 md:border-r border-zinc-700/50 text-xs">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
                                            <div className="w-full">
                                                <ItemStepRenderer text={step.left} />
                                            </div>
                                            <div className="flex flex-col items-center justify-center text-zinc-600 px-2">
                                                <div className="bg-zinc-800/80 p-1.5 rounded-full border border-zinc-700 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                                                    <Plus size={16} />
                                                </div>
                                            </div>
                                            <div className="w-full">
                                                <ItemStepRenderer text={step.right} />
                                            </div>
                                        </div>
                                        <div className="w-full md:w-32 bg-zinc-950/40 p-4 border-t md:border-t-0 md:border-l border-zinc-800/80 flex flex-col justify-center items-center gap-1 group-hover:bg-amber-500/[0.03] transition-colors">
                                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Cost</div>
                                            <div className="text-2xl font-black text-amber-500 tabular-nums">{step.cost}</div>
                                            <div className="mt-1 px-2 py-0.5 rounded-full bg-zinc-800 text-[9px] font-bold text-zinc-500 border border-zinc-700 flex items-center gap-1">
                                                <AlertCircle size={8} /> Penalty: {step.priorWork}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-12 p-8 bg-gradient-to-br from-emerald-900/20 via-zinc-900/60 to-emerald-950/10 border border-emerald-500/30 rounded-2xl flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/40 animate-pulse">
                                        <Check size={32} className="text-emerald-400" strokeWidth={3} />
                                    </div>
                                    <h3 className="text-xl font-black text-zinc-100 mb-2 tracking-tight">FULLY ENCHANTED!</h3>
                                    <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed mb-6">
                                        Following this path will result in the most efficient merge possible.
                                    </p>
                                    {finalEnchantsList.length > 0 && (
                                        <div className="w-full bg-black/30 rounded-xl border border-emerald-500/20 p-4 mb-6 text-left">
                                            <h4 className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-[0.2em] mb-3 border-b border-emerald-500/10 pb-2">Final Enchantments List</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                                {finalEnchantsList.map((e: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                                                        {e}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        <div className="px-4 py-2 bg-black/40 rounded-xl text-zinc-300 text-xs border border-white/5 font-bold flex items-center gap-2">
                                            <span className="text-zinc-500 font-medium">Final Work Penalty:</span> {Math.pow(2, solution.item.w) - 1}
                                        </div>
                                        <div className="px-4 py-2 bg-black/40 rounded-xl text-zinc-300 text-xs border border-white/5 font-bold flex items-center gap-2">
                                            <span className="text-zinc-500 font-medium">Prior Uses:</span> {solution.item.w}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                {solution && !isCalculating && (
                    <div className="pt-8 mt-4 border-t border-zinc-800 flex justify-end">
                         <button onClick={() => { setSelectedEnchants(new Map()); setSolution(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-bold text-zinc-300 transition-all border border-zinc-700/50 shadow-lg"><RefreshCw size={18} /> Start New Calculation</button>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};
