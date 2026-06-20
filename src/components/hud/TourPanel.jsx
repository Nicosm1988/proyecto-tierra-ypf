import { PauseCircle, PlayCircle, Route } from "lucide-react";

export default function TourPanel({ activeTourId, onRunCommand, onStopTour, tours }) {
  return (
    <div className="hud-panel-stack" aria-label="Recorridos cinematograficos">
      {tours.map((tour) => {
        const active = activeTourId === tour.id;
        return (
          <article className={active ? "tour-card active" : "tour-card"} key={tour.id}>
            <div>
              <Route aria-hidden="true" size={17} />
              <span>{tour.steps.length} pasos</span>
            </div>
            <h3>{tour.name}</h3>
            <p>{tour.summary}</p>
            <button
              onClick={() => (active ? onStopTour() : onRunCommand("tour", { tour }))}
              type="button"
            >
              {active ? (
                <PauseCircle aria-hidden="true" size={16} />
              ) : (
                <PlayCircle aria-hidden="true" size={16} />
              )}
              <span>{active ? "Pausar" : "Iniciar tour"}</span>
            </button>
          </article>
        );
      })}
    </div>
  );
}
