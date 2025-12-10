
import React, { useState } from 'react';
import { Calculator, Activity, X, ChevronDown, ChevronRight, Thermometer } from 'lucide-react';

interface ClinicalToolsProps {
  onClose: () => void;
}

const NORMAL_VALUES = [
  { category: 'Hematology', items: [
      { name: 'Hemoglobin (Male)', value: '13.5 - 17.5 g/dL' },
      { name: 'Hemoglobin (Female)', value: '12.0 - 15.5 g/dL' },
      { name: 'WBC', value: '4,500 - 11,000 /µL' },
      { name: 'Platelets', value: '150,000 - 450,000 /µL' },
  ]},
  { category: 'Electrolytes', items: [
      { name: 'Sodium (Na)', value: '135 - 145 mEq/L' },
      { name: 'Potassium (K)', value: '3.5 - 5.0 mEq/L' },
      { name: 'Chloride (Cl)', value: '96 - 106 mEq/L' },
      { name: 'Calcium', value: '8.5 - 10.2 mg/dL' },
  ]},
  { category: 'Renal Function', items: [
      { name: 'BUN', value: '7 - 20 mg/dL' },
      { name: 'Creatinine (Male)', value: '0.7 - 1.3 mg/dL' },
      { name: 'Creatinine (Female)', value: '0.6 - 1.1 mg/dL' },
  ]},
  { category: 'Blood Gas (Arterial)', items: [
      { name: 'pH', value: '7.35 - 7.45' },
      { name: 'pCO2', value: '35 - 45 mmHg' },
      { name: 'pO2', value: '80 - 100 mmHg' },
      { name: 'HCO3', value: '22 - 26 mEq/L' },
  ]}
];

const ClinicalTools: React.FC<ClinicalToolsProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'CALC' | 'LABS'>('CALC');
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  
  // Calculator States
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  
  const [gfrCreat, setGfrCreat] = useState('');
  const [gfrAge, setGfrAge] = useState('');
  const [gfrSex, setGfrSex] = useState<'M' | 'F'>('M');

  const calculateBMI = () => {
    const h = parseFloat(bmiHeight) / 100;
    const w = parseFloat(bmiWeight);
    if (!h || !w) return 0;
    return (w / (h * h)).toFixed(1);
  };

  const calculateGFR = () => {
    // Simplified MDRD
    const cr = parseFloat(gfrCreat);
    const age = parseFloat(gfrAge);
    if (!cr || !age) return 0;
    let gfr = 175 * Math.pow(cr, -1.154) * Math.pow(age, -0.203);
    if (gfrSex === 'F') gfr *= 0.742;
    return gfr.toFixed(0);
  };

  return (
    <div className="bg-white w-80 shadow-2xl border-l border-gray-200 flex flex-col h-full transform transition-transform duration-300">
      <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <Activity size={18} /> Clinical Tools
        </h3>
        <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded">
          <X size={18} />
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('CALC')}
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'CALC' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Calculators
        </button>
        <button 
          onClick={() => setActiveTab('LABS')}
          className={`flex-1 py-3 text-sm font-bold ${activeTab === 'LABS' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Normal Values
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'CALC' && (
          <div className="space-y-4">
            {/* BMI Calculator */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setActiveCalc(activeCalc === 'BMI' ? null : 'BMI')}
                className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-bold text-gray-700">BMI Calculator</span>
                {activeCalc === 'BMI' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {activeCalc === 'BMI' && (
                <div className="p-3 bg-white space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Height (cm)</label>
                      <input type="number" value={bmiHeight} onChange={e => setBmiHeight(e.target.value)} className="w-full border p-1 rounded text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Weight (kg)</label>
                      <input type="number" value={bmiWeight} onChange={e => setBmiWeight(e.target.value)} className="w-full border p-1 rounded text-sm" />
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded text-center">
                    <span className="text-xs text-gray-500">Result:</span>
                    <div className="font-bold text-xl text-indigo-700">{calculateBMI()} kg/m²</div>
                  </div>
                </div>
              )}
            </div>

            {/* eGFR Calculator */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                onClick={() => setActiveCalc(activeCalc === 'GFR' ? null : 'GFR')}
                className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-bold text-gray-700">eGFR (MDRD)</span>
                {activeCalc === 'GFR' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {activeCalc === 'GFR' && (
                <div className="p-3 bg-white space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Creatinine</label>
                      <input type="number" value={gfrCreat} onChange={e => setGfrCreat(e.target.value)} className="w-full border p-1 rounded text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Age</label>
                      <input type="number" value={gfrAge} onChange={e => setGfrAge(e.target.value)} className="w-full border p-1 rounded text-sm" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setGfrSex('M')} className={`flex-1 py-1 text-xs rounded border ${gfrSex === 'M' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-50'}`}>Male</button>
                    <button onClick={() => setGfrSex('F')} className={`flex-1 py-1 text-xs rounded border ${gfrSex === 'F' ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-gray-50'}`}>Female</button>
                  </div>
                  <div className="bg-indigo-50 p-2 rounded text-center">
                    <span className="text-xs text-gray-500">Result:</span>
                    <div className="font-bold text-xl text-indigo-700">{calculateGFR()}</div>
                    <span className="text-[10px] text-gray-400">mL/min/1.73m²</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Placeholder for Wells */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 opacity-60">
                <span className="font-bold text-gray-700">Wells Score (DVT)</span>
                <span className="text-xs text-gray-500 block">Coming soon...</span>
            </div>
          </div>
        )}

        {activeTab === 'LABS' && (
          <div className="space-y-4">
            {NORMAL_VALUES.map((cat, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-xs text-indigo-600 uppercase tracking-wide mb-2 border-b border-indigo-100 pb-1">{cat.category}</h4>
                <ul className="space-y-2">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-mono text-gray-900 font-medium">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalTools;
