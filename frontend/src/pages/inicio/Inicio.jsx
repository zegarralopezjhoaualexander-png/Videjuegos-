import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import SiteFooter from "../../components/layout/SiteFooter.jsx";
import {
  BENEFITS,
  BRAND_MARK,
  LANDING_COPY,
  MOSAIC_IMAGES,
  NAV_LINKS,
  SITE_NAME,
} from "../../utils/siteContent.js";
import "./Inicio.css";

const MOSAIC_TILES = [...MOSAIC_IMAGES, ...MOSAIC_IMAGES.slice(0, 4)];

function Inicio() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleImageError = (event) => {
    event.currentTarget.style.display = "none";
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="site-header">
        <nav className="site-nav" aria-label="Navegación principal">
          <Link to="/" className="site-brand">
            <span className="brand-badge" aria-hidden="true">
              {BRAND_MARK}
            </span>
            <span className="site-brand__name">{SITE_NAME}</span>
          </Link>

          <button
            type="button"
            className="site-nav__toggle"
            aria-expanded={menuOpen}
            aria-controls="site-nav-menu"
            aria-label={
              menuOpen ? LANDING_COPY.closeMenu : LANDING_COPY.openMenu
            }
            onClick={() => setMenuOpen((current) => !current)}
          >
            <span className="site-nav__toggle-bar" />
            <span className="site-nav__toggle-bar" />
            <span className="site-nav__toggle-bar" />
          </button>

          <div
            id="site-nav-menu"
            className={`site-nav__menu${menuOpen ? " site-nav__menu--open" : ""}`}
          >
            <ul className="site-nav__links">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link
                      to={link.to}
                      className="site-nav__link"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="site-nav__link"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>

            <Link
              to="/login"
              className="neon-button neon-button--secondary site-nav__account"
              onClick={() => setMenuOpen(false)}
            >
              <span className="neon-button__label">
                {LANDING_COPY.account}
              </span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="inicio-main">
        <div className="inicio-bg" aria-hidden="true">
          <div className="inicio-mosaic">
            {MOSAIC_TILES.map((image, index) => (
              <div className="inicio-mosaic__tile" key={`${image}-${index}`}>
                <img
                  src={`/img/${image}`}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                />
              </div>
            ))}
          </div>
        </div>

        <section className="inicio-hero" aria-labelledby="inicio-title">
          <div className="inicio-card neon-panel hud-corners">
            <h1 id="inicio-title" className="inicio-card__title">
              {LANDING_COPY.title}
            </h1>

            <div className="inicio-card__grid">
              <div className="inicio-card__actions">
                {user ? (
                  <>
                    <p className="inicio-greeting">
                      {LANDING_COPY.greeting}{" "}
                      <strong>
                        {user.nombre || LANDING_COPY.fallbackName}
                      </strong>
                    </p>
                    <Link
                      to="/catalogo"
                      className="neon-button neon-button--primary"
                    >
                      <span className="neon-button__label">
                        {LANDING_COPY.goCatalog}
                      </span>
                    </Link>
                    <button
                      type="button"
                      className="neon-button neon-button--secondary"
                      onClick={handleSignOut}
                    >
                      <span className="neon-button__label">
                        {LANDING_COPY.logout}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="neon-button neon-button--primary"
                    >
                      <span className="neon-button__label">
                        {LANDING_COPY.login}
                      </span>
                    </Link>
                    <Link
                      to="/registro"
                      className="neon-button neon-button--secondary"
                    >
                      <span className="neon-button__label">
                        {LANDING_COPY.register}
                      </span>
                    </Link>
                    <p className="inicio-card__hint">
                      {LANDING_COPY.browseHint}{" "}
                      <Link to="/catalogo" className="neon-link">
                        {LANDING_COPY.browseLink}
                      </Link>
                    </p>
                  </>
                )}
              </div>

              <div className="inicio-card__info">
                <p className="inicio-card__description">
                  {LANDING_COPY.description}
                </p>
                <ul className="inicio-benefits">
                  {BENEFITS.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

export default Inicio;
