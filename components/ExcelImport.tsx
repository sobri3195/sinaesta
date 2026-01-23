import React, { useState, useRef } from 'react';
import { Question, QuestionType, ErrorTaxonomy } from '../types';
import { Upload, Download, FileSpreadsheet, AlertCircle, Check, X, FileText, HelpCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { templateEndpoints } from '../services/endpoints/templateEndpoints';

interface ExcelImportProps {
  onImport: (questions: Question[]) => void;
  onCancel: () => void;
  specialty: string;
}

interface ImportError {
  row: number;
  field: string;
  message: string;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImport, onCancel, specialty }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [previewData, setPreviewData] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template data structure
  const generateTemplateData = () => {
    const template = [
      {
        question_text: "Contoh: Seorang pasien laki-laki 45 tahun datang dengan nyeri dada sejak 3 jam lalu...",
        option_a: "Infark miokard akut",
        option_b: "Angina pectoris stabil",
        option_c: "Perikarditis",
        option_d: "Diseksi aorta",
        correct_answer: "A", // A, B, C, D
        explanation: "Nyeri dada dengan onset mendadak dan karakteristik memberikan kesan infark miokard akut.",
        category: "Cardiology",
        difficulty: "Hard", // Easy, Medium, Hard
        type: "MCQ", // MCQ, VIGNETTE, CLINICAL_REASONING, SPOT_DIAGNOSIS
        domain: "Diagnosis", // Diagnosis, Therapy, Investigation, Mechanism, Patient Safety
        points: 2,
        time_limit: 90,
        error_taxonomy: "", // Error taxonomy if applicable
        vignette_title: "", // If vignette-based question
        vignette_content: "", // Full case content if VIGNETTE type
        image_url: "", // Optional image URL
        guideline_id: "", // Optional guideline reference
        blueprint_topic_id: "" // Optional blueprint topic
      }
    ];
    return template;
  };

  // Validate and parse Excel data
  const processExcelData = (data: any[]) => {
    const processedQuestions: Question[] = [];
    const validationErrors: ImportError[] = [];
    let rowIndex = 2; // Starting from row 2 (after headers)

    data.forEach((row, index) => {
      try {
        // Validate required fields
        if (!row.question_text || row.question_text.trim() === '') {
          validationErrors.push({
            row: rowIndex,
            field: 'question_text',
            message: 'Question text is required'
          });
          rowIndex++;
          return;
        }

        // Validate options
        const options = [
          row.option_a,
          row.option_b,
          row.option_c,
          row.option_d
        ].filter(opt => opt && opt.trim() !== '');

        if (options.length < 2) {
          validationErrors.push({
            row: rowIndex,
            field: 'options',
            message: 'At least 2 options are required (A and B)'
          });
          rowIndex++;
          return;
        }

        // Validate correct answer
        const correctAnswerMap: { [key: string]: number } = {
          'A': 0, 'B': 1, 'C': 2, 'D': 3
        };

        let correctAnswerIndex = 0;
        if (row.correct_answer) {
          const answer = row.correct_answer.toString().toUpperCase().trim();
          if (correctAnswerMap.hasOwnProperty(answer)) {
            correctAnswerIndex = correctAnswerMap[answer];
            if (correctAnswerIndex >= options.length) {
              validationErrors.push({
                row: rowIndex,
                field: 'correct_answer',
                message: `Correct answer "${answer}" refers to option that doesn't exist`
              });
              rowIndex++;
              return;
            }
          } else {
            validationErrors.push({
              row: rowIndex,
              field: 'correct_answer',
              message: `Correct answer must be A, B, C, or D. Got: "${answer}"`
            });
            rowIndex++;
            return;
          }
        }

        // Create question object
        const question: Question = {
          id: `imported_${Date.now()}_${index}`,
          text: row.question_text.trim(),
          options: options,
          correctAnswerIndex: correctAnswerIndex,
          explanation: row.explanation || '',
          category: row.category || specialty,
          difficulty: (row.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
          type: (row.type as QuestionType) || 'MCQ',
          domain: (row.domain as 'Diagnosis' | 'Therapy' | 'Investigation' | 'Mechanism' | 'Patient Safety') || 'Diagnosis',
          points: parseInt(row.points) || 1,
          timeLimit: parseInt(row.time_limit) || 90,
          imageUrl: row.image_url || undefined,
          authorId: 'excel_import'
        };

        // Add error taxonomy if present
        if (row.error_taxonomy && row.error_taxonomy !== '') {
          question.errorTaxonomy = row.error_taxonomy as ErrorTaxonomy;
        }

        // Add vignette data if present
        if (row.type === 'VIGNETTE' && row.vignette_title && row.vignette_content) {
          question.vignetteId = `vignette_${Date.now()}_${index}`;
        }

        processedQuestions.push(question);
      } catch (error) {
        validationErrors.push({
          row: rowIndex,
          field: 'general',
          message: `Error processing row: ${error}`
        });
      }
      rowIndex++;
    });

    return { questions: processedQuestions, errors: validationErrors };
  };

  // Real Excel processing using xlsx library
  const handleFileProcessing = async (file: File) => {
    setIsProcessing(true);
    setErrors([]);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      if (jsonData.length === 0) {
        setErrors([{
          row: 1,
          field: 'file',
          message: 'File is empty or has no valid data'
        }]);
        setIsProcessing(false);
        return;
      }

      const { questions, errors } = processExcelData(jsonData);
      setPreviewData(questions);
      setErrors(errors);
      setShowPreview(true);
    } catch (error) {
      setErrors([{
        row: 1,
        field: 'file',
        message: `Error processing file: ${error}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (validExtensions.includes(fileExtension)) {
        setFile(selectedFile);
        handleFileProcessing(selectedFile);
      } else {
        setErrors([{
          row: 1,
          field: 'file',
          message: 'Please select a valid Excel file (.xlsx, .xls, or .csv)'
        }]);
      }
    }
  };

  const downloadExcelTemplate = async () => {
    try {
      await templateEndpoints.getQuestionTemplate(specialty, 'xlsx');
    } catch (error) {
      console.error('Failed to download template:', error);
      setErrors([{
        row: 0,
        field: 'download',
        message: 'Failed to download Excel template'
      }]);
    }
  };

  const downloadCSVTemplate = async () => {
    try {
      await templateEndpoints.getQuestionTemplate(specialty, 'csv');
    } catch (error) {
      console.error('Failed to download template:', error);
      setErrors([{
        row: 0,
        field: 'download',
        message: 'Failed to download CSV template'
      }]);
    }
  };

  const handleImport = () => {
    if (previewData.length > 0 && errors.length === 0) {
      onImport(previewData);
    }
  };

  const hasCriticalErrors = errors.some(error => 
    error.field === 'question_text' || error.field === 'correct_answer'
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">Import Soal dari Excel</h2>
                <p className="text-indigo-100">Program Studi: {specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowHelp(!showHelp)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
                title="Bantuan"
              >
                <HelpCircle size={20} />
              </button>
              <button onClick={onCancel} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Help Section */}
          {showHelp && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">Panduan Import Soal</h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p><strong>Langkah 1:</strong> Download template Excel/CSV dengan klik tombol "Download Template" di bawah.</p>
                    <p><strong>Langkah 2:</strong> Isi template dengan soal-soal Anda. Pastikan kolom yang <span className="font-bold text-red-600">wajib</span> diisi: question_text, option_a, option_b, correct_answer.</p>
                    <p><strong>Langkah 3:</strong> Upload file Excel/CSV yang sudah diisi.</p>
                    <p><strong>Langkah 4:</strong> Preview soal, perbaiki jika ada error, lalu klik "Import".</p>
                    <p className="mt-3 pt-3 border-t border-blue-200"><strong>Format correct_answer:</strong> Gunakan huruf A, B, C, atau D untuk menunjukkan jawaban yang benar.</p>
                    <p><strong>Format difficulty:</strong> Easy, Medium, atau Hard</p>
                    <p><strong>Format type:</strong> MCQ, VIGNETTE, CLINICAL_REASONING, atau SPOT_DIAGNOSIS</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-2">Download Template</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Download template Excel untuk memastikan format data yang benar. 
                  Isi template dengan soal-soal Anda, pastikan kolom yang wajib diisi telah terisi.
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadExcelTemplate}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download Template Excel (.xlsx)
                  </button>
                  <button 
                    onClick={downloadCSVTemplate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download Template CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Upload File Excel/CSV</h3>
            <p className="text-sm text-gray-500 mb-4">
              Pilih file Excel (.xlsx atau .xls) atau CSV yang berisi soal-soal Anda
            </p>
            {file && (
              <p className="text-sm text-green-600 mb-3 flex items-center justify-center gap-2">
                <Check size={16} /> File selected: {file.name}
              </p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                'Pilih File'
              )}
            </button>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-2">
                    Ditemukan {errors.length} Error {hasCriticalErrors ? '(Critical)' : ''}
                  </h3>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <span className="font-medium">Baris {error.row}:</span> {error.field} - {error.message}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-red-600 mt-2">
                    Silakan perbaiki data di Excel dan upload ulang
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {showPreview && previewData.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Preview Soal ({previewData.length} soal)
              </h3>
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {previewData.map((question, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500">Soal {index + 1}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {question.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-white ${
                          question.difficulty === 'Hard' ? 'bg-red-500' : 
                          question.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                      {question.text}
                    </p>
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Jawaban Benar:</span> {question.options[question.correctAnswerIndex]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={previewData.length === 0 || errors.length > 0 || hasCriticalErrors}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Check size={16} />
              Import {previewData.length} Soal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImport;
