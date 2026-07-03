import React, { useState } from 'react';
import { extractTextFromPdf } from '../utils/pdfParser';
import { generateAIResponse, hasApiKey } from '../utils/aiClient';
import { Sparkles, Loader2, X, Check, XCircle } from 'lucide-react';

interface QuizGeneratorProps {
  file: File;
  onOpenSettings: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export const QuizGenerator: React.FC<QuizGeneratorProps> = ({ file, onOpenSettings }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    if (!hasApiKey()) {
      onOpenSettings();
      return;
    }

    setLoading(true);
    setError(null);
    setQuiz(null);
    setAnswers({});
    setShowResults(false);

    try {
      const text = await extractTextFromPdf(file);
      // To save tokens and time, limit to first 15000 characters
      const truncatedText = text.substring(0, 15000);

      const prompt = `Based on the following educational document, generate a 5-question multiple choice quiz. 
You MUST format your response as a pure JSON array of objects. Do not wrap it in markdown code blocks.
Example format:
[
  {
    "question": "What is X?",
    "options": ["A", "B", "C", "D"],
    "correctAnswerIndex": 0
  }
]

Document Text:
${truncatedText}`;

      const aiResponse = await generateAIResponse(prompt);
      
      // Clean up potential markdown formatting (```json ... ```)
      const cleanedResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedQuiz: QuizQuestion[] = JSON.parse(cleanedResponse);
      setQuiz(parsedQuiz);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (qIndex: number, optIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  return (
    <>
      <button 
        onClick={handleGenerate}
        disabled={loading}
        className="btn btn-primary"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}
      >
        {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
        {loading ? 'Analyzing...' : 'Generate AI Quiz'}
      </button>

      {error && (
        <div style={{ color: '#ff4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>
      )}

      {quiz && (
        <div className="modal-overlay animate-fade-in" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
            padding: '32px', borderRadius: '16px', backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)', position: 'relative'
          }}>
            <button 
              onClick={() => setQuiz(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
              <Sparkles size={24} />
              AI Quiz
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {quiz.map((q, qIndex) => (
                <div key={qIndex} style={{ backgroundColor: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                  <p style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1.05rem' }}>{qIndex + 1}. {q.question}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, oIndex) => {
                      const isSelected = answers[qIndex] === oIndex;
                      const isCorrect = q.correctAnswerIndex === oIndex;
                      
                      let bg = 'rgba(255,255,255,0.05)';
                      let border = '1px solid transparent';
                      
                      if (showResults) {
                        if (isCorrect) {
                          bg = 'rgba(204, 255, 0, 0.1)';
                          border = '1px solid var(--success-color)';
                        } else if (isSelected && !isCorrect) {
                          bg = 'rgba(255, 68, 68, 0.1)';
                          border = '1px solid #ff4444';
                        }
                      } else if (isSelected) {
                        bg = 'rgba(255,255,255,0.1)';
                        border = '1px solid var(--text-secondary)';
                      }

                      return (
                        <div 
                          key={oIndex}
                          onClick={() => handleSelectAnswer(qIndex, oIndex)}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            backgroundColor: bg,
                            border,
                            cursor: showResults ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span>{opt}</span>
                          {showResults && isCorrect && <Check size={18} color="var(--success-color)" />}
                          {showResults && isSelected && !isCorrect && <XCircle size={18} color="#ff4444" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {!showResults ? (
              <button 
                className="btn btn-primary"
                onClick={() => setShowResults(true)}
                disabled={Object.keys(answers).length < quiz.length}
                style={{ width: '100%', marginTop: '24px' }}
              >
                Submit Answers
              </button>
            ) : (
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--accent-color)' }}>
                  You scored {Object.entries(answers).filter(([qId, ans]) => quiz[parseInt(qId)].correctAnswerIndex === ans).length} out of {quiz.length}!
                </p>
                <button className="btn btn-secondary" onClick={() => setQuiz(null)}>Close Quiz</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
