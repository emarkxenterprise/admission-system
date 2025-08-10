import React, { useState, useEffect } from 'react';

const LAYOUTS = [
  { key: 'default', label: 'Default' },
  { key: 'material', label: 'Material UI' },
  { key: 'coreui', label: 'CoreUI' },
  { key: 'minimal', label: 'Minimal' },
];

const LayoutSelector = ({ value, onChange }) => {
  const [selected, setSelected] = useState(value || 'default');

  useEffect(() => {
    setSelected(value || 'default');
  }, [value]);

  const handleChange = (e) => {
    setSelected(e.target.value);
    onChange && onChange(e.target.value);
    localStorage.setItem('admin_layout', e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="layout-select" className="text-sm font-medium text-gray-700">Layout:</label>
      <select
        id="layout-select"
        value={selected}
        onChange={handleChange}
        className="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        {LAYOUTS.map(layout => (
          <option key={layout.key} value={layout.key}>{layout.label}</option>
        ))}
      </select>
    </div>
  );
};

export default LayoutSelector; 