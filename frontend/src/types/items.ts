import type { CostUnit, ItemCategory, Rarity, ResetOn } from "./enums";

type CostDTO = {
  quantity: number;
  unit: CostUnit;
};

export type ItemPropertyDTO = {
    id: number;
    name: string;
    description: string;
    baseMaxUses: number;
    resetOn: ResetOn;
    currentUses: number; // Si no es null, estamos hablando de un CharacterItemProperty
}

export type ItemDTO = {
  id: number;
  name: string;
  descriptionTemplate: string;
  summaryTemplate: string;
  iconUrl: string;
  cost: CostDTO;
  rarity: Rarity;
  weight: number;
  category: ItemCategory;
  requiresAttunement: boolean;
  propertyDTOList: ItemPropertyDTO[];
  currentUses: number;
  maxUses: number;
  maxUsesAutoCalculated: boolean;
  maxUsesFormula: string;
  stackable: boolean;
  resetOn: string;

  // WEAPON
  range: string;
  damage: string;

  // ARMOR
  armorClassFormula: string;

  // CharacterItem
  attuned: boolean;
  equipped: boolean;
  quantity: number;
};