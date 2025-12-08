import type { QuestionSummary } from '../types';

interface QuestionCardProps {
  question: QuestionSummary;
  onClick: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
};

const QuestionCard = ({ question, onClick }: QuestionCardProps) => {
  const hasAcceptedAnswer = question.answers.length > 0;

  return (
    <div className="question-card" onClick={onClick}>
      <div className="question-stats">
        <div className={`stat ${question.votes > 0 ? 'positive' : question.votes < 0 ? 'negative' : ''}`}>
          <span className="stat-value">{question.votes}</span>
          <span className="stat-label">votes</span>
        </div>
        <div className={`stat ${hasAcceptedAnswer ? 'accepted' : ''}`}>
          <span className="stat-value">{question.answers.length}</span>
          <span className="stat-label">answers</span>
        </div>
        <div className="stat">
          <span className="stat-value">{question.views}</span>
          <span className="stat-label">views</span>
        </div>
      </div>

      <div className="question-content">
        <h3 className="question-title">{question.title}</h3>
        <div className="question-tags">
          {question.tags.map((tag) => (
            <span key={tag._id} className="tag">
              {tag.name}
            </span>
          ))}
        </div>
        <div className="question-meta">
          <span className="author">
            {question.author.username}
            <span className="reputation">{question.author.reputation}</span>
          </span>
          <span className="time">asked {formatDate(question.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
