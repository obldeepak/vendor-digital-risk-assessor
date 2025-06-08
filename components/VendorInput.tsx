
import React, { useState } from 'react';

interface VendorInputProps {
  onAnalyze: (domain: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const VendorInput: React.FC<VendorInputProps> = ({ onAnalyze, isLoading, disabled = false }) => {
  const [domain, setDomain] = useState<string>('infosys.com'); // Default for convenience

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled) {
      onAnalyze(domain);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <label htmlFor="vendorDomain" className="sr-only">
          Vendor Domain
        </label>
        <input
          type="text"
          id="vendorDomain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g., vendor.com"
          className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all w-full sm:w-auto disabled:opacity-50"
          disabled={isLoading || disabled}
        />
        <button
          type="submit"
          className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-md shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-md"
          disabled={isLoading || disabled}
        >
          {isLoading ? 'Analyzing...' : 'Analyze Risk'}
        </button>
      </div>
       {!disabled && <p className="text-xs text-slate-400 mt-2">Enter a domain (e.g., infosys.com, google.com) to begin the simulated risk analysis.</p>}
       {disabled && <p className="text-xs text-amber-400 mt-2">Analysis is disabled. Please check API key configuration.</p>}
    </form>
  );
};