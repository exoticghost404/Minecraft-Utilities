import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Calculator, Plus, Book, AlertCircle, Check, Lock, Unlock, RefreshCw, Minus, Search, X, Timer } from 'lucide-react';
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
  protection: { levelMax: 4, weight: 1, incompatible: ["blast_protection","fire_protection","projectile_protection"], items:["helmet","chestplate","leggings","boots","turtle_shell"] },
  aqua_affinity: { levelMax: 1, weight: 2, incompatible: [], items:["helmet","turtle_shell"] },
  bane_of_arthropods: { levelMax: 5, weight: 1, incompatible:["smite","sharpness","density","breach"], items:["sword","axe","mace","spear"] },
  blast_protection: { levelMax: 4, weight: 2, incompatible:["fire_protection","protection","projectile_protection"], items:["helmet","chestplate","leggings","boots","turtle_shell"] },
  channeling: { levelMax: 1, weight: 4, incompatible:["riptide"], items:["trident"] },
  depth_strider: { levelMax: 3, weight: 2, incompatible:["frost_walker"], items:["boots"] },
  efficiency: { levelMax: 5, weight: 1, incompatible: [], items:["pickaxe","shovel","axe","hoe","shears"] },
  feather_falling: { levelMax: 4, weight: 1, incompatible: [], items:["boots"] },
  fire_aspect: { levelMax: 2, weight: 2, incompatible: [], items:["sword","mace","spear"] },
  fire_protection: { levelMax: 4, weight: 1, incompatible:["blast_protection","protection","projectile_protection"], items:["helmet","chestplate","leggings","boots","turtle_shell"] },
  flame: { levelMax: 1, weight: 2, incompatible: [], items:["bow"] },
  fortune: { levelMax: 3, weight: 2, incompatible:["silk_touch"], items:["pickaxe","shovel","axe","hoe"] },
  frost_walker: { levelMax: 2, weight: 2, incompatible:["depth_strider"], items:["boots"] },
  impaling: { levelMax: 5, weight: 2, incompatible: [], items:["trident"] },
  infinity: { levelMax: 1, weight: 4, incompatible:["mending"], items:["bow"] },
  knockback: { levelMax: 2, weight: 1, incompatible: [], items:["sword","spear"] },
  looting: { levelMax: 3, weight: 2, incompatible: [], items:["sword","spear"] },
  loyalty: { levelMax: 3, weight: 1, incompatible:["riptide"], items:["trident"] },
  luck_of_the_sea: { levelMax: 3, weight: 2, incompatible: [], items:["fishing_rod"] },
  lure: { levelMax: 3, weight: 2, incompatible: [], items:["fishing_rod"] },
  mending: { levelMax: 1, weight: 2, incompatible:["infinity"], items:["helmet","chestplate","leggings","boots","pickaxe","shovel","axe","sword","hoe","brush","fishing_rod","bow","shears","flint_and_steel","carrot_on_a_stick","warped_fungus_on_a_stick","shield","elytra","trident","turtle_shell","crossbow","mace","spear"] },
  multishot: { levelMax: 1, weight: 2, incompatible:["piercing"], items:["crossbow"] },
  piercing: { levelMax: 4, weight: 1, incompatible:["multishot"], items:["crossbow"] },
  power: { levelMax: 5, weight: 1, incompatible: [], items:["bow"] },
  projectile_protection: { levelMax: 4, weight: 1, incompatible:["protection","blast_protection","fire_protection"], items:["helmet","chestplate","leggings","boots","turtle_shell"] },
  punch: { levelMax: 2, weight: 2, incompatible: [], items:["bow"] },
  quick_charge: { levelMax: 3, weight: 1, incompatible: [], items:["crossbow"] },
  respiration: { levelMax: 3, weight: 2, incompatible: [], items:["helmet","turtle_shell"] },
  riptide: { levelMax: 3, weight: 2, incompatible:["channeling","loyalty"], items:["trident"] },
  sharpness: { levelMax: 5, weight: 1, incompatible:["bane_of_arthropods","smite","density","breach"], items:["sword","axe","spear"] },
  silk_touch: { levelMax: 1, weight: 4, incompatible:["fortune"], items:["pickaxe","shovel","axe","hoe"] },
  smite: { levelMax: 5, weight: 1, incompatible:["bane_of_arthropods","sharpness","density","breach"], items:["sword","axe","mace","spear"] },
  soul_speed: { levelMax: 3, weight: 4, incompatible: [], items:["boots"] },
  sweeping_edge: { levelMax: 3, weight: 2, incompatible: [], items:["sword"] },
  swift_sneak: { levelMax: 3, weight: 4, incompatible: [], items:["leggings"] },
  thorns: { levelMax: 3, weight: 4, incompatible: [], items:["helmet","chestplate","leggings","boots","turtle_shell"] },
  unbreaking: { levelMax: 3, weight: 1, incompatible: [], items:["helmet","chestplate","leggings","boots","pickaxe","shovel","axe","sword","hoe","brush","fishing_rod","bow","shears","flint_and_steel","carrot_on_a_stick","warped_fungus_on_a_stick","shield","elytra","trident","turtle_shell","crossbow","mace","spear"] },
  curse_of_binding: { levelMax: 1, weight: 4, incompatible: [], items:["helmet","chestplate","leggings","boots","elytra","pumpkin","turtle_shell"] },
  curse_of_vanishing: { levelMax: 1, weight: 4, incompatible: [], items:["helmet","chestplate","leggings","boots","pickaxe","shovel","axe","sword","hoe","brush","fishing_rod","bow","shears","flint_and_steel","carrot_on_a_stick","warped_fungus_on_a_stick","shield","elytra","pumpkin","trident","turtle_shell","crossbow","mace","spear"] },
  density: { levelMax: 5, weight: 1, incompatible:["breach","smite","bane_of_arthropods","sharpness"], items:["mace"] },
  breach: { levelMax: 4, weight: 2, incompatible:["density","smite","bane_of_arthropods","sharpness"], items:["mace"] },
  wind_burst: { levelMax: 3, weight: 2, incompatible: [], items:["mace"] },
  lunge: { levelMax: 3, weight: 1, incompatible: [], items:["spear"] }
};

// --- DP Solver Core ---

type EnchantInput = { id: string; level: number; weight: number; };
type State = { mask: number; work: number; cost: number; steps: any[]; display: string; };

const priorWorkPenalty = (w: number) => (1 << w) - 1;

function solveManyEnchants(itemType: string, enchants: EnchantInput[]) {
  const n = enchants.length;
  if (!n || n > 16) return null;

  const fullMask = (1 << n) - 1;
  let states: State[] = enchants.map((e, i) => ({
    mask: 1 << i,
    work: 0,
    cost: e.level * e.weight,
    steps: [],
    display: `Book (${e.id} ${e.level})`
  }));

  for (let round = 1; round < n; round++) {
    const next = new Map<string, State>();
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const a = states[i], b = states[j];
        if (a.mask & b.mask) continue;
        const newMask = a.mask | b.mask;
        const newWork = Math.max(a.work, b.work) + 1;
        const mergeCost = a.cost + b.cost + priorWorkPenalty(a.work) + priorWorkPenalty(b.work);
        if (mergeCost >= 40) continue;
        const key = `${newMask}|${newWork}`;
        const merged: State = {
          mask: newMask,
          work: newWork,
          cost: mergeCost,
          display: `${itemType} (${a.display.replace(/^Book \(|\)$/g,'')}, ${b.display.replace(/^Book \(|\)$/g,'')})`,
          steps: [...a.steps, ...b.steps, { left: a.display, right: b.display, cost: mergeCost, priorWork: priorWorkPenalty(newWork) }]
        };
        const existing = next.get(key);
        if (!existing || merged.cost < existing.cost) next.set(key, merged);
      }
    }
    states = Array.from(next.values());
    if (!states.length) break;
  }

  const best = states.filter(s => s.mask === fullMask).sort((a,b)=>a.cost-b.cost)[0];
  if (!best) return null;
  return { item: { display: best.display, w: best.work }, instructions: best.steps, maxLevels: best.cost, maxXp: best.cost*2 };
}

function process(itemType: string, enchants: [string,number][], mode: 'levels'|'prior_work') {
  const inputs: EnchantInput[] = enchants.map(([id, level]) => ({ id, level, weight: ENCHANTMENT_DATA[id]?.weight || 1 }));
  return solveManyEnchants(itemType === 'book' ? 'Book' : itemType, inputs);
}

// --- COMPONENT ---

export const EnchantmentCalculatorView: React.FC<EnchantmentCalculatorViewProps> = ({ onBack }) => {
  const [selectedItemType, setSelectedItemType] = useState<string>(ITEM_TYPES[0]);
  const [selectedEnchants, setSelectedEnchants] = useState<Map<string,number>>(new Map());
  const [allowIncompatible, setAllowIncompatible] = useState(false);
  const [optimizationMode, setOptimizationMode] = useState<'levels'|'prior_work'>('levels');
  const [enchantSearchQuery, setEnchantSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [solution, setSolution] = useState<any|null>(null);
  const [calcTime, setCalcTime] = useState(0);

  const filteredItemTypes = useMemo(() => itemSearchQuery ? ITEM_TYPES.filter(t=>t.toLowerCase().includes(itemSearchQuery.toLowerCase())) : ITEM_TYPES, [itemSearchQuery]);

  const toggleEnchant = (id: string, level: number) => {
    const map = new Map(selectedEnchants);
    if (map.has(id)) map.delete(id);
    else map.set(id, level);
    setSelectedEnchants(map);
    setSolution(null);
  };

  useEffect(() => {
    if (!selectedEnchants.size) { setSolution(null); return; }
    setIsCalculating(true);
    const start = performance.now();
    const result = process(selectedItemType.toLowerCase().includes('book') ? 'book' : selectedItemType, Array.from(selectedEnchants.entries()), optimizationMode);
    setSolution(result);
    setIsCalculating(false);
    setCalcTime(Math.round(performance.now() - start));
  }, [selectedEnchants, selectedItemType, optimizationMode]);

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400">
            <ArrowLeft size={16}/> Back
          </button>
          <h1 className="text-2xl font-bold text-amber-400">Anvil Calculator</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col h-[280px]">
            <label className="text-zinc-400 text-xs font-bold mb-2">Target Item</label>
            <input type="text" placeholder="Search..." value={itemSearchQuery} onChange={e=>setItemSearchQuery(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-2 py-1 text-xs text-zinc-200"/>
            <div className="flex flex-wrap gap-2 mt-2">
              {filteredItemTypes.map(type => <button key={type} onClick={()=>{setSelectedItemType(type); setSelectedEnchants(new Map()); setSolution(null)}} className={`px-2 py-1 rounded text-xs ${selectedItemType===type?'bg-amber-600 text-white':'bg-zinc-950 text-zinc-400'}`}>{type}</button>)}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col h-[500px]">
            <label className="text-zinc-400 text-xs font-bold mb-2">Enchantments</label>
            <div className="flex flex-wrap gap-2 max-h-[440px] overflow-y-auto">
              {Object.keys(ENCHANTMENT_DATA).map(id => {
                const data = ENCHANTMENT_DATA[id];
                const active = selectedEnchants.has(id);
                return <button key={id} onClick={()=>toggleEnchant(id, data.levelMax)} className={`px-2 py-1 text-xs rounded ${active?'bg-amber-500 text-white':'bg-zinc-950 text-zinc-400'}`}>{id}</button>
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6 min-h-[600px]">
          {isCalculating ? <div className="flex flex-col items-center justify-center h-full text-zinc-500 animate-pulse"><RefreshCw size={48} className="animate-spin mb-4"/>Calculating...</div> :
          solution ? (
            <div>
              <h2 className="text-lg font-bold text-amber-400 mb-2">Optimal Solution</h2>
              <p>Total Levels: {solution.maxLevels} | Raw XP: {solution.maxXp}</p>
              <ol className="list-decimal ml-4 mt-2">
                {solution.instructions.map((s:any,i:number)=><li key={i}>{s.display} (Cost: {s.cost})</li>)}
              </ol>
            </div>
          ) : <div className="text-zinc-500 text-center mt-20">Select enchantments to calculate the optimal path</div>}
        </div>
      </main>
    </div>
  );
};
