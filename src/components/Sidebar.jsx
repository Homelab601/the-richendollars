export default function Sidebar({
  navItems,
  activePage,
  onChangePage,
}) {
  return (
    <aside className="sidebar">
      <div className="logo-orb">R</div>

      <h2>The Richendollars</h2>

      <p>Family • Home • Future</p>

      <nav>
        {navItems.map((item) => (
          <button
            key={item}
            className={
              activePage === item
                ? "nav-button active"
                : "nav-button"
            }
            onClick={() => onChangePage(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}