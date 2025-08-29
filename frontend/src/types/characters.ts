export type CharacterSummaryDTO = {
  id: number;
  name: string;
  iconUrl: string;
  characterClass: string;
  level: number;
  race: string;
  accountUsername?: string; // visible solo para admins
};

export type CharacterAbilityStatsValue = {
  value: number | null;
  manual: boolean;
  proficient: boolean;
};

export type CharacterAbilityStats = {
  athletics: CharacterAbilityStatsValue;
  acrobatics: CharacterAbilityStatsValue;
  sleightOfHand: CharacterAbilityStatsValue;
  stealth: CharacterAbilityStatsValue;
  arcana: CharacterAbilityStatsValue;
  history: CharacterAbilityStatsValue;
  investigation: CharacterAbilityStatsValue;
  nature: CharacterAbilityStatsValue;
  religion: CharacterAbilityStatsValue;
  animalHandling: CharacterAbilityStatsValue;
  insight: CharacterAbilityStatsValue;
  medicine: CharacterAbilityStatsValue;
  perception: CharacterAbilityStatsValue;
  survival: CharacterAbilityStatsValue;
  deception: CharacterAbilityStatsValue;
  intimidation: CharacterAbilityStatsValue;
  performance: CharacterAbilityStatsValue;
  persuasion: CharacterAbilityStatsValue;

  savingThrowStrength: CharacterAbilityStatsValue;
  savingThrowDexterity: CharacterAbilityStatsValue;
  savingThrowConstitution: CharacterAbilityStatsValue;
  savingThrowIntelligence: CharacterAbilityStatsValue;
  savingThrowWisdom: CharacterAbilityStatsValue;
  savingThrowCharisma: CharacterAbilityStatsValue;

  passivePerception: CharacterAbilityStatsValue;
};

export type SpellSlot = {
  level: number;         // Nivel del conjuro (0-9)
  currentSlots: number;  // Huecos actuales disponibles
  maxSlots: number;      // Huecos totales
};

export type CharacterDTO = {
  id: number;
  name: string;
  race: string;
  characterClass: string;
  background: string;
  alignment: string;
  iconUrl: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  armorClass: number;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  speed: number;
  proficiencyBonus: number;
  proficiencyBonusManual: boolean;
  otherProficiencies: string;
  languages: string;
  hitDiceType: string;
  hitDiceCurrentAmount: number;
  hitDiceMaxAmount: number;
  size: string;
  inspirationPoints: number;
  coins: number[];             // [cobre, plata, electrum, oro, platino]
  knownSpells: number[];       // 10 niveles de conjuros
  spellSlots: SpellSlot[];     // huecos de conjuro por nivel
  skills: CharacterAbilityStats;

  initiative: number;
  initiativeManual: boolean;

  actualWeight: number;
  maxWeight: number;
  maxWeightManual: boolean;

  spellCastingStat: string; // STRENGTH, DEXTERITY, CONSTITUTION, INTELLIGENCE, WISDOM, CHARISMA
  
  spellCastingModifier: number;
  spellCastingModifierManual: boolean;
  spellSaveDC: number;
  spellSaveDCManual: boolean;
  maxPreparedSpells: number;
  
  accountId?: number;
};

export const attributeLabels: Record<keyof Pick<CharacterDTO, "strength" | "dexterity" | "constitution" | "intelligence" | "wisdom" | "charisma">, string> = {
  strength: "Fuerza",
  dexterity: "Destreza",
  constitution: "Constitución",
  intelligence: "Inteligencia",
  wisdom: "Sabiduría",
  charisma: "Carisma",
};

export const skillGroups: Record<keyof typeof attributeLabels, { label: string; savingThrow: keyof CharacterDTO["skills"]; skills: (keyof CharacterDTO["skills"])[] }> = {
  strength: {
    label: "Fuerza",
    savingThrow: "savingThrowStrength",
    skills: ["athletics"],
  },
  dexterity: {
    label: "Destreza",
    savingThrow: "savingThrowDexterity",
    skills: ["acrobatics", "sleightOfHand", "stealth"],
  },
  constitution: {
    label: "Constitución",
    savingThrow: "savingThrowConstitution",
    skills: [],
  },
  intelligence: {
    label: "Inteligencia",
    savingThrow: "savingThrowIntelligence",
    skills: ["arcana", "history", "investigation", "nature", "religion"],
  },
  wisdom: {
    label: "Sabiduría",
    savingThrow: "savingThrowWisdom",
    skills: ["animalHandling", "insight", "medicine", "perception", "survival", "passivePerception"],
  },
  charisma: {
    label: "Carisma",
    savingThrow: "savingThrowCharisma",
    skills: ["deception", "intimidation", "performance", "persuasion"],
  },
} as const;



// Modificadores:
// Función para calcular el modificador (devuelve number)
export const calculateModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

// Función para formatear el modificador (devuelve string con + o -)
export const formatModifier = (value: number): string => {
  return (value >= 0 ? '+' : '') + value;
};

// Función para calcular el valor de habilidad (devuelve string formateado)
export const calculateSkillValue = (
  skill: CharacterAbilityStatsValue,
  abilityModifier: number,
  proficiencyBonus: number
): string => {
  if (skill.manual && skill.value !== null) {
    return formatModifier(skill.value);
  }
  let total = abilityModifier;
  if (skill.proficient) {
    total += proficiencyBonus;
  }
  return formatModifier(total);
};

// Conjuro cosas
export const calculateSpellModifier = (
  character: CharacterDTO,
  isManual: boolean,
  manualValue: number
): number => {
  if (isManual) {
    return manualValue;
  }
  
  if (!character.spellCastingStat) return 0;
  
  const abilityScore = character[character.spellCastingStat.toLowerCase() as keyof typeof attributeLabels];
  return calculateModifier(abilityScore) + character.proficiencyBonus;
};

export const calculateSpellSaveDC = (
  character: CharacterDTO,
  isManual: boolean,
  manualValue: number
): number => {
  if (isManual) {
    return manualValue;
  }
  
  return 8 + calculateSpellModifier(character, false, 0);
};