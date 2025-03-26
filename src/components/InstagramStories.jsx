import React, { useState, useEffect } from "react";
import Stories from "react-insta-stories";
import { getAllVideos } from "../lib/supabase";

// Componente optimizado para la imagen de perfil
const ProfileImage = ({ src, alt, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      width={40}
      height={40}
    />
  );
};

const InstagramStories = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true);
        setError(null);
        console.log("Cargando videos desde Supabase...");
        const videos = await getAllVideos();

        console.log("Videos recibidos de Supabase:", videos);

        // Si no hay videos, establecer un mensaje de error
        if (!videos || videos.length === 0) {
          console.log("No se encontraron videos en Supabase");
          setError(
            "No se encontraron videos. Verifica que los videos estén subidos al bucket 'videos' en Supabase."
          );
          setStories([]);
          return;
        }

        // Títulos personalizados para cada video
        const videoTitles = {
          "video1.mp4": "¡Preparando la inauguración! 🍻",
          "video2.mp4": "Volver a casa para cocinar 🏠👨‍🍳",
          "video3.mp4": "Team Pacto prueba El Calvo 🍽️",
          "video4.mp4": "👨‍🍳 Isaac, Cocina con buen rollo",
          "video5.mp4": "Albóndigas que enamoran 😍",
          "video6.mp4": "Top 3 platos favoritos 🔥",
          "video7.mp4": "Detalles que marcan la diferencia ✨",
          "video8.mp4": "Cocina básica, dicen... 🤔",
          "video9.mp4": "Gracias por hacerlo posible ❤️",
          "video10.mp4": "Producto del bueno, directo del mercado a tu plato 🥘",
          "video11.mp4": "Lucía, la reina de la sala en El Calvo 👑",
          "video12.mp4": "La mejor croqueta del mundo 🏆 Un homenaje a @canitasmaite_res 💫",
          // Añade más títulos según necesites
        };

        // Convertir los videos a formato de stories
        const formattedStories = videos.map((video, index) => {
          // Añadir un parámetro de consulta único para evitar problemas de caché
          const uniqueUrl = `${video.url}?index=${index}&t=${Date.now()}`;

          return {
            url: uniqueUrl,
            type: "video",
            header: {
              heading: "Ultramarinos El Calvo",
              subheading:
                videoTitles[video.name] ||
                `Video ${index + 1} de ${videos.length}`,
              profileImage: "/icon.svg",
            },
          };
        });

        console.log(
          "Orden final de stories:",
          formattedStories
            .map((s, i) => `${i + 1}: ${s.url.split("/").pop()}`)
            .join(", ")
        );
        setStories(formattedStories);
        console.log(`Videos cargados con éxito: ${formattedStories.length}`);
        console.log(
          "URLs de los videos:",
          formattedStories.map((story) => story.url).join("\n")
        );
      } catch (error) {
        console.error("Error al cargar los videos:", error);
        setError(
          `Error al cargar los videos: ${error.message || "Error desconocido"}`
        );
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Botón de stories clickado");
    setIsOpen(true);
  };

  if (typeof window === "undefined") return null;

  return (
    <>
      {/* Círculo de preview */}
      <button
        onClick={handleClick}
        className="stories-preview-button"
        aria-label="Ver historias"
        disabled={loading || (stories.length === 0 && !error)}
      >
        <div className={`stories-preview-circle ${loading ? "loading" : ""}`}>
          <ProfileImage
            src="/icon.svg"
            alt="Ultramarinos El Calvo Stories"
            className="stories-preview-image"
          />
        </div>
      </button>

      {/* Modal de stories */}
      {isOpen && stories.length > 0 && (
        <div className="stories-modal">
          <div className="stories-container">
            <button
              onClick={() => setIsOpen(false)}
              className="close-button"
              aria-label="Cerrar historias"
            >
              ×
            </button>
            <Stories
              stories={stories}
              defaultInterval={8000}
              width="100%"
              height="100%"
              storyStyles={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              loop={true}
              keyboardNavigation={true}
              preloadCount={1}
            />
          </div>
        </div>
      )}

      {/* Mensaje de error o carga */}
      {isOpen && (error || stories.length === 0) && (
        <div className="stories-modal">
          <div className="stories-container">
            <button
              onClick={() => setIsOpen(false)}
              className="close-button"
              aria-label="Cerrar historias"
            >
              ×
            </button>
            <div className="error-message">
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <p>Cargando videos...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <p className="error-title">Error</p>
                  <p>{error}</p>
                  <p className="error-help">Verifica que:</p>
                  <ul>
                    <li>
                      Los videos estén subidos al bucket 'videos' en Supabase
                    </li>
                    <li>Las políticas de acceso permitan leer los archivos</li>
                    <li>Las credenciales de Supabase sean correctas</li>
                  </ul>
                </div>
              ) : (
                "No hay videos disponibles"
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .stories-preview-button {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          outline: none;
          position: relative;
          z-index: 60;
        }

        .stories-preview-button:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .stories-preview-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          padding: 2px;
          margin: 0 8px;
          transition: transform 0.2s ease;
        }

        .stories-preview-button:hover .stories-preview-circle {
          transform: scale(1.1);
        }

        .stories-preview-circle.loading {
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        .stories-preview-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: contain;
          border: 2px solid white;
          padding: 2px;
          background: white;
        }

        .stories-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .stories-container {
          position: relative;
          width: 100%;
          height: 100vh;
          max-width: 540px;
          max-height: 90vh;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          background: black;
          border-radius: 12px;
          overflow: hidden;
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          color: white;
          font-size: 32px;
          cursor: pointer;
          z-index: 1001;
        }

        .error-message {
          color: white;
          font-size: 18px;
          text-align: center;
          padding: 20px;
          max-width: 80%;
          margin: 0 auto;
        }

        .error-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #ff4d4d;
        }

        .error-container {
          background: rgba(0, 0, 0, 0.7);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .error-help {
          margin-top: 20px;
          font-weight: bold;
        }

        .error-container ul {
          text-align: left;
          margin-top: 10px;
          padding-left: 20px;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .stories-modal {
            background: black;
            padding: 0;
          }
          
          .stories-container {
            max-width: 100%;
            max-height: 100vh;
            border-radius: 0;
          }
        }
      `}</style>
    </>
  );
};

export default InstagramStories;
