import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

type MenuItemType = {
  label: string;
  path: string;
};

type CharacterMenuDropdownProps = {
  items: MenuItemType[];
};

export default function CharacterMenuDropdown({ items }: CharacterMenuDropdownProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleNavigation = (path: string) => {
    navigate(`/character/${id}/${path}`);
    setIsOpen(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e: React.TouchEvent, path: string) => {
    if (!touchStartPos.current) return;
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartPos.current.x);
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartPos.current.y);
    if (deltaX < 10 && deltaY < 10) handleNavigation(path);
    touchStartPos.current = null;
  };

  // Cerrar el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón hamburguesa */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        onTouchStart={handleTouchStart}
        className="p-2 rounded-md hover:bg-amber-200 transition-colors cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-amber-800"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Menú flotante */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 max-h-[80vh] overflow-y-auto">
          <div className="py-1 text-sm text-gray-700">
            {items.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, item.path)}
                className="w-full text-left px-4 py-2 hover:bg-amber-100 text-gray-800"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
