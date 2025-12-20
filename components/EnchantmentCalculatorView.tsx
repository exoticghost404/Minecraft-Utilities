
import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Calculator, Plus, Book, AlertCircle, Check, Lock, Unlock, RefreshCw, Minus, Search, Trash2, X, Timer, Hammer, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { EnchantmentItem } from '../types';

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

interface EnchantData {
    levelMax: number;
    weight: number;
    incompatible: string[];
    items: string[];
}

const ENCHANTMENT_DATA: Record<string, EnchantData> = {
    protection: { levelMax: 4, weight: 1, incompatible: ["blast_protection", "fire_protection", "projectile_protection"], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
    aqua_affinity: { levelMax: 1, weight: 2, incompatible: [], items: ["helmet", "turtle_shell"] },
    bane_of_arthropods: { levelMax: 5, weight: 1, incompatible: ["smite", "sharpness", "density", "breach"], items: ["sword", "axe", "mace", "spear"] },
    blast_protection: { levelMax: 4, weight: 2, incompatible: ["fire_protection", "protection", "projectile_protection"], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
    channeling: { levelMax: 1, weight: 4, incompatible: ["riptide"], items: ["trident"] },
    depth_strider: { levelMax: 3, weight: 2, incompatible: ["frost_walker"], items: ["boots"] },
    efficiency: { levelMax: 5, weight: 1, incompatible: [], items: ["pickaxe", "shovel", "axe", "hoe", "shears"] },
    feather_falling: { levelMax: 4, weight: 1, incompatible: [], items: ["boots"] },
    fire_aspect: { levelMax: 2, weight: 2, incompatible: [], items: ["sword", "mace", "spear"] },
    fire_protection: { levelMax: 4, weight: 1, incompatible: ["blast_protection", "protection", "projectile_protection"], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
    flame: { levelMax: 1, weight: 2, incompatible: [], items: ["bow"] },
    fortune: { levelMax: 3, weight: 2, incompatible: ["silk_touch"], items: ["pickaxe", "shovel", "axe", "hoe"] },
    frost_walker: { levelMax: 2, weight: 2, incompatible: ["depth_strider"], items: ["boots"] },
    impaling: { levelMax: 5, weight: 2, incompatible: [], items: ["trident"] },
    infinity: { levelMax: 1, weight: 4, incompatible: ["mending"], items: ["bow"] },
    knockback: { levelMax: 2, weight: 1, incompatible: [], items: ["sword", "spear"] },
    looting: { levelMax: 3, weight: 2, incompatible: [], items: ["sword", "spear"] },
    loyalty: { levelMax: 3, weight: 1, incompatible: ["riptide"], items: ["trident"] },
    luck_of_the_sea: { levelMax: 3, weight: 2, incompatible: [], items: ["fishing_rod"] },
    lure: { levelMax: 3, weight: 2, incompatible: [], items: ["fishing_rod"] },
    mending: { levelMax: 1, weight: 2, incompatible: ["infinity"], items: ["helmet", "chestplate", "leggings", "boots", "pickaxe", "shovel", "axe", "sword", "hoe", "brush", "fishing_rod", "bow", "shears", "flint_and_steel", "carrot_on_a_stick", "warped_fungus_on_a_stick", "shield", "elytra", "trident", "turtle_shell", "crossbow", "mace", "spear"] },
    multishot: { levelMax: 1, weight: 2, incompatible: ["piercing"], items: ["crossbow"] },
    piercing: { levelMax: 4, weight: 1, incompatible: ["multishot"], items: ["crossbow"] },
    power: { levelMax: 5, weight: 1, incompatible: [], items: ["bow"] },
    projectile_protection: { levelMax: 4, weight: 1, incompatible: ["protection", "blast_protection", "fire_protection"], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
    punch: { levelMax: 2, weight: 2, incompatible: [], items: ["bow"] },
    quick_charge: { levelMax: 3, weight: 1, incompatible: [], items: ["crossbow"] },
    respiration: { levelMax: 3, weight: 2, incompatible: [], items: ["helmet", "turtle_shell"] },
    riptide: { levelMax: 3, weight: 2, incompatible: ["channeling", "loyalty"], items: ["trident"] },
    sharpness: { levelMax: 5, weight: 1, incompatible: ["bane_of_arthropods", "smite", "density", "breach"], items: ["sword", "axe", "spear"] },
    silk_touch: { levelMax: 1, weight: 4, incompatible: ["fortune"], items: ["pickaxe", "shovel", "axe", "hoe"] },
    smite: { levelMax: 5, weight: 1, incompatible: ["bane_of_arthropods", "sharpness", "density", "breach"], items: ["sword", "axe", "mace", "spear"] },
    soul_speed: { levelMax: 3, weight: 4, incompatible: [], items: ["boots"] },
    sweeping_edge: { levelMax: 3, weight: 2, incompatible: [], items: ["sword"] },
    swift_sneak: { levelMax: 3, weight: 4, incompatible: [], items: ["leggings"] },
    thorns: { levelMax: 3, weight: 4, incompatible: [], items: ["helmet", "chestplate", "leggings", "boots", "turtle_shell"] },
    unbreaking: { levelMax: 3, weight: 1, incompatible: [], items: ["helmet", "chestplate", "leggings", "boots", "pickaxe", "shovel", "axe", "sword", "hoe", "brush", "fishing_rod", "bow", "shears", "flint_and_steel", "carrot_on_a_stick", "warped_fungus_on_a_stick", "shield", "elytra", "trident", "turtle_shell", "crossbow", "mace", "spear"] },
    curse_of_binding: { levelMax: 1, weight: 4, incompatible: [], items: ["helmet", "chestplate", "leggings", "boots", "elytra", "pumpkin", "turtle_shell"] },
    curse_of_vanishing: { levelMax: 1, weight: 4, incompatible: [], items: ["helmet", "chestplate", "leggings", "boots", "pickaxe", "shovel", "axe", "sword", "hoe", "brush", "fishing_rod", "bow", "shears", "flint_and_steel", "carrot_on_a_stick", "warped_fungus_on_a_stick", "shield", "elytra", "pumpkin", "trident", "turtle_shell", "crossbow", "mace", "spear"] },
    density: { levelMax: 5, weight: 1, incompatible: ["breach", "smite", "bane_of_arthropods", "sharpness"], items: ["mace"] },
    breach: { levelMax: 4, weight: 2, incompatible: ["density", "smite", "bane_of_arthropods", "sharpness"], items: ["mace"] },
    wind_burst: { levelMax: 3, weight: 2, incompatible: [], items: ["mace"] },
    lunge: { levelMax: 3, weight: 1, incompatible: [], items: ["spear"] }
};

// Strict Allow-List for tools that have very limited enchantments
const STRICT_TOOL_ENCHANTS: Record<string, string[]> = {
    'flint and steel': ['unbreaking', 'mending', 'curse_of_vanishing'],
    'shield': ['unbreaking', 'mending', 'curse_of_vanishing'],
    'brush': ['unbreaking', 'mending', 'curse_of_vanishing'],
    'carrot/warped fungus stick': ['unbreaking', 'mending', 'curse_of_vanishing'],
    'shears': ['efficiency', 'unbreaking', 'mending', 'silk_touch', 'curse_of_vanishing'],
    'elytra': ['unbreaking', 'mending', 'curse_of_binding', 'curse_of_vanishing'],
    'pumpkin': ['curse_of_binding', 'curse_of_vanishing'],
    'fishing rod': ['luck_of_the_sea', 'lure', 'unbreaking', 'mending', 'curse_of_vanishing']
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

// --- ALGORITHM IMPLEMENTATION ---

// 1. Data Setup
let ID_LIST: Record<string, number> = {};
let ENCHANTMENT2WEIGHT: number[] = [];
let RESULTS_CACHE: Record<string, any> = {};

// Initialize Data
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

// 2. Constants & Classes
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
    i: string | number; // name or id
    e: number[]; // enchant ids
    c: any; // instructions/history
    w: number; // work penalty
    l: number; // value (level cost base)
    x: number; // total xp cost
    display: string; // Friendly display name

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

// Helper to strip "Book (...)" wrapper and return raw content
const stripBookWrapper = (name: string): string => {
    if (name.startsWith('Book (') && name.endsWith(')')) {
        return name.slice(6, -1);
    }
    return name;
};

class MergeEnchants extends item_obj {
    constructor(left: item_obj, right: item_obj) {
        // Vanilla Formula: Right Value + 2^LeftWork - 1 + 2^RightWork - 1
        const merge_cost = right.l + Math.pow(2, left.w) - 1 + Math.pow(2, right.w) - 1;
        
        if (merge_cost > MAXIMUM_MERGE_LEVELS) {
            throw new MergeLevelsTooExpensiveError();
        }
        
        const new_value = left.l + right.l;
        
        // --- Display Name Logic ---
        let display = "Book";
        const rightContent = stripBookWrapper(right.display);
        
        if (left.i === 'item') {
            // Target Item (e.g. Helmet) is Left
            if (left.display.includes('(') && left.display.endsWith(')')) {
                // Already has enchants: "Helmet (A, B)" + "C" -> "Helmet (A, B, C)"
                display = left.display.slice(0, -1) + `, ${rightContent})`;
            } else {
                // Fresh Item: "Helmet" + "A" -> "Helmet (A)"
                display = `${left.display} (${rightContent})`;
            }
        } else {
            // Book + Book
            const leftContent = stripBookWrapper(left.display);
            display = `Book (${leftContent}, ${rightContent})`;
        }

        super(left.i, new_value, left.e.concat(right.e), display);
        
        this.w = Math.max(left.w, right.w) + 1; // new work
        this.x = left.x + right.x + experience(merge_cost); // total xp
        
        // c stores the structure for instructions
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

// 3. Helper Functions

function combinations<T>(set: T[], k: number): T[][] {
    if (k > set.length || k <= 0) return [];
    if (k === set.length) return [set];
    if (k === 1) return set.map(x => [x]);

    const combs: T[][] = [];
    for (let i = 0; i < set.length - k + 1; i++) {
        const head = set.slice(i, i + 1);
        const tailcombs = combinations(set.slice(i + 1), k - 1);
        for (let j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}

function hashFromItem(item: item_obj): string {
    const enchants = [...item.e].sort((a,b) => a-b);
    return `${item.i}|${enchants.join(',')}|${item.w}`;
}

function memoizeHashFromArguments(items: item_obj[]) {
    return items.map(hashFromItem).join(';');
}

function compareCheapest(item1: item_obj, item2: item_obj): Record<number, item_obj> {
    const work2item: Record<number, item_obj> = {};
    const work1 = item1.w;
    const work2 = item2.w;

    if (work1 === work2) {
        const val1 = item1.l;
        const val2 = item2.l;
        if (val1 === val2) {
            if (item1.x <= item2.x) work2item[work1] = item1;
            else work2item[work2] = item2;
        } else if (val1 < val2) {
            work2item[work1] = item1;
        } else {
            work2item[work2] = item2;
        }
    } else {
        work2item[work1] = item1;
        work2item[work2] = item2;
    }
    return work2item;
}

function removeExpensiveCandidatesFromDictionary(work2item: Record<number, item_obj>) {
    const cheapest: Record<number, item_obj> = {};
    let cheapest_value: number | undefined;

    // Iterate sorted by work (keys are strings in JS objects, need to sort)
    const works = Object.keys(work2item).map(Number).sort((a, b) => a - b);

    for (const work of works) {
        const item = work2item[work];
        const value = item.l;

        if (cheapest_value === undefined || value < cheapest_value) {
            cheapest[work] = item;
            cheapest_value = value;
        }
    }
    return cheapest;
}

function cheapestItemFromItems2(left: item_obj, right: item_obj): item_obj {
    
    if (right.i === 'item') return new MergeEnchants(right, left);
    if (left.i === 'item') return new MergeEnchants(left, right);

    let normal: MergeEnchants | null = null;
    try { normal = new MergeEnchants(left, right); } catch {}

    let reversed: MergeEnchants | null = null;
    try { reversed = new MergeEnchants(right, left); } catch {}

    if (!normal && !reversed) throw new MergeLevelsTooExpensiveError();
    if (normal && !reversed) return normal;
    if (!normal && reversed) return reversed;

    const best = compareCheapest(normal!, reversed!);
    return Object.values(best)[0];
}

// The recursive core
function cheapestItemsFromList(items: item_obj[]): Record<number, item_obj> {
    // Check memoization
    const argsKey = memoizeHashFromArguments(items);
    if (RESULTS_CACHE[argsKey]) return RESULTS_CACHE[argsKey];

    let work2item: Record<number, item_obj> = {};
    const count = items.length;

    if (count === 1) {
        const item = items[0];
        work2item[item.w] = item;
        RESULTS_CACHE[argsKey] = work2item;
        return work2item;
    }

    if (count === 2) {
        try {
            const cheapest = cheapestItemFromItems2(items[0], items[1]);
            work2item[cheapest.w] = cheapest;
        } catch {
            // If merge is too expensive, return empty or partial
        }
        RESULTS_CACHE[argsKey] = work2item;
        return work2item;
    }

    // Split logic
    const max_subcount = Math.floor(count / 2);

    for (let k = 1; k <= max_subcount; k++) {
        const subcombs = combinations(items, k);
        for (const left_subset of subcombs) {
            const right_subset = items.filter(x => !left_subset.includes(x));

            const left_res = cheapestItemsFromList(left_subset);
            const right_res = cheapestItemsFromList(right_subset);
            
            // Combine results
            for (const lw in left_res) {
                const l_item = left_res[lw];
                for (const rw in right_res) {
                    const r_item = right_res[rw];

                    let new_map: Record<number, item_obj> = {};
                    try {
                        const merged = cheapestItemFromItems2(l_item, r_item);
                        new_map[merged.w] = merged;
                    } catch { continue; }

                    for (const w in new_map) {
                        const new_item = new_map[w];
                        const workNum = Number(w);
                        
                        if (work2item[workNum]) {
                            const better = compareCheapest(work2item[workNum], new_item);
                            work2item[workNum] = better[workNum];
                        } else {
                            work2item[workNum] = new_item;
                        }
                    }
                }
            }
        }
    }
    
    work2item = removeExpensiveCandidatesFromDictionary(work2item);
    RESULTS_CACHE[argsKey] = work2item;
    return work2item;
}

function getInstructions(comb: any): any[] {
    let instructions: any[] = [];
    
    // Recursive traversal
    if (comb.L || comb.R) {
        // If children have children, traverse them
        if (comb.L && comb.L.l !== undefined) { 
             instructions = instructions.concat(getInstructions(comb.L));
        }
        if (comb.R && comb.R.l !== undefined) {
             instructions = instructions.concat(getInstructions(comb.R));
        }

        // Current Step
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

function process(itemType: string, enchants: [string, number][], mode: 'levels' | 'prior_work') {
    RESULTS_CACHE = {}; // Clear cache per run
    
    const enchant_objs: item_obj[] = [];
    enchants.forEach(([name, level]) => {
        const id = ID_LIST[name];
        const weight = ENCHANTMENT2WEIGHT[id];
        const val = level * weight;
        
        // Use friendly name
        const display = `Book (${getPrettyName(name)} ${getDisplayLevel(level)})`;
        
        const obj = new item_obj('book', val, [id], display);
        // We set initial 'c' props to match expected struct if accessed
        obj.c = { I: id, l: obj.l, w: obj.w };
        enchant_objs.push(obj);
    });

    if (enchant_objs.length === 0) return null;

    let base_item: item_obj;
    const items_to_process = [...enchant_objs];
    
    // Sort by value descending to find max
    let mostExpensiveIdx = 0;
    items_to_process.forEach((itm, idx) => {
        if (itm.l > items_to_process[mostExpensiveIdx].l) mostExpensiveIdx = idx;
    });

    if (itemType === 'book') {
        const expensive = items_to_process[mostExpensiveIdx];
        const id = expensive.e[0];
        
        // Base is the expensive book, keeps its name
        base_item = new item_obj('book', expensive.l, [id], expensive.display);
        base_item.c = { I: id, l: base_item.l, w: base_item.w };
        
        items_to_process.splice(mostExpensiveIdx, 1);
        
        // Recalc max for next step
        if (items_to_process.length > 0) {
            mostExpensiveIdx = 0;
            items_to_process.forEach((itm, idx) => {
                if (itm.l > items_to_process[mostExpensiveIdx].l) mostExpensiveIdx = idx;
            });
        }
    } else {
        const formattedItemName = itemType.charAt(0).toUpperCase() + itemType.slice(1);
        base_item = new item_obj('item', 0, [], formattedItemName);
        base_item.c = { I: 'item', l: 0, w: 0 };
    }

    // Merge base with most expensive remaining (Foundation step)
    if (items_to_process.length > 0) {
        const next_expensive = items_to_process[mostExpensiveIdx];
        const foundation = new MergeEnchants(base_item, next_expensive);
        
        items_to_process.splice(mostExpensiveIdx, 1);
        items_to_process.push(foundation);
    } else {
        items_to_process.push(base_item);
    }

    // Now solve
    const cheapest_map = cheapestItemsFromList(items_to_process);

    // Pick best based on mode
    let best: item_obj | null = null;
    let min_cost = Infinity;

    for (const w in cheapest_map) {
        const itm = cheapest_map[w];
        const cost = mode === 'levels' ? itm.x : itm.w;
        if (cost < min_cost) {
            min_cost = cost;
            best = itm;
        }
    }

    if (!best) return null;

    const instructions = getInstructions(best.c);
    
    // Calculate totals for UI
    let totalLevels = 0;
    instructions.forEach(step => totalLevels += step.cost);

    return {
        item: best,
        instructions,
        maxLevels: totalLevels,
        maxXp: best.x
    };
}


// --- COMPONENT ---

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

  // Filter Item Types based on search
  const filteredItemTypes = useMemo(() => {
      if (!itemSearchQuery) return ITEM_TYPES;
      return ITEM_TYPES.filter(t => t.toLowerCase().includes(itemSearchQuery.toLowerCase()));
  }, [itemSearchQuery]);

  // Filter Enchants Logic
  const availableEnchantments = useMemo(() => {
    const enchants: EnchantmentItem[] = [];
    const type = selectedItemType.toLowerCase();
    const strictList = STRICT_TOOL_ENCHANTS[type];

    CATEGORIES.forEach(cat => {
      cat.groups.forEach(group => {
        let isMatch = false;
        const groupName = group.name.toLowerCase();

        if (type === 'book') isMatch = true;
        if (cat.id === 'universal') isMatch = true;
        if (cat.id === 'armor') {
            if (type === groupName) isMatch = true;
            if (['helmet','chestplate','leggings','boots','elytra','turtle shell'].includes(type) && groupName === 'general armor') isMatch = true;
            // Turtle shell can have helmet specific enchants
            if (type === 'turtle shell' && groupName === 'helmet') isMatch = true;
        }
        if (cat.id === 'weapon') {
            if (type === 'sword' && groupName === 'sword') isMatch = true;
            if (type === 'axe' && groupName === 'sword') isMatch = true;
            if (type === 'bow' && groupName === 'bow') isMatch = true;
            if (type === 'crossbow' && groupName === 'crossbow') isMatch = true;
            if (type === 'trident' && groupName === 'trident') isMatch = true;
            if (type === 'mace' && (groupName === 'mace' || groupName === 'sword')) isMatch = true;
            if (type === 'spear' && (groupName === 'spear' || groupName === 'sword')) isMatch = true;
        }
        if (cat.id === 'tool') {
            if (['pickaxe','axe','shovel','hoe','shears','fishing rod'].includes(type) && groupName === 'general tools') isMatch = true;
            if (type === 'fishing rod' && groupName === 'fishing rod') isMatch = true;
        }

        if (isMatch) {
            group.items.forEach(item => {
                let valid = true;
                if (strictList && !strictList.includes(item.id)) valid = false;
                else {
                    if (type === 'mace' && ['sharpness','knockback','looting','sweeping_edge'].includes(item.id)) valid = false;
                    if (type === 'axe' && groupName === 'sword' && !['sharpness','smite','bane_of_arthropods'].includes(item.id)) valid = false;
                    if (type === 'spear' && item.id === 'sweeping_edge') valid = false;
                }
                if (valid) enchants.push(item);
            });
        }
      });
    });

    const unique = new Map();
    enchants.forEach(e => unique.set(e.id, e));
    return Array.from(unique.values()).filter(e => 
        e.name.toLowerCase().includes(enchantSearchQuery.toLowerCase())
    );
  }, [selectedItemType, enchantSearchQuery]);

  const areConflicting = (a: string, b: string): boolean => {
    if (a === b) return false;
    const dataA = ENCHANTMENT_DATA[a];
    const dataB = ENCHANTMENT_DATA[b];
    if (dataA && dataA.incompatible.includes(b)) return true;
    if (dataB && dataB.incompatible.includes(a)) return true;
    return false;
  };

  const isEnchantDisabled = (id: string) => {
    if (allowIncompatible) return false;
    if (selectedEnchants.has(id)) return false;
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

  // Run Solver
  useEffect(() => {
    if (selectedEnchants.size === 0) {
        setSolution(null);
        return;
    }
    const timer = setTimeout(() => {
        runSolver();
    }, 50);
    return () => clearTimeout(timer);
  }, [selectedEnchants, selectedItemType, optimizationMode]);

  const runSolver = () => {
    setIsCalculating(true);
    const startTime = performance.now();

    try {
        const enchantsArray: [string, number][] = Array.from(selectedEnchants.entries());
        const type = selectedItemType.toLowerCase().includes('book') ? 'book' : selectedItemType;
        
        const result = process(type, enchantsArray, optimizationMode);
        setSolution(result);
    } catch (e) {
        console.error("Solver error:", e);
        setSolution(null);
    }

    const endTime = performance.now();
    setCalcTime(Math.round(endTime - startTime));
    setIsCalculating(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button 
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors text-sm font-medium"
          >
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
               <p className="text-xs text-zinc-400">Exact Vanilla Mechanics • Subset DP Optimizer</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
            {/* Item Selector */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col h-[280px]">
                <div className="mb-3">
                    <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">
                        Target Item
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                        <input 
                            type="text"
                            placeholder="Search items..."
                            value={itemSearchQuery}
                            onChange={(e) => setItemSearchQuery(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 transition-colors"
                        />
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex flex-wrap gap-2 content-start">
                        {filteredItemTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => {
                                    setSelectedItemType(type);
                                    setSelectedEnchants(new Map());
                                    setEnchantSearchQuery('');
                                    setSolution(null);
                                }}
                                className={`
                                    px-2 py-1.5 rounded text-xs font-medium transition-all border
                                    ${selectedItemType === type 
                                        ? 'bg-amber-600 text-white border-amber-600 shadow shadow-amber-900/50' 
                                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:bg-zinc-800'}
                                `}
                            >
                                {type}
                            </button>
                        ))}
                        {filteredItemTypes.length === 0 && (
                            <div className="text-zinc-500 text-xs italic w-full text-center py-4">No items found</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Enchant Selector */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col h-[500px]">
                 <div className="flex flex-col gap-3 mb-3 shrink-0">
                    <div className="flex justify-between items-center">
                        <label className="block text-zinc-400 text-xs font-bold uppercase tracking-wider">
                            Enchantments
                        </label>
                        {selectedEnchants.size > 0 && (
                            <button 
                                onClick={() => {
                                    setSelectedEnchants(new Map());
                                    setSolution(null);
                                }}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                            >
                                <Trash2 size={12} /> Clear
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setAllowIncompatible(!allowIncompatible)}
                        className={`
                            flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all border
                            ${allowIncompatible 
                                ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20' 
                                : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'}
                        `}
                    >
                        {allowIncompatible ? <Unlock size={14} /> : <Lock size={14} />}
                        {allowIncompatible ? 'Allow Incompatible' : 'Strict Mode'}
                    </button>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                        <input 
                            type="text"
                            placeholder="Find enchantment..."
                            value={enchantSearchQuery}
                            onChange={(e) => setEnchantSearchQuery(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-xs text-zinc-200 outline-none focus:border-amber-500 transition-colors"
                        />
                        {enchantSearchQuery && (
                            <button 
                                onClick={() => setEnchantSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                    {availableEnchantments.length === 0 ? (
                        <div className="text-center text-zinc-600 text-sm py-4">
                            {enchantSearchQuery ? `No match for "${enchantSearchQuery}"` : "No enchantments available."}
                        </div>
                    ) : (
                        availableEnchantments.map(ench => {
                            const active = selectedEnchants.has(ench.id);
                            const currentLevel = selectedEnchants.get(ench.id);
                            const disabled = isEnchantDisabled(ench.id);
                            const maxLevel = ENCHANTMENT_DATA[ench.id]?.levelMax || getMaxLevelNumber(ench.maxLevel);

                            return (
                                <div
                                    key={ench.id}
                                    className={`
                                        w-full flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all mb-1
                                        ${active
                                            ? 'bg-amber-500/10 border-amber-500/30'
                                            : disabled 
                                                ? 'bg-zinc-950/30 border-zinc-800/30 cursor-not-allowed opacity-50'
                                                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800'}
                                    `}
                                >
                                    <button
                                        onClick={() => !disabled && toggleEnchant(ench.id, maxLevel)}
                                        disabled={disabled}
                                        className={`flex-1 flex items-center gap-2 text-left ${active ? 'text-amber-100' : disabled ? 'text-zinc-600' : 'text-zinc-400'}`}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${active ? 'bg-amber-500 border-amber-400 text-black' : 'border-zinc-600'}`}>
                                            {active && <Check size={10} strokeWidth={4} />}
                                        </div>
                                        <span>{ench.name}</span>
                                    </button>
                                    
                                    {active && maxLevel > 1 && currentLevel !== undefined && (
                                        <div className="flex items-center gap-1 bg-zinc-900 rounded border border-zinc-700 ml-2">
                                            <button 
                                                onClick={() => updateLevel(ench.id, Math.max(1, currentLevel - 1))}
                                                disabled={currentLevel <= 1}
                                                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="w-6 text-center text-xs font-mono text-amber-400 font-bold">
                                                {getDisplayLevel(currentLevel)}
                                            </span>
                                            <button 
                                                onClick={() => updateLevel(ench.id, Math.min(maxLevel, currentLevel + 1))}
                                                disabled={currentLevel >= maxLevel}
                                                className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    )}

                                    {active && maxLevel === 1 && (
                                         <span className="text-xs text-amber-500/70 font-mono ml-2">I</span>
                                    )}
                                    
                                    {disabled && !active && <AlertCircle size={14} className="text-zinc-700 ml-2" />}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>

        <div className="lg:col-span-8">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 min-h-[600px] relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Calculator size={240} />
                </div>

                <div className="relative z-10 flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                                <Book size={20} className="text-amber-500" />
                                {solution ? 'Optimal solution found!' : 'Optimization Result'}
                            </h2>
                            {solution && (
                                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                    <Timer size={12} /> Completed in {calcTime < 1 ? '< 1' : calcTime} ms
                                </p>
                            )}
                        </div>

                        {/* Optimization Mode Toggle */}
                        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2">Optimize:</span>
                            <button
                                onClick={() => setOptimizationMode('levels')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${optimizationMode === 'levels' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                Levels/XP
                            </button>
                            <button
                                onClick={() => setOptimizationMode('prior_work')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${optimizationMode === 'prior_work' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                            >
                                Prior Work
                            </button>
                        </div>
                    </div>

                    {solution && (
                         <div className="flex items-center justify-between bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 mb-6">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Total Cost:</span>
                                <span className="text-3xl font-bold text-emerald-400">{solution.maxLevels}</span>
                                <span className="text-sm text-zinc-500 font-medium">Levels</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Raw XP Cost</div>
                                <div className="text-lg font-mono font-bold text-zinc-300">{solution.maxXp.toLocaleString()}</div>
                            </div>
                         </div>
                    )}

                    {isCalculating && !solution ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500 animate-pulse">
                            <RefreshCw size={48} className="mb-4 animate-spin" />
                            <p>Solving permutations...</p>
                        </div>
                    ) : !solution ? (
                        <div className="flex flex-col items-center justify-center h-[400px] text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            {selectedEnchants.size > 0 ? (
                                <p>No valid combination found (Conflict or Too Expensive).</p>
                            ) : (
                                <>
                                    <Plus size={48} className="mb-4 opacity-20" />
                                    <p>Select enchantments to calculate the optimal path.</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {/* Steps List */}
                            {solution.instructions.map((step: any, index: number) => {
                                return (
                                    <div key={index} className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-zinc-700 transition-all animate-in slide-in-from-bottom-2 fade-in duration-300" style={{animationDelay: `${index * 50}ms`}}>
                                        
                                        {/* Step Counter */}
                                        <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-6 h-6 bg-zinc-800 border border-zinc-600 rounded-full flex items-center justify-center text-xs font-bold text-zinc-400 shadow-lg z-10">
                                            {index + 1}
                                        </div>

                                        {/* Content - Using Grid for symmetrical centering on desktop */}
                                        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                            
                                            {/* Left Item */}
                                            <div className="flex items-center justify-center md:justify-end gap-2 text-zinc-200 font-medium text-center md:text-right">
                                                <div className="order-2 md:order-1">
                                                    <span>{step.left}</span>
                                                </div>
                                                <div className="order-1 md:order-2 shrink-0">
                                                    {step.left.includes('(') || ITEM_TYPES.some(t => step.left.startsWith(t)) ? <Hammer size={16} className="text-amber-500" /> : <Book size={16} className="text-blue-400" />}
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex justify-center text-zinc-600">
                                                <ArrowRight size={16} className="hidden md:block" />
                                                <div className="block md:hidden rotate-90"><ArrowRight size={16} /></div>
                                            </div>

                                            {/* Right Item */}
                                            <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-200 font-medium text-center md:text-left">
                                                <div className="shrink-0">
                                                    {step.right.includes('(') || ITEM_TYPES.some(t => step.right.startsWith(t)) ? <Hammer size={16} className="text-amber-500" /> : <Book size={16} className="text-blue-400" />}
                                                </div>
                                                <div>
                                                    <span>{step.right}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cost Badge */}
                                        <div className="shrink-0 flex items-center gap-2 bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800/50 group-hover:border-amber-500/20 transition-colors w-full md:w-auto justify-center md:justify-start mt-2 md:mt-0">
                                            <div className="text-right">
                                                <div className="text-xs text-zinc-500 font-mono">COST</div>
                                                <div className="text-lg font-bold text-amber-400 leading-none">{step.cost}</div>
                                            </div>
                                            <div className="h-8 w-px bg-zinc-800 mx-1"></div>
                                            <div className="text-xs text-zinc-600 flex flex-col items-center">
                                                <span>Penalty</span>
                                                <span className="font-mono text-zinc-400">{step.priorWork}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="mt-8 p-6 bg-gradient-to-br from-emerald-900/10 to-zinc-900/50 border border-emerald-500/20 rounded-xl flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-emerald-500/5 blur-xl"></div>
                                <div className="relative z-10 w-full flex flex-col items-center">
                                    <div className="text-emerald-400 font-bold text-lg mb-2 flex items-center justify-center gap-2">
                                        <Check size={20} strokeWidth={3} />
                                        Complete!
                                    </div>
                                    <div className="text-zinc-300 text-sm max-w-lg mx-auto leading-relaxed">
                                        Your <span className="font-bold text-white">{solution.item.display}</span> is fully enchanted.
                                    </div>
                                    <div className="inline-block mt-4 px-3 py-1 bg-black/40 rounded-full text-zinc-500 text-xs border border-white/5">
                                        Final Prior Work Penalty: {Math.pow(2, solution.item.w) - 1} ({solution.item.w} uses)
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                {solution && (
                    <div className="pt-6 mt-auto border-t border-zinc-800 flex justify-end">
                         <button 
                            onClick={() => {
                                setSelectedEnchants(new Map());
                                setSolution(null);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors"
                        >
                            <RefreshCw size={16} /> Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};
