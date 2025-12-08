interface VoteButtonsProps {
  votes: number;
  userVote?: number | null;
  onVote: (value: number) => void;
  isAccepted?: boolean;
  canAccept?: boolean;
  onAccept?: () => void;
}

const VoteButtons = ({ votes, userVote, onVote, isAccepted, canAccept, onAccept }: VoteButtonsProps) => {
  return (
    <div className="vote-buttons">
      <button
        className={`vote-btn upvote ${userVote === 1 ? 'active' : ''}`}
        onClick={() => onVote(1)}
        title="Upvote"
      >
        ^
      </button>

      <span className={`vote-count ${votes > 0 ? 'positive' : votes < 0 ? 'negative' : ''}`}>
        {votes}
      </span>

      <button
        className={`vote-btn downvote ${userVote === -1 ? 'active' : ''}`}
        onClick={() => onVote(-1)}
        title="Downvote"
      >
        v
      </button>

      {(isAccepted || canAccept) && (
        <button
          className={`accept-btn ${isAccepted ? 'accepted' : ''}`}
          onClick={onAccept}
          disabled={!canAccept && !isAccepted}
          title={isAccepted ? 'Accepted answer' : 'Accept this answer'}
        >
          {isAccepted ? 'Accepted' : 'Accept'}
        </button>
      )}
    </div>
  );
};

export default VoteButtons;
