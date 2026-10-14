document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  const mobileMenuBtn = document.getElementById('mobile-menu');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // 1. Cambio de sombra en el Navbar al hacer scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Toggle del Menú Móvil
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // 3. Resaltado de enlace activo al hacer clic
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');

      // Cerrar menú móvil al hacer click
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
    });
  });
});


//nosotros

// Animación al hacer Scroll para "Sobre Nosotros"
const observerOptions = {
  threshold: 0.25
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

const aboutSection = document.querySelector('.about-section');
if (aboutSection) {
  observer.observe(aboutSection);
}

// ================= CONSUMO DINÁMICO DE ROSTERS DESDE GOOGLE SHEETS =================
document.addEventListener('DOMContentLoaded', () => {
  loadRostersFromGoogleSheet();
  setupRosterToggleEvents();
});

async function loadRostersFromGoogleSheet() {
  // ID de tu nueva Hoja de Google Sheets
  const SHEET_ID = '1x_1q6dWnLE_Wm20Y7MzzeQSMqrNjDjrceVV8E1AEFPQ';
  
  // URL para obtener los datos en formato JSON público
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  const loader = document.getElementById('rosters-loader');
  const container = document.getElementById('rosters-dynamic-container');

  if (!container) return;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Extraer JSON de la respuesta de Google GViz
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const rawData = JSON.parse(jsonString);

    // Mapeo dinámico de columnas por si cambias el orden en Excel
    let cols = { roster: 0, nombre: 1, rol: 2, edad: 3, pais: 4, foto: 5, bio: 6 };

    if (rawData.table.cols && rawData.table.cols.length > 0) {
      rawData.table.cols.forEach((col, idx) => {
        const label = (col.label || col.id || '').toUpperCase();
        if (label.includes('ROSTER')) cols.roster = idx;
        if (label.includes('NOMBRE')) cols.nombre = idx;
        if (label.includes('ROL')) cols.rol = idx;
        if (label.includes('EDAD')) cols.edad = idx;
        if (label.includes('PAIS')) cols.pais = idx;
        if (label.includes('FOTO') || label.includes('IMG')) cols.foto = idx;
        if (label.includes('BIO') || label.includes('SABER')) cols.bio = idx;
      });
    }

    const rows = rawData.table.rows;
    const groupedRosters = {};

    rows.forEach(r => {
      if (!r.c) return;

      const rosterVal = r.c[cols.roster] ? String(r.c[cols.roster].v).trim() : 'General';
      const nombreVal = r.c[cols.nombre] ? r.c[cols.nombre].v : '';
      const rolVal = r.c[cols.rol] ? r.c[cols.rol].v : 'Jugador';
      const edadVal = r.c[cols.edad] ? r.c[cols.edad].v : '-';
      const paisVal = r.c[cols.pais] ? r.c[cols.pais].v : 'Internacional';
      const fotoVal = r.c[cols.foto] ? r.c[cols.foto].v : '';
      const bioVal = r.c[cols.bio] ? r.c[cols.bio].v : 'Sin información disponible.';

      // Omitir fila si vuelve a incluir las cabeceras
      if (String(rosterVal).toUpperCase() === 'ROSTER' || String(nombreVal).toUpperCase() === 'NOMBRE') return;

      if (nombreVal) {
        if (!groupedRosters[rosterVal]) {
          groupedRosters[rosterVal] = [];
        }

        groupedRosters[rosterVal].push({
          nombre: nombreVal,
          rol: rolVal,
          edad: edadVal,
          pais: paisVal,
          foto: fotoVal || 'https://via.placeholder.com/300x350/111/fff?text=FN+PLAYER',
          bio: bioVal
        });
      }
    });

    if (loader) loader.style.display = 'none';

    if (Object.keys(groupedRosters).length === 0) {
      container.innerHTML = '<p class="no-victories">No se encontraron jugadores en la hoja de cálculo.</p>';
      return;
    }

    // Iconos temáticos según el nombre de la categoría
    const getRosterIcon = (name) => {
      const lower = name.toLowerCase();
      if (lower.includes('academia') || lower.includes('acd')) return 'fa-graduation-cap';
      if (lower.includes('sparring')) return 'fa-fist-raised';
      if (lower.includes('a')) return 'fa-crown';
      if (lower.includes('b')) return 'fa-fire';
      return 'fa-shield-alt';
    };

    let htmlOutput = '';

    for (const [rosterName, players] of Object.entries(groupedRosters)) {
      const iconClass = getRosterIcon(rosterName);

      htmlOutput += `
        <div class="roster-category">
          <h3 class="roster-title">
            <i class="fas ${iconClass}"></i> ${rosterName.toUpperCase()}
          </h3>
          <div class="roster-grid">
            ${players.map(p => `
              <div class="player-card">
                <div class="player-photo-wrapper">
                  <img src="${p.foto}" alt="${p.nombre}" class="player-photo" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x350/111/fff?text=FN+PLAYER';">
                  <span class="player-role-badge">${p.rol}</span>
                </div>
                <div class="player-info">
                  <h4 class="player-name">${p.nombre}</h4>
                  <ul class="player-details">
                    <li><i class="fas fa-gamepad"></i> <strong>Rol:</strong> ${p.rol}</li>
                    <li><i class="fas fa-birthday-cake"></i> <strong>Edad:</strong> ${p.edad} años</li>
                    <li><i class="fas fa-globe-americas"></i> <strong>Nacionalidad:</strong> ${p.pais}</li>
                  </ul>
                  
                  <button class="btn-more-info">
                    <span>Saber más</span>
                    <i class="fas fa-chevron-down"></i>
                  </button>
                  
                  <div class="player-bio">
                    <p>${p.bio}</p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = htmlOutput;

  } catch (error) {
    console.error('Error al cargar rosters:', error);
    if (loader) {
      loader.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
        <p>No se pudieron cargar los datos de los rosters. Asegúrate de dar acceso público a la hoja de cálculo.</p>
      `;
    }
  }
}

// Evento delegado para el botón "Saber más" en los jugadores cargados dinámicamente
function setupRosterToggleEvents() {
  const container = document.getElementById('rosters-dynamic-container');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-more-info');
    if (!btn) return;

    const card = btn.closest('.player-card');
    const span = btn.querySelector('span');

    card.classList.toggle('active');

    if (card.classList.contains('active')) {
      span.textContent = 'Ocultar info';
    } else {
      span.textContent = 'Saber más';
    }
  });
}
// ================= CONSUMO DE GOOGLE SHEETS (GALERÍA DE VICTORIAS) =================
document.addEventListener('DOMContentLoaded', () => {
  loadVictoriesFromGoogleSheet();
});

async function loadVictoriesFromGoogleSheet() {
  const SHEET_ID = '1pLAyXbqviit4rQSQyPRyox_OepqHTu9IOGv8fkYZ3WY';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  const loader = document.getElementById('victories-loader');
  const grid = document.getElementById('victories-grid');

  if (!grid) return;

  try {
    const response = await fetch(url);
    const text = await response.text();

    // Extraemos la estructura JSON limpia que devuelve Google GViz API
    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const rawData = JSON.parse(jsonString);

    let eventoIdx = 0;
    let imgIdx = 1;

    // Mapeo dinámico de las columnas 'EVENTO' e 'IMG'
    if (rawData.table.cols && rawData.table.cols.length > 0) {
      rawData.table.cols.forEach((col, idx) => {
        const label = (col.label || col.id || '').toUpperCase();
        if (label.includes('EVENTO')) eventoIdx = idx;
        if (label.includes('IMG')) imgIdx = idx;
      });
    }

    const rows = rawData.table.rows;
    const victories = [];

    rows.forEach(r => {
      if (!r.c) return;

      const eventoVal = r.c[eventoIdx] ? r.c[eventoIdx].v : '';
      const imgVal = r.c[imgIdx] ? r.c[imgIdx].v : '';

      // Omitir fila si vuelve a contener las cabeceras por error de formato
      if (String(eventoVal).toUpperCase() === 'EVENTO' || String(imgVal).toUpperCase() === 'IMG') {
        return;
      }

      if (eventoVal || imgVal) {
        victories.push({
          evento: eventoVal || 'CAMPEONATO FN SPORT',
          img: imgVal || 'https://via.placeholder.com/500x300/111/fff?text=FN+SPORT'
        });
      }
    });

    // Ocultar cargador
    if (loader) loader.style.display = 'none';

    if (victories.length === 0) {
      grid.innerHTML = '<p class="no-victories">Aún no hay triunfos registrados en la hoja de cálculo.</p>';
      return;
    }

    // Renderizar las tarjetas dinámicamente
    grid.innerHTML = victories.map(v => `
      <div class="victory-card">
        <div class="victory-img-wrapper">
          <img 
            src="${v.img}" 
            alt="${v.evento}" 
            class="victory-photo" 
            loading="lazy"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/500x300/111/fff?text=FN+SPORT';"
          >
          <span class="victory-badge"><i class="fas fa-trophy"></i> Victoria</span>
        </div>
        <div class="victory-info">
          <h4 class="victory-title">${v.evento}</h4>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar datos desde Google Sheets:', error);
    if (loader) {
      loader.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
        <p>No se pudo conectar con la hoja de victorias. Verifique que el documento esté en modo público.</p>
      `;
    }
  }
}