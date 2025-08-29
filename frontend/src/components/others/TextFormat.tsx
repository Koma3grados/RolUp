import React from "react";

interface TextFormatProps {
  text: string;
}

// Aplica reglas de formateo y devuelve un array de nodos React
function applyFormatting(text: string): React.ReactNode[] {
  if (!text) return [];

  let parts: React.ReactNode[] = [text];

  // ========================
  // Aquí puedes añadir más reglas
  // Cada regla toma `parts` y devuelve un array nuevo
  // ========================

  // 1. Negritas con *texto*
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const regex = /\*(.*?)\*/g;
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(part)) !== null) {
      if (match.index > lastIndex) {
        segments.push(part.slice(lastIndex, match.index));
      }
      segments.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < part.length) {
      segments.push(part.slice(lastIndex));
    }
    return segments;
  });

  // 2. "XdY fuego" → texto rojo + emoji 🔥
  parts = parts.flatMap((part) => {
    if (typeof part !== "string") return part;
    const regex = /(\d+d\d+)\s*fuego/gi;
    const segments: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(part)) !== null) {
      if (match.index > lastIndex) {
        segments.push(part.slice(lastIndex, match.index));
      }
      segments.push(
        <span key={match.index} style={{ color: "red" }}>
          {match[1]}🔥
        </span>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < part.length) {
      segments.push(part.slice(lastIndex));
    }
    return segments;
  });

  return parts;
}

export default function TextFormat({ text }: TextFormatProps) {
  const formatted = applyFormatting(text);
  return <>{formatted}</>;
}