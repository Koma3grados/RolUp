import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
}

const SearchBar = ({
  placeholder = "Buscar...",
  value,
  onChange,
  className = "",
  inputClassName = ""
}: SearchBarProps) => {
  return (
    <div className={`relative w-full md:w-[280px] mx-auto ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-10 pr-4 py-2 border rounded-md w-full bg-white text-sm focus:outline-none focus:border-amber-500 ${inputClassName}`}
      />
    </div>
  );
};

export default SearchBar;