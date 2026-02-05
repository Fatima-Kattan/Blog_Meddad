// src/components/auth/DatePickerField.tsx
import React from 'react';

interface DatePickerFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    error?: string;
    max?: string;
    min?: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
    label,
    name,
    value,
    onChange,
    required = false,
    error,
    max,
    min,
}) => {
    return (
        <div className="date-group">
            <label htmlFor={name} className="date-label">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type="date"
                value={value}
                onChange={onChange}
                required={required}
                max={max}
                min={min}
                className={`date-field ${error ? 'date-error' : ''}`}
            />
            {error && <p className="error-message">{error}</p>}

            <style>{`
        .date-group {
          margin-bottom: 1rem;
          width: 100%;
        }
        
        .date-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #cfc3c3;
          font-size: 0.95rem;
        }
        
        .date-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #491f73ff;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #22083e;
          font-family: inherit;
        }
        
        .date-field:focus {
          outline: none;
          border-color: #733DEC;
          box-shadow: 0 0 0 3px rgba(183, 33, 255, 0.1);
        }
        
        .date-field.date-error {
          border-color: #ef4444;
        }
        
        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .text-red-500{
        color:red}
      `}</style>
        </div>
    );
};

export default DatePickerField;