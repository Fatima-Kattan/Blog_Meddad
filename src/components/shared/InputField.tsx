// src/components/auth/InputField.tsx
import React from 'react';

interface InputFieldProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    error,
    disabled = false,
}) => {
    return (
        <div className="input-group">
            <label htmlFor={name} className="input-label">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`input-field ${error ? 'input-error' : ''}`}
            />
            {error && <p className="error-message">{error}</p>}

            <style>{`
        .input-group {
          margin-bottom: 1rem;
          width: 100%;
        }
        
        .input-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: rgb(207, 195, 195);
          font-size: 0.95rem;
        }
        
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #491f73ff;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #22083e;
          color:white;
        }
        
        .input-field:focus {
          outline: none;
          color:white;
          border-color: #733DEC;
          box-shadow: 0 0 0 3px rgba(183, 33, 255, 0.1);
        }
        
        .input-field.input-error {
          border-color: #ef4444;
        }
        
        .input-field.input-error:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
          .text-red-500{
          color:red
          }
      `}</style>
        </div>
    );
};

export default InputField;