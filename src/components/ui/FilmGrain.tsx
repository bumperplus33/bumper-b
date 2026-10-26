"use client";

export default function FilmGrain() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* Cinematic 24fps jitter */
        @keyframes film-noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-1%, -1%); }
          20% { transform: translate(1%, 1%); }
          30% { transform: translate(-2%, -1%); }
          40% { transform: translate(1%, -2%); }
          50% { transform: translate(-1%, 2%); }
          60% { transform: translate(2%, 1%); }
          70% { transform: translate(0%, -2%); }
          80% { transform: translate(-2%, 1%); }
          90% { transform: translate(1%, 2%); }
        }
        .animate-film {
          animation: film-noise 0.3s infinite steps(10);
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-film { animation: none; }
        }
      `,
        }}
      />

      <div className="pointer-events-none fixed inset-0 z-50 h-screen w-screen overflow-hidden">
        <div
          // Kept low so the grain sits under the type instead of competing with it
          className="absolute -inset-[50%] h-[200%] w-[200%] opacity-[0.06] mix-blend-difference animate-film"
          style={{
            // baseFrequency='1.2' and numOctaves='2' creates that perfectly uniform, sandy texture
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            // Tightly tiled to keep the grain microscopic
            backgroundSize: "200px 200px",
          }}
        />
      </div>
    </>
  );
}
