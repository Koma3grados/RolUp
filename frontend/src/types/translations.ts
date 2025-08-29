import type { CharacterDTO } from "./characters";
import type { Category, Source, ResetOn, ItemCategory, Rarity, CostUnit } from "./enums";

export const categoryTranslations: Record<Category, string> = {
  DAMAGE: "Daño",
  UTILITY: "Utilidad",
  TANK: "Tanqueo",
  SUPPORT: "Soporte",
  AOE: "AoE",
  HEALING: "Curación",
  SHIELDING: "Escudos",
  BURST: "Burst",
  CC: "CC",
  MOVEMENT: "Movilidad"
};

export const sourceTranslations: Record<Source, string> = {
  INNATE: "Innato",
  ITEM: "Objeto",
  CLASS: "Clase",
  RACE: "Raza",
  BACKGROUND: "Trasfondo",
  FEAT: "Dote"
};

export const schoolTranslations = {
  abjuration: "Abjuración",
  conjuration: "Conjuración",
  divination: "Adivinación",
  enchantment: "Encantamiento",
  evocation: "Evocación",
  illusion: "Ilusión",
  necromancy: "Nigromancia",
  transmutation: "Transmutación"
};

export const spellStatTranslations: Record<string, string> = {
  STRENGTH: "Fuerza",
  DEXTERITY: "Destreza",
  CONSTITUTION: "Constitución",
  INTELLIGENCE: "Inteligencia",
  WISDOM: "Sabiduría",
  CHARISMA: "Carisma"
};

export const resetOnTranslations: Record<ResetOn, string> = {
  SHORT_REST: "Descanso corto",
  LONG_REST: "Descanso largo",
  SPECIAL: "Especial",
  NONE: "Ninguno"
};

export const skillTranslations: Record<keyof CharacterDTO["skills"], string> = {
  athletics: "Atletismo",
  acrobatics: "Acrobacias",
  sleightOfHand: "Juego de Manos",
  stealth: "Sigilo",
  arcana: "C. Arcano",
  history: "Historia",
  investigation: "Investigación",
  nature: "Naturaleza",
  religion: "Religión",
  animalHandling: "Trato con Animales",
  insight: "Perspicacia",
  medicine: "Medicina",
  perception: "Percepción",
  survival: "Supervivencia",
  deception: "Engaño",
  intimidation: "Intimidación",
  performance: "Interpretación",
  persuasion: "Persuasión",
  
  // Tiradas de salvación
  savingThrowStrength: "Tirada de Fuerza",
  savingThrowDexterity: "Tirada de Destreza",
  savingThrowConstitution: "Tirada de Constitución",
  savingThrowIntelligence: "Tirada de Inteligencia",
  savingThrowWisdom: "Tirada de Sabiduría",
  savingThrowCharisma: "Tirada de Carisma",
  
  passivePerception: "Percepción Pasiva"
};

export const itemCategoryTranslations: Record<ItemCategory, string> = {
  WEAPON: "Arma",
  ARMOR: "Armadura",
  CONSUMABLE: "Consumible",
  OTHER: "Otro"
};

export const rarityTranslations: Record<Rarity, string> = {
  COMMON: "Común",
  UNCOMMON: "Poco común",
  RARE: "Raro",
  VERY_RARE: "Muy raro",
  LEGENDARY: "Legendario"
};

export const costUnitTranslations: Record<CostUnit, string> = {
  PP: "Platino",
  GP: "Oro",
  EP: "Electrum",
  SP: "Plata",
  CP: "Cobre"
};

// Funciones helper
export const translateCategory = (category: Category): string => {
  return categoryTranslations[category] || category;
};

export const translateSchool = (school: string): string => {
  return schoolTranslations[school.toLowerCase() as keyof typeof schoolTranslations] || school;
};

export const translateSource = (source: Source): string => {
  return sourceTranslations[source] || source;
};

export const translateCostUnit = (unit: CostUnit): string => {
  return costUnitTranslations[unit] || unit;
};

export const translateResetOn = (resetOn: ResetOn): string => {
  return resetOnTranslations[resetOn] || resetOn;
};

export const translateSpellStat = (stat: string): string => {
  return spellStatTranslations[stat] || stat;
};