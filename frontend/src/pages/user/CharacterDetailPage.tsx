import { useEffect, useState } from "react";
import { charactersAPI } from "@/features/characters/services/characters";
import { attributeLabels, formatModifier, calculateSkillValue, skillGroups, type CharacterDTO, calculateModifier } from "@/types/characters";
import EditModal from "@/components/modals/forms/EditModal";
import { useParams } from "react-router-dom";
import { skillTranslations } from "@/types/translations";
import toast from "react-hot-toast";
import ValueOrManualModal from "@/components/modals/forms/ValueOrManualModal";
import SkillEditModal from "@/features/characters/components/user/SkillEditModal";
import CoinsEditModal from "@/features/characters/components/user/CoinsEditModal";
import LoadingSpinner from "@/components/others/LoadingSpinner";
import PageHeader from "@/components/others/PageHeader";

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<CharacterDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);

  // Estado para modales principales
  const [modalProps, setModalProps] = useState<null | {
    field: keyof CharacterDTO;
    type: "text" | "number" | "skill" | "valueOrManual" | "coin";
    title: string;
    value: any;
    autoValue?: number;
    valueLabel?: string;
    autoValueLabel?: string;
    coinIndex?: number;
  }>(null);

  const menuItems = [
    { label: "Conjuros", path: "spells" },
    { label: "Habilidades", path: "skills" },
    { label: "Inventario", path: "items" },
  ];

  const proficiencyBonus = character?.proficiencyBonus ?? 0;

  const openEditModal = (
    field: keyof CharacterDTO,
    type: "text" | "number" | "skill" | "coin",
    title: string,
    value: any
  ) => {
    if (field === "coins") {
      const index = value.index;
      setModalProps({
        field,
        type,
        title: `Editar ${["Cobre", "Plata", "Electrum", "Oro", "Platino"][index]}`,
        value: character?.coins?.[index] ?? 0,
        coinIndex: value.index
      });
    } else {
      setModalProps({ field, type, title, value });
    }
    setModalOpen(true);
  };

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const data = await charactersAPI.getCharacter(Number(id));
        setCharacter(data);
      } catch (error) {
        toast.error("Error cargando el personaje", {
          position: "top-center"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [id]);

  const handleEdit = async (field: keyof CharacterDTO, value: any, isManual?: boolean) => {
    if (!character) return;

    let updated: Partial<CharacterDTO> = {};

    if (field === "initiative") {
      updated = {
        initiative: value,
        initiativeManual: isManual
      };
    } else if (field === "coins") {
      const newCoins = [...(character.coins || [0, 0, 0, 0, 0])];
      if (modalProps?.type === "coin" && modalProps.coinIndex !== undefined) {
        newCoins[modalProps.coinIndex] = value;
      }
      updated = { coins: newCoins };
    } else if (field === "skills" && value.key) {
      const updatedSkills = {
        ...character.skills,
        [value.key]: {
          ...value,
        },
      };
      updated = { skills: updatedSkills };
    } else {
      updated = { [field]: value };
    }

    try {
      const updatedCharacter = await charactersAPI.updateCharacter(character.id, updated);

      setCharacter(prev => {
        if (!prev) return prev;

        if (updatedCharacter && typeof updatedCharacter === 'object') {
          return { ...prev, ...updatedCharacter };
        }

        return { ...prev, ...updated };
      });

      setModalOpen(false);
    } catch (error) {
      toast.error("Error al actualizar", {
        position: "top-center"
      });
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!character) return <div className="p-6 text-black bg-white">Personaje no encontrado</div>;

  return (
    <div className="min-h-screen bg-cover bg-fixed text-ink font-serif p-6 space-y-0"
      style={{
        backgroundImage: "url('/Scroll.png')",
        backgroundColor: '#f5e7d0',
      }}>

      {/* Overlay entre fondo y contenido */}
      <div className="fixed inset-0 bg-parchment/70 z-0"></div>

      {/* Contenido principal */}
      <div className="relative z-10">

        <PageHeader
          title={character.name}
          menuItems={menuItems}
          editable={true}
          onEditClick={() => openEditModal("name", "text", "Nombre del personaje", character.name)}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Columna izquierda - Atributos (segunda en móvil, primera en desktop) */}
          <div className="order-2 md:order-1 md:col-span-3 space-y-3">
            {Object.keys(attributeLabels).map((key) => {
              const attr = key as keyof typeof attributeLabels;
              const group = skillGroups[attr];
              const abilityScore = character[attr];
              const abilityModifier = calculateModifier(abilityScore);

              return (
                <div
                  key={attr}
                  className="rounded-2xl bg-white shadow-sm px-4 py-3 text-black text-center"
                >
                  <h3
                    className="text-lg font-bold mb-1 border-b border-gray-300 pb-1 cursor-pointer hover:bg-gray-100 rounded-md transition-colors duration-0 mx-auto w-full"
                    onClick={() =>
                      openEditModal(attr, "number", attributeLabels[attr], character[attr])
                    }
                  >
                    {attributeLabels[attr]}: {character[attr]} ({formatModifier(abilityModifier)})
                  </h3>
                  <ul className="mt-1 text-sm space-y-1">
                    <li
                      key={group.savingThrow}
                      className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors duration-0"
                      onClick={() =>
                        openEditModal(
                          "skills",
                          "skill",
                          `Tirada de Salvación de ${attributeLabels[attr]}`,
                          {
                            ...character.skills[group.savingThrow],
                            key: group.savingThrow,
                          }
                        )
                      }
                    >
                      <span className="text-gray-700 italic">Tirada de salvación</span>
                      <span className="font-medium">
                        {calculateSkillValue(
                          character.skills[group.savingThrow],
                          abilityModifier,
                          proficiencyBonus
                        )}
                        {character.skills[group.savingThrow]?.proficient ? " ✓" : ""}
                      </span>
                    </li>
                    {group.skills.map((skillKey) => {
                      const skill = character.skills[skillKey];
                      return (
                        <li
                          key={skillKey}
                          className="flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-gray-100 transition-colors duration-0"
                          onClick={() =>
                            openEditModal(
                              "skills",
                              "skill",
                              skillTranslations[skillKey],
                              {
                                ...character.skills[skillKey],
                                key: skillKey,
                              }
                            )
                          }
                        >
                          <span className="text-gray-800">{skillTranslations[skillKey]}</span>
                          <span className="font-medium">
                            {calculateSkillValue(skill, abilityModifier, proficiencyBonus)}
                            {skill.proficient ? " ✓" : ""}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Columna centro - Combate y stats principales (primera en móvil, segunda en desktop) */}
          <div className="order-1 md:order-2 md:col-span-5 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div
                className="rounded-xl bg-white shadow p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-0"
                onClick={() =>
                  openEditModal("armorClass", "number", "Clase de Armadura", character.armorClass)
                }
              >
                <h4 className="font-bold text-gray-700">CA</h4>
                <p className="text-xl">{character.armorClass}</p>
              </div>
              <div
                className="rounded-xl bg-white shadow p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-0"
                onClick={() => {
                  setModalProps({
                    field: "initiative",
                    type: "valueOrManual",
                    title: "Editar Iniciativa",
                    value: {
                      value: character.initiative,
                      isManual: character.initiativeManual,
                    },
                    autoValue: calculateModifier(character.dexterity),
                    autoValueLabel: "Valor automático (Mod. Destreza)",
                  });
                  setModalOpen(true);
                }}
              >
                <h4 className="font-bold text-gray-700">Iniciativa</h4>
                <p className="text-xl">
                  {character.initiativeManual
                    ? (character.initiative >= 0 ? '+' : '') + character.initiative
                    : (calculateModifier(character.dexterity) >= 0 ? '+' : '') + calculateModifier(character.dexterity)}
                </p>
              </div>
              <div
                className="rounded-xl bg-white shadow p-3 cursor-pointer hover:bg-gray-100 transition-colors duration-0"
                onClick={() =>
                  openEditModal("speed", "number", "Velocidad", character.speed)
                }
              >
                <h4 className="font-bold text-gray-700">Velocidad</h4>
                <p className="text-xl">{character.speed}</p>
              </div>
            </div>

            <div className="rounded-xl bg-white shadow p-4">
              <h4 className="font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">Puntos de Golpe</h4>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("maxHp", "number", "PG máximos", character.maxHp)}
              >
                <strong>Máximos:</strong> {character.maxHp}
              </p>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("currentHp", "number", "PG actuales", character.currentHp)}
              >
                <strong>Actuales:</strong> {character.currentHp}
              </p>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("tempHp", "number", "PG temporales", character.tempHp)}
              >
                <strong>Temporales:</strong> {character.tempHp}
              </p>

            </div>

            <div className="rounded-xl bg-white shadow p-4">
              <h4 className="font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">Dados de Golpe</h4>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("hitDiceCurrentAmount", "number", "Dados Actuales", character.hitDiceCurrentAmount)}
              >
                <strong>Actuales:</strong> {character.hitDiceCurrentAmount}
              </p>
              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("hitDiceMaxAmount", "number", "Dados Máximos", character.hitDiceMaxAmount)}
              >
                <strong>Máximos:</strong> {character.hitDiceMaxAmount}
              </p>
              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("hitDiceType", "text", "Tipo de Dado", character.hitDiceType)}
              >
                <strong>Tipo:</strong> {character.hitDiceType}
              </p>
            </div>

            <div className="rounded-xl bg-white shadow p-4">
              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("proficiencyBonus", "number", "Bonificador de competencia", character.proficiencyBonus)}
              >
                <strong>Bonificador de competencia:</strong> {formatModifier(character.proficiencyBonus)}
              </p>
              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("inspirationPoints", "number", "Puntos de inspiración", character.inspirationPoints)}
              >
                <strong>Puntos de inspiración:</strong> {character.inspirationPoints}
              </p>
            </div>
          </div>

          {/* Columna derecha - Info general y otros (tercera en móvil, tercera en desktop) */}
          <div className="order-3 md:order-3 md:col-span-4 space-y-3">
            <div className="rounded-xl bg-white shadow p-4 space-y-1">
              <h4 className="font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">Información General</h4>
              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("characterClass", "text", "Clase", character.characterClass)}
              >
                <strong>Clase:</strong> {character.characterClass}
              </p>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("race", "text", "Raza", character.race)}
              >
                <strong>Raza:</strong> {character.race}
              </p>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("background", "text", "Trasfondo", character.background)}
              >
                <strong>Trasfondo:</strong> {character.background}
              </p>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("alignment", "text", "Alineamiento", character.alignment)}
              >
                <strong>Alineamiento:</strong> {character.alignment}
              </p>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("level", "number", "Nivel", character.level)}
              >
                <strong>Nivel:</strong> {character.level}
              </p>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("experience", "number", "Experiencia Actual", character.experience)}
              >
                <strong>Experiencia actual:</strong> {character.experience}
              </p>
              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("experienceToNextLevel", "number", "Experiencia siguiente nivel", character.experienceToNextLevel)}
              >
                <strong>Experiencia siguiente nivel:</strong> {character.experienceToNextLevel}
              </p>
            </div>

            <div className="rounded-xl bg-white shadow p-4">
              <h4 className="font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">Competencias e Idiomas</h4>
              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("languages", "text", "Idiomas", character.languages)}
              >
                <strong>Idiomas:</strong> {character.languages}
              </p>

              <p
                className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => openEditModal("otherProficiencies", "text", "Otras competencias", character.otherProficiencies)}
              >
                <strong>Otras competencias:</strong> {character.otherProficiencies}
              </p>
            </div>

            <div className="rounded-xl bg-white shadow p-4">
              <h4 className="font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">Monedas</h4>
              <ul className="grid grid-cols-2 gap-1">
                {["Cobre", "Plata", "Electrum", "Oro", "Platino"].map((label, i) => (
                  <li
                    key={i}
                    className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded"
                    onClick={() => openEditModal("coins", "coin", "", { index: i })}
                  >
                    {label}: {character.coins?.[i] ?? 0}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modales */}
        {modalOpen && modalProps && (
          <>
            {modalProps.type === "valueOrManual" && (
              <ValueOrManualModal
                isOpen={modalOpen}
                title={modalProps.title}
                initialValue={modalProps.value.value}
                initialIsManual={modalProps.value.isManual}
                autoValue={modalProps.autoValue ?? 0}
                valueLabel={modalProps.valueLabel}
                autoValueLabel={modalProps.autoValueLabel}
                onSave={(val) => handleEdit(
                  modalProps.field,
                  val.value,
                  val.isManual
                )}
                onClose={() => setModalOpen(false)}
              />
            )}

            {modalProps.type === "skill" && (
              <SkillEditModal
                isOpen={modalOpen}
                skill={modalProps.value}
                title={modalProps.title}
                onSave={(newVal) => handleEdit(modalProps.field, newVal)}
                onClose={() => setModalOpen(false)}
              />
            )}

            {(modalProps.type === "text" || modalProps.type === "number") && (
              <EditModal
                isOpen={modalOpen}
                title={modalProps.title}
                initialValue={modalProps.value}
                type={modalProps.type}
                onSave={(val: any) => handleEdit(modalProps.field, val)}
                onClose={() => setModalOpen(false)}
              />
            )}

            {modalProps.type === "coin" && modalProps.coinIndex !== undefined && (
              <CoinsEditModal
                isOpen={modalOpen}
                coinIndex={modalProps.coinIndex}
                initialValue={modalProps.value}
                onSave={(val) => handleEdit("coins", val)}
                onClose={() => setModalOpen(false)}
              />
            )}
          </>
        )}

      </div>
    </div>
  );
}
