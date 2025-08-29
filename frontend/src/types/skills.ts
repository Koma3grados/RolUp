import { Category } from "@/types/enums";

export type SkillDTO = {
  id: number;
  name: string;
  descriptionTemplate: string;
  summaryTemplate: string;
  iconUrl: string;
  resetOn: string;
  currentUses: number;
  maxUses: number;
  autoCalculated: boolean;
  autoFormula: string;
  categories: Category[];
  source: string;
};