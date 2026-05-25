import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import ArticleList from "./components/ArticleList";
import ArticleDetail from "./components/ArticleDetail";
import ArticleForm from "./components/ArticleForm";

const API_URL = `${window.location.protocol}//${window.location.hostname}:3001`;
const socket = io(API_URL);

const categories = [
  "House Info",
  "Knowledge Base",
  "Recipes",
  "Homelab",
  "Helpful Links",
];

export default function App() {
  const [activePage, setActivePage] = useState(() => {
    return localStorage.getItem("activePage") || "Home";
  });

  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [redsGames, setRedsGames] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);

  const [selectedArticle, setSelectedArticle] = useState(() => {
    const saved = localStorage.getItem("selectedArticle");
    return saved ? JSON.parse(saved) : null;
  });

  const [form, setForm] = useState({
    title: "",
    body: "",
    url: "",
  });

  const navItems = ["Home", ...categories];

  useEffect(() => {
    fetchArticles();
    fetchRedsGames();
    fetchLocalNews();

    const redsInterval = setInterval(fetchRedsGames, 30000);
    const newsInterval = setInterval(fetchLocalNews, 300000);

    socket.on("articlesUpdated", (updatedArticles) => {
      setArticles([...updatedArticles].reverse());
    });

    return () => {
      clearInterval(redsInterval);
      clearInterval(newsInterval);
      socket.off("articlesUpdated");
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  useEffect(() => {
    localStorage.setItem("selectedArticle", JSON.stringify(selectedArticle));
  }, [selectedArticle]);

  async function fetchArticles() {
    try {
      const res = await fetch(`${API_URL}/articles`);
      const data = await res.json();
      setArticles([...data].reverse());
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    }
  }

  async function fetchRedsGames() {
    try {
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 14);

      const startDate = start.toISOString().split("T")[0];
      const endDate = end.toISOString().split("T")[0];

      const res = await fetch(
        `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=113&startDate=${startDate}&endDate=${endDate}&hydrate=team,linescore`
      );

      const data = await res.json();
      setRedsGames(data.dates.flatMap((d) => d.games || []));
    } catch {
      setRedsGames([]);
    }
  }

  async function fetchLocalNews() {
    try {
      const rss = encodeURIComponent("https://www.wowktv.com/feed/");
      const res = await fetch(`https://api.allorigins.win/raw?url=${rss}`);
      const text = await res.text();
      const xml = new DOMParser().parseFromString(text, "text/xml");

      const items = [...xml.querySelectorAll("item")]
        .slice(0, 5)
        .map((item) => ({
          title: item.querySelector("title")?.textContent || "WOWK Local News",
          link:
            item.querySelector("link")?.textContent ||
            "https://www.wowktv.com/news/local/",
        }));

      setNews(items);
    } catch {
      setNews([]);
    }
  }

  function changePage(page) {
    setActivePage(page);
    setShowForm(false);
    setSelectedArticle(null);
    setEditingArticle(null);
  }

  function openNewArticle() {
    setSelectedArticle(null);
    setEditingArticle(null);
    setForm({ title: "", body: "", url: "" });
    setShowForm(true);
  }

  function openEditArticle(article) {
    setEditingArticle(article);
    setSelectedArticle(null);
    setForm({
      title: article.title || "",
      body: article.body || "",
      url: article.url || "",
    });
    setShowForm(true);
  }

  function resetForm() {
    setForm({ title: "", body: "", url: "" });
    setEditingArticle(null);
    setShowForm(false);
  }

  async function createOrUpdateArticle(e) {
    e.preventDefault();

    if (!form.title.trim() || activePage === "Home") {
      alert("Please enter a title and make sure you are not on the Home page.");
      return;
    }

    if (editingArticle) {
      const updatedArticle = {
        ...editingArticle,
        title: form.title,
        body: form.body,
        url: form.url,
        updatedAt: new Date().toLocaleString(),
      };

      try {
        const res = await fetch(`${API_URL}/articles/${editingArticle.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedArticle),
        });

        if (!res.ok) throw new Error(`Update failed: ${res.status}`);

        resetForm();
        setSelectedArticle(updatedArticle);
      } catch (err) {
        alert(`Could not update article.\nBackend used:\n${API_URL}`);
        console.error("Failed to update article:", err);
      }

      return;
    }

    const newArticle = {
      id: Date.now().toString(),
      title: form.title,
      category: activePage,
      body: form.body,
      url: form.url,
      createdAt: new Date().toLocaleString(),
    };

    try {
      const res = await fetch(`${API_URL}/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticle),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);

      resetForm();
    } catch (err) {
      alert(`Could not save article.\nBackend used:\n${API_URL}`);
      console.error("Failed to create article:", err);
    }
  }

  async function deleteArticle(id) {
    if (!confirm("Delete this article?")) return;

    try {
      await fetch(`${API_URL}/articles/${id}`, {
        method: "DELETE",
      });

      setSelectedArticle(null);
      resetForm();
    } catch (err) {
      console.error("Failed to delete article:", err);
    }
  }

  const pageArticles = useMemo(() => {
    if (activePage === "Home") return [];
    return articles.filter((article) => article.category === activePage);
  }, [articles, activePage]);

  return (
    <div className="app">
      <Sidebar
        navItems={navItems}
        activePage={activePage}
        onChangePage={changePage}
      />

      <main className="main">
        <header className="hero">
          <div>
            <p className="eyebrow">The Richendollars</p>
            <h1>{activePage === "Home" ? "Welcome Home" : activePage}</h1>
            <p>
              {activePage === "Home"
                ? "Your private family command center."
                : `Articles and notes for ${activePage}.`}
            </p>
          </div>

          {activePage !== "Home" && !showForm && !selectedArticle && (
            <button className="gold-button" onClick={openNewArticle}>
              + New {activePage === "Recipes" ? "Recipe" : "Article"}
            </button>
          )}
        </header>

        {activePage === "Home" ? (
          <HomePage news={news} redsGames={redsGames} />
        ) : (
          <section className="article-page">
            {showForm && (
              <ArticleForm
                activePage={activePage}
                editingArticle={editingArticle}
                form={form}
                setForm={setForm}
                onSubmit={createOrUpdateArticle}
                onCancel={resetForm}
              />
            )}

            {selectedArticle ? (
              <ArticleDetail
                article={selectedArticle}
                onBack={() => setSelectedArticle(null)}
                onEdit={() => openEditArticle(selectedArticle)}
                onDelete={() => deleteArticle(selectedArticle.id)}
              />
            ) : (
              !showForm && (
                <ArticleList
                  activePage={activePage}
                  articles={pageArticles}
                  onSelectArticle={setSelectedArticle}
                  onDeleteArticle={deleteArticle}
                />
              )
            )}
          </section>
        )}
      </main>
    </div>
  );
}