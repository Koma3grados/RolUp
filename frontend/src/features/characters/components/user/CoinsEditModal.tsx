import { useDisableScroll } from "@/components/hooks/useDisableScroll";
import EditModal from "@/components/modals/forms/EditModal";

interface CoinsEditModalProps {
  isOpen: boolean;
  coinIndex: number;
  initialValue: number;
  onSave: (value: number) => void;
  onClose: () => void;
}

export default function CoinsEditModal({
  isOpen,
  coinIndex,
  initialValue,
  onSave,
  onClose,
}: CoinsEditModalProps) {
  if (!isOpen) return null;
  
  useDisableScroll(isOpen);

  return (
    <EditModal
      isOpen={isOpen}
      title={`Editar ${["Cobre", "Plata", "Electrum", "Oro", "Platino"][coinIndex]}`}
      initialValue={initialValue}
      type="number"
      onSave={(val: number) => {
        onSave(val);
        onClose();
      }}
      onClose={onClose}
    />
  );
}