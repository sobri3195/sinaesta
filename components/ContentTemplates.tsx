import React, { useState } from 'react';
import { LayoutTemplate, Plus, BookOpen, Stethoscope, ClipboardList, Zap } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'Question' | 'Exam' | 'OSCE' | 'Custom';
  description: string;
}

const TEMPLATES: Template[] = [
  {
    id: 't1',
    name: 'MCQ - Clinical Stem',
    category: 'Question',
    description: 'Single best answer with structured vignette + explanation placeholders.'
  },
  {
    id: 't2',
    name: 'Case-Based Exam (50Q)',
    category: 'Exam',
    description: 'Exam template with sections, timing, and rubric.'
  },
  {
    id: 't3',
    name: 'OSCE Scenario: Acute Abdomen',
    category: 'OSCE',
    description: 'Scenario template with checklist, communication, and scoring.'
  },
  {
    id: 't4',
    name: 'Custom Template',
    category: 'Custom',
    description: 'Build your own template with reusable metadata.'
  }
];

const ContentTemplates: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Template['category'] | 'All'>('All');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Content templates</h3>
          <p className="text-sm text-gray-500">Start from templates to keep content consistent.</p>
        </div>
        <button className="flex items-center gap-2 text-sm text-indigo-600">
          <Plus size={16} /> Create template
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4">
        {['All', 'Question', 'Exam', 'OSCE', 'Custom'].map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as any)}
            className={`px-3 py-1.5 text-sm rounded-full border ${
              activeCategory === category ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-5">
        {TEMPLATES.filter(template => activeCategory === 'All' || template.category === activeCategory).map(template => (
          <div key={template.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-indigo-600">
              {template.category === 'Question' && <BookOpen size={18} />}
              {template.category === 'Exam' && <LayoutTemplate size={18} />}
              {template.category === 'OSCE' && <Stethoscope size={18} />}
              {template.category === 'Custom' && <ClipboardList size={18} />}
              <h4 className="text-base font-semibold text-gray-900">{template.name}</h4>
            </div>
            <p className="text-sm text-gray-500 mt-2">{template.description}</p>
            <div className="flex items-center gap-2 mt-4">
              <button className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Preview</button>
              <button className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1">
                <Zap size={14} /> Quick create
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentTemplates;
