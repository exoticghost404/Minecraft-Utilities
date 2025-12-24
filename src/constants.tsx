import { Shield, Sword, Hammer, Globe, HardHat, Shirt, Footprints, Pickaxe, Zap, Fish, BoxSelect, Feather } from 'lucide-react';
import { Category, EnchantmentType, BestLoadout } from './types';

export const CATEGORIES: Category[] = [
  {
    id: 'armor',
    name: 'Armor',
    icon: Shield,
    groups: [
      {
        name: 'General Armor',
        items: [
          { 
            id: 'protection', 
            name: 'Protection', 
            maxLevel: 'I–IV', 
            type: EnchantmentType.NORMAL,
            description: 'Reduces most types of damage by 4% for each level.'
          },
          { 
            id: 'projectile_protection', 
            name: 'Projectile Protection', 
            maxLevel: 'I–IV', 
            type: EnchantmentType.NORMAL,
            description: 'Reduces projectile damage.'
          },
          { 
            id: 'fire_protection', 
            name: 'Fire Protection', 
            maxLevel: 'I–IV', 
            type: EnchantmentType.NORMAL,
            description: 'Reduces fire damage and burn time.'
          },
          { 
            id: 'blast_protection', 
            name: 'Blast Protection', 
            maxLevel: 'I–IV', 
            type: EnchantmentType.NORMAL,
            description: 'Reduces explosion damage and knockback.'
          },
          { 
            id: 'thorns', 
            name: 'Thorns', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Reflects some of the damage taken when hit, at the cost of reducing durability.'
          },
        ],
      },
      {
        name: 'Helmet',
        items: [
          { 
            id: 'aqua_affinity', 
            name: 'Aqua Affinity', 
            type: EnchantmentType.NORMAL,
            description: 'Increase the rate of underwater mining speed.'
          },
          { 
            id: 'respiration', 
            name: 'Respiration', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Extends underwater breathing time.'
          },
        ],
      },
      {
        name: 'Leggings',
        items: [
          { 
            id: 'swift_sneak', 
            name: 'Swift Sneak', 
            maxLevel: 'I–III', 
            type: EnchantmentType.TREASURE,
            description: 'Increased player speed when crouching.'
          },
        ],
      },
      {
        name: 'Boots',
        items: [
          { 
            id: 'feather_falling', 
            name: 'Feather Falling', 
            maxLevel: 'I–IV', 
            type: EnchantmentType.NORMAL,
            description: 'Reduces fall damage.'
          },
          { 
            id: 'frost_walker', 
            name: 'Frost Walker', 
            maxLevel: 'I–II', 
            type: EnchantmentType.NORMAL,
            description: 'Changes the water source blocks beneath the player into frosted ice and prevents damage from magma blocks.'
          },
          { 
            id: 'soul_speed', 
            name: 'Soul Speed', 
            maxLevel: 'I–III', 
            type: EnchantmentType.TREASURE,
            description: 'Increases walking speed on soul sand and soul soil.'
          },
          { 
            id: 'depth_strider', 
            name: 'Depth Strider', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Increases underwater movement speed.'
          },
        ],
      }
    ],
  },
  {
    id: 'weapon',
    name: 'Weapons',
    icon: Sword,
    groups: [
      {
        name: 'General Weapons',
        items: [
          { 
            id: 'sharpness', 
            name: 'Sharpness', 
            maxLevel: 'I–V', 
            type: EnchantmentType.NORMAL,
            description: 'Increases weapon damage.'
          },
          { 
            id: 'smite', 
            name: 'Smite', 
            maxLevel: 'I–V', 
            type: EnchantmentType.NORMAL,
            description: 'Increases damage to undead mobs.'
          },
          { 
            id: 'bane_of_arthropods', 
            name: 'Bane of Arthropods', 
            maxLevel: 'I–V', 
            type: EnchantmentType.NORMAL,
            description: 'Increases damage and applies Slowness IV to arthropod mobs (spiders, bees, etc.).'
          },
          { 
            id: 'fire_aspect', 
            name: 'Fire Aspect', 
            maxLevel: 'I–II', 
            type: EnchantmentType.NORMAL,
            description: 'Sets target on fire.'
          },
          { 
            id: 'knockback', 
            name: 'Knockback', 
            maxLevel: 'I–II', 
            type: EnchantmentType.NORMAL,
            description: 'Knocks back mobs away from you when hit.'
          },
          { 
            id: 'looting', 
            name: 'Looting', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Increases amount of loot earned from mobs.'
          },
          { 
            id: 'sweeping_edge', 
            name: 'Sweeping Edge', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Increases sweeping attack damage. Available only in Java Edition.'
          },
        ],
      },
      {
        name: 'Bow',
        items: [
          { 
            id: 'power', 
            name: 'Power', 
            maxLevel: 'I–V', 
            type: EnchantmentType.NORMAL,
            description: 'Increases arrow damage.'
          },
          { 
            id: 'punch', 
            name: 'Punch', 
            maxLevel: 'I–II', 
            type: EnchantmentType.NORMAL,
            description: 'Increases arrow knockback.'
          },
          { 
            id: 'flame', 
            name: 'Flame', 
            type: EnchantmentType.NORMAL,
            description: 'Arrows set targets on fire.'
          },
          { 
            id: 'infinity', 
            name: 'Infinity', 
            type: EnchantmentType.NORMAL,
            description: 'Shooting with projectiles does not consume arrows.'
          },
        ],
      },
      {
        name: 'Crossbow',
        items: [
          { 
            id: 'multishot', 
            name: 'Multishot', 
            type: EnchantmentType.NORMAL,
            description: 'Shoot 3 arrows at the cost of one.'
          },
          { 
            id: 'piercing', 
            name: 'Piercing', 
            maxLevel: 'I–IV', 
            type: EnchantmentType.NORMAL,
            description: 'Arrows pass through multiple entities.'
          },
          { 
            id: 'quick_charge', 
            name: 'Quick Charge', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Decreases crossbow charging time.'
          },
        ],
      },
      {
        name: 'Trident',
        items: [
          { 
            id: 'loyalty', 
            name: 'Loyalty', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Trident returns after being thrown.'
          },
          { 
            id: 'riptide', 
            name: 'Riptide', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Trident launches player with itself when thrown. Functions only in water or rain.'
          },
          { 
            id: 'channeling', 
            name: 'Channeling', 
            type: EnchantmentType.NORMAL,
            description: 'Channels a bolt of lightning toward a hit entity during thunderstorms.'
          },
          { 
            id: 'impaling', 
            name: 'Impaling', 
            maxLevel: 'I–V', 
            type: EnchantmentType.NORMAL,
            description: 'Trident deals additional damage to mobs that spawn naturally in the ocean.'
          },
        ],
      },
      {
        name: 'Mace',
        items: [
            { 
              id: 'density', 
              name: 'Density', 
              maxLevel: 'I–V', 
              type: EnchantmentType.NORMAL,
              description: 'Boosts the rate at which mace multiplies damage while falling.'
            },
            { 
              id: 'breach', 
              name: 'Breach', 
              maxLevel: 'I–IV', 
              type: EnchantmentType.NORMAL,
              description: 'Negate the effectiveness of enemy armor by 15% per level.'
            },
            { 
              id: 'wind_burst', 
              name: 'Wind Burst', 
              maxLevel: 'I–III', 
              type: EnchantmentType.TREASURE,
              description: 'Allows the player to bounce up into the air following a successful hit.'
            },
        ],
      },
      {
        name: 'Spear',
        items: [
            { 
              id: 'lunge', 
              name: 'Lunge', 
              maxLevel: 'I–III', 
              type: EnchantmentType.NORMAL,
              description: 'Spear jabs get a burst of speed. Consumes saturation and hunger.'
            },
        ],
      },
    ],
  },
  {
    id: 'tool',
    name: 'Tools',
    icon: Hammer,
    groups: [
      {
        name: 'General Tools',
        items: [
          { 
            id: 'efficiency', 
            name: 'Efficiency', 
            maxLevel: 'I–V', 
            type: EnchantmentType.NORMAL,
            description: 'Increases mining speed. On axes, increases chance to stun shields.'
          },
          { 
            id: 'fortune', 
            name: 'Fortune', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Increases certain item drop chances from blocks.'
          },
          { 
            id: 'silk_touch', 
            name: 'Silk Touch', 
            type: EnchantmentType.NORMAL,
            description: 'Mined blocks will drop as blocks instead of breaking into other items.'
          },
        ],
      },
      {
        name: 'Fishing Rod',
        items: [
          { 
            id: 'luck_of_the_sea', 
            name: 'Luck of the Sea', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Increases rate of fishing rare loot.'
          },
          { 
            id: 'lure', 
            name: 'Lure', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Decreases wait time until fish/junk/loot bites.'
          },
        ],
      }
    ],
  },
  {
    id: 'universal',
    name: 'Universal',
    icon: Globe,
    groups: [
      {
        name: 'Durability & Mending',
        items: [
          { 
            id: 'unbreaking', 
            name: 'Unbreaking', 
            maxLevel: 'I–III', 
            type: EnchantmentType.NORMAL,
            description: 'Increases item durability.'
          },
          { 
            id: 'mending', 
            name: 'Mending', 
            type: EnchantmentType.NORMAL,
            description: 'Repairs the item when gaining XP orbs.'
          },
        ],
      },
      {
        name: 'Curses',
        items: [
          { 
            id: 'curse_of_vanishing', 
            name: 'Curse of Vanishing', 
            type: EnchantmentType.CURSE,
            description: 'Item destroyed upon death.'
          },
          { 
            id: 'curse_of_binding', 
            name: 'Curse of Binding', 
            type: EnchantmentType.CURSE,
            description: 'Items cannot be removed from armor slots unless the cause is death or breaking.'
          },
        ],
      },
    ],
  },
];

export const BEST_LOADOUTS: BestLoadout[] = [
  {
    id: 'helmet',
    name: 'Helmet',
    icon: HardHat,
    description: 'Maximum survivability and underwater capability.',
    enchantments: [
      { name: 'Protection', level: 'IV' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Mending' },
      { name: 'Respiration', level: 'III' },
      { name: 'Aqua Affinity' },
      { name: 'Thorns', level: 'III', note: 'Uses extra durability' },
    ],
  },
  {
    id: 'chestplate',
    name: 'Chestplate',
    icon: Shirt,
    description: 'The core of your defense.',
    enchantments: [
      { name: 'Protection', level: 'IV' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Mending' },
      { name: 'Thorns', level: 'III', note: 'Optional' },
    ],
  },
  {
    id: 'leggings',
    name: 'Leggings',
    icon: BoxSelect,
    description: 'Stealth and protection.',
    enchantments: [
      { name: 'Protection', level: 'IV' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Mending' },
      { name: 'Swift Sneak', level: 'III', note: 'Deep Dark essential' },
      { name: 'Thorns', level: 'III', note: 'Uses extra durability' },
    ],
  },
  {
    id: 'boots',
    name: 'Boots',
    icon: Footprints,
    description: 'Mobility across all terrains.',
    enchantments: [
      { name: 'Protection', level: 'IV' },
      { name: 'Feather Falling', level: 'IV', note: 'Essential' },
      { name: 'Depth Strider', level: 'III', isChoice: true, note: 'Fast swimming' },
      { name: 'Frost Walker', level: 'II', isChoice: true, note: 'Ice walking' },
      { name: 'Soul Speed', level: 'III', note: 'Nether speed' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Mending' },
      { name: 'Thorns', level: 'III', note: 'Uses extra durability' },
    ],
    alternatives: 'Choose Depth Strider for general use, Frost Walker for specialized travel.',
  },
  {
    id: 'sword',
    name: 'Sword',
    icon: Sword,
    description: 'Maximum DPS and loot generation.',
    enchantments: [
      { name: 'Sharpness', level: 'V', isChoice: true, note: 'General damage' },
      { name: 'Smite', level: 'V', isChoice: true, note: 'Undead damage (Wither/Zombies)' },
      { name: 'Looting', level: 'III' },
      { name: 'Sweeping Edge', level: 'III', note: 'Java Edition Only' },
      { name: 'Fire Aspect', level: 'II' },
      { name: 'Knockback', level: 'II', note: 'Can be annoying for loot' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Mending' },
    ],
    alternatives: 'Keep a separate Smite V sword for the Wither fight.',
  },
  {
    id: 'pickaxe',
    name: 'Pickaxe',
    icon: Pickaxe,
    description: 'The most important tool in the game.',
    enchantments: [
      { name: 'Efficiency', level: 'V' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Mending' },
      { name: 'Fortune', level: 'III', isChoice: true, note: 'Multiplies drops' },
      { name: 'Silk Touch', isChoice: true, note: 'Preserves blocks' },
    ],
    alternatives: 'You MUST have two pickaxes: one for Fortune, one for Silk Touch. They cannot be combined.',
  },
  {
    id: 'bow',
    name: 'Bow',
    icon: Zap,
    description: 'Long range destruction.',
    enchantments: [
      { name: 'Power', level: 'V' },
      { name: 'Punch', level: 'II' },
      { name: 'Flame' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Infinity', isChoice: true, note: 'Unlimited ammo, no Mending' },
      { name: 'Mending', isChoice: true, note: 'Infinite durability, need arrows' },
    ],
    alternatives: 'Infinity is generally preferred for Bows as bows are cheap to repair/replace.',
  },
  {
    id: 'rod',
    name: 'Fishing Rod',
    icon: Fish,
    description: 'For treasure hunting.',
    enchantments: [
      { name: 'Luck of the Sea', level: 'III' },
      { name: 'Lure', level: 'III' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Mending' },
    ],
  },
  {
    id: 'elytra',
    name: 'Elytra',
    icon: Feather,
    description: 'Flight durability.',
    enchantments: [
        { name: 'Unbreaking', level: 'III' },
        { name: 'Mending' }
    ]
  },
  {
    id: 'mace',
    name: 'Mace',
    icon: Hammer,
    description: 'Heavy smash attacks.',
    enchantments: [
        { name: 'Density', level: 'V', isChoice: true, note: 'Massive damage scale' },
        { name: 'Breach', level: 'IV', isChoice: true, note: 'Armor penetration' },
        { name: 'Wind Burst', level: 'III', note: 'Launch upwards' },
        { name: 'Fire Aspect', level: 'II', note: 'Burn target' },
        { name: 'Unbreaking', level: 'III' },
        { name: 'Mending' }
    ]
  },
  {
    id: 'trident',
    name: 'Trident',
    icon: Zap,
    description: 'Versatile weapon for melee, range, or travel.',
    enchantments: [
      { name: 'Impaling', level: 'V' },
      { name: 'Riptide', level: 'III', isChoice: true, note: 'Flight in rain/water. No Loyalty.' },
      { name: 'Loyalty', level: 'III', isChoice: true, note: 'Returns when thrown. No Riptide.' },
      { name: 'Channeling', isChoice: true, note: 'Summons lightning. Needs Loyalty.' },
      { name: 'Unbreaking', level: 'III' },
      { name: 'Mending' },
    ],
    alternatives: 'Riptide and Loyalty/Channeling are mutually exclusive. Build two tridents.'
  },
  {
    id: 'spear',
    name: 'Spear',
    icon: Sword,
    description: 'Long-range melee strikes with mobility.',
    enchantments: [
        { name: 'Lunge', level: 'III', note: 'Optional' },
        { name: 'Sharpness', level: 'V', isChoice: true, note: 'General damage' },
        { name: 'Smite', level: 'V', isChoice: true, note: 'Undead damage' },
        { name: 'Looting', level: 'III' },
        { name: 'Fire Aspect', level: 'II' },
        { name: 'Knockback', level: 'II', note: 'Optional' },
        { name: 'Unbreaking', level: 'III' },
        { name: 'Mending' }
    ]
  }
];
