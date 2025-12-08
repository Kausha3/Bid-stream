import { useState, useEffect, useCallback } from 'react';
import type { Question } from '../types';
import { useAuth } from '../context/AuthContext';
import VoteButtons from './VoteButtons';
import AnswerForm from './AnswerForm';
import * as api from '../services/api';

interface QuestionDetailProps {
  questionId: string;
  onBack: () => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const QuestionDetail = ({ questionId, onBack }: QuestionDetailProps) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user, isAuthenticated } = useAuth();

  const fetchQuestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getQuestion(questionId);
      if (response.success) {
        setQuestion(response.data);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  const handleVoteQuestion = async (value: number) => {
    if (!isAuthenticated) return;
    const response = await api.voteQuestion(questionId, value);
    if (response.success) {
      fetchQuestion();
    }
  };

  const handleVoteAnswer = async (answerId: string, value: number) => {
    if (!isAuthenticated) return;
    const response = await api.voteAnswer(answerId, value);
    if (response.success) {
      fetchQuestion();
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    if (!isAuthenticated || question?.author._id !== user?._id) return;
    const response = await api.acceptAnswer(questionId, answerId);
    if (response.success) {
      fetchQuestion();
    }
  };

  if (isLoading) {
    return <div className="loading">Loading question...</div>;
  }

  if (!question) {
    return <div className="error">Question not found</div>;
  }

  return (
    <div className="question-detail">
      <button className="back-btn" onClick={onBack}>
        Back to Questions
      </button>

      <div className="question-header">
        <h1>{question.title}</h1>
        <div className="question-info">
          <span>Asked {formatDate(question.createdAt)}</span>
          <span>Viewed {question.views} times</span>
        </div>
      </div>

      <div className="question-body-container">
        <VoteButtons
          votes={question.votes}
          userVote={question.userVote}
          onVote={handleVoteQuestion}
        />

        <div className="question-main">
          <div className="body-content">{question.body}</div>

          <div className="question-tags">
            {question.tags.map((tag) => (
              <span key={tag._id} className="tag">
                {tag.name}
              </span>
            ))}
          </div>

          <div className="author-card">
            <span className="label">asked</span>
            <span className="author-name">{question.author.username}</span>
            <span className="author-rep">{question.author.reputation} rep</span>
          </div>
        </div>
      </div>

      <div className="answers-section">
        <h2>{question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}</h2>

        {question.answers.map((answer) => (
          <div key={answer._id} className={`answer ${answer.isAccepted ? 'accepted' : ''}`}>
            <VoteButtons
              votes={answer.votes}
              userVote={answer.userVote}
              onVote={(value) => handleVoteAnswer(answer._id, value)}
              isAccepted={answer.isAccepted}
              canAccept={question.author._id === user?._id && !question.acceptedAnswer}
              onAccept={() => handleAcceptAnswer(answer._id)}
            />

            <div className="answer-main">
              <div className="body-content">{answer.body}</div>

              <div className="author-card">
                <span className="label">answered {formatDate(answer.createdAt)}</span>
                <span className="author-name">{answer.author.username}</span>
                <span className="author-rep">{answer.author.reputation} rep</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAuthenticated && (
        <AnswerForm questionId={questionId} onSuccess={fetchQuestion} />
      )}
    </div>
  );
};

export default QuestionDetail;
