export default function ArticleList({
  activePage,
  articles,
  onSelectArticle,
  onDeleteArticle,
}) {
  return (
    <div className="card">
      <h2>{activePage} Articles</h2>

      {articles.length === 0 ? (
        <p className="empty">No articles yet.</p>
      ) : (
        <div className="article-list">
          {articles.map((article) => (
            <article
              className="article article-summary"
              key={article.id}
              onClick={() => onSelectArticle(article)}
            >
              <div>
                <h3>{article.title}</h3>
                <small>{article.createdAt}</small>
              </div>

              <button
                className="delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteArticle(article.id);
                }}
              >
                Delete
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}