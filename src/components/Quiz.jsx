import React, { useState } from 'react';
import ReactGA from 'react-ga4';
import { quizQuestions } from '../data/quizQuestions';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizState, setQuizState] = useState('idle'); // idle, loading, active, finished
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuizState('loading');

    ReactGA.event({
      category: "Quiz",
      action: "Started"
    });
    
    try {
      // MOCK LOGIC - Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      // Shuffle the imported questions and pick 5
      const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
      const selectedQuestions = shuffled.slice(0, 5).map(q => {
        // Keep track of which option is correct while shuffling
        const optionsWithOriginalIndices = q.options.map((opt, index) => ({
          text: opt,
          isCorrect: index === q.correctIndex
        }));
        
        // Shuffle the options
        optionsWithOriginalIndices.sort(() => 0.5 - Math.random());
        
        // Find the new correct index
        const newCorrectIndex = optionsWithOriginalIndices.findIndex(o => o.isCorrect);
        
        return {
          ...q,
          options: optionsWithOriginalIndices.map(o => o.text),
          correctIndex: newCorrectIndex
        };
      });

      setQuestions(selectedQuestions);
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizState('active');
    } catch (err) {
      setError(err.message);
      setQuizState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    
    setSelectedAnswer(index);
    const isCorrect = index === questions[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setQuizState('finished');
        ReactGA.event({
          category: "Quiz",
          action: "Completed",
          value: score + (isCorrect ? 1 : 0)
        });
      }
    }, 2000);
  };

  return (
    <section className="py-12 w-full">
      <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col h-[600px]">
        <h2 className="text-2xl font-heading font-bold text-[#C8A96E] mb-6 flex items-center">
          <span className="mr-2">📝</span> Test Your Knowledge
        </h2>

        {quizState === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold mb-4">Ready for a quick challenge?</h3>
            <p className="text-slate-400 light:text-slate-600 mb-8 max-w-sm">
              Our AI will generate 5 multiple-choice questions to test your understanding of the election process.
            </p>
            {error && <div className="text-red-500 mb-4 bg-red-500/10 p-3 rounded-lg">{error}</div>}
            <button 
              onClick={startQuiz}
              className="bg-[#C8A96E] hover:bg-[#b0935d] text-slate-900 px-8 py-3 rounded-full font-bold transition-all shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-4"
            >
              Start Quiz
            </button>
          </div>
        )}

        {quizState === 'loading' && (
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <div className="skeleton h-8 w-3/4 rounded-lg"></div>
            <div className="space-y-3">
              <div className="skeleton h-12 w-full rounded-xl"></div>
              <div className="skeleton h-12 w-full rounded-xl"></div>
              <div className="skeleton h-12 w-full rounded-xl"></div>
              <div className="skeleton h-12 w-full rounded-xl"></div>
            </div>
            <p className="text-center text-slate-400 animate-pulse mt-4">AI is generating your custom quiz...</p>
          </div>
        )}

        {quizState === 'active' && questions.length > 0 && (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6 text-sm text-slate-400 font-bold">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>Score: {score}</span>
            </div>
            
            <h3 className="text-xl font-bold font-heading mb-8">
              {questions[currentQuestionIndex].question}
            </h3>

            <div className="space-y-3 flex-1">
              {questions[currentQuestionIndex].options.map((opt, idx) => {
                let btnClass = "w-full text-left p-4 rounded-xl border transition-all font-body focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-2 ";
                if (selectedAnswer === null) {
                  btnClass += "bg-slate-800/50 light:bg-slate-100 border-slate-700 light:border-slate-300 hover:border-[#C8A96E] hover:bg-slate-800 light:hover:bg-slate-200";
                } else {
                  const isCorrect = idx === questions[currentQuestionIndex].correctIndex;
                  if (isCorrect) {
                    btnClass += "bg-green-500/20 border-green-500 text-green-400 light:text-green-700";
                  } else if (idx === selectedAnswer) {
                    btnClass += "bg-red-500/20 border-red-500 text-red-400 light:text-red-700";
                  } else {
                    btnClass += "bg-slate-800/30 border-slate-700/50 opacity-50";
                  }
                }

                return (
                  <button 
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedAnswer !== null}
                    className={btnClass}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className="mt-6 p-4 bg-slate-800/80 light:bg-slate-100 rounded-xl border border-slate-700 light:border-slate-300 animate-fade-slide-up">
                <span className="font-bold text-[#C8A96E]">Explanation: </span>
                <span className="text-sm">{questions[currentQuestionIndex].explanation}</span>
              </div>
            )}
          </div>
        )}

        {quizState === 'finished' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-slide-up">
            <div className="text-6xl mb-4">
              {score === 5 ? '🏆' : score >= 3 ? '🌟' : '📚'}
            </div>
            <h3 className="text-3xl font-bold font-heading mb-2 text-[#C8A96E]">Quiz Complete!</h3>
            <p className="text-xl mb-6">You scored {score} out of {questions.length}</p>
            
            <p className="text-slate-400 light:text-slate-600 mb-8 max-w-sm">
              {score === 5 ? "Perfect! You're an election expert." : 
               score >= 3 ? "Great job! You know your stuff." : 
               "Good effort! The election timeline above has more info to explore."}
            </p>

            <button 
              onClick={startQuiz}
              className="bg-transparent border-2 border-[#C8A96E] text-[#C8A96E] hover:bg-[#C8A96E] hover:text-slate-900 px-8 py-3 rounded-full font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C8A96E] focus-visible:outline-offset-4"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Quiz;
