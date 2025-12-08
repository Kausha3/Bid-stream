import { useState } from 'react';
import type { FormEvent } from 'react';
import * as api from '../services/api';

interface AskQuestionProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AskQuestion = ({ onSuccess, onCancel }: AskQuestionProps) => {
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const tags = formData.tags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (tags.length === 0 || tags.length > 5) {
      setError('Please add 1-5 tags');
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.createQuestion({
        title: formData.title,
        body: formData.body,
        tags
      });

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to create question');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ask-question">
      <h2>Ask a Question</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What's your programming question? Be specific."
            required
            minLength={10}
            maxLength={200}
          />
          <span className="hint">Min 10 characters</span>
        </div>

        <div className="form-group">
          <label>Body</label>
          <textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="Include all the information someone would need to answer your question"
            required
            minLength={20}
            rows={10}
          />
          <span className="hint">Min 20 characters</span>
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="javascript, react, typescript"
          />
          <span className="hint">Add up to 5 tags separated by commas</span>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Posting...' : 'Post Question'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestion;
