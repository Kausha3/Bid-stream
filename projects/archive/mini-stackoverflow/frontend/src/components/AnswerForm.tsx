import { useState } from 'react';
import type { FormEvent } from 'react';
import * as api from '../services/api';

interface AnswerFormProps {
  questionId: string;
  onSuccess: () => void;
}

const AnswerForm = ({ questionId, onSuccess }: AnswerFormProps) => {
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (body.length < 10) {
      setError('Answer must be at least 10 characters');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await api.createAnswer({ body, questionId });
      if (response.success) {
        setBody('');
        onSuccess();
      } else {
        setError(response.message || 'Failed to post answer');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="answer-form">
      <h3>Your Answer</h3>

      <form onSubmit={handleSubmit}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your answer here..."
          rows={8}
          required
          minLength={10}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Posting...' : 'Post Your Answer'}
        </button>
      </form>
    </div>
  );
};

export default AnswerForm;
