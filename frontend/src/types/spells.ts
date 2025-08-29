import { Category, Source, School } from "@/types/enums";

export type SpellDTO = {
  id: number;
  name: string;
  level: number;
  school: School;
  descriptionTemplate: string;
  summaryTemplate: string;
  iconUrl: string;
  prepared: boolean;
  favourite: boolean;
  concentration: boolean;
  categories: Category[];
  source: Source;
};

export const schoolStyles = {
  abjuration: { icon: "🛡️", bgColor: "bg-blue-100", textColor: "text-blue-800" },
  conjuration: { icon: "🌀", bgColor: "bg-green-100", textColor: "text-green-800" },
  divination: { icon: "🔮", bgColor: "bg-purple-100", textColor: "text-purple-800" },
  enchantment: { icon: "✨", bgColor: "bg-pink-100", textColor: "text-pink-800" },
  evocation: { icon: "🔥", bgColor: "bg-red-100", textColor: "text-red-800" },
  illusion: { icon: "👁️", bgColor: "bg-indigo-100", textColor: "text-indigo-800" },
  necromancy: { icon: "💀", bgColor: "bg-gray-800", textColor: "text-gray-100" },
  transmutation: { icon: "♻️", bgColor: "bg-amber-100", textColor: "text-amber-800" },
  default: { icon: "🔮", bgColor: "bg-gray-100", textColor: "text-gray-800" }
};