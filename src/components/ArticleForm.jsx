export default function ArticleForm({
  activePage,
  editingArticle,
  form,
  setForm,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="card form-card">
      <div className="card-header">
        <h2>
          {editingArticle
            ? `Edit ${activePage === "Recipes" ? "Recipe" : "Article"}`
            : `New ${activePage === "Recipes" ? "Recipe" : "Article"}`}
        </h2>

        <button className="muted-button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form className="form" onSubmit={onSubmit}>
        <label>
          Title
          <input
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            placeholder="Article title"
          />
        </label>

        <label>
          Save from URL
          <input
            value={form.url}
            onChange={(e) =>
              setForm({
                ...form,
                url: e.target.value,
              })
            }
            placeholder="https://example.com"
          />
        </label>

        <label>
          Article Body
          <textarea
            value={form.body}
            onChange={(e) =>
              setForm({
                ...form,
                body: e.target.value,
              })
            }
            placeholder="Write notes, recipes, instructions, or helpful information..."
          />
        </label>

        <button className="gold-button">
          {editingArticle ? "Save Changes" : `Save to ${activePage}`}
        </button>
      </form>
    </div>
  );
}