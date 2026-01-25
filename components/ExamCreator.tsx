import React, { useState, useRef, useEffect } from 'react';
import { Exam, Question, QuestionStatus, ExamSection } from '../types';
import { generateExamQuestions, generateExamOverview, generateAnswerOptions, generateExplanations, generateExamThumbnail } from '../services/geminiService';
import { 
  ChevronRight, ChevronLeft, Save, Plus, Trash2, Wand2, Loader2, Upload, 
  GripVertical, Undo2, Redo2, Eye, EyeOff, FileText, Image as ImageIcon, 
  AlertCircle, Check, X, RefreshCw, BookOpen, Settings, ListChecks, Tags, MessageSquare, Palette,
  Bold, Italic, Underline, List, Type, Layers, Clock, FileSpreadsheet
} from 'lucide-react';
import VignetteBuilder from './VignetteBuilder';
import ExcelImport from './ExcelImport';
import FileUpload from './FileUpload';

interface ExamCreatorProps {
  initialExam: Exam | null;
  onSave: (exam: Exam) => void;
  onCancel: () => void;
}

// --- Helper Components ---

const TagManager: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label: string;
}> = ({ tags, onChange, placeholder, label }) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-indigo-500">
        {tags.map(tag => (
          <span key={tag} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm flex items-center gap-1">
            {tag}
            <button onClick={() => removeTag(tag)}><X size={14}/></button>
          </span>
        ))}
        <input 
          className="flex-1 outline-none min-w-[120px] text-sm"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
        />
      </div>
    </div>
  );
};

const RichTextEditor: React.FC<{
  value: string;
  onChange: (val: string) => void;
  label?: React.ReactNode;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}> = ({ value, onChange, label, placeholder, className, minHeight = "h-32" }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    let newText = '';
    if (tag === 'ul' || tag === 'ol') {
         const listItems = selection ? selection.split('\n').map(s => `  <li>${s}</li>`).join('\n') : '  <li></li>';
         newText = `${before}\n<${tag}>\n${listItems}\n</${tag}>\n${after}`;
    } else if (tag === 'br') {
         newText = `${before}<br/>${after}`;
    } else {
         newText = `${before}<${tag}>${selection}</${tag}>${after}`;
    }

    const newCursorPos = before.length + tag.length + 2; 

    onChange(newText);
    
    setTimeout(() => {
        textarea.focus();
        if(!selection && tag !== 'br') {
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        } else if (tag === 'br') {
             textarea.setSelectionRange(start + 5, start + 5);
        }
    }, 0);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <div className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-2">{label}</div>}
      <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white transition-shadow shadow-sm">
        <div className="flex items-center gap-1 p-1.5 border-b border-gray-100 bg-gray-50">
           <button onClick={() => insertTag('b')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Bold"><Bold size={14}/></button>
           <button onClick={() => insertTag('i')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Italic"><Italic size={14}/></button>
           <button onClick={() => insertTag('u')} className="p-1.5 hover:bg-gray-200 rounded text-gray-700" title="Underline"><Underline size={14}/></button>
           <div className="w-px h-4 bg-gray-300 mx-1"></div>
           <button onClick={() => insertTag('br')} className="px-2 py-1 hover:bg-gray-200 rounded text-gray-600 text-xs font-mono font-bold" title="Line Break">&lt;br&gt;</button>
           <button onClick={() => insertTag('ul')} className="p-1.5 hover:bg-gray-200 rounded text-gray-600" title="Bullet List"><List size={14}/></button>
           <div className="flex-1"></div>
           <span className="text-[10px] text-gray-400 font-medium px-2">HTML Mode</span>
        </div>
        <textarea
          ref={textareaRef}
          className={`w-full p-3 text-sm outline-none resize-y ${minHeight} font-sans leading-relaxed`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

// --- Main Component ---

const ExamCreator: React.FC<ExamCreatorProps> = ({ initialExam, onSave, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Exam State
  const [exam, setExam] = useState<Partial<Exam>>(initialExam || {
    title: '',
    topic: '',
    subtopics: [],
    difficulty: 'Medium',
    durationMinutes: 60,
    questions: [],
    description: '',
    thumbnailUrl: '',
    vignettes: [],
    sections: []
  });

  // UI State
  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [overview, setOverview] = useState('');
  const [previewExpanded, setPreviewExpanded] = useState<Set<string>>(new Set());
  const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  
  // Vignette Builder State
  const [isVignetteBuilderOpen, setIsVignetteBuilderOpen] = useState(false);

  // History for Undo/Redo
  const [history, setHistory] = useState<Partial<Exam>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // File Upload Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const saveToHistory = (newExamState: Partial<Exam>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newExamState)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const updateExam = (updates: Partial<Exam>) => {
    const updated = { ...exam, ...updates };
    setExam(updated);
    saveToHistory(updated);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setExam(history[historyIndex + 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setExam(history[historyIndex + 1]);
    }
  };

  // --- AI Generation ---

  const handleGenerateAI = async () => {
    if (!exam.topic) return;
    setIsGenerating(true);
    try {
      // 1. Generate Questions
      const questions = await generateExamQuestions(
        exam.topic!,
        exam.difficulty!,
        questionCount,
        exam.subtopics
      );
      
      // 2. Generate Overview
      const overviewText = await generateExamOverview(
        exam.topic!,
        exam.difficulty!,
        questionCount,
        exam.durationMinutes || 60,
        exam.subtopics || [],
        exam.description
      );

      // 3. Generate Thumbnail (if empty)
      let thumb = exam.thumbnailUrl;
      if (!thumb) {
         thumb = await generateExamThumbnail(exam.topic!, exam.difficulty!);
      }

      updateExam({ 
        questions: [...(exam.questions || []), ...questions],
        description: overviewText || exam.description,
        thumbnailUrl: thumb || exam.thumbnailUrl
      });
      setOverview(overviewText);
      setCurrentStep(2); // Move to Editor
    } catch (e) {
      alert("AI Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateThumbnail = async () => {
      if (!exam.topic) {
          alert("Please enter a topic first.");
          return;
      }
      setIsGeneratingThumb(true);
      try {
          const thumb = await generateExamThumbnail(exam.topic, exam.difficulty || 'Medium');
          if (thumb) {
              updateExam({ thumbnailUrl: thumb });
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingThumb(false);
      }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onloadend = () => {
              updateExam({ thumbnailUrl: reader.result as string });
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  // --- Question Management ---

  const handleDeleteQuestion = (id: string) => {
    // Also remove from any sections
    const newSections = exam.sections?.map(s => ({
        ...s,
        questionIds: s.questionIds.filter(qid => qid !== id)
    }));
    updateExam({ 
        questions: exam.questions?.filter(q => q.id !== id),
        sections: newSections
    });
  };

  const handleAddQuestion = () => {
    const newQ: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'New Question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswerIndex: 0,
      category: exam.topic,
      difficulty: exam.difficulty || 'Medium',
      type: 'MCQ', // Default type
      points: 1
    };
    updateExam({ questions: [...(exam.questions || []), newQ] });
    setEditingQuestion(newQ);
  };

  const handleExcelImport = (importedQuestions: Question[]) => {
    // Add imported questions to existing questions
    const currentQuestions = exam.questions || [];
    const newQuestions = importedQuestions.map(q => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9), // Generate new IDs
      category: exam.topic || q.category, // Use exam topic as fallback
    }));
    
    updateExam({ questions: [...currentQuestions, ...newQuestions] });
    setIsExcelImportOpen(false);
    alert(`Berhasil import ${newQuestions.length} soal dari Excel`);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;
    const updatedQuestions = exam.questions?.map(q => 
      q.id === editingQuestion.id ? editingQuestion : q
    );
    updateExam({ questions: updatedQuestions });
    setEditingQuestion(null);
  };

  const assignQuestionToSection = (qId: string, sectionId: string) => {
      // Remove from all sections first
      let newSections = (exam.sections || []).map(s => ({
          ...s,
          questionIds: s.questionIds.filter(id => id !== qId)
      }));

      // Add to new section if not "none"
      if (sectionId !== 'none') {
          newSections = newSections.map(s => {
              if (s.id === sectionId) {
                  return { ...s, questionIds: [...s.questionIds, qId] };
              }
              return s;
          });
      }
      updateExam({ sections: newSections });
  };

  // --- Section Management ---
  const handleAddSection = () => {
      const newSection: ExamSection = {
          id: Math.random().toString(36).substr(2, 9),
          title: `Section ${(exam.sections?.length || 0) + 1}`,
          durationMinutes: 30,
          questionIds: [],
          order: (exam.sections?.length || 0) + 1
      };
      updateExam({ sections: [...(exam.sections || []), newSection] });
  };

  const updateSection = (id: string, field: keyof ExamSection, value: any) => {
      const newSections = (exam.sections || []).map(s => 
          s.id === id ? { ...s, [field]: value } : s
      );
      updateExam({ sections: newSections });
  };

  const deleteSection = (id: string) => {
      updateExam({ sections: exam.sections?.filter(s => s.id !== id) });
  };

  // --- Vignette Management ---
  const handleSaveVignette = (vignette: any) => {
      const newVignettes = [...(exam.vignettes || []), vignette];
      updateExam({ vignettes: newVignettes });
      setIsVignetteBuilderOpen(false);
  };

  // --- File Upload ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          alert("File uploaded (Mock)");
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && editingQuestion) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setEditingQuestion({ ...editingQuestion, imageUrl: reader.result as string });
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const togglePreviewExplanation = (qId: string) => {
      const newSet = new Set(previewExpanded);
      if (newSet.has(qId)) newSet.delete(qId);
      else newSet.add(qId);
      setPreviewExpanded(newSet);
  };

  const handleGenerateOptions = async () => {
    if (!editingQuestion?.text) return;
    const currentCorrect = editingQuestion.options[editingQuestion.correctAnswerIndex];
    const res = await generateAnswerOptions(editingQuestion.text, currentCorrect);
    if (res) {
        setEditingQuestion({
            ...editingQuestion,
            options: res.options,
            correctAnswerIndex: res.correctAnswerIndex
        });
    }
  };

  const validateQuestion = (q: Question) => {
      if (!q.text) return "Question text missing";
      if (q.options.length !== 4) return "Must have exactly 4 options";
      if (q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) return "Invalid correct answer";
      return null;
  };

  // --- Render Steps ---

  const renderStep1 = (): JSX.Element => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Col */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Exam Title</label>
            <input 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={exam.title}
              onChange={e => setExam({ ...exam, title: e.target.value })}
              placeholder="e.g. Midterm Biology 2024"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Main Topic</label>
            <input 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={exam.topic}
              onChange={e => setExam({ ...exam, topic: e.target.value })}
              placeholder="e.g. Cardiology"
            />
          </div>
          <TagManager 
            label="Subtopics / Focus Areas" 
            tags={exam.subtopics || []} 
            onChange={tags => setExam({ ...exam, subtopics: tags })} 
            placeholder="Type & Enter..." 
          />
          <button 
            onClick={() => setIsVignetteBuilderOpen(true)}
            className="w-full py-2 bg-indigo-5 text-indigo-600 border border-indigo-200 rounded-lg font-bold hover:bg-indigo-100 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Create Case Vignette
          </button>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Difficulty</label>
               <select 
                 className="w-full border border-gray-300 rounded-lg p-3"
                 value={exam.difficulty}
                 onChange={e => setExam({ ...exam, difficulty: e.target.value as any })}
               >
                 <option>Easy</option>
                 <option>Medium</option>
                 <option>Hard</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-bold text-gray-700 mb-1">Total Duration (min)</label>
               <input 
                 type="number"
                 className="w-full border border-gray-300 rounded-lg p-3"
                 value={exam.durationMinutes}
                 onChange={e => setExam({ ...exam, durationMinutes: parseInt(e.target.value) })}
               />
             </div>
          </div>

          {/* Thumbnail Section */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <label className="block text-sm font-bold text-gray-700 mb-2">Exam Cover Image</label>
             <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {isGeneratingThumb ? (
                        <Loader2 className="animate-spin text-indigo-600" />
                    ) : exam.thumbnailUrl ? (
                        <img src={exam.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    ) : (
                        <ImageIcon size={24} className="text-gray-400" />
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-2">Upload an image or generate one with AI</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => coverImageInputRef.current?.click()}
                            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-1"
                        >
                            <Upload size={12} /> Upload
                        </button>
                        <button
                            onClick={handleRegenerateThumbnail}
                            disabled={isGeneratingThumb}
                            className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 flex items-center gap-1 disabled:opacity-50"
                        >
                            <Wand2 size={12} /> AI Generate
                        </button>
                    </div>
                    <input
                        ref={coverImageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                    />
                </div>
             </div>
          </div>

          {/* AI Generation Section */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
             <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Wand2 className="text-indigo-600" />
                AI Question Generation
             </h3>
             <p className="text-xs text-gray-600 mb-3">Generate questions automatically based on your topic and difficulty</p>
             <div className="flex gap-3 items-center">
                <div className="flex-1">
                   <label className="block text-xs font-medium text-gray-600 mb-1">Number of Questions</label>
                   <input 
                     type="number"
                     min="5"
                     max="100"
                     value={questionCount}
                     onChange={e => setQuestionCount(parseInt(e.target.value) || 10)}
                     className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
                <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !exam.topic}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16}/> : <Wand2 size={16}/>}
                  {isGenerating ? 'Generating...' : 'Generate Questions'}
                </button>
             </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Exam Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              rows={4}
              value={exam.description}
              onChange={e => setExam({ ...exam, description: e.target.value })}
              placeholder="Brief description of this exam..."
            />
          </div>
        </div>
      </div>

      {/* Step 1 Footer */}
      <div className="flex justify-between items-center pt-6">
        <button onClick={onCancel} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
        <button 
          onClick={() => setCurrentStep(2)} 
          disabled={!exam.title || !exam.topic}
          className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black flex items-center gap-2 disabled:opacity-50"
        >
          Next: Editor <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );

  const renderStep2 = (): JSX.Element => (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <ListChecks className="text-indigo-600" />
            Questions ({exam.questions?.length})
          </h2>
          
          {/* Exam Difficulty Selector */}
          <div className="ml-2 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
            <span className="text-xs font-bold text-gray-400 uppercase">Difficulty</span>
            <select 
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
              value={exam.difficulty || 'Medium'}
              onChange={(e) => updateExam({ difficulty: e.target.value as any })}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          
          <button 
            onClick={() => setIsSectionManagerOpen(true)}
            className={`text-sm font-bold flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors
              ${(exam.sections?.length || 0) > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}
            `}
          >
            <Layers size={16} /> 
            {(exam.sections?.length || 0) > 0 ? `${exam.sections?.length} Sections` : 'Divide into Sections'}
          </button>
          <div className="flex gap-2">
            <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"><Undo2 size={18}/></button>
            <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"><Redo2 size={18}/></button>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsExcelImportOpen(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 flex items-center gap-2"
          >
            <FileSpreadsheet size={16} /> Import Excel
          </button>
          <button 
            onClick={handleAddQuestion} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={16} /> Add Question
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {(exam.questions || []).length === 0 ? (
          <div className="text-center py-16">
            <FileText size={48} className="mx-auto text-gray-300 mb-4"/>
            <p className="text-gray-500 mb-4">No questions yet. Add some questions to get started.</p>
            <button 
              onClick={handleAddQuestion}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 mx-auto"
            >
              <Plus size={18} /> Add Your First Question
            </button>
          </div>
        ) : (
          (exam.questions || []).map((q, idx) => {
            const error = validateQuestion(q);
            const currentSectionId = exam.sections?.find(s => s.questionIds.includes(q.id))?.id || 'none';
            
            return (
              <div key={q.id} className={`bg-white p-4 rounded-xl border flex gap-4 items-start group hover:shadow-md transition-all ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
                <div className="mt-1 text-gray-400 cursor-move"><GripVertical size={20} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${q.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{q.difficulty}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700">{q.type}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingQuestion(q)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Settings size={16}/></button>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="p-1 hover:bg-gray-100 rounded text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  
                  {q.imageUrl && (
                    <img 
                      src={q.imageUrl} 
                      alt="Question" 
                      className="max-h-32 rounded mb-2 border border-gray-200" 
                      loading="lazy"
                    />
                  )}
                  
                  <div className="font-medium text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: q.text }} />
                  
                  <div className="space-y-1">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`flex items-center gap-2 text-sm p-2 rounded border
                        ${i === q.correctAnswerIndex ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-600'}
                      `}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-xs
                          ${i === q.correctAnswerIndex ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}
                        `}>
                          {i === q.correctAnswerIndex && <Check size={10} />}
                        </div>
                        {opt}
                      </div>
                    ))}
                  </div>
                  
                  {q.explanation && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-100 text-xs text-amber-900">
                      <strong>Explanation:</strong> <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
                    </div>
                  )}
                  
                  {exam.sections && exam.sections.length > 0 && (
                    <div className="mt-2">
                      <select 
                        value={currentSectionId}
                        onChange={(e) => assignQuestionToSection(q.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="none">No Section</option>
                        {exam.sections.map(section => (
                          <option key={section.id} value={section.id}>{section.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {error && (
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle size={12}/> {error}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Step 2 Footer */}
      <div className="pt-6 border-t border-gray-200 flex justify-between">
        <button onClick={() => setCurrentStep(1)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Back to Config</button>
        <button 
          onClick={() => setCurrentStep(3)} 
          disabled={!exam.title || !exam.topic || !exam.questions?.length}
          className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
        >
          Next: Preview <ChevronRight size={18}/>
        </button>
      </div>
    </div>
  );

  const renderStep3 = (): JSX.Element => (
    <div className="h-full flex flex-col">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 flex gap-6 items-start">
        {exam.thumbnailUrl && (
            <img src={exam.thumbnailUrl} alt="Exam Thumbnail" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
        )}
        <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h2>
            <div className="flex gap-4 text-sm text-gray-500 mb-4">
              <span>{exam.questions?.length} Questions</span>
              <span>•</span>
              <span>{exam.durationMinutes} Minutes</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${exam.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{exam.difficulty}</span>
            </div>
            {exam.description && <div className="prose prose-sm text-gray-600" dangerouslySetInnerHTML={{ __html: exam.description }} />}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 bg-white p-8 rounded-xl border border-gray-200 shadow-inner">
        {exam.questions?.map((q, idx) => (
          <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <span className="font-bold text-gray-400">{idx + 1}.</span>
                <div className="flex-1">
                  {q.imageUrl && (
                    <img 
                      src={q.imageUrl} 
                      alt="Question" 
                      className="max-h-48 rounded mb-3 border border-gray-200" 
                      loading="lazy"
                    />
                  )}
                  <div className="font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: q.text }} />
                </div>
              </div>
              <button 
                  onClick={() => togglePreviewExplanation(q.id)}
                  className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors flex items-center gap-1
                      ${previewExpanded.has(q.id) ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}
                  `}
              >
                  {previewExpanded.has(q.id) ? <EyeOff size={12}/> : <Eye size={12}/>}
                  {previewExpanded.has(q.id) ? 'Hide Explanation' : 'Show Explanation'}
              </button>
            </div>
            <div className="pl-8 space-y-2">
              {q.options.map((opt, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border text-sm
                  ${i === q.correctAnswerIndex ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-gray-200 text-gray-600'}
                `}>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs
                    ${i === q.correctAnswerIndex ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'}
                  `}>
                    {i === q.correctAnswerIndex && <Check size={12} />}
                  </div>
                  {opt}
                </div>
              ))}
            </div>
            {previewExpanded.has(q.id) && q.explanation && (
              <div className="mt-4 ml-8 p-4 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-900">
                <strong>Explanation:</strong> <div dangerouslySetInnerHTML={{ __html: q.explanation }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-6 mt-4 border-t border-gray-200 flex justify-between">
        <button onClick={() => setCurrentStep(2)} className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Back to Editor</button>
        <button onClick={() => onSave(exam as Exam)} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg">
          <Save size={18} /> Publish Exam
        </button>
      </div>
    </div>
  );

  if (isVignetteBuilderOpen) {
      return (
          <VignetteBuilder onSave={handleSaveVignette} onCancel={() => setIsVignetteBuilderOpen(false)} />
      );
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
         <div className="flex items-center gap-3">
             <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <X size={20} />
             </button>
             <h1 className="text-xl font-bold text-gray-900">Exam Creator</h1>
         </div>
         {/* Stepper */}
         <div className="flex items-center gap-2">
             {[1, 2, 3].map(step => (
                 <div key={step} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors
                    ${currentStep === step ? 'bg-indigo-600 text-white' : currentStep > step ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}
                 `}>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">{step}</span>
                    {step === 1 ? 'Config' : step === 2 ? 'Editor' : 'Preview'}
                 </div>
             ))}
         </div>
         <div className="w-20"></div> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-hidden p-6 md:p-8">
         {currentStep === 1 && renderStep1()}
         {currentStep === 2 && renderStep2()}
         {currentStep === 3 && renderStep3()}
      </div>

      {/* Section Manager Modal */}
      {isSectionManagerOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Layers className="text-indigo-600"/> Manage Exam Sections
                      </h3>
                      <button onClick={() => setIsSectionManagerOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                          <X size={20}/>
                      </button>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                      {(exam.sections || []).map((section, idx) => (
                          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                  <div className="flex-1">
                                      <input 
                                          className="font-bold text-gray-900 bg-transparent border-b border-gray-300 focus:border-indigo-500 outline-none w-full"
                                          value={section.title}
                                          onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                                      />
                                      <div className="text-sm text-gray-500 mt-1">
                                          {section.questionIds.length} questions • {section.durationMinutes} minutes
                                      </div>
                                  </div>
                                  <button 
                                      onClick={() => deleteSection(section.id)}
                                      className="p-1 hover:bg-red-100 rounded text-red-500 ml-2"
                                  >
                                      <Trash2 size={16}/>
                                  </button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
                                      <input 
                                          type="number"
                                          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                          value={section.durationMinutes}
                                          onChange={(e) => updateSection(section.id, 'durationMinutes', parseInt(e.target.value))}
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                                      <input 
                                          type="number"
                                          className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                                          value={section.order}
                                          onChange={(e) => updateSection(section.id, 'order', parseInt(e.target.value))}
                                      />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="flex gap-3">
                      <button 
                          onClick={handleAddSection}
                          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                      >
                          <Plus size={16}/> Add Section
                      </button>
                      <button 
                          onClick={() => setIsSectionManagerOpen(false)}
                          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200"
                      >
                          Done
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Excel Import Modal */}
      {isExcelImportOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
                  <ExcelImport 
                      onImport={handleExcelImport}
                      onCancel={() => setIsExcelImportOpen(false)}
                  />
              </div>
          </div>
      )}

      {/* Question Editor Modal */}
      {editingQuestion && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-bold text-gray-900">Edit Question</h3>
                          <button 
                              onClick={() => setEditingQuestion(null)}
                              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                          >
                              <X size={20}/>
                          </button>
                      </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                      {/* Question Text */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label>
                          <RichTextEditor
                              value={editingQuestion.text}
                              onChange={(text) => setEditingQuestion({ ...editingQuestion, text })}
                              placeholder="Enter your question here..."
                              minHeight="h-24"
                          />
                      </div>

                      {/* Question Image */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Question Image (Optional)</label>
                          <div className="flex gap-4 items-center">
                              <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                                  {editingQuestion.imageUrl ? (
                                      <img src={editingQuestion.imageUrl} alt="Question" className="w-full h-full object-cover" />
                                  ) : (
                                      <ImageIcon size={24} className="text-gray-400" />
                                  )}
                              </div>
                              <div>
                                  <button
                                      onClick={() => imageInputRef.current?.click()}
                                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
                                  >
                                      <Upload size={16}/> Upload Image
                                  </button>
                                  <input
                                      ref={imageInputRef}
                                      type="file"
                                      accept="image/*"
                                      onChange={handleImageUpload}
                                      className="hidden"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Options */}
                      <div>
                          <div className="flex justify-between items-center mb-3">
                              <label className="block text-sm font-bold text-gray-700">Answer Options</label>
                              <button 
                                  onClick={handleGenerateOptions}
                                  className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 flex items-center gap-1"
                              >
                                  <Wand2 size={14}/> Generate Options
                              </button>
                          </div>
                          <div className="space-y-3">
                              {editingQuestion.options.map((option, index) => (
                                  <div key={index} className="flex gap-3 items-center">
                                      <button 
                                          onClick={() => setEditingQuestion({ ...editingQuestion, correctAnswerIndex: index })}
                                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                              ${index === editingQuestion.correctAnswerIndex 
                                                  ? 'border-green-500 bg-green-500 text-white' 
                                                  : 'border-gray-300 hover:border-gray-400'
                                              }
                                          `}
                                      >
                                          {index === editingQuestion.correctAnswerIndex && <Check size={14}/>}
                                      </button>
                                      <input 
                                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                          value={option}
                                          onChange={(e) => {
                                              const newOptions = [...editingQuestion.options];
                                              newOptions[index] = e.target.value;
                                              setEditingQuestion({ ...editingQuestion, options: newOptions });
                                          }}
                                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>

                      {/* Explanation */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Explanation (Optional)</label>
                          <RichTextEditor
                              value={editingQuestion.explanation || ''}
                              onChange={(explanation) => setEditingQuestion({ ...editingQuestion, explanation })}
                              placeholder="Explain why this is the correct answer..."
                              minHeight="h-20"
                          />
                      </div>

                      {/* Question Metadata */}
                      <div className="grid grid-cols-3 gap-4">
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Difficulty</label>
                              <select 
                                  className="w-full border border-gray-300 rounded-lg p-2"
                                  value={editingQuestion.difficulty}
                                  onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                              >
                                  <option value="Easy">Easy</option>
                                  <option value="Medium">Medium</option>
                                  <option value="Hard">Hard</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Points</label>
                              <input 
                                  type="number"
                                  className="w-full border border-gray-300 rounded-lg p-2"
                                  value={editingQuestion.points}
                                  onChange={(e) => setEditingQuestion({ ...editingQuestion, points: parseInt(e.target.value) || 1 })}
                                  min="1"
                              />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                              <select 
                                  className="w-full border border-gray-300 rounded-lg p-2"
                                  value={editingQuestion.type}
                                  onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                              >
                                  <option value="MCQ">Multiple Choice</option>
                                  <option value="TrueFalse">True/False</option>
                                  <option value="ShortAnswer">Short Answer</option>
                              </select>
                          </div>
                      </div>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                      <button 
                          onClick={() => setEditingQuestion(null)}
                          className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveQuestion}
                          disabled={!!validateQuestion(editingQuestion)}
                          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                      >
                          <Save size={16}/> Save Question
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ExamCreator;
