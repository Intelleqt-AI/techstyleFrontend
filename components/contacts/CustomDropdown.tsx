import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Active', label: 'Active' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Negotiation', label: 'Negotiation' },
];

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ value, onChange, placeholder = 'Select Status' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedLabel = statusOptions.find(option => option.value === value)?.label || placeholder;

  return (
    <div ref={dropdownRef} className="relative bg-transparent w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex text-sm bg-white items-center justify-between w-full border rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50"
      >
        <span className={value ? 'text-black' : 'text-gray-400'}>{selectedLabel}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {statusOptions.map(option => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`
                px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                hover:bg-gray-100 
                ${value === option.value ? 'bg-blue-50' : ''}
              `}
            >
              {option.label}
              {value === option.value && <Check className="h-4 w-4 text-blue-600" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
