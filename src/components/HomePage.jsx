import NewsWidget from "./NewsWidget";
import RedsWidget from "./RedsWidget";
import WeatherWidget from "./WeatherWidget";
import FridgeNotes from "./FridgeNotes";

export default function HomePage({ news, redsGames, socket }) {
  return (
    <section className="home-layout">
      <div className="card calendar-card">
        <div className="card-header">
          <div>
            <h2>Family Calendar</h2>
            <p>The Richendollars Family Schedule</p>
          </div>
        </div>

        <iframe
          title="family-calendar"
          src="https://calendar.google.com/calendar/embed?src=kyleegoodwin11%40gmail.com&src=j.pauline93%40gmail.com&ctz=America%2FNew_York"
        ></iframe>
      </div>

      <div className="bottom-widgets">
        <NewsWidget news={news} />
        <RedsWidget redsGames={redsGames} />
      </div>

      <WeatherWidget />

      <FridgeNotes socket={socket} />
    </section>
  );
}