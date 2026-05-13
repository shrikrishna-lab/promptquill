import { useState } from 'react';

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#080808',
    borderBottom: '1px solid #1a1a1a',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#a3e635',
    fontSize: '22px',
    fontWeight: 700,
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  icon: { fontSize: '24px' },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  link: {
    color: '#888',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  userBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: '16px',
    paddingLeft: '16px',
    borderLeft: '1px solid #1a1a1a',
  },
  avatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#a3e635',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
  },
  userName: { color: '#fff', fontSize: '14px' },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '28px',
    cursor: 'pointer',
    padding: '4px',
  },
  mobileMenu: {
    position: 'fixed',
    top: '64px',
    left: 0,
    right: 0,
    backgroundColor: '#080808',
    borderBottom: '1px solid #1a1a1a',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
};

const linkHover = { color: '#a3e635' };

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(null);

  const links = [
    { label: 'Dashboard', href: '/ai' },
    { label: 'Settings', href: '/settings' },
  ];

  const navLinks = (
    <>
      {links.map(l => (
        <a
          key={l.href}
          href={l.href}
          style={{ ...styles.link, ...(hovered === l.label ? linkHover : {}) }}
          onMouseEnter={() => setHovered(l.label)}
          onMouseLeave={() => setHovered(null)}
        >
          {l.label}
        </a>
      ))}
    </>
  );

  return (
    <nav style={styles.nav}>
      <a href="/" style={styles.brand}>
        <span style={styles.icon}>&#x1F4BB;</span>
        PromptQuill
      </a>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ ...styles.links, display: 'none' }} className="nav-links-desktop">
          {navLinks}
        </div>

        <button
          style={styles.hamburger}
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
        >
          {menuOpen ? '\u2715' : '\u2630'}
        </button>
      </div>

      {menuOpen && (
        <div style={styles.mobileMenu} className="nav-mobile-menu">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              style={{ ...styles.link, ...(hovered === l.label ? linkHover : {}) }}
              onMouseEnter={() => setHovered(l.label)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}

        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
        @media (min-width: 769px) {
          .nav-links-desktop { display: flex !important; }
          .nav-hamburger { display: none !important; }
          .nav-mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
