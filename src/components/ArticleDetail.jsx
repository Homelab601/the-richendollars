export default function ArticleDetail({
  article,
  onBack,
  onEdit,
  onDelete,
}) {
  return (
    <div className="card article-detail">
      <div className="article-header">
        <div>
          <h2>{article.title}</h2>

          <small>
            Created: {article.createdAt}
            {article.updatedAt && ` • Updated: ${article.updatedAt}`}
          </small>
        </div>

        <div className="article-actions">
          <button className="muted-button" onClick={onBack}>
            Back
          </button>

          <button className="gold-button" onClick={onEdit}>
            Edit
          </button>

          <button className="delete" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      {article.url && (
        <a href={article.url} target="_blank" rel="noreferrer">
          Open saved URL
        </a>
      )}

      {article.body && <p>{article.body}</p>}
    </div>
  );
}