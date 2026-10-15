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



//frases
// Animación de Aparición para la Sección de Frases
const quotesObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

const quotesSection = document.querySelector('.quotes-section');
if (quotesSection) {
  quotesObserver.observe(quotesSection);
}


// ================= CONSUMO DINÁMICO DEL STAFF DESDE GOOGLE SHEETS =================
document.addEventListener('DOMContentLoaded', () => {
  loadStaffFromGoogleSheet();
});

async function loadStaffFromGoogleSheet() {
  // ID de tu Google Sheet para el Staff
  const SHEET_ID = '1Ur_hK9L-rRRiGFjU9_qos1d7Co9XVcWLAJ-2t40LWQw';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  const loader = document.getElementById('staff-loader');
  const container = document.getElementById('staff-dynamic-container');

  if (!container) return;

  try {
    const response = await fetch(url);
    const text = await response.text();

    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const rawData = JSON.parse(jsonString);

    // Mapeo dinámico de columnas (NOMBRE, ROL, PAIS, EDAD, FOTO/IMG, INSTAGRAM, FACEBOOK, TIKTOK)
    let cols = { nombre: 0, rol: 1, pais: 2, edad: 3, foto: 4, instagram: 5, facebook: 6, tiktok: 7 };

    if (rawData.table.cols && rawData.table.cols.length > 0) {
      rawData.table.cols.forEach((col, idx) => {
        const label = (col.label || col.id || '').toUpperCase();
        if (label.includes('NOMBRE')) cols.nombre = idx;
        if (label.includes('ROL')) cols.rol = idx;
        if (label.includes('PAIS')) cols.pais = idx;
        if (label.includes('EDAD')) cols.edad = idx;
        if (label.includes('FOTO') || label.includes('IMG')) cols.foto = idx;
        if (label.includes('INSTAGRAM') || label.includes('IG')) cols.instagram = idx;
        if (label.includes('FACEBOOK') || label.includes('FB')) cols.facebook = idx;
        if (label.includes('TIKTOK') || label.includes('TK')) cols.tiktok = idx;
      });
    }

    const rows = rawData.table.rows;
    const staffMembers = [];

    rows.forEach(r => {
      if (!r.c) return;

      const nombreVal = r.c[cols.nombre] ? r.c[cols.nombre].v : '';
      const rolVal = r.c[cols.rol] ? r.c[cols.rol].v : 'Staff';
      const paisVal = r.c[cols.pais] ? r.c[cols.pais].v : 'Internacional';
      const edadVal = r.c[cols.edad] ? r.c[cols.edad].v : '-';
      const fotoVal = r.c[cols.foto] ? r.c[cols.foto].v : '';
      const igVal = r.c[cols.instagram] ? r.c[cols.instagram].v : '';
      const fbVal = r.c[cols.facebook] ? r.c[cols.facebook].v : '';
      const tkVal = r.c[cols.tiktok] ? r.c[cols.tiktok].v : '';

      // Omitir cabeceras si se leen de nuevo
      if (String(nombreVal).toUpperCase() === 'NOMBRE' || String(rolVal).toUpperCase() === 'ROL') return;

      if (nombreVal) {
        staffMembers.push({
          nombre: nombreVal,
          rol: rolVal,
          pais: paisVal,
          edad: edadVal,
          foto: fotoVal,
          instagram: igVal,
          facebook: fbVal,
          tiktok: tkVal
        });
      }
    });

    if (loader) loader.style.display = 'none';

    if (staffMembers.length === 0) {
      container.innerHTML = '<p class="no-victories">No se encontraron miembros del staff registrados.</p>';
      return;
    }

    // Renderizado dinámico de tarjetas con Redes Sociales
    container.innerHTML = staffMembers.map(m => {
      // Generar botones solo para las redes que tengan enlace
      let socialButtons = '';
      if (m.instagram) {
        socialButtons += `<a href="${m.instagram}" target="_blank" class="staff-social-btn" title="Instagram"><i class="fab fa-instagram"></i></a>`;
      }
      if (m.facebook) {
        socialButtons += `<a href="${m.facebook}" target="_blank" class="staff-social-btn" title="Facebook"><i class="fab fa-facebook-f"></i></a>`;
      }
      if (m.tiktok) {
        socialButtons += `<a href="${m.tiktok}" target="_blank" class="staff-social-btn" title="TikTok"><i class="fab fa-tiktok"></i></a>`;
      }

      return `
        <div class="staff-card">
          <div class="staff-avatar-wrapper">
            ${m.foto ? 
              `<img src="${m.foto}" alt="${m.nombre}" class="staff-avatar" onerror="this.onerror=null; this.src='https://via.placeholder.com/250x250/111/fff?text=FN';">` : 
              `<i class="fas fa-user-shield staff-icon-placeholder"></i>`
            }
          </div>
          <span class="staff-role-badge">${m.rol}</span>
          <h3 class="staff-name">${m.nombre}</h3>
          
          <ul class="staff-details-list">
            <li><i class="fas fa-globe-americas"></i> <strong>${m.pais}</strong></li>
            <li><i class="fas fa-birthday-cake"></i> <strong>${m.edad} años</strong></li>
          </ul>

          ${socialButtons ? `<div class="staff-social-links">${socialButtons}</div>` : ''}
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error al cargar el Staff:', error);
    if (loader) {
      loader.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
        <p>No se pudieron cargar los datos del Staff. Asegúrate de otorgar acceso público a la hoja de cálculo.</p>
      `;
    }
  }
}




//
/// ================= ANIMACIÓN MÁQUINA DE ESCRIBIR ÉPICA (SPONSORS - FN ESPORT) =================
document.addEventListener('DOMContentLoaded', () => {
  const phrases = [
    "ÚNETE A FN ESPORT",
    "INVIERTE EN LA VICTORIA",
    "SOMOS FN ESPORT",
    "SÉ NUESTRO SPONSOR",
    "HAZ HISTORIA CON NOSOTROS",
    "DOMINA EL COMPETITIVO",
    "EL FUTURO ES FN ESPORT"
  ];

  const targetElement = document.getElementById('dynamic-sponsor-text');
  if (!targetElement) return;

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 65;    // Velocidad de escritura
  const deletingSpeed = 35;  // Velocidad de borrado
  const pauseTime = 1800;    // Tiempo que se muestra cada frase en pantalla

  function typeEffect() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      targetElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
    } else {
      targetElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
    }

    let nextSpeed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentPhrase.length) {
      nextSpeed = pauseTime;
      isDeleting = true;
    } 
    else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      nextSpeed = 300;
    }

    setTimeout(typeEffect, nextSpeed);
  }

  typeEffect();
});


// ================= CONSUMO DINÁMICO DE SPONSORS DESDE GOOGLE SHEETS =================
document.addEventListener('DOMContentLoaded', () => {
  loadSponsorsFromGoogleSheet();
});

async function loadSponsorsFromGoogleSheet() {
  // ID de la Hoja de Cálculo de Sponsors
  const SHEET_ID = '158f-BBBHiDbsOsz-y53wbI5BipnHvEBa81o1-_eY5ZY';
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

  const loader = document.getElementById('sponsors-loader');
  const container = document.getElementById('sponsors-dynamic-container');

  if (!container) return;

  try {
    const response = await fetch(url);
    const text = await response.text();

    const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
    const rawData = JSON.parse(jsonString);

    // Mapeo flexible de columnas (NOMBRE, LOGO, ROL, INSTAGRAM, FACEBOOK, TIKTOK)
    let cols = { nombre: 0, logo: 1, rol: 2, instagram: 3, facebook: 4, tiktok: 5 };

    if (rawData.table.cols && rawData.table.cols.length > 0) {
      rawData.table.cols.forEach((col, idx) => {
        const label = (col.label || col.id || '').toUpperCase();
        if (label.includes('NOMBRE')) cols.nombre = idx;
        if (label.includes('LOGO') || label.includes('IMG')) cols.logo = idx;
        if (label.includes('ROL') || label.includes('TIPO')) cols.rol = idx;
        if (label.includes('INSTAGRAM') || label.includes('IG')) cols.instagram = idx;
        if (label.includes('FACEBOOK') || label.includes('FB')) cols.facebook = idx;
        if (label.includes('TIKTOK') || label.includes('TK')) cols.tiktok = idx;
      });
    }

    const rows = rawData.table.rows;
    const sponsorsList = [];

    rows.forEach(r => {
      if (!r.c) return;

      const nombreVal = r.c[cols.nombre] ? r.c[cols.nombre].v : '';
      const logoVal = r.c[cols.logo] ? r.c[cols.logo].v : '';
      const rolVal = r.c[cols.rol] ? r.c[cols.rol].v : 'Sponsor Oficial';
      const igVal = r.c[cols.instagram] ? r.c[cols.instagram].v : '';
      const fbVal = r.c[cols.facebook] ? r.c[cols.facebook].v : '';
      const tkVal = r.c[cols.tiktok] ? r.c[cols.tiktok].v : '';

      // Omitir fila si es la cabecera
      if (String(nombreVal).toUpperCase() === 'NOMBRE' || String(logoVal).toUpperCase() === 'LOGO') return;

      if (nombreVal || logoVal) {
        sponsorsList.push({
          nombre: nombreVal || 'Marca Aliada',
          logo: logoVal,
          rol: rolVal,
          instagram: igVal,
          facebook: fbVal,
          tiktok: tkVal
        });
      }
    });

    if (loader) loader.style.display = 'none';

    if (sponsorsList.length === 0) {
      container.innerHTML = '<p class="no-victories">No se encontraron sponsors registrados por el momento.</p>';
      return;
    }

    // Generar HTML dinámico
    container.innerHTML = sponsorsList.map(s => {
      // Construir iconos de redes solo si existe el enlace
      let socialButtons = '';
      if (s.instagram) {
        socialButtons += `<a href="${s.instagram}" target="_blank" class="sponsor-social-btn" title="Instagram"><i class="fab fa-instagram"></i></a>`;
      }
      if (s.facebook) {
        socialButtons += `<a href="${s.facebook}" target="_blank" class="sponsor-social-btn" title="Facebook"><i class="fab fa-facebook-f"></i></a>`;
      }
      if (s.tiktok) {
        socialButtons += `<a href="${s.tiktok}" target="_blank" class="sponsor-social-btn" title="TikTok"><i class="fab fa-tiktok"></i></a>`;
      }

      return `
        <div class="sponsor-card">
          <div class="sponsor-logo-wrapper">
            ${s.logo ? 
              `<img src="${s.logo}" alt="${s.nombre}" class="sponsor-logo-img" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x100/111/fff?text=${encodeURIComponent(s.nombre)}';">` : 
              `<i class="fas fa-handshake" style="font-size: 3rem; color: #555;"></i>`
            }
          </div>
          <span class="sponsor-card-role">${s.rol}</span>
          <h3 class="sponsor-card-title">${s.nombre}</h3>
          
          ${socialButtons ? `<div class="sponsor-social-links">${socialButtons}</div>` : ''}
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Error al cargar los Sponsors:', error);
    if (loader) {
      loader.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
        <p>No se pudieron cargar los Sponsors. Verifica que la hoja de cálculo sea pública.</p>
      `;
    }
  }
}

// ================= MOTOR DE DESTRUCCIÓN DE MURO (FN ESPORT) =================
document.addEventListener('DOMContentLoaded', () => {
  initWallDestruction();
});

function initWallDestruction() {
  const canvas = document.getElementById('wallCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const revealContent = document.getElementById('fnRevealContent');
  const btnAutoFire = document.getElementById('btnAutoFire');
  const btnRepairWall = document.getElementById('btnRepairWall');

  let width, height;
  let shards = [];
  let particles = [];
  let decals = [];
  let wallIntact = true;
  let destructionRatio = 0;
  let audioCtx = null;

  // Sintetizador de Audio Táctico
  function playGunshotSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const bufferSize = audioCtx.sampleRate * 0.15;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.12);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.7, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      // Ignorar restricciones de auto-audio si el usuario aún no ha interactuado
    }
  }

  function resizeCanvas() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.clientWidth;
    height = canvas.height = parent.clientHeight;
    if (shards.length === 0 || wallIntact) {
      buildWallGrid();
    }
  }

  // Generación de bloques de concreto Voronoi
  function buildWallGrid() {
    shards = [];
    particles = [];
    decals = [];
    destructionRatio = 0;
    wallIntact = true;
    if (revealContent) revealContent.classList.remove('revealed');

    const cols = Math.ceil(width / 70);
    const rows = Math.ceil(height / 70);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * 70 + (Math.random() - 0.5) * 20;
        const y = r * 70 + (Math.random() - 0.5) * 20;
        const w = 70 + (Math.random() - 0.5) * 15;
        const h = 70 + (Math.random() - 0.5) * 15;

        shards.push({
          x: x,
          y: y,
          w: w,
          h: h,
          vx: 0,
          vy: 0,
          rot: 0,
          vRot: 0,
          broken: false,
          alpha: 1,
          color: Math.random() > 0.5 ? '#1a1a1a' : '#111111'
        });
      }
    }
  }

  // Creación de impacto y física de escombros
  function createImpact(x, y, power = 1) {
    playGunshotSound();

    decals.push({ x, y, radius: (15 + Math.random() * 20) * power });

    // Partículas de humo y chispas
    for (let i = 0; i < 25 * power; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 8) * power;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color: Math.random() > 0.4 ? '#ffffff' : '#888888',
        life: 1,
        decay: 0.02 + Math.random() * 0.03
      });
    }

    // Impulso sobre bloques cercanos
    let brokenCount = 0;
    shards.forEach(shard => {
      const dx = (shard.x + shard.w / 2) - x;
      const dy = (shard.y + shard.h / 2) - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const forceRadius = 180 * power;

      if (dist < forceRadius) {
        shard.broken = true;
        const force = ((forceRadius - dist) / forceRadius) * 14 * power;
        const angle = Math.atan2(dy, dx);

        shard.vx += Math.cos(angle) * force + (Math.random() - 0.5) * 4;
        shard.vy += Math.sin(angle) * force + (Math.random() - 0.5) * 4;
        shard.vRot += (Math.random() - 0.5) * 0.3 * power;
      }

      if (shard.broken) brokenCount++;
    });

    destructionRatio = brokenCount / shards.length;

    if (destructionRatio > 0.45 && revealContent) {
      revealContent.classList.add('revealed');
    }
  }

  // Ráfaga automática
  let isBursting = false;
  function triggerBurst() {
    if (isBursting) return;
    isBursting = true;
    let shots = 0;
    const maxShots = 14;

    const interval = setInterval(() => {
      const rx = width * 0.15 + Math.random() * (width * 0.7);
      const ry = height * 0.15 + Math.random() * (height * 0.7);
      createImpact(rx, ry, 1.3);

      shots++;
      if (shots >= maxShots) {
        clearInterval(interval);
        isBursting = false;
      }
    }, 90);
  }

  // Bucle de Renderizado
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Dibujar fondo oscuro detrás del muro
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // Renderizar Bloques / Esquinas
    shards.forEach(shard => {
      if (shard.alpha <= 0) return;

      ctx.save();
      if (shard.broken) {
        shard.x += shard.vx;
        shard.y += shard.vy;
        shard.vy += 0.35; // Gravedad
        shard.rot += shard.vRot;
        shard.alpha -= 0.012;
      }

      ctx.translate(shard.x + shard.w / 2, shard.y + shard.h / 2);
      ctx.rotate(shard.rot);
      ctx.globalAlpha = Math.max(0, shard.alpha);

      ctx.fillStyle = shard.color;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.rect(-shard.w / 2, -shard.h / 2, shard.w, shard.h);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    });

    // Renderizar marcas de disparo (Decals)
    decals.forEach(d => {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Renderizar partículas de chispas
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(idx, 1);
        return;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  // Event Listeners
  window.addEventListener('resize', resizeCanvas);
  
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createImpact(x, y, 1);
  });

  if (btnAutoFire) btnAutoFire.addEventListener('click', triggerBurst);
  if (btnRepairWall) btnRepairWall.addEventListener('click', buildWallGrid);

  // Inicializar
  resizeCanvas();
  render();
}