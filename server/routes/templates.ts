import express from 'express';
import * as XLSX from 'xlsx';
import { authenticateUser, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Generate and download Excel template
router.get('/questions', authenticateUser, (req: AuthenticatedRequest, res) => {
  try {
    const { specialty = 'General', type = 'xlsx' } = req.query;

    const template = [
      {
        question_text: "Contoh: Seorang pasien laki-laki 45 tahun datang dengan nyeri dada sejak 3 jam lalu...",
        option_a: "Infark miokard akut",
        option_b: "Angina pectoris stabil",
        option_c: "Perikarditis",
        option_d: "Diseksi aorta",
        correct_answer: "A", // A, B, C, D
        explanation: "Nyeri dada dengan onset mendadak dan karakteristik memberikan kesan infark miokard akut.",
        category: specialty,
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

    if (type === 'csv') {
      const csvContent = [
        Object.keys(template[0]).join(','),
        ...template.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=template_soal_${specialty}.csv`);
      return res.send(csvContent);
    }

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(template);
    
    // Set column widths
    const colWidths = [
      { wch: 60 }, // question_text
      { wch: 30 }, // option_a
      { wch: 30 }, // option_b
      { wch: 30 }, // option_c
      { wch: 30 }, // option_d
      { wch: 10 }, // correct_answer
      { wch: 50 }, // explanation
      { wch: 20 }, // category
      { wch: 10 }, // difficulty
      { wch: 20 }, // type
      { wch: 20 }, // domain
      { wch: 10 }, // points
      { wch: 10 }, // time_limit
      { wch: 20 }, // error_taxonomy
      { wch: 30 }, // vignette_title
      { wch: 50 }, // vignette_content
      { wch: 30 }, // image_url
      { wch: 20 }, // guideline_id
      { wch: 20 }  // blueprint_topic_id
    ];
    ws['!cols'] = colWidths;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Soal');
    
    // Write to buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=template_soal_${specialty}.xlsx`);
    res.send(buf);
  } catch (error: any) {
    console.error('Template generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate template',
    });
  }
});

export default router;
