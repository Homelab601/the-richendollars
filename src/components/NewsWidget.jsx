export default function NewsWidget({ news }) {
  return (
    <div className="card">
      <h2>Local News</h2>

      <div className="headline-list">
        {news.length > 0 ? (
          news.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noreferrer"
            >
              {item.title}
            </a>
          ))
        ) : (
          <>
            <a
              href="https://www.wowktv.com/news/local/"
              target="_blank"
              rel="noreferrer"
            >
              WOWK Local News
            </a>

            <a
              href="https://wchstv.com/"
              target="_blank"
              rel="noreferrer"
            >
              WCHS Eyewitness News
            </a>

            <a
              href="https://www.wsaz.com/"
              target="_blank"
              rel="noreferrer"
            >
              WSAZ NewsChannel 3
            </a>
          </>
        )}
      </div>
    </div>
  );
}