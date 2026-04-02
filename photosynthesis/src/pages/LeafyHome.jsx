import "./LeafyHome.css";
import bg from "../assets/aihomebg.png";
import mascot from "../assets/leafywave.png";

const LeafyHome = () => {
  return (
    <div className="leafy-shell">
      <div className="phone" aria-label="Photosynthesis home">
        <div
          className="leafy-bg"
          style={{ backgroundImage: `url(${bg})` }}
          role="presentation"
        />
        <div className="leafy-scrim" aria-hidden />

        <div className="leafy-stack">
          <header className="leafy-header">
            <div className="leafy-brand" aria-hidden>
              <svg
                className="leafy-brand__mark"
                viewBox="0 0 32 32"
                width="28"
                height="28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 4c-4.5 4.8-7 10.2-7 15.5 0 3.8 2.2 6.8 5 8.5h4c2.8-1.7 5-4.7 5-8.5C23 14.2 20.5 8.8 16 4Z"
                  fill="rgba(255,255,255,0.92)"
                />
                <path
                  d="M16 8c-2.8 3.2-4.5 7-4.5 11.2 0 2.5 1.2 4.5 2.8 5.8h3.4c1.6-1.3 2.8-3.3 2.8-5.8C20.5 15 18.8 11.2 16 8Z"
                  fill="rgba(92,125,92,0.35)"
                />
              </svg>
            </div>
            <h1 className="leafy-title">Photosynthesis</h1>
            <p className="leafy-tagline">
              Your space, your plants — guided step by step.
            </p>
          </header>

          <div className="leafy-mid" aria-hidden>
            <img
              src={mascot}
              alt=""
              className="leafy-mascot"
              width={220}
              height={280}
            />
          </div>

          <div className="leafy-bottom">
            <article className="leafy-card">
              <h2>Start your garden your way</h2>
              <p>
                Get tips and plant ideas tailored to your space and goals.
              </p>
              <button type="button">Let&apos;s go!</button>
            </article>

            <article className="leafy-card">
              <h2>Not sure where to begin?</h2>
              <p>
                Explore easy plants, beginner tips, and answers to get you
                growing.
              </p>
              <button type="button">Let&apos;s go!</button>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeafyHome;
