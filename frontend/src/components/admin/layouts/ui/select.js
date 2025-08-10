import React, { useState, useRef, useEffect } from 'react';

export const Select = ({ 
  children, 
  value, 
  onValueChange,
  className = '', 
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const selectRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <div ref={selectRef} className={`relative ${className}`} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            selectedValue,
            onSelect: handleSelect
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem = ({ 
  children, 
  value,
  onSelect,
  ...props 
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(value);
    }
  };

  return (
    <div
      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

export const SelectTrigger = ({ 
  children, 
  className = '', 
  isOpen,
  setIsOpen,
  ...props 
}) => {
  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const SelectValue = ({ 
  placeholder = 'Select an option',
  selectedValue,
  children,
  ...props 
}) => {
  // Find the selected option's display text
  const getDisplayText = () => {
    if (!selectedValue) return placeholder;
    
    // If children is a function, call it with the selected value
    if (typeof children === 'function') {
      return children(selectedValue);
    }
    
    // Otherwise, just show the placeholder or selected value
    return selectedValue;
  };

  return (
    <span {...props}>
      {getDisplayText()}
    </span>
  );
};

export const SelectContent = ({ 
  children, 
  className = '', 
  isOpen,
  ...props 
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}; 