import { useNavigate } from "react-router-dom";
import CharacterMenuDropdown from "@/components/modals/menus/CharacterMenuDropdown";
import { useAuth } from "@/store/AuthContext";

interface PageHeaderProps {
  title: string;
  menuItems: Array<{ label: string; path: string }>;
  showBackButton?: boolean;
  backPath?: string;
  editable?: boolean;
  onEditClick?: () => void;
  customTitleElement?: React.ReactNode;
}

export default function PageHeader({
  title,
  menuItems,
  showBackButton = true,
  backPath,
  editable = false,
  onEditClick,
  customTitleElement
}: PageHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  const handleBackClick = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(isAdmin ? "/admin" : "/home");
    }
  };

  const renderTitle = () => {
    if (customTitleElement) {
      return customTitleElement;
    }

    if (editable && onEditClick) {
      return (
        <div
          className="relative group inline-block max-w-full cursor-pointer"
          onClick={onEditClick}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-900 px-4 py-2">
            {title}
          </h1>

          {/* Indicador de que es editable */}
          <span className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-amber-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </span>
        </div>
      );
    }

    return (
      <h1 className="flex-grow text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-amber-700 to-amber-900 px-4 py-2 truncate min-w-0">
        {title}
      </h1>
    );
  };

  return (
    <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
      {/* Botón condicional para admin/normal */}
      {showBackButton && (
        isAdmin ? (
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Volver al panel
          </button>
        ) : (
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 bg-amber-800 text-white px-4 py-2 rounded-lg hover:bg-amber-900 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )
      )}

      {renderTitle()}

      {/* Menú desplegable */}
      <CharacterMenuDropdown items={menuItems} />
    </div>
  );
}