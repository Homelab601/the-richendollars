export default function RedsWidget({ redsGames }) {
  const liveGame = redsGames.find((game) =>
    ["Live", "In Progress", "Warmup", "Pre-Game"].includes(
      game.status.abstractGameState
    )
  );

  const nextThreeGames = redsGames
    .filter((game) => game.status.abstractGameState === "Preview")
    .slice(0, 3);

  function gameLabel(game) {
    return `${game.teams.away.team.name} @ ${game.teams.home.team.name}`;
  }

  function gameTime(dateString) {
    return new Date(dateString).toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function inningStatus(game) {
    if (!game?.linescore) return game?.status?.detailedState || "Scheduled";

    const inning = game.linescore.currentInningOrdinal;
    const state = game.linescore.inningState;
    const outs = game.linescore.outs;

    if (!inning || !state) return game.status.detailedState;

    return `${state} ${inning} • ${outs ?? 0} out${outs === 1 ? "" : "s"}`;
  }

  return (
    <div className="card">
      <h2>Cincinnati Reds</h2>

      {liveGame ? (
        <div className="live-game">
          <span className="live-pill">LIVE</span>

          <p>{gameLabel(liveGame)}</p>

          <div className="score-row">
            <span>{liveGame.teams.away.score ?? 0}</span>
            <em>-</em>
            <span>{liveGame.teams.home.score ?? 0}</span>
          </div>

          <small>{inningStatus(liveGame)}</small>
        </div>
      ) : (
        <p className="empty">No live Reds game right now.</p>
      )}

      <h3 className="section-subtitle">Next 3 Games</h3>

      <div className="game-list">
        {nextThreeGames.length > 0 ? (
          nextThreeGames.map((game) => (
            <div className="game-card" key={game.gamePk}>
              <p>{gameLabel(game)}</p>
              <small>{gameTime(game.gameDate)}</small>
            </div>
          ))
        ) : (
          <p className="empty">No upcoming games found.</p>
        )}
      </div>
    </div>
  );
}