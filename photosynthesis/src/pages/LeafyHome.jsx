import "./LeafyHome.css";
import background from "../assets/aihomebg.png";
import leafyWave from "../assets/leafywave.png";
import speechBubble from "../assets/leafy-v2/speech-bubble.png";
import iconCircle from "../assets/leafy-v2/icon-circle-a.png";
import iconCamera from "../assets/leafy-v2/icon-camera.png";
import iconMic from "../assets/leafy-v2/icon-microphone.png";
import iconChatHistory from "../assets/leafy-v2/icon-chat-history.png";

const PAST_CHATS = [
  {
    title: "Why are my kale leaves...?",
    snippet: "Over watering is a usual cause...",
    time: "2h ago",
  },
  {
    title: "How often should I water...?",
    snippet: "Basil should be watered when...",
    time: "16h ago",
  },
  {
    title: "What are these bugs on my....?",
    snippet: "These look like aphids, which...",
    time: "21h ago",
  },
];

const TOPIC_CHIPS = [
  "Get Started",
  "Plant Care",
  "My Plants",
  "Problems",
  "Weather",
  "Harvest",
  "Tips",
];

const SUGGESTED_CARDS = [
  {
    title: "How do I get started with gardening?",
    body:
      "Learn the basics, choose your first plants, and get simple guidance to begin.",
  },
  {
    title: "What do I need to start gardening?",
    body:
      "Discover tools, plant ideas, and step-by-step guidance for beginners.",
  },
  {
    title: "Start your garden your way",
    body:
      "Get tips and plant ideas tailored to your space and goals.",
  },
  {
    title: "Not sure where to begin?",
    body:
      "Explore easy plants, beginner tips, and answers to get you growing.",
  },
];

const LeafyHome = () => {
  return (
    <div className="leafy-shell">
      <div className="phone leafy-v2-phone" aria-label="Photosynthesis home">
        <div
          className="leafy-v2"
          style={{ "--leafy-bg": `url(${background})` }}
        >
          <div className="leafy-v2__wash" aria-hidden />

          <div className="leafy-v2__content">
            <button type="button" className="leafy-v2__back" aria-label="Back">
              ‹
            </button>

            <div className="leafy-v2__scroll">
              <section className="leafy-v2__hero-card" aria-labelledby="ask-leafy-heading">
                <div className="leafy-v2__hero-inner">
                  <div className="leafy-v2__mascot" aria-hidden>
                    <img
                      src={leafyWave}
                      alt=""
                      className="leafy-v2__mascot-img"
                    />
                  </div>

                  <div className="leafy-v2__hero-text">
                    <h1 id="ask-leafy-heading" className="leafy-v2__title">
                      Ask Leafy
                    </h1>
                    <p className="leafy-v2__subtitle">
                      Your personal plant assistant
                    </p>

                    <div className="leafy-v2__bubble-wrap">
                      <img
                        src={speechBubble}
                        alt=""
                        className="leafy-v2__bubble-shape"
                      />
                      <p className="leafy-v2__bubble-text">
                        Carrots can taste sweeter after a light frost!
                      </p>
                    </div>

                    <button type="button" className="leafy-v2__cta-talk">
                      Let&apos;s start talking!
                    </button>
                  </div>
                </div>
              </section>

              <section
                className="leafy-v2__mid"
                aria-label="Quick actions and past chats"
              >
                <div className="leafy-v2__mid-left">
                  <article className="leafy-v2__tile">
                    <div className="leafy-v2__tile-head">
                      <span className="leafy-v2__icon-ring">
                        <img src={iconCircle} alt="" />
                        <img
                          src={iconCamera}
                          alt=""
                          className="leafy-v2__iconglyph"
                          width={30}
                          height={30}
                        />
                      </span>
                      <h2 className="leafy-v2__tile-title">Plant Capture</h2>
                    </div>
                    <p className="leafy-v2__tile-desc">
                      Scan your plant to identify problems and get care advice
                    </p>
                    <span className="leafy-v2__chevron" aria-hidden>
                      ›
                    </span>
                  </article>

                  <article className="leafy-v2__tile">
                    <div className="leafy-v2__tile-head">
                      <span className="leafy-v2__icon-ring">
                        <img src={iconCircle} alt="" />
                        <img
                          src={iconMic}
                          alt=""
                          className="leafy-v2__iconglyph"
                          width={30}
                          height={30}
                        />
                      </span>
                      <h2 className="leafy-v2__tile-title">Voice</h2>
                    </div>
                    <p className="leafy-v2__tile-desc">
                      Talk to get instant gardening help, hands-free
                    </p>
                    <span className="leafy-v2__chevron" aria-hidden>
                      ›
                    </span>
                  </article>
                </div>

                <article className="leafy-v2__past">
                  <div className="leafy-v2__past-head">
                    <span className="leafy-v2__icon-ring">
                      <img src={iconCircle} alt="" />
                      <img
                        src={iconChatHistory}
                        alt=""
                        className="leafy-v2__iconglyph leafy-v2__iconglyph--sm"
                        width={26}
                        height={26}
                      />
                    </span>
                    <h2 className="leafy-v2__tile-title">Past Chats</h2>
                  </div>
                  <ul className="leafy-v2__past-list">
                    {PAST_CHATS.map((c) => (
                      <li key={c.title} className="leafy-v2__past-item">
                        <button type="button" className="leafy-v2__past-row">
                          <span className="leafy-v2__past-copy">
                            <span className="leafy-v2__past-title">
                              {c.title}
                            </span>
                            <span className="leafy-v2__past-snippet">
                              {c.snippet}
                            </span>
                            <span className="leafy-v2__past-time">{c.time}</span>
                          </span>
                          <span className="leafy-v2__chevron leafy-v2__chevron--sm" aria-hidden>
                            ›
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </article>
              </section>

              <section
                className="leafy-v2__suggested-head"
                aria-labelledby="suggested-topics-heading"
              >
                <h2 id="suggested-topics-heading" className="leafy-v2__section-title">
                  Suggested Topics
                </h2>
                <div className="leafy-v2__chips" aria-label="Topic categories">
                  {TOPIC_CHIPS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={i === 0}
                      className={
                        i === 0
                          ? "leafy-v2__chip leafy-v2__chip--on"
                          : "leafy-v2__chip"
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </section>

              <section
                className="leafy-v2__grid"
                aria-label="Suggested topic cards"
              >
                {SUGGESTED_CARDS.map((card) => (
                  <article key={card.title} className="leafy-v2__topic-card">
                    <h3 className="leafy-v2__topic-title">{card.title}</h3>
                    <p className="leafy-v2__topic-body">{card.body}</p>
                    <button type="button" className="leafy-v2__go">
                      Let&apos;s go!
                    </button>
                  </article>
                ))}
              </section>
            </div>
          </div>

          <div className="leafy-v2__home-indicator" aria-hidden />
        </div>
      </div>
    </div>
  );
};

export default LeafyHome;
