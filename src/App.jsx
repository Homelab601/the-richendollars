import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

import Sidebar from "./components/Sidebar";
import HomePage from "./components/HomePage";
import ArticleList from "./components/ArticleList";
import ArticleDetail from "./components/ArticleDetail";
import ArticleForm from "./components/ArticleForm";
import AdminPage from "./components/AdminPage";

const API_URL = "";
const socket = io("/", {
  path: "/socket.io",
  transports: ["websocket", "polling"],
});

const categories = [
  "House Info",
  "Knowledge Base",
  "Recipes",
  "Homelab",
  "Helpful Links",
  "Admin",
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
  const [searchTerm, setSearchTerm] = useState("");

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

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("articlesUpdated", (updatedArticles) => {
      setArticles([...updatedArticles].reverse());
    });

    return () => {
      clearInterval(redsInterval);
      clearInterval(newsInterval);
      socket.off("connect_error");
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
    setSearchTerm("");
  }

  function openNewArticle() {
    setSelectedArticle(null);
    setEditingArticle(null);
    setForm({
      title: "",
      body: "",
      url: "",
    });
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
    setForm({
      title: "",
      body: "",
      url: "",
    });
    setEditingArticle(null);
    setShowForm(false);
  }

  async function createOrUpdateArticle(e) {
    e.preventDefault();

    if (!form.title.trim() || activePage === "Home" || activePage === "Admin") {
      alert("Please enter a title and make sure you are on an article page.");
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedArticle),
        });

        if (!res.ok) throw new Error(`Update failed: ${res.status}`);

        resetForm();
        setSelectedArticle(updatedArticle);
      } catch (err) {
        alert(`Could not update article.\nBackend used:\n${API_URL || "same origin"}`);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newArticle),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);

      resetForm();
    } catch (err) {
      alert(`Could not save article.\nBackend used:\n${API_URL || "same origin"}`);
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
    if (activePage === "Home" || activePage === "Admin") return [];

    const categoryArticles = articles.filter(
      (article) => article.category === activePage
    );

    if (!searchTerm.trim()) return categoryArticles;

    const search = searchTerm.toLowerCase();

    return categoryArticles.filter((article) => {
      return (
        article.title?.toLowerCase().includes(search) ||
        article.body?.toLowerCase().includes(search) ||
        article.url?.toLowerCase().includes(search) ||
        article.category?.toLowerCase().includes(search)
      );
    });
  }, [articles, activePage, searchTerm]);

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
                : activePage === "Admin"
                ? "Protected tools, backups, and homelab status."
                : `Articles and notes for ${activePage}.`}
            </p>
          </div>

          {activePage !== "Home" &&
            activePage !== "Admin" &&
            !showForm &&
            !selectedArticle && (
              <button className="gold-button" onClick={openNewArticle}>
                + New {activePage === "Recipes" ? "Recipe" : "Article"}
              </button>
            )}
        </header>

        {activePage === "Home" ? (
          <HomePage news={news} redsGames={redsGames} socket={socket} />
        ) : activePage === "Admin" ? (
          <AdminPage apiUrl={API_URL} />
        ) : (
          <section className="article-page">
            {!showForm && !selectedArticle && (
              <div className="card search-card">
                <label>
                  Search {activePage}
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search titles, notes, recipes, links..."
                  />
                </label>
              </div>
            )}

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