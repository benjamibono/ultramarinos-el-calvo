import React, { useState, lazy, Suspense, useEffect } from "react";
import Stories from "react-insta-stories";

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

// Datos de ejemplo para las historias
const stories = [
  {
    url: "src/videos/video1.mp4",
    type: "video",
    preloadResource: false,
    header: {
      heading: "¡Preparando la inauguración! 🍻",
      subheading: "21/11/2024",
      profileImage: "/icon.svg",
    },
  },
  {
    url: "src/videos/video2.mp4",
    type: "video",
    preloadResource: false,
    header: {
      heading: "Volver a casa para cocinar 🏠👨‍🍳",
      subheading: "04/03/2025",
      profileImage: "icon.svg",
    },
  },
  {
    url: "src/videos/video3.mp4",
    type: "video",
    preloadResource: false,
    header: {
      heading: "Team Pacto prueba El Calvo 🍽️",
      subheading: "06/03/2025",
      profileImage: "icon.svg",
    },
  },
  {
    url: "src/videos/video4.mp4",
    type: "video",
    preloadResource: false,
    header: {
      heading: "👨‍🍳 Isaac, Cocina con buen rollo",
      subheading: "09/03/2025",
      profileImage: "icon.svg",
    },
  },
  {
    url: "src/videos/video5.mp4",
    type: "video",
    preloadResource: false,
    header: {
      heading: "Albóndigas que enamoran 😍",
      subheading: "11/03/2025",
      profileImage: "icon.svg",
    },
  },
  {
    url: "src/videos/video6.mp4",
    type: "video",
    preloadResource: false,
    header: {
      heading: "Top 3 platos favoritos 🔥",
      subheading: "12/03/2025",
      profileImage: "icon.svg",
    },
  },
  {
    url: "src/videos/video7.mp4",
    type: "video",
    preloadResource: false,
    header: {
      heading: "Detalles que marcan la diferencia ✨",
      subheading: "14/03/2025",
      profileImage: "icon.svg",
    },
  },
  {
    url: "src/videos/video8.mp4",
    type: "video",
    preloadResource: false,
    header: {
      heading: "Cocina básica, dicen... 🤔",
      subheading: "15/03/2025",
      profileImage: "icon.svg",
    },
  },
];

// Cargar Stories solo cuando se necesite
const StoriesComponent = lazy(() => import("react-insta-stories"));

const InstagramStories = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Precachear el siguiente video
      const nextIndex = currentIndex + 1;
      if (nextIndex < stories.length) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = stories[nextIndex].url;
        link.as = "video";
        document.head.appendChild(link);
      }
    }
  }, [isOpen, currentIndex]);

  if (typeof window === "undefined") return null;

  return (
    <>
      {/* Círculo de preview */}
      <button
        onClick={() => setIsOpen(true)}
        className="stories-preview-button"
        aria-label="Ver historias"
      >
        <div className="stories-preview-circle">
          <ProfileImage
            src="/icon.svg"
            alt="Stories preview"
            className="stories-preview-image"
          />
        </div>
      </button>

      {/* Modal de stories */}
      {isOpen && (
        <div className="stories-modal">
          <div className="stories-container">
            <button
              onClick={() => setIsOpen(false)}
              className="close-button"
              aria-label="Cerrar historias"
            >
              ×
            </button>
            <Suspense fallback={<div className="loading">Cargando...</div>}>
              <StoriesComponent
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
                preloadCount={2}
              />
            </Suspense>
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
        }

        .stories-preview-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
          padding: 2px;
          margin: 0 8px;
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
