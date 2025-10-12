import React from "react";
import "./Gallery.css"; // import custom CSS

export const Gallery = ({ galleries = [] }) => {
  const visibleGalleries = Array.isArray(galleries)
    ? galleries.filter((g) => g && (g.isVisible ?? true))
    : [];

  if (visibleGalleries.length === 0) return null;

  return (
    <section
      className="py-5 px-3 my-2"
      style={{
        background: "linear-gradient(to left, #66023c, #cd1c18)",
      }}
    >
      <div className="container">
        {visibleGalleries.map((gallery) => {
          const items = Array.isArray(gallery.items)
            ? gallery.items.filter((it) => it?.imageUrl)
            : [];

          return (
            <div
              key={gallery.id}
              className="mb-5 p-4 rounded-4 shadow-lg bg-dark bg-opacity-50"
            >
              {/* Heading */}
              {gallery.heading && (
                <h2 className="display-5 fw-bold text-white text-center mb-4">
                  {gallery.heading}
                </h2>
              )}

              {/* Description */}
              {gallery.description && (
                <div
                  className="text-white-50 text-center mb-4"
                  dangerouslySetInnerHTML={{ __html: gallery.description }}
                />
              )}

              {/* Image Grid */}
              {items.length > 0 ? (
                <div className="row g-3">
                  {items.map((item) => (
                    <div
                      key={item.id || item.imageUrl}
                      className="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center"
                    >
                      <div
                        className="gallery-card bg-dark bg-opacity-25 rounded shadow-sm overflow-hidden d-flex align-items-center justify-content-center"
                        style={{ width: "10rem", height: "8rem" }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.caption || "Gallery image"}
                          className="img-fluid w-100 h-100"
                          style={{ objectFit: "cover" }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white-50 text-center">
                  No images available.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
