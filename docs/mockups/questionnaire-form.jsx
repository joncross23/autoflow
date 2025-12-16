import { useState } from 'react';

// AutoFlow Questionnaire Form Mockup
// Phase 0.5 - Design Sprint
// Features: Public form, progress indicator, branding, AI analysis preview

const accentThemes = {
  midnight: { primary: '#3B82F6', primaryHover: '#2563EB', primaryMuted: '#1E3A5F' },
  emerald: { primary: '#10B981', primaryHover: '#059669', primaryMuted: '#064E3B' },
  sunset: { primary: '#F59E0B', primaryHover: '#D97706', primaryMuted: '#78350F' },
  royal: { primary: '#8B5CF6', primaryHover: '#7C3AED', primaryMuted: '#4C1D95' },
  rose: { primary: '#EC4899', primaryHover: '#DB2777', primaryMuted: '#831843' },
  slate: { primary: '#64748B', primaryHover: '#475569', primaryMuted: '#1E293B' },
};

const modeThemes = {
  dark: {
    bg: '#0A0A0B',
    bgSecondary: '#131316',
    bgTertiary: '#1A1A1F',
    bgElevated: '#1F1F26',
    border: '#27272A',
    borderSubtle: '#1F1F23',
    text: '#FAFAFA',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
  },
  light: {
    bg: '#FAFAFA',
    bgSecondary: '#F4F4F5',
    bgTertiary: '#E4E4E7',
    bgElevated: '#FFFFFF',
    border: '#D4D4D8',
    borderSubtle: '#E4E4E7',
    text: '#09090B',
    textSecondary: '#52525B',
    textMuted: '#A1A1AA',
  },
};

const defaultQuestions = [
  {
    id: 'q1',
    question: "What's one task you personally do every single week that you absolutely shouldn't, but it has to get done?",
    placeholder: "e.g., Manually updating spreadsheets with sales data every Monday morning...",
    hint: "Think about tasks that feel repetitive or below your pay grade.",
  },
  {
    id: 'q2',
    question: "Describe one process in your business that's a bit of a mess right now.",
    placeholder: "e.g., Our invoice approval process involves 5 different people and takes 2 weeks...",
    hint: "Don't worry about sounding negative — we're looking for improvement opportunities.",
  },
  {
    id: 'q3',
    question: "On a typical week, how many hours do YOU personally spend on things that aren't revenue-generating or strategic?",
    placeholder: "e.g., About 15 hours on admin, reporting, and chasing updates...",
    hint: "Include time spent on admin, manual data entry, status updates, etc.",
  },
  {
    id: 'q4',
    question: "If you had an extra 20 hours per week back, what would you actually do with it? Be specific.",
    placeholder: "e.g., I'd finally focus on that partnership deal, spend more time with key clients...",
    hint: "This helps us understand what matters most to you.",
  },
  {
    id: 'q5',
    question: "What's the most annoying handoff between team members or systems?",
    placeholder: "e.g., When marketing passes leads to sales, half the info is missing...",
    hint: "Where do things fall through the cracks?",
  },
  {
    id: 'q6',
    question: "Which reports or updates do you create manually that feel like they should be automatic?",
    placeholder: "e.g., Weekly team status reports, monthly client summaries, expense reconciliation...",
    hint: "Include any recurring reports or data compilation tasks.",
  },
];

function ThemeProvider({ children, mode, accent }) {
  const modeColors = modeThemes[mode];
  const accentColors = accentThemes[accent];
  
  const cssVars = {
    '--bg': modeColors.bg,
    '--bg-secondary': modeColors.bgSecondary,
    '--bg-tertiary': modeColors.bgTertiary,
    '--bg-elevated': modeColors.bgElevated,
    '--border': modeColors.border,
    '--border-subtle': modeColors.borderSubtle,
    '--text': modeColors.text,
    '--text-secondary': modeColors.textSecondary,
    '--text-muted': modeColors.textMuted,
    '--primary': accentColors.primary,
    '--primary-hover': accentColors.primaryHover,
    '--primary-muted': accentColors.primaryMuted,
  };
  
  return <div style={cssVars}>{children}</div>;
}

function FormHeader({ companyName, formTitle }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 16,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 18,
        }}>A</div>
        <span style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text)',
        }}>{companyName}</span>
      </div>
      <h1 style={{
        margin: '0 0 8px 0',
        fontSize: 28,
        fontWeight: 700,
        color: 'var(--text)',
        letterSpacing: '-0.02em',
      }}>{formTitle}</h1>
      <p style={{
        margin: 0,
        fontSize: 15,
        color: 'var(--text-secondary)',
        maxWidth: 500,
        marginLeft: 'auto',
        marginRight: 'auto',
        lineHeight: 1.6,
      }}>
        Help us understand your automation opportunities. This takes about 5-10 minutes 
        and your responses will be analysed by AI to identify high-impact improvements.
      </p>
    </div>
  );
}

function ProgressBar({ current, total }) {
  const progress = ((current) / total) * 100;
  
  return (
    <div style={{
      padding: '16px 24px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Question {current + 1} of {total}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {Math.round(progress)}% complete
        </span>
      </div>
      <div style={{
        height: 4,
        background: 'var(--bg-tertiary)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'var(--primary)',
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}

function QuestionCard({ question, answer, onChange, questionNumber }) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 12,
      padding: '28px',
      border: `1px solid ${isFocused ? 'var(--primary)' : 'var(--border-subtle)'}`,
      transition: 'border-color 0.2s ease',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        marginBottom: 16,
      }}>
        <span style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}>{questionNumber}</span>
        <div>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text)',
            lineHeight: 1.4,
          }}>{question.question}</h3>
          {question.hint && (
            <p style={{
              margin: 0,
              fontSize: 13,
              color: 'var(--text-muted)',
              fontStyle: 'italic',
            }}>{question.hint}</p>
          )}
        </div>
      </div>
      
      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={question.placeholder}
        style={{
          width: '100%',
          minHeight: 120,
          padding: '14px 16px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          color: 'var(--text)',
          fontSize: 14,
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s ease',
        }}
      />
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 8,
      }}>
        <span style={{
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          {answer.length > 0 ? `${answer.length} characters` : 'Required'}
        </span>
        <span style={{
          fontSize: 12,
          color: answer.length >= 20 ? '#22C55E' : 'var(--text-muted)',
        }}>
          {answer.length >= 20 ? '✓ Good detail' : 'Tip: More detail helps our AI'}
        </span>
      </div>
    </div>
  );
}

function ContactFields({ name, email, company, onNameChange, onEmailChange, onCompanyChange }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderRadius: 12,
      padding: '28px',
      border: '1px solid var(--border-subtle)',
    }}>
      <h3 style={{
        margin: '0 0 20px 0',
        fontSize: 17,
        fontWeight: 600,
        color: 'var(--text)',
      }}>Your Details</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: 6,
          }}>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Your full name"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: 6,
          }}>Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@company.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>
        
        <div>
          <label style={{
            display: 'block',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: 6,
          }}>Company</label>
          <input
            type="text"
            value={company}
            onChange={(e) => onCompanyChange(e.target.value)}
            placeholder="Your company name"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function SubmissionSuccess() {
  return (
    <div style={{
      maxWidth: 500,
      margin: '0 auto',
      padding: '60px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: '#22C55E20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px',
      }}>
        <span style={{ fontSize: 40 }}>✓</span>
      </div>
      
      <h2 style={{
        margin: '0 0 12px 0',
        fontSize: 24,
        fontWeight: 700,
        color: 'var(--text)',
      }}>Thank you!</h2>
      
      <p style={{
        margin: '0 0 32px 0',
        fontSize: 15,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
      }}>
        Your responses have been submitted and our AI is already analysing them 
        to identify your best automation opportunities. We'll be in touch soon with 
        a personalised report.
      </p>
      
      <div style={{
        background: 'var(--bg-elevated)',
        borderRadius: 12,
        padding: '20px',
        border: '1px solid var(--border-subtle)',
        textAlign: 'left',
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>✦</span> What happens next?
        </h4>
        <ol style={{
          margin: 0,
          paddingLeft: 20,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.8,
        }}>
          <li>AI analyses your responses within 24 hours</li>
          <li>We identify top automation opportunities</li>
          <li>You receive a personalised priority report</li>
          <li>Optional: Schedule a call to discuss findings</li>
        </ol>
      </div>
    </div>
  );
}

function FormNavigation({ currentIndex, totalQuestions, onPrev, onNext, onSubmit, canSubmit }) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const isContactPage = currentIndex === totalQuestions;
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 24,
    }}>
      <button
        onClick={onPrev}
        disabled={isFirst}
        style={{
          padding: '12px 24px',
          background: 'var(--bg-tertiary)',
          border: 'none',
          borderRadius: 8,
          color: isFirst ? 'var(--text-muted)' : 'var(--text)',
          fontSize: 14,
          fontWeight: 500,
          cursor: isFirst ? 'not-allowed' : 'pointer',
          opacity: isFirst ? 0.5 : 1,
        }}
      >
        ← Previous
      </button>
      
      {isContactPage ? (
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          style={{
            padding: '12px 32px',
            background: canSubmit ? 'var(--primary)' : 'var(--bg-tertiary)',
            border: 'none',
            borderRadius: 8,
            color: canSubmit ? 'white' : 'var(--text-muted)',
            fontSize: 14,
            fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          Submit Responses ✓
        </button>
      ) : (
        <button
          onClick={onNext}
          style={{
            padding: '12px 24px',
            background: 'var(--primary)',
            border: 'none',
            borderRadius: 8,
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isLast ? 'Continue to Details' : 'Next Question'} →
        </button>
      )}
    </div>
  );
}

function QuestionDots({ total, current, answers }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 24,
    }}>
      {[...Array(total + 1)].map((_, i) => {
        const isActive = i === current;
        const isComplete = i < total ? answers[i]?.length >= 20 : false;
        const isContact = i === total;
        
        return (
          <div
            key={i}
            style={{
              width: isActive ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: isActive 
                ? 'var(--primary)' 
                : isComplete 
                  ? '#22C55E' 
                  : 'var(--border)',
              transition: 'all 0.2s ease',
            }}
            title={isContact ? 'Your details' : `Question ${i + 1}`}
          />
        );
      })}
    </div>
  );
}

export default function QuestionnaireMockup() {
  const [mode, setMode] = useState('dark');
  const [accent, setAccent] = useState('midnight');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(defaultQuestions.map(() => ''));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const totalQuestions = defaultQuestions.length;
  const isContactPage = currentIndex === totalQuestions;
  
  const handleNext = () => {
    if (currentIndex < totalQuestions) {
      setCurrentIndex(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const handleSubmit = () => {
    setSubmitted(true);
  };
  
  const canSubmit = name.length > 0 && email.includes('@');
  
  return (
    <ThemeProvider mode={mode} accent={accent}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <FormHeader 
          companyName="AutoFlow" 
          formTitle="AI & Automation Audit" 
        />
        
        {!submitted && (
          <ProgressBar current={currentIndex} total={totalQuestions + 1} />
        )}
        
        <div style={{
          maxWidth: 700,
          margin: '0 auto',
          padding: '32px 24px',
        }}>
          {submitted ? (
            <SubmissionSuccess />
          ) : (
            <>
              <QuestionDots 
                total={totalQuestions} 
                current={currentIndex} 
                answers={answers}
              />
              
              {isContactPage ? (
                <ContactFields
                  name={name}
                  email={email}
                  company={company}
                  onNameChange={setName}
                  onEmailChange={setEmail}
                  onCompanyChange={setCompany}
                />
              ) : (
                <QuestionCard
                  question={defaultQuestions[currentIndex]}
                  answer={answers[currentIndex]}
                  onChange={(value) => {
                    const newAnswers = [...answers];
                    newAnswers[currentIndex] = value;
                    setAnswers(newAnswers);
                  }}
                  questionNumber={currentIndex + 1}
                />
              )}
              
              <FormNavigation
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                onPrev={handlePrev}
                onNext={handleNext}
                onSubmit={handleSubmit}
                canSubmit={canSubmit}
              />
            </>
          )}
        </div>
        
        {/* Theme controls */}
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-elevated)',
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid var(--border-subtle)',
        }}>
          {Object.entries(accentThemes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setAccent(key)}
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: theme.primary,
                border: accent === key ? '2px solid var(--text)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
          <button
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
            style={{
              marginLeft: 4,
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'var(--bg-tertiary)',
              border: 'none',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            {mode === 'dark' ? '◐' : '○'}
          </button>
        </div>
        
        {/* Mockup label */}
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}>
          <span><strong style={{ color: 'var(--primary)' }}>Questionnaire Form</strong> — Public submission flow</span>
          <span style={{
            padding: '2px 8px',
            background: 'var(--primary)',
            color: 'white',
            borderRadius: 4,
            fontWeight: 600,
          }}>MOCKUP</span>
        </div>
      </div>
    </ThemeProvider>
  );
}
