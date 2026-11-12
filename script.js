/* ===== NAVBAR SCROLL ===== */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

/* ===== HAMBURGER MENU ===== */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ===== SCROLL REVEAL ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

function observeReveals() {
  document.querySelectorAll('.reveal:not(.observed), .reveal-left:not(.observed), .reveal-right:not(.observed)').forEach(el => {
    el.classList.add('observed');
    revealObserver.observe(el);
  });
}
observeReveals();

/* ===== ACTIVE NAV LINK ===== */
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  }
});

/* ===== HERO PARTICLES ===== */
const particlesContainer = document.querySelector('.hero-particles');
if (particlesContainer) {
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.classList.add('hero-particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (8 + Math.random() * 12) + 's';
    particle.style.animationDelay = (Math.random() * 10) + 's';
    particle.style.width = (1 + Math.random() * 2) + 'px';
    particle.style.height = particle.style.width;
    particlesContainer.appendChild(particle);
  }
}

/* ===== LOAD SITE DATA ===== */
async function loadSiteData() {
  // Priority 1: data loaded via <script src="data/site-data.js">
  if (window.__SITE_DATA__) {
    return window.__SITE_DATA__;
  }
  // Priority 2: fetch from server
  try {
    const res = await fetch('data/site.json');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } catch (e) {
    console.warn('Impossible de charger les données du site:', e.message);
    return null;
  }
}

/* ===== PORTFOLIO RENDERING ===== */
const portfolioContent = document.getElementById('portfolio-content');
if (portfolioContent) {
  loadSiteData().then(data => {
    if (!data) return;
    renderPortfolio(data.portfolio);
  });
}

function renderPortfolio(portfolio) {
  const container = document.getElementById('portfolio-content');
  if (!container) return;

  // Render filters
  const filtersContainer = document.getElementById('portfolio-filters');
  if (filtersContainer) {
    filtersContainer.innerHTML = portfolio.filters
      .map(f => `<button ${f.id === 'all' ? 'class="active"' : ''} data-filter="${f.id}">${f.label}</button>`)
      .join('');
  }

  // Render categories and items
  const categories = portfolio.categories.sort((a, b) => a.order - b.order);
  let html = '';

  for (const cat of categories) {
    const items = portfolio.items
      .filter(i => i.category === cat.id)
      .sort((a, b) => a.order - b.order);
    if (items.length === 0) continue;

    html += `<h3 class="portfolio-category"><span class="gold" aria-hidden="true">${cat.icon}</span> ${cat.label}</h3>`;
    html += '<div class="portfolio-grid">';
    for (const item of items) {
      const wideClass = item.wide ? ' portfolio-item--wide' : '';
      html += `<div class="portfolio-item${wideClass}" data-tags="${item.tags.join(' ')}">
        <img src="${item.image}" alt="${item.alt || item.title + ' — ' + item.description}" loading="lazy"${item.width ? ` width="${item.width}" height="${item.height}"` : ''}>
        <div class="overlay">
          <div>
            <h4>${item.title}</h4>
            <p>${item.description}</p>
          </div>
        </div>
      </div>`;
    }
    html += '</div>';
  }

  container.innerHTML = html;
  observeReveals();
  setupPortfolioFilters();
  setupPortfolioLightbox();
}

/* ===== PORTFOLIO FILTERS (event delegation) ===== */
function setupPortfolioFilters() {
  const filtersContainer = document.getElementById('portfolio-filters');
  if (!filtersContainer) return;

  filtersContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    filtersContainer.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    document.querySelectorAll('.portfolio-item[data-tags]').forEach(item => {
      if (filter === 'all' || item.dataset.tags.includes(filter)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    document.querySelectorAll('.portfolio-category').forEach(cat => {
      cat.style.display = filter === 'all' ? '' : 'none';
    });
  });
}

/* ===== PORTFOLIO LIGHTBOX ===== */
function setupPortfolioLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('img');
  let currentIndex = 0;

  function getVisibleItems() {
    return Array.from(document.querySelectorAll('.portfolio-item:not(.hidden)')).filter(item => item.querySelector('img'));
  }

  function openLightbox(index) {
    const visible = getVisibleItems();
    currentIndex = index;
    const img = visible[currentIndex].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    const visible = getVisibleItems();
    currentIndex = (currentIndex + dir + visible.length) % visible.length;
    const next = visible[currentIndex].querySelector('img');
    lightboxImg.src = next.src;
    lightboxImg.alt = next.alt;
  }

  // Use event delegation for dynamically rendered items
  document.getElementById('portfolio-content').addEventListener('click', (e) => {
    const item = e.target.closest('.portfolio-item');
    if (!item) return;
    const visible = getVisibleItems();
    const idx = visible.indexOf(item);
    if (idx !== -1) openLightbox(idx);
  });

  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

/* ===== HOMEPAGE DYNAMIC RENDERING ===== */
const homepageContent = document.getElementById('homepage-dynamic');
if (homepageContent) {
  loadSiteData().then(data => {
    if (!data) return;
    renderHomepage(data);
  });
}

function renderHomepage(data) {
  const h = data.homepage;

  // Hero
  const heroTitle = document.querySelector('.hero-content h1 .line');
  if (heroTitle) {
    heroTitle.innerHTML = `${h.hero.title_line1} <span class="gold">${h.hero.title_line2}</span>`;
  }
  const tagline = document.querySelector('.hero-content .tagline');
  if (tagline) tagline.textContent = h.hero.tagline;

  // Featured piece
  const featuredImg = document.querySelector('.featured-img img');
  if (featuredImg) featuredImg.src = h.featured.image;
  const featuredTitle = document.querySelector('.featured-content h2');
  if (featuredTitle) {
    const titleParts = h.featured.title.split(h.featured.title_gold);
    featuredTitle.innerHTML = titleParts[0] + `<span class="gold">${h.featured.title_gold}</span>` + (titleParts[1] || '');
  }
  const featuredDesc = document.querySelector('.featured-content p');
  if (featuredDesc) featuredDesc.textContent = h.featured.description;

  // Services preview
  const serviceCards = document.querySelectorAll('.service-card');
  h.services_preview.forEach((s, i) => {
    if (serviceCards[i]) {
      serviceCards[i].querySelector('.icon').innerHTML = s.icon;
      const h3 = serviceCards[i].querySelector('h3');
      (h3.querySelector('a') || h3).textContent = s.title;
      serviceCards[i].querySelector('p').textContent = s.description;
    }
  });

  // Featured portfolio
  const portfolioGrid = document.querySelector('.portfolio-grid--home');
  if (portfolioGrid && h.featured_portfolio && h.featured_portfolio.length > 0) {
    const selectedItems = h.featured_portfolio
      .map(id => data.portfolio.items.find(item => item.id === id))
      .filter(Boolean);

    if (selectedItems.length > 0) {
      portfolioGrid.innerHTML = selectedItems.map((item, i) => {
        const wideClass = i === 0 ? ' portfolio-item--wide' : '';
        return `<div class="portfolio-item${wideClass} reveal">
          <img src="${item.image}" alt="${item.alt || item.title}" loading="lazy"${item.width ? ` width="${item.width}" height="${item.height}"` : ''}>
          <div class="overlay"><h3>${item.title}</h3></div>
        </div>`;
      }).join('');
      observeReveals();
    }
  }

  // Process steps
  const processContainer = document.querySelector('.process-steps');
  if (processContainer && h.process_steps) {
    processContainer.innerHTML = h.process_steps.map(s => `
      <div class="process-step reveal">
        <div class="process-number">${s.number}</div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
      </div>
    `).join('');
    observeReveals();
  }
}

/* ===== SERVICES PAGE DYNAMIC RENDERING ===== */
const servicesContent = document.getElementById('services-dynamic');
if (servicesContent) {
  loadSiteData().then(data => {
    if (!data) return;
    renderServices(data.services);
  });
}

function renderServices(services) {
  // Service details
  const detailsContainer = document.getElementById('service-details-container');
  if (detailsContainer) {
    detailsContainer.innerHTML = services.details.map(s => `
      <div class="service-detail reveal">
        <div class="service-detail-img">
          <img src="${s.image}" alt="${s.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div class="service-detail-content">
          <h2 class="service-detail-title">${s.title} <span class="gold">${s.title_gold}</span></h2>
          <span class="price">${s.price}</span>
          <p>${s.description}</p>
          <ul>
            ${s.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
          <p>${s.footer}</p>
          ${s.page ? `<a href="${s.page}" class="btn" style="margin-top:1rem">En savoir plus</a>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Before/After
  const baCAD = document.getElementById('ba-cad-img');
  const baRender = document.getElementById('ba-render-img');
  if (baCAD) baCAD.src = services.before_after.cad_image;
  if (baRender) baRender.src = services.before_after.render_image;

  // Pricing table
  const tbody = document.getElementById('pricing-tbody');
  if (tbody) {
    tbody.innerHTML = services.pricing.map(p =>
      `<tr${p.highlight ? ' class="highlight"' : ''}>
        <td>${p.type}</td>
        <td>${p.price}</td>
      </tr>`
    ).join('');
  }

  const pricingOption = document.getElementById('pricing-option-text');
  if (pricingOption) {
    pricingOption.innerHTML = services.pricing_option;
  }

  observeReveals();
}

/* ===== STATIC PORTFOLIO FILTERS (fallback for non-dynamic pages) ===== */
if (!portfolioContent) {
  const filterButtons = document.querySelectorAll('.portfolio-filters button');
  const allPortfolioItems = document.querySelectorAll('.portfolio-item[data-tags]');
  const portfolioCategories = document.querySelectorAll('.portfolio-category');

  if (filterButtons.length > 0) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        allPortfolioItems.forEach(item => {
          if (filter === 'all' || item.dataset.tags.includes(filter)) {
            item.classList.remove('hidden');
          } else {
            item.classList.add('hidden');
          }
        });

        portfolioCategories.forEach(cat => {
          cat.style.display = filter === 'all' ? '' : 'none';
        });
      });
    });
  }
}

/* ===== STATIC PORTFOLIO LIGHTBOX (fallback) ===== */
if (!portfolioContent) {
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    let currentIndex = 0;
    let visibleImages = [];

    function getVisibleItems() {
      return Array.from(document.querySelectorAll('.portfolio-item:not(.hidden)')).filter(item => item.querySelector('img'));
    }

    function openLightbox(index) {
      visibleImages = getVisibleItems();
      currentIndex = index;
      const img = visibleImages[currentIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function navigate(dir) {
      visibleImages = getVisibleItems();
      currentIndex = (currentIndex + dir + visibleImages.length) % visibleImages.length;
      lightboxImg.src = visibleImages[currentIndex].querySelector('img').src;
    }

    document.querySelectorAll('.portfolio-item').forEach(item => {
      item.addEventListener('click', () => {
        const visible = getVisibleItems();
        const idx = visible.indexOf(item);
        if (idx !== -1) openLightbox(idx);
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }
}

/* ===== CONTACT FORM (Formspree) ===== */
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;

    fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' }
    }).then(response => {
      if (response.ok) {
        contactForm.style.display = 'none';
        document.querySelector('.form-success').style.display = 'block';
        contactForm.reset();
      } else {
        alert('Une erreur est survenue. Veuillez réessayer ou me contacter directement par email.');
      }
    }).catch(() => {
      alert('Erreur de connexion. Veuillez réessayer.');
    }).finally(() => {
      btn.textContent = 'Envoyer ma demande';
      btn.disabled = false;
    });
  });
}
