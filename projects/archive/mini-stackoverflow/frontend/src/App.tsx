import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import QuestionCard from './components/QuestionCard';
import QuestionDetail from './components/QuestionDetail';
import AskQuestion from './components/AskQuestion';
import type { QuestionSummary, Tag } from './types';
import * as api from './services/api';
import './App.css';

type View = 'list' | 'detail' | 'ask';
type SortOption = 'newest' | 'votes' | 'unanswered';

function AppContent() {
  const [view, setView] = useState<View>('list');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionSummary[]>([]);
  const [popularTags, setPopularTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sort, setSort] = useState<SortOption>('newest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { user, isAuthenticated, logout } = useAuth();

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getQuestions({
        sort,
        ...(selectedTag && { tag: selectedTag })
      });
      if (response.success) {
        setQuestions(response.data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [sort, selectedTag]);

  const fetchTags = useCallback(async () => {
    try {
      const response = await api.getPopularTags();
      if (response.success) {
        setPopularTags(response.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
    fetchTags();
  }, [fetchQuestions, fetchTags]);

  const handleAskQuestion = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setView('ask');
  };

  const handleQuestionClick = (questionId: string) => {
    setSelectedQuestionId(questionId);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedQuestionId(null);
    fetchQuestions();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 onClick={handleBackToList}>MiniOverflow</h1>
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <span className="user-info">
                  {user?.username}
                  <span className="rep">{user?.reputation}</span>
                </span>
                <button className="btn btn-secondary" onClick={logout}>
                  Log Out
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>
                Log In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        {view === 'list' && (
          <>
            <div className="list-header">
              <h2>All Questions</h2>
              <button className="btn btn-primary" onClick={handleAskQuestion}>
                Ask Question
              </button>
            </div>

            <div className="content-wrapper">
              <div className="questions-container">
                <div className="sort-tabs">
                  {(['newest', 'votes', 'unanswered'] as SortOption[]).map((s) => (
                    <button
                      key={s}
                      className={`sort-tab ${sort === s ? 'active' : ''}`}
                      onClick={() => setSort(s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>

                {isLoading ? (
                  <div className="loading">Loading questions...</div>
                ) : questions.length === 0 ? (
                  <div className="empty">No questions yet. Be the first to ask!</div>
                ) : (
                  <div className="questions-list">
                    {questions.map((question) => (
                      <QuestionCard
                        key={question._id}
                        question={question}
                        onClick={() => handleQuestionClick(question._id)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <aside className="sidebar">
                <div className="sidebar-section">
                  <h3>Popular Tags</h3>
                  <div className="tags-list">
                    {popularTags.map((tag) => (
                      <button
                        key={tag._id}
                        className={`tag ${selectedTag === tag.name ? 'active' : ''}`}
                        onClick={() =>
                          setSelectedTag(selectedTag === tag.name ? null : tag.name)
                        }
                      >
                        {tag.name}
                        <span className="count">{tag.questionsCount}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}

        {view === 'detail' && selectedQuestionId && (
          <QuestionDetail questionId={selectedQuestionId} onBack={handleBackToList} />
        )}

        {view === 'ask' && (
          <AskQuestion
            onSuccess={() => {
              setView('list');
              fetchQuestions();
            }}
            onCancel={() => setView('list')}
          />
        )}
      </main>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
