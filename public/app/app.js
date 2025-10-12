// Actualizar año
document.getElementById('year').textContent = new Date().getFullYear();

// Contadores animados para la sección hero
function animateCounter(elementId, finalValue, duration = 2000) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  let start = 0;
  const increment = finalValue / (duration / 10);
  const timer = setInterval(() => {
    start += increment;
    if (start >= finalValue) {
      element.textContent = finalValue.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start).toLocaleString();
    }
  }, 10);
}

// Inicializar contadores cuando la sección sea visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter('counter1', 1250);
      animateCounter('counter2', 5600);
      animateCounter('counter3', 32);
      observer.unobserve(entry.target);
    }
  });
});

// Observar la sección hero
const heroSection = document.querySelector('.hero-section');
if (heroSection) {
  observer.observe(heroSection);
}

// Smooth scrolling para enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// TOAST mejorado
function showToast(message, type='success', duration=2400){
  const cont = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast align-items-center text-bg-${type} border-0`;
  el.role = 'alert'; el.ariaLive='assertive'; el.ariaAtomic='true';
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
  cont.appendChild(el);
  const t = new bootstrap.Toast(el, {delay: duration});
  t.show();
  el.addEventListener('hidden.bs.toast', ()=> el.remove());
}

// STATE con localStorage y sistema de borradores
const State = {
  route: 'landing',
  user: null,
  data: {
    conglomerados: [],
    subparcelas: [], 
    arboles: []
  },
  borradores: {
    subparcela: null,
    arbol: null,
    conglomerado: null
  },
  mapReady: false, 
  map: null, 
  markers: null, 
  activeForm: null,
  autosaveTimeouts: {}
};

// Cargar datos del localStorage al iniciar
function loadFromStorage() {
  try {
    const saved = localStorage.getItem('ifn_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      State.data.conglomerados = parsed.conglomerados || [];
      State.data.subparcelas = parsed.subparcelas || [];
      State.data.arboles = parsed.arboles || [];
    }
    
    // Cargar borradores
    const borradores = localStorage.getItem('ifn_borradores');
    if (borradores) {
      State.borradores = {...State.borradores, ...JSON.parse(borradores)};
    }
  } catch (e) {
    console.warn('Error cargando datos del localStorage:', e);
  }
}

// Guardar datos en localStorage
function saveToStorage() {
  try {
    localStorage.setItem('ifn_data', JSON.stringify(State.data));
  } catch (e) {
    console.warn('Error guardando datos en localStorage:', e);
  }
}

// Guardar borradores en localStorage
function saveBorradores() {
  try {
    localStorage.setItem('ifn_borradores', JSON.stringify(State.borradores));
  } catch (e) {
    console.warn('Error guardando borradores:', e);
  }
}

// Sistema de auto-guardado para formularios
function setupAutosave(formId, borradorKey) {
  const form = document.getElementById(formId);
  if (!form) return;

  // Cargar borrador existente
  if (State.borradores[borradorKey]) {
    loadFormData(form, State.borradores[borradorKey]);
    showToast('Borrador cargado automáticamente', 'info', 2000);
  }

  // Configurar auto-guardado en cada cambio
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      // Cancelar timeout anterior
      if (State.autosaveTimeouts[borradorKey]) {
        clearTimeout(State.autosaveTimeouts[borradorKey]);
      }

      // Mostrar estado "guardando..."
      updateAutosaveStatus(borradorKey, 'saving');

      // Nuevo timeout para guardar después de 1 segundo de inactividad
      State.autosaveTimeouts[borradorKey] = setTimeout(() => {
        const formData = getFormData(form);
        State.borradores[borradorKey] = {
          data: formData,
          timestamp: new Date().toISOString(),
          form: borradorKey
        };
        saveBorradores();
        updateAutosaveStatus(borradorKey, 'saved');
      }, 1000);
    });
  });
}

// Obtener datos del formulario
function getFormData(form) {
  const formData = new FormData(form);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }
  return data;
}

// Cargar datos en formulario
function loadFormData(form, borrador) {
  if (!borrador || !borrador.data) return;
  
  Object.keys(borrador.data).forEach(key => {
    const element = form.elements[key];
    if (element) {
      element.value = borrador.data[key];
      
      // Disparar evento change para selectores dependientes
      if (element.tagName === 'SELECT') {
        element.dispatchEvent(new Event('change'));
      }
    }
  });
}

// Actualizar estado del auto-guardado
function updateAutosaveStatus(formType, status) {
  const statusElement = document.getElementById(`autosaveStatus${formType.charAt(0).toUpperCase() + formType.slice(1)}`);
  if (!statusElement) return;

  statusElement.className = `autosave-status autosave-${status}`;
  statusElement.classList.remove('d-none');
  
  switch(status) {
    case 'saving':
      statusElement.textContent = 'Guardando...';
      statusElement.title = 'Guardando cambios automáticamente';
      break;
    case 'saved':
      statusElement.textContent = 'Auto-guardado';
      statusElement.title = `Último guardado: ${new Date().toLocaleTimeString()}`;
      break;
    case 'error':
      statusElement.textContent = 'Error al guardar';
      statusElement.title = 'Error al guardar el borrador';
      break;
  }
}

// UTILS mejoradas
// === API helpers (REST hacia Laravel) ===
const API = '/api';

async function api(url, opts = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    const msg = (data && (data.message || JSON.stringify(data))) || `Error ${res.status}`;
    throw new Error(msg);
  }
  return data ?? {};
}
// ===== Extensiones para conectar con Laravel =====
const API_BASE = 'http://127.0.0.1:8000/api';
window.API_ENABLED = true;

function apiFetch(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  return fetch(url, { ...opts, headers });
}

async function postConglomerado(frontObj){
  const payload = {
    codigo: frontObj.codigo,
    region: frontObj.region,
    municipio: frontObj.municipio,
    vereda: frontObj.vereda,
    fecha: frontObj.fecha,
    brigada: frontObj.brigada,
    latitud: Number(frontObj.latitud),
    longitud: Number(frontObj.longitud),
    observaciones: frontObj.observaciones || null,
    adjuntos: frontObj.adjuntos?.files ? Array.from(frontObj.adjuntos.files).map(f => f.name) : []
  };

  const res = await apiFetch('/conglomerados', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Error HTTP ${res.status}`);
  }
  return res.json();
}


async function getConglomerados(search='') {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const json = await api(`${API}/conglomerados${q}`);
  // si viene paginado, devuelve .data
  return Array.isArray(json) ? json : (json.data ?? []);
}

async function createConglomerado(payload) {
  return api(`${API}/conglomerados`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function getSubparcelasByConglomeradoId(conglomerado_id) {
  return api(`${API}/conglomerados/${conglomerado_id}/subparcelas`);
}

async function createSubparcela(payload) {
  return api(`${API}/subparcelas`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function createArbol(payload) {
  return api(`${API}/arboles`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

const qs = (s)=>document.querySelector(s);
const qsa = (s)=>Array.from(document.querySelectorAll(s));
function hideAll(){ qsa('.view').forEach(v=>v.classList.add('d-none')) }
function fillSelect(sel, items, map){
  const el = typeof sel==='string' ? qs(sel) : sel;
  if (!el) return;
  el.innerHTML = '<option value="">Seleccione…</option>' + items.map(map).join('');
}
function toNum(s){ 
  const n = parseFloat(s); 
  return isFinite(n) ? n : null;
}
function alertBox(type, text){ return `<div class="alert alert-${type} mb-2" role="alert">${text}</div>`; }
function download(filename, text){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], {type:'text/csv;charset=utf-8;'}));
  a.download = filename; 
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
}

// Validación de coordenadas mejorada
function isValidCoordinate(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

// Validación de fecha
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date <= new Date();
}

// Validación de nombre científico (formato Género especie)
function isValidScientificName(name) {
  if (!name || name.trim() === '') return false;
  const sciName = name.trim();
  // Formato básico: Género especie (opcional subespecie/variedad)
  return /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[a-záéíóúñ\-]+){1,2}$/.test(sciName);
}

// APP mejorada con sistema de borradores
const App = {
  async init() {
    loadFromStorage();
    await this.updateConglomeradosSelects?.();
    this.setupEventListeners();
    this.setupFileInputs();
    this.go('landing');
  },


  setupEventListeners() {
    // Mejorar validación de formularios
    qsa('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
        }
        form.classList.add('was-validated');
      });
    });
  },

  setupFileInputs() {
    // Configurar inputs de archivo para mostrar lista
    qsa('input[type="file"]').forEach(input => {
      input.addEventListener('change', function(e) {
        const fileList = document.getElementById('fileList' + this.name.charAt(0).toUpperCase() + this.name.slice(1));
        if (fileList) {
          fileList.innerHTML = '';
          Array.from(this.files).forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
              <div class="d-flex justify-content-between align-items-center">
                <span><i class="bi bi-file-earmark me-2"></i>${file.name}</span>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="App.removeFile(this, ${index})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            `;
            fileList.appendChild(fileItem);
          });
        }
      });
    });
  },

  removeFile(button, index) {
    const fileInput = button.closest('form').querySelector('input[type="file"]');
    const files = Array.from(fileInput.files);
    files.splice(index, 1);
    
    // Crear nuevo DataTransfer y reemplazar files
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
    
    // Disparar evento change para actualizar lista
    fileInput.dispatchEvent(new Event('change'));
  },

  go(view){
    State.route = view; 
    hideAll();
    
    const views = {
      'landing':'#view-landing',
      'login':'#view-login',
      'dashboard':'#view-dashboard',
      'conglomerado':'#view-conglomerado',
      'subparcela':'#view-subparcela',
      'arbol':'#view-arbol',
      'validacion':'#view-validacion',
      'reportes':'#view-reportes',
      'mapa':'#view-mapa'
    };
    
    const id = views[view];
    if(id) {
      const element = qs(id);
      if (element) {
        element.classList.remove('d-none');
      }
    }

    switch(view){
      case 'dashboard':
        qs('#userRole').textContent = State.user?.role || '';
        qs('#cardsTecnico').classList.toggle('d-none', State.user?.role!=='Tecnico');
        qs('#cardsBotanico').classList.toggle('d-none', State.user?.role!=='Botanico');
        qs('#cardsCoordinador').classList.toggle('d-none', State.user?.role!=='Coordinador');
        this.actualizarBorradoresUI();
        break;
        
      case 'conglomerado': 
        State.activeForm='conglomerado';
        setTimeout(() => setupAutosave('formConglomerado', 'conglomerado'), 100);
        break;
        
      case 'subparcela': 
        State.activeForm='subparcela'; 
        fillSelect('#spCong', State.data.conglomerados, c=>`<option value="${c.codigo}">${c.codigo} — ${c.municipio}</option>`); 
        setTimeout(() => setupAutosave('formSubparcela', 'subparcela'), 100);
        break;
        
      case 'arbol':
        fillSelect('#arCong', State.data.conglomerados, c=>`<option value="${c.codigo}">${c.codigo}</option>`);
        this.updateSubparcelas();
        setTimeout(() => setupAutosave('formArbol', 'arbol'), 100);
        break;
        
      case 'validacion': 
        this.renderPendientes(); 
        break;
        
      case 'reportes': 
        this.renderReportes(); 
        break;
        
      case 'mapa': 
        setTimeout(()=>this.mapa.init(), 100); 
        break;
    }
  },

  // Actualizar UI de borradores en el dashboard
  actualizarBorradoresUI() {
    const borradoresSection = qs('#borradoresSection');
    const borradoresCount = qs('#borradoresCount');
    const listaBorradores = qs('#listaBorradores');
    
    if (!borradoresSection || !borradoresCount || !listaBorradores) return;
    
    const borradoresActivos = Object.values(State.borradores).filter(b => b !== null && b.data);
    const tieneBorradores = borradoresActivos.length > 0;
    
    // Mostrar/ocultar sección
    borradoresSection.classList.toggle('d-none', !tieneBorradores || !State.user);
    
    if (tieneBorradores) {
      borradoresCount.textContent = borradoresActivos.length;
      
      // Listar borradores
      listaBorradores.innerHTML = borradoresActivos.map(borrador => `
        <div class="draft-item p-2 mb-2 rounded border">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>${this.getBorradorTitulo(borrador.form)}</strong>
              <small class="text-muted d-block">Guardado: ${new Date(borrador.timestamp).toLocaleString()}</small>
            </div>
            <div>
              <button class="btn btn-sm btn-outline-primary me-1" onclick="App.cargarBorrador('${borrador.form}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="App.eliminarBorrador('${borrador.form}')">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  },

  getBorradorTitulo(tipo) {
    const titulos = {
      'subparcela': 'Subparcela',
      'arbol': 'Árbol',
      'conglomerado': 'Conglomerado'
    };
    return titulos[tipo] || 'Formulario';
  },

  cargarBorrador(tipo) {
    const vistas = {
      'subparcela': 'subparcela',
      'arbol': 'arbol',
      'conglomerado': 'conglomerado'
    };
    
    this.go(vistas[tipo]);
    showToast('Borrador cargado', 'info');
  },

  eliminarBorrador(tipo) {
    if (confirm('¿Estás seguro de que quieres eliminar este borrador?')) {
      State.borradores[tipo] = null;
      saveBorradores();
      this.actualizarBorradoresUI();
      showToast('Borrador eliminado', 'success');
    }
  },

  limpiarBorrador(tipo) {
    if (confirm('¿Estás seguro de que quieres limpiar este borrador? Se perderán todos los datos no guardados.')) {
      State.borradores[tipo] = null;
      saveBorradores();
      
      // Limpiar formulario
      const formId = `form${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
      const form = qs(`#${formId}`);
      if (form) form.reset();
      
      updateAutosaveStatus(tipo, 'saved');
      this.actualizarBorradoresUI();
      showToast('Borrador limpiado', 'success');
    }
  },

async updateSubparcelas(conglomerado = null) {
  const congSelect = qs('#arCong');
  const subSelect  = qs('#arSub');
  if (!congSelect || !subSelect) return;

  const selectedCode = conglomerado || congSelect.value;

  // estado inicial
  subSelect.innerHTML = '<option value="">Seleccione…</option>';
  if (!selectedCode) return;

  // buscar el ID del conglomerado (lo necesitamos para la API)
  const cong = State.data.conglomerados.find(c => c.codigo === selectedCode);
  if (!cong) return;

  // 1) intentar cargar desde backend
  try {
    const subs = await api(`${API}/conglomerados/${cong.id}/subparcelas`);
    const options = (subs || [])
      .map(s => `<option value="${s.codigo}" data-id="${s.id}">${s.codigo}</option>`)
      .join('');
    subSelect.innerHTML = `<option value="">Seleccione…</option>${options}`;
    return; // listo con API
  } catch (e) {
    // sigue a fallback local
  }

  // 2) fallback: usar las que tengamos en memoria local
  try {
    const subsLocal = State.data.subparcelas.filter(s => s.conglomerado === selectedCode);
    const options = subsLocal
      .map(s => `<option value="${s.codigo}">${s.codigo}</option>`)
      .join('');
    subSelect.innerHTML = `<option value="">Seleccione…</option>${options}`;
    showToast('Trabajando sin conexión: subparcelas locales', 'warning');
  } catch {
    subSelect.innerHTML = '<option value="">Seleccione…</option>';
    showToast('No se pudieron cargar subparcelas', 'warning');
  }
},

  login(role){ 
    State.user = { role }; 
    this.go('dashboard'); 
    showToast(`Sesión iniciada como ${role}`, 'primary'); 
  },

  logout(){ 
    State.user = null; 
    this.go('landing'); 
    showToast('Sesión cerrada', 'secondary'); 
  },

// === ACTUALIZAR SELECTS DE CONGLOMERADOS (para formularios dependientes) ===
async updateConglomeradosSelects() {
  const selects = ['#spCong', '#arCong']; // selects donde se listan los conglomerados
  selects.forEach(sel => {
    const el = qs(sel);
    if (el) el.innerHTML = '<option value="">Cargando…</option>';
  });

  try {
    const res = await api(`${API}/conglomerados`);
    const data = res.data || res;

    // Pintar opciones
    selects.forEach(sel => {
      const el = qs(sel);
      if (!el) return;
      el.innerHTML =
        '<option value="">Seleccione…</option>' +
        data.map(c => `<option value="${c.codigo}" data-id="${c.id}">${c.codigo} — ${c.municipio}</option>`).join('');
    });

    // Sincronizar cache local (modo offline)
    const nuevos = data.map(c => ({
      id: c.id,
      codigo: c.codigo,
      region: c.region,
      municipio: c.municipio,
      vereda: c.vereda,
      latitud: c.latitud,
      longitud: c.longitud,
      fecha: c.fecha,
      brigada: c.brigada,
      observaciones: c.observaciones,
      adjuntos: c.adjuntos || []
    }));

    nuevos.forEach(n => {
      if (!State.data.conglomerados.some(c => c.codigo === n.codigo)) {
        State.data.conglomerados.push(n);
      }
    });
    saveToStorage();
  } catch (err) {
    console.warn('Backend no disponible, usando locales:', err);
    selects.forEach(sel => {
      const el = qs(sel);
      if (!el) return;
      el.innerHTML =
        '<option value="">Seleccione…</option>' +
        State.data.conglomerados
          .map(c => `<option value="${c.codigo}">${c.codigo} — ${c.municipio || ''}</option>`)
          .join('');
    });
    showToast('Usando conglomerados locales (sin conexión)', 'warning');
  }
},

// === CARGAR SUBPARCELAS POR CONGLOMERADO EN SELECT DEL FORM "Árbol" ===
async updateSubparcelas(conglomerado = null) {
  const congSelect = qs('#arCong');
  const subSelect  = qs('#arSub');
  if (!congSelect || !subSelect) return;

  const selectedCode = conglomerado || congSelect.value;
  subSelect.innerHTML = '<option value="">Seleccione…</option>';
  if (!selectedCode) return;

  // 1) intenta desde backend
  try {
    const res = await api(`${API}/conglomerados/${encodeURIComponent(selectedCode)}/subparcelas`);
    const subs = Array.isArray(res) ? res : (res.data || []);
    const options = subs.map(s => `<option value="${s.codigo}">${s.codigo}</option>`).join('');
    subSelect.innerHTML = `<option value="">Seleccione…</option>${options}`;
  } catch {
    // 2) fallback local
    const subsLocal = State.data.subparcelas
      .filter(s => s.conglomerado === selectedCode)
      .map(s => `<option value="${s.codigo}">${s.codigo}</option>`)
      .join('');
    subSelect.innerHTML = `<option value="">Seleccione…</option>${subsLocal}`;
  }
},


// === GUARDAR CONGLOMERADO ===
async saveConglomerado(ev) {
  ev.preventDefault();
  const form = ev.target;
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  const msgEl = qs('#msgCong');

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  // Validaciones adicionales
  const lat = toNum(obj.latitud), lng = toNum(obj.longitud);
  if (!isValidCoordinate(lat, lng)) {
    msgEl.innerHTML = alertBox('danger', 'Coordenadas inválidas. Latitud debe estar entre -90 y 90, Longitud entre -180 y 180.');
    return;
  }
  if (!isValidDate(obj.fecha)) {
    msgEl.innerHTML = alertBox('danger', 'Fecha inválida. No puede ser futura.');
    return;
  }

  // Crear objeto local
  const nuevo = {
    id: Date.now(),
    ...obj,
    latitud: lat,
    longitud: lng,
    adjuntos: form.adjuntos?.files ? Array.from(form.adjuntos.files).map(f => f.name) : [],
    fechaCreacion: new Date().toISOString()
  };

  // Guardar en memoria local
  State.data.conglomerados.push(nuevo);
  saveToStorage();
  State.borradores.conglomerado = null;
  saveBorradores();

  msgEl.innerHTML = alertBox('success', 'Conglomerado registrado exitosamente');
  showToast('Conglomerado guardado', 'success');
  form.reset();
  form.classList.remove('was-validated');

  // Mostrar marcador en mapa
  if (State.mapReady) {
    this.mapa.addMarker([lat, lng], `${obj.codigo} — ${obj.municipio}`, 'conglomerado');
    this.mapa.fit();
  }

  this.actualizarBorradoresUI();

// ==== Intentar enviar al backend (Laravel) ====
try {
  // Construir adjuntos desde el form (corregido: NO usa "nuevo.adjuntos")
  const adjuntosArr = form.adjuntos?.files
    ? Array.from(form.adjuntos.files).map(f => f.name)
    : [];

  const payload = {
    codigo: obj.codigo,
    region: obj.region,
    municipio: obj.municipio,
    vereda: obj.vereda,
    fecha: obj.fecha,
    brigada: obj.brigada,
    latitud: lat,
    longitud: lng,
    observaciones: obj.observaciones || null,
    adjuntos: adjuntosArr
  };

  const res = await fetch(`${API}/conglomerados`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    const creado = await res.json();

    // sincronizar (opcional, si quieres tener el ID real del server en memoria)
    const idx = State.data.conglomerados.findIndex(c => c.codigo === payload.codigo);
    if (idx >= 0) {
      State.data.conglomerados[idx] = { ...State.data.conglomerados[idx], ...creado };
    } else {
      State.data.conglomerados.push(creado);
    }
    saveToStorage();

    // refrescar selects dependientes
    await this.updateConglomeradosSelects();

    showToast('Conglomerado enviado al servidor', 'success');
  } else {
    const txt = await res.text();
    console.warn('Error al enviar:', txt);
    showToast('Guardado localmente, error al enviar al servidor', 'warning');
  }
} catch (err) {
  console.warn('Error conexión:', err);
  showToast('Guardado localmente, sin conexión con el servidor', 'warning');
}

},

// === GUARDAR SUBPARCELA ===
async saveSubparcela(ev) {
  ev.preventDefault();
  const form = ev.target;
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  const msgEl = qs('#msgSub');

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  if (!State.data.conglomerados.some(c => c.codigo === obj.conglomerado)) {
    msgEl.innerHTML = alertBox('danger', 'Conglomerado inexistente.');
    return;
  }

  const lat = toNum(obj.latitud), lng = toNum(obj.longitud);
  if (!isValidCoordinate(lat, lng)) {
    msgEl.innerHTML = alertBox('danger', 'Coordenadas inválidas.');
    return;
  }

  if (State.data.subparcelas.some(s => s.codigo === obj.codigo && s.conglomerado === obj.conglomerado)) {
    msgEl.innerHTML = alertBox('danger', 'El código de la subparcela ya existe en ese conglomerado.');
    return;
  }

  // Crear registro local
  const nueva = {
    id: Date.now(),
    ...obj,
    latitud: lat,
    longitud: lng,
    estado: 'registrado',
    fechaCreacion: new Date().toISOString()
  };

  State.data.subparcelas.push(nueva);
  State.borradores.subparcela = null;
  saveBorradores();
  saveToStorage();

  msgEl.innerHTML = alertBox('success', 'Subparcela registrada exitosamente');
  showToast('Subparcela guardada', 'success');
  form.reset();
  form.classList.remove('was-validated');

  if (State.mapReady) {
    this.mapa.addMarker([lat, lng], `${obj.codigo} (SP)`, 'subparcela');
    this.mapa.fit();
  }

  this.actualizarBorradoresUI();

  // ==== Intentar enviar al backend (Laravel) ====
  try {
    const payload = {
      codigo: obj.codigo,
      estado: obj.estado,
      coberturas: obj.coberturas,
      latitud: lat,
      longitud: lng,
      // Busca ID real del cong (si se obtuvo desde backend)
      conglomerado_id: Number(obj.conglomerado_id) || null
    };

    const res = await fetch(`${API}/subparcelas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('Subparcela enviada al servidor', 'success');
      await this.updateSubparcelas(payload.conglomerado_id);
    } else {
      const txt = await res.text();
      console.warn('Error al enviar subparcela:', txt);
      showToast('Guardado localmente, error al enviar al servidor', 'warning');
    }
  } catch (err) {
    console.warn('Error conexión subparcela:', err);
    showToast('Guardado localmente, sin conexión con el servidor', 'warning');
  }
},


async saveArbol(ev) {
  ev.preventDefault();
  const form = ev.target;
  const fd = new FormData(form);
  const obj = Object.fromEntries(fd.entries());
  const msgEl = qs('#msgArb');

  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  // Validar que exista el conglomerado y la subparcela
  if (!State.data.conglomerados.some(c => c.codigo === obj.conglomerado)) {
    msgEl.innerHTML = alertBox('danger', 'Conglomerado inexistente.');
    return;
  }

  if (!State.data.subparcelas.some(s => s.codigo === obj.subparcela && s.conglomerado === obj.conglomerado)) {
    msgEl.innerHTML = alertBox('danger', 'Subparcela no encontrada en el conglomerado seleccionado.');
    return;
  }

  // Validar nombre científico
  const sci = (obj.nombreCientifico || '').trim();
  if (!isValidScientificName(sci)) {
    msgEl.innerHTML = alertBox(
      'danger',
      'Formato de nombre científico inválido. Use: Género especie (ej: Quercus humboldtii)'
    );
    return;
  }

  // Validar coordenadas
  const lat = toNum(obj.latitud), lng = toNum(obj.longitud);
  if (!isValidCoordinate(lat, lng)) {
    msgEl.innerHTML = alertBox('danger', 'Coordenadas inválidas. Latitud entre -90 y 90, Longitud entre -180 y 180.');
    return;
  }

  // Determinar estado según el rol del usuario
  const estado =
    State.user?.role === 'Botanico' || State.user?.role === 'Coordinador'
      ? 'validado'
      : 'pendiente_validacion';
  const validadoPor = estado === 'validado' ? State.user.role : '';

  // Crear objeto local
  const nuevo = {
    id: Date.now(),
    ...obj,
    nombreCientifico: sci,
    latitud: lat,
    longitud: lng,
    estado,
    validadoPor,
    fecha: new Date().toISOString().slice(0, 10),
    fechaRegistro: new Date().toISOString(),
    evidencias: form.evidencias?.files
      ? Array.from(form.evidencias.files).map(f => f.name)
      : []
  };

  // Guardar localmente (offline)
  State.data.arboles.push(nuevo);
  State.borradores.arbol = null;
  saveBorradores();
  saveToStorage();

  const estadoMsg = estado === 'validado' ? 'validado' : 'registrado (pendiente de validación)';
  msgEl.innerHTML = alertBox('success', `Árbol ${estadoMsg} exitosamente`);
  showToast(`Árbol ${estadoMsg}`, 'success');
  form.reset();
  form.classList.remove('was-validated');

  if (State.mapReady) {
    this.mapa.addMarker([lat, lng], `${sci}`, 'arbol');
    this.mapa.fit();
  }

  this.actualizarBorradoresUI();

  // ==== Intentar enviar al backend Laravel ====
  try {
    const payload = {
      conglomerado_id: Number(obj.conglomerado_id) || null,
      subparcela_id: Number(obj.subparcela_id) || null,
      nombre_cientifico: sci,
      nombres_comunes: obj.nombresComunes || null,
      categoria: obj.categoria,
      dap: Number(obj.dap),
      altura: Number(obj.altura),
      latitud: lat,
      longitud: lng,
      azimut: obj.azimut ? Number(obj.azimut) : null,
      usos: obj.usos || null,
      observaciones: obj.observaciones || null,
      estado,
      validado_por: validadoPor || null,
      fecha: new Date().toISOString().slice(0, 10),
      evidencias: nuevo.evidencias
    };

    const res = await fetch(`${API}/arboles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('Árbol sincronizado con el servidor', 'success');
    } else {
      const txt = await res.text();
      console.warn('Error al enviar árbol:', txt);
      showToast('Guardado localmente, error al enviar al servidor', 'warning');
    }
  } catch (err) {
    console.warn('Error conexión árbol:', err);
    showToast('Guardado localmente, sin conexión con el servidor', 'warning');
  }
},


  renderPendientes(){
    const tb = qs('#tablaPendientes tbody');
    if (!tb) return;
    
    const pend = State.data.arboles.filter(a=>a.estado==='pendiente_validacion');
    tb.innerHTML = pend.length ? pend.map(a=>`
      <tr>
        <td>${a.id}</td>
        <td>${a.conglomerado}</td>
        <td>${a.subparcela}</td>
        <td><em class="nombre-cientifico">${a.nombreCientifico}</em></td>
        <td><span class="badge estado-pendiente">Pendiente</span></td>
        <td>${a.fecha}</td>
        <td>
          <button class="btn btn-sm btn-success rounded-pill" onclick="App.validar(${a.id})">
            <i class="bi bi-check-lg me-1"></i>Validar
          </button>
          <button class="btn btn-sm btn-outline-primary rounded-pill ms-1" onclick="App.editarArbol(${a.id})">
            <i class="bi bi-pencil"></i>
          </button>
        </td>
      </tr>`).join('') 
      : `<tr><td colspan="7" class="text-center text-muted py-3">No hay registros pendientes de validación.</td></tr>`;
  },

  editarArbol(id) {
    const arbol = State.data.arboles.find(a => a.id === id);
    if (!arbol) return;
    
    // Llenar formulario de árbol con datos existentes
    this.go('arbol');
    setTimeout(() => {
      const form = qs('#formArbol');
      if (form) {
        Object.keys(arbol).forEach(key => {
          const element = form.elements[key];
          if (element) {
            element.value = arbol[key];
          }
        });
        showToast('Árbol cargado para edición', 'info');
      }
    }, 100);
  },

  validar(id){
    if(!(State.user?.role==='Botanico' || State.user?.role==='Coordinador')){ 
      showToast('Solo Botánico o Coordinador pueden validar', 'warning'); 
      return; 
    }
    
    const arbol = State.data.arboles.find(a => a.id === id);
    if (!arbol) return;
    
    // Verificar que tenga información mínima para validar
    if (!arbol.nombreCientifico || !arbol.categoria) {
      showToast('Complete la información del árbol antes de validar', 'warning');
      return;
    }
    
    State.data.arboles = State.data.arboles.map(a=>
      a.id===id ? {...a, estado:'validado', validadoPor: State.user.role} : a
    );
    
    saveToStorage();
    this.renderPendientes(); 
    showToast('Registro validado exitosamente', 'success');
  },

  renderReportes(){
    const fFechaDesde = qs('#fFechaDesde').value;
    const fFechaHasta = qs('#fFechaHasta').value;
    const fZona = qs('#fZona').value.trim().toLowerCase();
    const fEspecie = qs('#fEspecie').value.trim().toLowerCase();
    const fTecnico = qs('#fTecnico').value.trim().toLowerCase();
    const fEstado = qs('#fEstado').value;
    
    let rows = State.data.arboles;
    
    // Aplicar filtros según caso de uso
    if (fFechaDesde) {
      rows = rows.filter(a => a.fecha >= fFechaDesde);
    }
    if (fFechaHasta) {
      rows = rows.filter(a => a.fecha <= fFechaHasta);
    }
    if (fZona) {
      rows = rows.filter(a => 
        a.conglomerado.toLowerCase().includes(fZona) ||
        (State.data.conglomerados.find(c => c.codigo === a.conglomerado)?.municipio?.toLowerCase() || '').includes(fZona)
      );
    }
    if (fEspecie) {
      rows = rows.filter(a => a.nombreCientifico.toLowerCase().includes(fEspecie));
    }
    if (fTecnico) {
      rows = rows.filter(a => a.validadoPor?.toLowerCase().includes(fTecnico));
    }
    if (fEstado) {
      rows = rows.filter(a => a.estado === fEstado);
    }
    
    const tb = qs('#tablaReportes tbody');
    const sinResultados = qs('#sinResultados');
    const contador = qs('#contadorResultados');
    
    if (!tb || !sinResultados || !contador) return;
    
    // Mostrar/ocultar mensaje de no resultados
    sinResultados.classList.toggle('d-none', rows.length > 0);
    contador.textContent = `${rows.length} registros`;
    
    tb.innerHTML = rows.length ? rows.map(a=>{
      const conglomerado = State.data.conglomerados.find(c => c.codigo === a.conglomerado);
      return `
      <tr>
        <td>${a.id}</td>
        <td>${a.conglomerado}${conglomerado ? `<br><small>${conglomerado.municipio}</small>` : ''}</td>
        <td>${a.subparcela}</td>
        <td><em class="nombre-cientifico">${a.nombreCientifico}</em></td>
        <td>
          <span class="badge ${a.estado==='validado' ? 'estado-validado' : 'estado-pendiente'}">
            ${a.estado.replace('_', ' ')}
          </span>
        </td>
        <td>${a.validadoPor||'-'}</td>
        <td>${a.fecha}</td>
        <td>${a.dap || '-'}</td>
        <td>${a.altura || '-'}</td>
      </tr>`;
    }).join('')
      : `<tr><td colspan="9" class="text-center text-muted py-3">No hay información para los filtros seleccionados</td></tr>`;
  },

  limpiarFiltros() {
    qs('#fFechaDesde').value = '';
    qs('#fFechaHasta').value = '';
    qs('#fZona').value = '';
    qs('#fEspecie').value = '';
    qs('#fTecnico').value = '';
    qs('#fEstado').value = '';
    this.renderReportes();
    showToast('Filtros limpiados', 'info');
  },

  exportCSV(){
    const rows = [['ID','Conglomerado','Subparcela','Nombre científico','Estado','Validado por','Fecha','DAP (cm)','Altura (m)']];
    const tb = qs('#tablaReportes tbody'); 
    
    if (!tb) {
      showToast('No hay datos para exportar', 'warning'); 
      return;
    }
    
    const trs = Array.from(tb.querySelectorAll('tr'));
    trs.forEach(tr=>{ 
      const tds = Array.from(tr.querySelectorAll('td')).map(td=>{
        let text = td.innerText.replace(/\n/g,' ').replace(/,/g,';');
        // Remover etiquetas HTML de los badges
        text = text.replace(/<[^>]*>/g, '').trim();
        return `"${text}"`;
      }); 
      if(tds.length === 9) rows.push(tds); 
    });
    
    if(rows.length <= 1){ 
      showToast('No hay datos para exportar', 'warning'); 
      return; 
    }
    
    const csv = rows.map(r=>r.join(',')).join('\n'); 
    const timestamp = new Date().toISOString().slice(0,10);
    download(`reporte_ifn_${timestamp}.csv`, csv); 
    showToast('Reporte CSV exportado exitosamente', 'primary');
  },

  exportPDF() {
    showToast('Función de exportación PDF en desarrollo', 'info');
    // En una implementación real, aquí se integraría con una librería como jsPDF
  },

  mapa: {
    init(){
      if(State.mapReady){ 
        this.refresh(); 
        return; 
      }
      
      const mapEl = qs('#map');
      const mapError = qs('#mapError');
      
      if (!mapEl) return;
      
      // Verificar si Leaflet está cargado
      if (typeof L === 'undefined') {
        mapError.classList.remove('d-none');
        mapEl.style.display = 'none';
        showToast('Error al cargar el mapa', 'danger', 5000);
        return;
      }
      
      const center = [7.119349, -73.122741];
      const map = L.map(mapEl).setView(center, 12); 
      State.map = map;
      
      // Manejar errores de tiles
      map.on('tileerror', function(e) {
        console.warn('Error loading tile:', e);
        mapError.classList.remove('d-none');
      });
      
      try {
        const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNGM0Y0RjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zNWVtIj5NYXBhIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+'
        }).addTo(map);
      } catch (e) {
        console.error('Error creating map:', e);
        mapError.classList.remove('d-none');
        mapEl.style.display = 'none';
        return;
      }
      
      const markers = L.layerGroup().addTo(map); 
      State.markers = markers;
      
      map.on('click', (e)=>{
        if(!qs('#chkPick')?.checked) return;
        
        const {lat, lng} = e.latlng;
        
        if(State.activeForm==='conglomerado'){ 
          const f = qs('#view-conglomerado form'); 
          if(f){ 
            f.latitud.value = lat.toFixed(6); 
            f.longitud.value = lng.toFixed(6);
            f.latitud.dispatchEvent(new Event('change'));
            f.longitud.dispatchEvent(new Event('change'));
          } 
        }
        else if(State.activeForm==='subparcela'){ 
          const f = qs('#view-subparcela form'); 
          if(f){ 
            f.latitud.value = lat.toFixed(6); 
            f.longitud.value = lng.toFixed(6);
            f.latitud.dispatchEvent(new Event('change'));
            f.longitud.dispatchEvent(new Event('change'));
          } 
        }
        else if(State.activeForm==='arbol'){ 
          const f = qs('#view-arbol form'); 
          if(f){ 
            f.latitud.value = lat.toFixed(6); 
            f.longitud.value = lng.toFixed(6);
            f.latitud.dispatchEvent(new Event('change'));
            f.longitud.dispatchEvent(new Event('change'));
          } 
        }
        
        // Marcador temporal
        L.circleMarker([lat,lng], {
          radius: 8,
          color: '#ff6b35',
          fillColor: '#ff6b35',
          fillOpacity: 0.7
        })
        .addTo(State.markers)
        .bindPopup('Punto seleccionado<br>Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6))
        .openPopup();
      });
      
      this.refresh(); 
      State.mapReady = true;
      mapError.classList.add('d-none');
      mapEl.style.display = 'block';
    },
    
    refresh(){
      if(!State.map || !State.markers) return;
      
      State.markers.clearLayers();
      
      // Agregar conglomerados
      State.data.conglomerados.forEach(c=>{
        const lat = toNum(c.latitud), lng = toNum(c.longitud);
        if(isFinite(lat) && isFinite(lng) && isValidCoordinate(lat, lng)){
          const m = L.marker([lat, lng], {
            title: c.codigo
          })
          .bindPopup(`
            <strong>${c.codigo}</strong><br>
            ${c.municipio}, ${c.region}<br>
            <small>${c.fecha}</small>
          `);
          State.markers.addLayer(m);
        }
      });
      
      // Agregar subparcelas
      State.data.subparcelas.forEach(s=>{
        const lat = toNum(s.latitud), lng = toNum(s.longitud);
        if(isFinite(lat) && isFinite(lng) && isValidCoordinate(lat, lng)){
          const m = L.circleMarker([lat, lng], {
            radius: 6,
            color: '#198754',
            fillColor: '#198754',
            fillOpacity: 0.7
          })
          .bindPopup(`
            <strong>Subparcela ${s.codigo}</strong><br>
            Conglomerado: ${s.conglomerado}<br>
            Estado: ${s.estado}
          `);
          State.markers.addLayer(m);
        }
      });
      
      this.fit();
    },
    
    addMarker(latlng, label, kind='conglomerado'){
      if(!State.markers) return;
      
      const layer = kind==='subparcela' ? 
        L.circleMarker(latlng, {
          radius: 6,
          color: '#198754',
          fillColor: '#198754',
          fillOpacity: 0.7
        }).bindPopup(`<strong>${label}</strong>`) : 
        L.marker(latlng, {
          title: label
        }).bindPopup(`<strong>${label}</strong>`);
        
      State.markers.addLayer(layer);
    },
    
    fit(){
      if (!State.map || !State.markers) return;
      
      const layers = State.markers.getLayers();
      if(!layers.length){ 
        State.map.setView([7.119349, -73.122741], 12); 
        return; 
      }
      
      try {
        const group = L.featureGroup(layers); 
        State.map.fitBounds(group.getBounds().pad(0.1));
      } catch (e) {
        console.warn('Error fitting bounds:', e);
      }
    },
    
    centerBga(){ 
      if(State.map) State.map.setView([7.119349, -73.122741], 12); 
    },
    
    clearMarkers() {
      if (State.markers) {
        State.markers.clearLayers();
        showToast('Marcadores limpiados', 'info');
      }
    }
  }
};

// Boot mejorado
window.App = App;

document.addEventListener('DOMContentLoaded', ()=>{
  // --- THEME mejorado ---
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  
  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  function getStoredTheme() {
    return localStorage.getItem('ifn_theme');
  }
  
  function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('ifn_theme', theme);
    updateIcon();
  }
  
  function updateIcon(){
    const t = document.documentElement.getAttribute('data-bs-theme') || 'light';
    icon.className = t==='dark' ? 'bi bi-sun' : 'bi bi-moon-stars';
    const span = btn?.querySelector('span');
    if(span) span.textContent = t==='dark' ? 'Claro' : 'Oscuro';
  }
  
  // Inicializar tema
  const storedTheme = getStoredTheme();
  const systemTheme = getSystemTheme();
  setTheme(storedTheme || systemTheme);
  
  btn?.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
    const next = current==='light' ? 'dark' : 'light';
    setTheme(next);
  });
  
  // Escuchar cambios del sistema
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!getStoredTheme()) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Inicializar la aplicación
  App.init();
});