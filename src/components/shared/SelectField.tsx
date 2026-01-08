// src/components/auth/SelectField.tsx
import React from 'react';

interface SelectFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
    label,
    name,
    value,
    onChange,
    options,
    required = false,
    error,
    disabled = false,
}) => {
    return (
        <div className="select-group">
            <label htmlFor={name} className="select-label">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`select-field ${error ? 'select-error' : ''}`}
            >
                <option value="">Select {label}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="error-message">{error}</p>}

            <style jsx>{`
        .select-group {
          margin-bottom: 1rem;
          width: 100%;
        }
        
        .select-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: rgb(207, 195, 195);
          font-size: 0.95rem;
        }
        
        .select-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #491f73ff;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #22083e;
          cursor: pointer;
        }
        
        .select-field:focus {
          outline: none;
          border-color: #b721ff;
          box-shadow: 0 0 0 3px rgba(183, 33, 255, 0.1);
        }
        
        .select-field.select-error {
          border-color: #ef4444;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
      `}</style>
        </div>
    );
};

export default SelectField;