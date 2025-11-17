// app.js - Aplicación principal del IFN

// Actualizar año
document.getElementById('year').textContent = new Date().getFullYear();

// Base de datos de usuarios simulada
const UsersDB = {
  usuarios: [
    {
      id: 1,
      email: 'admin@ifn.gov.co',
      password: 'Admin123*',
      role: 'Administrador',
      nombre: 'Administrador Sistema',
      activo: true,
      fechaCreacion: '2024-01-15T08:00:00Z'
    },
    {
      id: 2,
      email: 'coordinador@ifn.gov.co',
      password: 'Coord123*',
      role: 'Coordinador',
      nombre: 'Coordinador Regional',
      activo: true,
      fechaCreacion: '2024-01-15T08:00:00Z'
    },
    {
      id: 3,
      email: 'tecnico@ifn.gov.co',
      password: 'Tecnico123*',
      role: 'Tecnico',
      nombre: 'Técnico de Campo',
      activo: true,
      fechaCreacion: '2024-01-15T08:00:00Z'
    },
    {
      id: 4,
      email: 'botanico@ifn.gov.co',
      password: 'Botanico123*',
      role: 'Botanico',
      nombre: 'Botánico Especialista',
      activo: true,
      fechaCreacion: '2024-01-15T08:00:00Z'
    },
    {
      id: 5,
      email: 'coordinador2@ifn.gov.co',
      password: 'Coord456*',
      role: 'Coordinador',
      nombre: 'Coordinador Zona Norte',
      activo: true,
      fechaCreacion: '2024-02-20T10:30:00Z'
    },
    {
      id: 6,
      email: 'tecnico2@ifn.gov.co',
      password: 'Tecnico456*',
      role: 'Tecnico',
      nombre: 'Técnico Zona Sur',
      activo: true,
      fechaCreacion: '2024-02-20T10:30:00Z'
    }
  ],

  // Método para validar credenciales
  validarCredenciales(email, password) {
    const usuario = this.usuarios.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password &&
      u.activo === true
    );
    
    if (usuario) {
      return {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nombre: usuario.nombre
      };
    }
    return null;
  },

  // Método para obtener usuario por email
  obtenerUsuarioPorEmail(email) {
    return this.usuarios.find(u => u.email.toLowerCase() === email.toLowerCase() && u.activo);
  },

  // Método para obtener todos los usuarios (para administrador)
  obtenerTodosUsuarios() {
    return this.usuarios.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      nombre: u.nombre,
      activo: u.activo,
      fechaCreacion: u.fechaCreacion
    }));
  }
};

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

// Base de datos simulada
const Database = {
  conglomerados: [
    {
      id: 1,
      codigo: "CONG-AMZ-001",
      region: "Amazonía",
      municipio: "Leticia",
      vereda: "Kilómetro 11",
      fecha: "2024-03-15",
      brigada: "Brigada Amazonas",
      latitud: -4.215278,
      longitud: -69.940556,
      observaciones: "Conglomerado en zona de bosque primario",
      estado: "activo",
      fechaCreacion: "2024-03-15T10:30:00Z"
    },
    {
      id: 2,
      codigo: "CONG-AND-001",
      region: "Andina",
      municipio: "Santander",
      vereda: "Chicamocha",
      fecha: "2024-04-20",
      brigada: "Brigada Santander",
      latitud: 6.605833,
      longitud: -73.067778,
      observaciones: "Conglomerado en zona de bosque seco tropical",
      estado: "activo",
      fechaCreacion: "2024-04-20T14:15:00Z"
    },
    {
      id: 3,
      codigo: "CONG-PAC-001",
      region: "Pacífico",
      municipio: "Buenaventura",
      vereda: "La Barra",
      fecha: "2024-05-10",
      brigada: "Brigada Pacífico",
      latitud: 3.880278,
      longitud: -77.031111,
      observaciones: "Conglomerado en zona de manglar",
      estado: "activo",
      fechaCreacion: "2024-05-10T08:45:00Z"
    },
    {
      id: 4,
      codigo: "CONG-CAR-001",
      region: "Caribe",
      municipio: "Santa Marta",
      vereda: "Minca",
      fecha: "2024-06-05",
      brigada: "Brigada Caribe",
      latitud: 11.145833,
      longitud: -74.116667,
      observaciones: "Conglomerado en Sierra Nevada",
      estado: "activo",
      fechaCreacion: "2024-06-05T11:20:00Z"
    },
    {
      id: 5,
      codigo: "CONG-ORI-001",
      region: "Orinoquía",
      municipio: "Villavicencio",
      vereda: "Acacías",
      fecha: "2024-07-12",
      brigada: "Brigada Orinoquía",
      latitud: 4.142222,
      longitud: -73.626667,
      observaciones: "Conglomerado en zona de sabana",
      estado: "activo",
      fechaCreacion: "2024-07-12T09:30:00Z"
    }
  ],

  subparcelas: [
    {
      id: 1,
      codigo: "SP-AMZ-001-A",
      conglomerado: "CONG-AMZ-001",
      estado: "activo",
      coberturas: "Bosque denso alto",
      latitud: -4.216389,
      longitud: -69.941667,
      fechaCreacion: "2024-03-16T09:15:00Z"
    },
    {
      id: 2,
      codigo: "SP-AMZ-001-B",
      conglomerado: "CONG-AMZ-001",
      estado: "activo",
      coberturas: "Bosque denso alto",
      latitud: -4.214167,
      longitud: -69.939444,
      fechaCreacion: "2024-03-16T10:30:00Z"
    },
    {
      id: 3,
      codigo: "SP-AND-001-A",
      conglomerado: "CONG-AND-001",
      estado: "activo",
      coberturas: "Bosque seco tropical",
      latitud: 6.606944,
      longitud: -73.068889,
      fechaCreacion: "2024-04-21T08:45:00Z"
    },
    {
      id: 4,
      codigo: "SP-PAC-001-A",
      conglomerado: "CONG-PAC-001",
      estado: "activo",
      coberturas: "Manglar",
      latitud: 3.881389,
      longitud: -77.032222,
      fechaCreacion: "2024-05-11T14:20:00Z"
    },
    {
      id: 5,
      codigo: "SP-CAR-001-A",
      conglomerado: "CONG-CAR-001",
      estado: "activo",
      coberturas: "Bosque montano bajo",
      latitud: 11.146944,
      longitud: -74.117778,
      fechaCreacion: "2024-06-06T10:15:00Z"
    },
    {
      id: 6,
      codigo: "SP-ORI-001-A",
      conglomerado: "CONG-ORI-001",
      estado: "activo",
      coberturas: "Sabana arbolada",
      latitud: 4.143333,
      longitud: -73.627778,
      fechaCreacion: "2024-07-13T11:45:00Z"
    }
  ],

  arboles: [
    {
      id: 1,
      conglomerado: "CONG-AMZ-001",
      subparcela: "SP-AMZ-001-A",
      nombreCientifico: "Ceiba pentandra",
      nombresComunes: "Ceiba, bonga",
      categoria: "Latifoliado",
      dap: 45.2,
      altura: 35.5,
      latitud: -4.216389,
      longitud: -69.941667,
      azimut: 45,
      usos: "maderable, ornamental",
      observaciones: "Árbol emergente, buen estado fitosanitario",
      estado: "validado",
      validadoPor: "Botanico",
      fecha: "2024-03-16",
      fechaRegistro: "2024-03-16T09:30:00Z"
    },
    {
      id: 2,
      conglomerado: "CONG-AMZ-001",
      subparcela: "SP-AMZ-001-A",
      nombreCientifico: "Hevea brasiliensis",
      nombresComunes: "Caucho, seringueira",
      categoria: "Latifoliado",
      dap: 32.8,
      altura: 28.3,
      latitud: -4.216389,
      longitud: -69.941667,
      azimut: 120,
      usos: "maderable, látex",
      observaciones: "Presencia de sangría para látex",
      estado: "validado",
      validadoPor: "Botanico",
      fecha: "2024-03-16",
      fechaRegistro: "2024-03-16T10:15:00Z"
    },
    {
      id: 3,
      conglomerado: "CONG-AMZ-001",
      subparcela: "SP-AMZ-001-B",
      nombreCientifico: "Bertholletia excelsa",
      nombresComunes: "Nuez del Brasil, castaña",
      categoria: "Latifoliado",
      dap: 52.1,
      altura: 42.7,
      latitud: -4.214167,
      longitud: -69.939444,
      azimut: 285,
      usos: "maderable, alimenticio",
      observaciones: "Frutos inmaduros presentes",
      estado: "validado",
      validadoPor: "Botanico",
      fecha: "2024-03-16",
      fechaRegistro: "2024-03-16T11:20:00Z"
    },
    {
      id: 4,
      conglomerado: "CONG-AND-001",
      subparcela: "SP-AND-001-A",
      nombreCientifico: "Quercus humboldtii",
      nombresComunes: "Roble, roble andino",
      categoria: "Latifoliado",
      dap: 38.5,
      altura: 32.1,
      latitud: 6.606944,
      longitud: -73.068889,
      azimut: 90,
      usos: "maderable, protección",
      observaciones: "Árbol dominante en la parcela",
      estado: "validado",
      validadoPor: "Botanico",
      fecha: "2024-04-21",
      fechaRegistro: "2024-04-21T09:00:00Z"
    },
    {
      id: 5,
      conglomerado: "CONG-AND-001",
      subparcela: "SP-AND-001-A",
      nombreCientifico: "Anacardium excelsum",
      nombresComunes: "Caracolí, espavé",
      categoria: "Latifoliado",
      dap: 41.3,
      altura: 29.8,
      latitud: 6.606944,
      longitud: -73.068889,
      azimut: 210,
      usos: "maderable, sombra",
      observaciones: "Copa amplia, buen estado",
      estado: "pendiente_validacion",
      validadoPor: "",
      fecha: "2024-04-21",
      fechaRegistro: "2024-04-21T10:30:00Z"
    },
    {
      id: 6,
      conglomerado: "CONG-PAC-001",
      subparcela: "SP-PAC-001-A",
      nombreCientifico: "Rhizophora mangle",
      nombresComunes: "Mangle rojo",
      categoria: "Latifoliado",
      dap: 22.7,
      altura: 18.4,
      latitud: 3.881389,
      longitud: -77.032222,
      azimut: 150,
      usos: "protección costera, leña",
      observaciones: "Raíces aéreas bien desarrolladas",
      estado: "validado",
      validadoPor: "Botanico",
      fecha: "2024-05-11",
      fechaRegistro: "2024-05-11T14:45:00Z"
    },
    {
      id: 7,
      conglomerado: "CONG-PAC-001",
      subparcela: "SP-PAC-001-A",
      nombreCientifico: "Avicennia germinans",
      nombresComunes: "Mangle negro",
      categoria: "Latifoliado",
      dap: 19.8,
      altura: 15.2,
      latitud: 3.881389,
      longitud: -77.032222,
      azimut: 330,
      usos: "protección costera, medicinal",
      observaciones: "Neumatóforos visibles",
      estado: "pendiente_validacion",
      validadoPor: "",
      fecha: "2024-05-11",
      fechaRegistro: "2024-05-11T15:20:00Z"
    },
    {
      id: 8,
      conglomerado: "CONG-CAR-001",
      subparcela: "SP-CAR-001-A",
      nombreCientifico: "Swietenia macrophylla",
      nombresComunes: "Caoba, aguano",
      categoria: "Latifoliado",
      dap: 48.9,
      altura: 36.7,
      latitud: 11.146944,
      longitud: -74.117778,
      azimut: 75,
      usos: "maderable, ornamental",
      observaciones: "Madera de alta calidad",
      estado: "validado",
      validadoPor: "Coordinador",
      fecha: "2024-06-06",
      fechaRegistro: "2024-06-06T10:45:00Z"
    },
    {
      id: 9,
      conglomerado: "CONG-CAR-001",
      subparcela: "SP-CAR-001-A",
      nombreCientifico: "Cedrela odorata",
      nombresComunes: "Cedro, cedro amargo",
      categoria: "Latifoliado",
      dap: 36.4,
      altura: 31.2,
      latitud: 11.146944,
      longitud: -74.117778,
      azimut: 195,
      usos: "maderable, aromático",
      observaciones: "Aroma característico en corteza",
      estado: "validado",
      validadoPor: "Botanico",
      fecha: "2024-06-06",
      fechaRegistro: "2024-06-06T11:30:00Z"
    },
    {
      id: 10,
      conglomerado: "CONG-ORI-001",
      subparcela: "SP-ORI-001-A",
      nombreCientifico: "Curatella americana",
      nombresComunes: "Chaparro, yayo",
      categoria: "Latifoliado",
      dap: 28.3,
      altura: 12.5,
      latitud: 4.143333,
      longitud: -73.627778,
      azimut: 300,
      usos: "leña, medicinal",
      observaciones: "Típico de sabanas bien drenadas",
      estado: "validado",
      validadoPor: "Botanico",
      fecha: "2024-07-13",
      fechaRegistro: "2024-07-13T12:15:00Z"
    },
    {
      id: 11,
      conglomerado: "CONG-ORI-001",
      subparcela: "SP-ORI-001-A",
      nombreCientifico: "Byrsonima crassifolia",
      nombresComunes: "Chaparro manteca, nance",
      categoria: "Latifoliado",
      dap: 18.7,
      altura: 8.9,
      latitud: 4.143333,
      longitud: -73.627778,
      azimut: 135,
      usos: "frutal, medicinal",
      observaciones: "Frutos verdes presentes",
      estado: "pendiente_validacion",
      validadoPor: "",
      fecha: "2024-07-13",
      fechaRegistro: "2024-07-13T13:00:00Z"
    },
    {
      id: 12,
      conglomerado: "CONG-AMZ-001",
      subparcela: "SP-AMZ-001-B",
      nombreCientifico: "Euterpe precatoria",
      nombresComunes: "Açaí, palmiche",
      categoria: "Palma",
      dap: 15.2,
      altura: 22.8,
      latitud: -4.214167,
      longitud: -69.939444,
      azimut: 60,
      usos: "alimenticio, artesanal",
      observaciones: "Racimos de frutos maduros",
      estado: "pendiente_validacion",
      validadoPor: "",
      fecha: "2024-03-17",
      fechaRegistro: "2024-03-17T08:45:00Z"
    }
  ],

  // Método para inicializar datos en el State
  initializeData() {
    if (State.data.conglomerados.length === 0) {
      State.data.conglomerados = this.conglomerados;
    }
    
    if (State.data.subparcelas.length === 0) {
      State.data.subparcelas = this.subparcelas;
    }
    
    if (State.data.arboles.length === 0) {
      State.data.arboles = this.arboles;
    }
    
    saveToStorage();
  },

  // Método para generar datos de prueba adicionales
  generateSampleData(count = 50) {
    const especies = [
      { cientifico: "Ocotea caparrapi", comun: "Laurel" },
      { cientifico: "Aniba perutilis", comun: "Comino" },
      { cientifico: "Copaifera officinalis", comun: "Aceite" },
      { cientifico: "Hura crepitans", comun: "Ceiba amarilla" },
      { cientifico: "Ficus insipida", comun: "Ojé" },
      { cientifico: "Spondias mombin", comun: "Jobo" },
      { cientifico: "Brosimum utile", comun: "Sandé" },
      { cientifico: "Virola sebifera", comun: "Cumala" },
      { cientifico: "Caryocar nuciferum", comun: "Almendro" },
      { cientifico: "Astrocaryum chambira", comun: "Chambira" }
    ];

    const conglomerados = this.conglomerados;
    const subparcelas = this.subparcelas;

    for (let i = 0; i < count; i++) {
      const congIndex = Math.floor(Math.random() * conglomerados.length);
      const spIndex = Math.floor(Math.random() * subparcelas.length);
      const especieIndex = Math.floor(Math.random() * especies.length);
      
      const fecha = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const fechaStr = fecha.toISOString().split('T')[0];
      
      const arbol = {
        id: this.arboles.length + i + 1,
        conglomerado: conglomerados[congIndex].codigo,
        subparcela: subparcelas[spIndex].codigo,
        nombreCientifico: especies[especieIndex].cientifico,
        nombresComunes: especies[especieIndex].comun,
        categoria: "Latifoliado",
        dap: parseFloat((Math.random() * 40 + 10).toFixed(1)),
        altura: parseFloat((Math.random() * 25 + 8).toFixed(1)),
        latitud: subparcelas[spIndex].latitud + (Math.random() * 0.002 - 0.001),
        longitud: subparcelas[spIndex].longitud + (Math.random() * 0.002 - 0.001),
        azimut: Math.floor(Math.random() * 360),
        usos: "maderable, " + (Math.random() > 0.5 ? "medicinal" : "ornamental"),
        observaciones: "Registro automático de prueba",
        estado: Math.random() > 0.3 ? "validado" : "pendiente_validacion",
        validadoPor: Math.random() > 0.3 ? (Math.random() > 0.5 ? "Botanico" : "Coordinador") : "",
        fecha: fechaStr,
        fechaRegistro: fecha.toISOString()
      };

      this.arboles.push(arbol);
    }

    State.data.arboles = this.arboles;
    saveToStorage();
    
    return this.arboles.length;
  },

  // Método para limpiar datos de prueba
  clearSampleData() {
    this.arboles = this.arboles.slice(0, 12);
    State.data.arboles = this.arboles;
    saveToStorage();
  },

  // Método para obtener estadísticas
  getStatistics() {
    const totalArboles = this.arboles.length;
    const validados = this.arboles.filter(a => a.estado === 'validado').length;
    const pendientes = this.arboles.filter(a => a.estado === 'pendiente_validacion').length;
    
    const especiesUnicas = [...new Set(this.arboles.map(a => a.nombreCientifico))].length;
    
    const dapPromedio = this.arboles.reduce((sum, a) => sum + a.dap, 0) / totalArboles;
    const alturaPromedio = this.arboles.reduce((sum, a) => sum + a.altura, 0) / totalArboles;
    
    return {
      totalArboles,
      validados,
      pendientes,
      especiesUnicas,
      dapPromedio: dapPromedio.toFixed(1),
      alturaPromedio: alturaPromedio.toFixed(1),
      conglomeradosActivos: this.conglomerados.length,
      subparcelasActivas: this.subparcelas.length
    };
  }
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
    } else {
      Database.initializeData();
    }
    
    const borradores = localStorage.getItem('ifn_borradores');
    if (borradores) {
      State.borradores = {...State.borradores, ...JSON.parse(borradores)};
    }

    const userSession = localStorage.getItem('ifn_user_session');
    if (userSession) {
      State.user = JSON.parse(userSession);
    }
  } catch (e) {
    console.warn('Error cargando datos del localStorage:', e);
    Database.initializeData();
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

// Guardar sesión de usuario
function saveUserSession() {
  try {
    if (State.user) {
      localStorage.setItem('ifn_user_session', JSON.stringify(State.user));
    } else {
      localStorage.removeItem('ifn_user_session');
    }
  } catch (e) {
    console.warn('Error guardando sesión de usuario:', e);
  }
}

// Sistema de auto-guardado para formularios
function setupAutosave(formId, borradorKey) {
  const form = document.getElementById(formId);
  if (!form) return;

  if (State.borradores[borradorKey]) {
    loadFormData(form, State.borradores[borradorKey]);
    showToast('Borrador cargado automáticamente', 'info', 2000);
  }

  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      if (State.autosaveTimeouts[borradorKey]) {
        clearTimeout(State.autosaveTimeouts[borradorKey]);
      }

      updateAutosaveStatus(borradorKey, 'saving');

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
    if (!element) return;

    if (element.type === 'file') {
      return;
    }

    element.value = borrador.data[key];

    if (element.tagName === 'SELECT') {
      element.dispatchEvent(new Event('change'));
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
  if (!dateString) return false;

  const parts = dateString.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    if (isNaN(date)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date <= today;
  }

  const d2 = new Date(dateString);
  if (isNaN(d2)) return false;

  return d2 <= new Date();
}

// Validación de nombre científico (formato Género especie) - ahora opcional
function isValidScientificName(name) {
  if (!name || name.trim() === '') return false;
  const sciName = name.trim();
  return /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(\s+[a-záéíóúñ\-]+){0,2}$/.test(sciName);
}
// Base de la API Laravel
const API_BASE = 'http://127.0.0.1:8000/api';


// APP mejorada con sistema de borradores y autenticación
const App = {
  init() {
    loadFromStorage();
    this.setupEventListeners();
    this.setupFileInputs();
    this.setupLoginListeners();
    this.go('landing');
  },

  setupEventListeners() {
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

  setupLoginListeners() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('loginPassword');
    
    if (togglePassword && passwordInput) {
      togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').className = type === 'password' ? 'bi bi-eye' : 'bi bi-eye-slash';
      });
    }
  },

  setupFileInputs() {
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
    
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    fileInput.files = dt.files;
    
    fileInput.dispatchEvent(new Event('change'));
  },

  // Nuevo método para manejar login REAL con backend
  // Nuevo método para manejar login REAL con backend
  handleLogin(ev) {
    ev.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
      this.showLoginError('Por favor ingrese email y contraseña');
      return;
    }
    
    if (!this.isValidEmail(email)) {
      this.showLoginError('Por favor ingrese un email válido');
      return;
    }

    fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        console.log('[IFN] Respuesta login backend:', data);

        // Si algo falla (401 o 500, etc.)
        if (!res.ok || data.ok === false) {
          if (res.status === 401) {
            // <<< AQUÍ el mensaje bonito que quieres
            this.showLoginError('Usuario y/o contraseña incorrectos.');
          } else {
            // Error de servidor genérico
            this.showLoginError('Ocurrió un error en el servidor. Intente de nuevo más tarde.');
            console.error('[IFN] Detalle error login:', data);
          }
          return;
        }

        // Si todo está bien
        const usuario = {
          email: data.user.email,
          role: data.user.role,
          nombre: data.user.nombre,
          token: null // después lo usamos si metemos tokens
        };

        this.loginSuccess(usuario);
      })
      .catch((err) => {
        console.error('[IFN] Error de red en login:', err);
        this.showLoginError('No se pudo conectar con el servidor.');
      });
  },

  // Método para llenar credenciales automáticamente
  fillCredentials(email, password) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
    document.getElementById('loginMessage').classList.add('d-none');
    
    showToast(`Credenciales de ${email.split('@')[0]} cargadas`, 'info', 2000);
  },

  // Validar formato de email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Mostrar error en login
  showLoginError(message) {
    const messageEl = document.getElementById('loginMessage');
    messageEl.textContent = message;
    messageEl.classList.remove('d-none');
    
    messageEl.classList.add('shake');
    setTimeout(() => {
      messageEl.classList.remove('shake');
    }, 500);
  },

  // Login exitoso
  loginSuccess(usuario) {
    State.user = usuario;
    saveUserSession();
    
    document.getElementById('loginMessage').classList.add('d-none');
    showToast(`Bienvenido/a, ${usuario.nombre}`, 'success');
    
    this.go('dashboard');
    
    this.actualizarNavegacion();
    this.actualizarBotonesAuth();
  },

  go(view){
    State.route = view; 
    hideAll();
    
    const views = {
      'landing':'#view-landing',
      'login':'#view-login',
      'dashboard':'#view-dashboard',
      'gestionUsuarios':'#view-gestionUsuarios',
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

    this.actualizarNavegacion();

    switch(view){
      case 'login':
        const loginForm = document.getElementById('formLogin');
        if (loginForm) {
          loginForm.reset();
          loginForm.classList.remove('was-validated');
        }
        document.getElementById('loginMessage').classList.add('d-none');
        break;
        
      case 'dashboard':
        qs('#userRole').textContent = State.user?.role || '';
        qs('#userEmail').textContent = State.user?.email || '';
        qs('#cardsAdministrador').classList.toggle('d-none', State.user?.role!=='Administrador');
        qs('#cardsCoordinador').classList.toggle('d-none', State.user?.role!=='Coordinador');
        qs('#cardsTecnico').classList.toggle('d-none', State.user?.role!=='Tecnico');
        qs('#cardsBotanico').classList.toggle('d-none', State.user?.role!=='Botanico');
        
        this.actualizarBotonesAuth();
        this.actualizarBorradoresUI();
        break;
        
      case 'gestionUsuarios':
        this.cargarGestionUsuarios();
        break;
        
      case 'conglomerado': 
        State.activeForm='conglomerado';
        this.validarPermiso('Coordinador', 'conglomerado');
        setTimeout(() => setupAutosave('formConglomerado', 'conglomerado'), 100);
        break;
        
      case 'subparcela': 
        State.activeForm='subparcela'; 
        this.validarPermiso('Coordinador', 'subparcela');
        fillSelect('#spCong', State.data.conglomerados, c=>`<option value="${c.codigo}">${c.codigo} — ${c.municipio}</option>`); 
        setTimeout(() => setupAutosave('formSubparcela', 'subparcela'), 100);
        break;
        
      case 'arbol':
        this.mostrarInfoEstadoArbol();

        fillSelect('#arCong', State.data.conglomerados, c=>`<option value="${c.codigo}">${c.codigo}</option>`);

        const congSelect = qs('#arCong');
        if (congSelect && !congSelect.dataset.subpListener) {
          congSelect.addEventListener('change', () => this.updateSubparcelas());
          congSelect.dataset.subpListener = '1';
        }

        this.updateSubparcelas();

        setTimeout(() => setupAutosave('formArbol', 'arbol'), 100);
        break;

      case 'validacion': 
        this.validarPermiso('Botanico', 'validacion');
        this.cargarPendientesValidacion();
        break;
        
      case 'reportes': 
        this.validarPermiso('Coordinador', 'reportes');
        this.renderReportes(); 
        break;
        
      case 'mapa': 
        setTimeout(()=>this.mapa.init(), 100); 
        break;
    }
  },


// NUEVO: cargar árboles pendientes desde backend
cargarPendientesValidacion: async function () {
  const tbody = qs('#tablaPendientes tbody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-3">
        Cargando árboles...
      </td>
    </tr>
  `;

  try {
    const res = await fetch('http://127.0.0.1:8000/api/arboles-pendientes', {
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await res.json();
    const rows = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);

    if (!rows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-3">
            No hay árboles registrados aún.
          </td>
        </tr>
      `;
      return;
    }

    // Pintar filas
    tbody.innerHTML = rows.map(row => `
      <tr>
        <td>${row.id_arbol}</td>
        <td>${row.codigo_conglomerado || '-'}</td>
        <td>${row.codigo_subparcela || '-'}</td>
        <td>${row.nombre_cientifico ?? ''}</td>
        <td>Pendiente</td>
        <td>${row.fecha_registro ?? ''}</td>
        <td>
          <button
            class="btn btn-sm btn-outline-primary btn-ver-validar"
            data-id="${row.id_arbol}"
            data-cong="${row.codigo_conglomerado || ''}"
            data-sub="${row.codigo_subparcela || ''}"
            data-nombre="${row.nombre_cientifico || ''}"
          >
            Ver / Validar
          </button>
        </td>
      </tr>
    `).join('');

    // Asignar eventos a los botones
    tbody.querySelectorAll('.btn-ver-validar').forEach(btn => {
      btn.addEventListener('click', () => {
        // Solo el botánico puede validar
        if (State.user?.role !== 'Botanico') {
          showToast('Solo el Botánico puede realizar validación taxonómica', 'warning');
          return;
        }

        const arbol = {
          id: parseInt(btn.dataset.id, 10),
          conglomerado: btn.dataset.cong || '-',
          subparcela: btn.dataset.sub || '-',
          nombreCientifico: btn.dataset.nombre || ''
        };

        App.mostrarModalValidacion(arbol);
      });
    });

  } catch (err) {
    console.error('[IFN] Error cargando árboles pendientes', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-3 text-danger">
          Error al cargar datos desde el servidor.
        </td>
      </tr>
    `;
  }
},


  // NUEVO MÉTODO: Cargar gestión de usuarios
  cargarGestionUsuarios() {
    const permisoElement = qs('#permisoGestionUsuarios');
    const contenidoElement = qs('#contenidoGestionUsuarios');
    
    if (State.user?.role === 'Administrador') {
      if (permisoElement) permisoElement.classList.add('d-none');
      if (contenidoElement) contenidoElement.classList.remove('d-none');
      this.cargarTablaUsuarios();
    } else {
      if (permisoElement) permisoElement.classList.remove('d-none');
      if (contenidoElement) contenidoElement.classList.add('d-none');
      showToast('Acceso restringido: Solo el Administrador puede gestionar usuarios', 'warning');
    }
  },

// ===============================
// Cargar tabla de usuarios (GET /personas)
// ===============================
cargarTablaUsuarios() {
  const tablaUsuarios = qs('#tablaUsuarios');
  const totalUsuarios = qs('#totalUsuarios');

  if (!tablaUsuarios || !totalUsuarios) return;

  fetch(`${API_BASE}/personas`)
    .then(r => r.json())
    .then(data => {
      console.log('[IFN] Respuesta lista personas:', data);

      if (!data.ok) {
        showToast(data.message || 'No se pudieron cargar los usuarios.', 'danger');
        tablaUsuarios.innerHTML = '';
        totalUsuarios.textContent = 'Total: 0 usuarios';
        return;
      }

      const personas = data.data || [];
      totalUsuarios.textContent = `Total: ${personas.length} usuarios`;

      tablaUsuarios.innerHTML = personas.map((p, index) => {
        const correoPk = p.correo;                 // PK real
        const numero   = index + 1;                // ID visible
        const rolFront = (p.tipo_usuario || '').trim();
        const fecha    = p.fecha_creacion
          ? new Date(p.fecha_creacion).toLocaleDateString()
          : '-';

        return `
          <tr>
            <td>${numero}</td>
            <td>${p.nombre_completo || ''}</td>
            <td>${p.correo || ''}</td>

            <td>
              <span class="badge ${App.getBadgeClassForRole(rolFront)}">
                ${rolFront || 'Sin rol'}
              </span>
            </td>

            <td><span class="badge bg-success">Activo</span></td>

            <td>${fecha}</td>

            <td>
              <button class="btn btn-sm btn-outline-primary"
                      onclick="App.editarUsuario('${correoPk}')"
                      title="Editar">
                <i class="bi bi-pencil"></i>
              </button>

              <button class="btn btn-sm btn-outline-warning ms-1"
                      onclick="App.desactivarUsuario('${correoPk}')"
                      title="Eliminar usuario">
                <i class="bi bi-person-x"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    })
    .catch(err => {
      console.error('[IFN] Error cargando usuarios:', err);
      showToast('Error en el servidor al cargar usuarios.', 'danger');
    });
},


// ===============================
// Rol → color del badge
// ===============================
getBadgeClassForRole(role) {
  const classes = {
    'Administrador': 'bg-danger',
    'Coordinador': 'bg-success',
    'Tecnico': 'bg-warning',
    'Botanico': 'bg-info'
  };
  return classes[role] || 'bg-secondary';
},


// ===============================
// Crear nuevo usuario (POST /personas)
// ===============================
mostrarModalNuevoUsuario() {
  const nombre = prompt('Nombre completo del usuario:');
  if (!nombre) return;

  const correo = prompt('Correo electrónico:');
  if (!correo) return;

  const password = prompt('Contraseña (mínimo 4 caracteres):');
  if (!password || password.length < 4) {
    showToast('La contraseña debe tener al menos 4 caracteres.', 'warning');
    return;
  }

  const tipoUsuario = prompt(
    'Rol del usuario (Administrador, Coordinador, Botánico, Técnico):',
    'Botánico'
  );
  if (!tipoUsuario) return;

  const documento = prompt('Documento (obligatorio):');
  if (!documento) {
    showToast('El documento es obligatorio.', 'warning');
    return;
  }

  fetch(`${API_BASE}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      correo,
      nombre_completo: nombre,
      documento,
      password,
      tipo_usuario: tipoUsuario,
    }),
  })
    .then(r => r.json())
    .then(data => {
      console.log('[IFN] Respuesta crear usuario:', data);
      if (!data.ok) {
        showToast(data.message || 'No se pudo crear el usuario.', 'danger');
        return;
      }
      showToast('Usuario creado correctamente.', 'success');
      App.cargarTablaUsuarios();
    })
    .catch(err => {
      console.error('[IFN] Error creando usuario:', err);
      showToast('Error en el servidor al crear usuario.', 'danger');
    });
},


// ===============================
// Editar usuario (PUT /personas/{correo})
// ===============================
editarUsuario(correo) {
  if (!correo) return;

  // 1) Obtener datos actuales del usuario
  fetch(`${API_BASE}/personas/${encodeURIComponent(correo)}`)
    .then(r => r.json())
    .then(data => {
      console.log('[IFN] Datos persona para editar:', data);

      if (!data.ok) {
        showToast(data.message || 'Usuario no encontrado.', 'danger');
        return;
      }

      const p = data.data;

      // 2) Prompt con datos actuales
      const nuevoNombre = prompt('Nombre completo:', p.nombre_completo || '');
      if (!nuevoNombre) return;

      const nuevoCorreo = prompt('Correo electrónico:', p.correo || '');
      if (!nuevoCorreo) return;

      const nuevoRol = prompt(
        'Rol (Administrador, Coordinador, Botánico, Técnico):',
        p.tipo_usuario || ''
      );
      if (!nuevoRol) return;

      const nuevoDocumento = prompt(
        'Documento:',
        p.documento || ''
      ) || '';

      const nuevaPassword = prompt(
        'Nueva contraseña (deja vacío para NO cambiarla):',
        ''
      );

      // 3) Construir payload
      const payload = {
        correo: nuevoCorreo,
        nombre_completo: nuevoNombre,
        documento: nuevoDocumento,
        tipo_usuario: nuevoRol,
      };

      if (nuevaPassword && nuevaPassword.trim().length >= 4) {
        payload.password = nuevaPassword.trim();
      }

      // 4) PUT al backend
      return fetch(`${API_BASE}/personas/${encodeURIComponent(correo)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    })
    .then(r => (r ? r.json() : null))
    .then(data => {
      if (!data) return;
      console.log('[IFN] Respuesta editar usuario:', data);

      if (!data.ok) {
        showToast(data.message || 'No se pudo actualizar el usuario.', 'danger');
        return;
      }

      showToast('Usuario actualizado correctamente.', 'success');
      App.cargarTablaUsuarios();
    })
    .catch(err => {
      console.error('[IFN] Error editando usuario:', err);
      showToast('Error en el servidor al editar usuario.', 'danger');
    });
},


// ===============================
// Eliminar usuario (DELETE /personas/{correo})
// ===============================
desactivarUsuario(correo) {
  if (!correo) return;

  // Evitar borrarse a sí mismo
  if (correo === State.user?.email) {
    showToast('No puedes eliminar tu propio usuario.', 'warning');
    return;
  }

  if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
    return;
  }

  fetch(`${API_BASE}/personas/${encodeURIComponent(correo)}`, {
    method: 'DELETE',
  })
    .then(r => r.json())
    .then(data => {
      console.log('[IFN] Respuesta eliminar usuario:', data);

      if (!data.ok) {
        showToast(data.message || 'No se pudo eliminar el usuario.', 'danger');
        return;
      }

      showToast('Usuario eliminado correctamente.', 'success');
      App.cargarTablaUsuarios();
    })
    .catch(err => {
      console.error('[IFN] Error eliminando usuario:', err);
      showToast('Error en el servidor al eliminar usuario.', 'danger');
    });
},


  actualizarNavegacion() {
    const userRole = State.user?.role;
    
    qsa('[data-role-visible]').forEach(el => {
      el.classList.add('d-none');
    });
    
    if (userRole) {
      qsa(`[data-role-visible*="${userRole}"]`).forEach(el => {
        el.classList.remove('d-none');
      });
    }
  },

  actualizarBotonesAuth() {
    const btnLogin = qs('#btnLogin');
    const btnLogout = qs('#btnLogout');
    
    if (State.user) {
      btnLogin?.classList.add('d-none');
      btnLogout?.classList.remove('d-none');
    } else {
      btnLogin?.classList.remove('d-none');
      btnLogout?.classList.add('d-none');
    }
  },

  validarPermiso(rolRequerido, modulo) {
    if (State.user?.role !== rolRequerido) {
      const permisoElement = qs(`#permiso${modulo.charAt(0).toUpperCase() + modulo.slice(1)}`);
      if (permisoElement) {
        permisoElement.classList.remove('d-none');
      }
      showToast(`Acceso restringido: Solo ${rolRequerido} puede acceder a este módulo`, 'warning');
      return false;
    }
    return true;
  },

  mostrarInfoEstadoArbol() {
    const infoElement = qs('#infoEstadoArbol');
    const textoElement = qs('#textoEstadoArbol');
    
    if (!infoElement || !textoElement) return;
    
    if (State.user?.role === 'Tecnico') {
      infoElement.classList.remove('d-none');
      textoElement.textContent = 'El árbol se registrará como PENDIENTE de validación. El botánico deberá confirmar la identidad científica.';
    } else if (State.user?.role === 'Botanico') {
      infoElement.classList.remove('d-none');
      textoElement.textContent = 'El árbol se registrará como VALIDADO inmediatamente. Asegúrese de conocer correctamente la identidad científica.';
    } else {
      infoElement.classList.add('d-none');
    }
  },

  actualizarBorradoresUI() {
    const borradoresSection = qs('#borradoresSection');
    const borradoresCount = qs('#borradoresCount');
    const listaBorradores = qs('#listaBorradores');
    
    if (!borradoresSection || !borradoresCount || !listaBorradores) return;
    
    const borradoresActivos = Object.values(State.borradores).filter(b => b !== null && b.data);
    const tieneBorradores = borradoresActivos.length > 0;
    
    borradoresSection.classList.toggle('d-none', !tieneBorradores || !State.user);
    
    if (tieneBorradores) {
      borradoresCount.textContent = borradoresActivos.length;
      
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
      
      const formId = `form${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
      const form = qs(`#${formId}`);
      if (form) form.reset();
      
      updateAutosaveStatus(tipo, 'saved');
      this.actualizarBorradoresUI();
      showToast('Borrador limpiado', 'success');
    }
  },

  updateSubparcelas() {
    const congSelect = qs('#arCong');
    const subSelect  = qs('#arSub');

    if (!congSelect || !subSelect) return;

    const codigo = congSelect.value.trim();

    subSelect.innerHTML = '<option value="">Seleccione…</option>';
    subSelect.disabled = true;

    if (!codigo) {
      return;
    }

    console.log('[IFN] Cargando subparcelas desde backend para', codigo);

    const token = State?.user?.token || localStorage.getItem('IFN_TOKEN');

    fetch(`http://127.0.0.1:8000/api/conglomerados/${encodeURIComponent(codigo)}/subparcelas`, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error('[IFN] Error HTTP al cargar subparcelas:', res.status, data);
          subSelect.innerHTML = '<option value="">Error cargando subparcelas</option>';
          return;
        }

        const lista = data.subparcelas || [];
        if (!lista.length) {
          subSelect.innerHTML = '<option value="">No hay subparcelas para este conglomerado</option>';
          return;
        }

        subSelect.innerHTML =
          '<option value="">Seleccione…</option>' +
          lista.map(sp => {
            const id   = sp.id_subparcela ?? sp.id;
            const cod  = sp.codigo_subparcela ?? sp.codigo;
            const num  = sp.numero_subparcela ?? '';
            return `<option value="${id}">Subparcela ${num} — ${cod}</option>`;
          }).join('');

        subSelect.disabled = false;
      })
      .catch((err) => {
        console.error('[IFN] Error al conectar para cargar subparcelas:', err);
        subSelect.innerHTML = '<option value="">Error cargando subparcelas</option>';
      });
  },

  // Método de login antiguo (para compatibilidad)
  login(role){ 
    const usuario = UsersDB.usuarios.find(u => u.role === role && u.activo);
    if (usuario) {
      this.loginSuccess({
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nombre: usuario.nombre
      });
    } else {
      showToast(`No se encontró usuario para el rol: ${role}`, 'warning');
    }
  },

  logout(){ 
    State.user = null; 
    saveUserSession();
    this.go('landing'); 
    showToast('Sesión cerrada', 'secondary'); 
    
    this.actualizarNavegacion();
    this.actualizarBotonesAuth();
  },

  saveConglomerado(ev) {
    ev.preventDefault();

    if (!this.validarPermiso('Coordinador', 'conglomerado')) return;

    const form = ev.target;
    const fd = new FormData(form);
    const obj = Object.fromEntries(fd.entries());
    const msgEl = qs('#msgCong');

    const normalizeDate = (value) => {
      if (!value) return null;
      if (value.includes('/')) {
        const [day, month, year] = value.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return value;
    };

    const fechaInicioRaw = (obj.fechaInicio || '').trim();
    const fechaFinalRaw  = (obj.fechaFinal  || '').trim();

    if (!fechaInicioRaw) {
      msgEl.innerHTML = alertBox('danger', 'La fecha de inicio es obligatoria.');
      return;
    }

    obj.fecha_inicio = normalizeDate(fechaInicioRaw);
    obj.fecha_final  = fechaFinalRaw ? normalizeDate(fechaFinalRaw) : null;

    if (!obj.fecha_inicio) {
      msgEl.innerHTML = alertBox('danger', 'La fecha de inicio es inválida.');
      return;
    }

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const lat = toNum(obj.latitud), lng = toNum(obj.longitud);
    if (!isValidCoordinate(lat, lng)) {
      msgEl.innerHTML = alertBox(
        'danger',
        'Coordenadas inválidas. Latitud debe estar entre -90 y 90, Longitud entre -180 y 180.'
      );
      return;
    }

    const fechaInicio = obj.fecha_inicio;
    const fechaFinal  = obj.fecha_final;

    if (!isValidDate(fechaInicio)) {
      msgEl.innerHTML = alertBox(
        'danger',
        'Fecha de inicio inválida. No puede ser futura.'
      );
      return;
    }

    if (fechaFinal && !isValidDate(fechaFinal)) {
      msgEl.innerHTML = alertBox(
        'danger',
        'Fecha final inválida. No puede ser futura.'
      );
      return;
    }

    if (State.data.conglomerados.some(c => c.codigo === obj.codigo)) {
      msgEl.innerHTML = alertBox('danger', 'El código del conglomerado ya existe.');
      return;
    }

    const fechaFront = fechaInicio;

    State.data.conglomerados.push({
      id: Date.now(),
      ...obj,
      fecha: fechaFront,
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinal,
      estado: obj.estado || 'registrado',
      fechaCreacion: new Date().toISOString(),
      adjuntos: form.adjuntos?.files
        ? Array.from(form.adjuntos.files).map(f => f.name)
        : []
    });

    const payload = {
      codigo: obj.codigo,
      region: obj.region || null,
      latitud: obj.latitud,
      longitud: obj.longitud,
      altitud: obj.altitud || null,
      fecha_inicio: fechaInicio,
      fecha_final: fechaFinal,
      brigada: obj.brigada,
      estado: obj.estado || 'registrado',
      correo: obj.correo || null
    };

    fetch('http://127.0.0.1:8000/api/conglomerados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error('Error de validación al crear el conglomerado', data);
          if (data.errors) {
            const mensajes = [];
            for (const campo in data.errors) {
              mensajes.push(`${campo}: ${data.errors[campo].join(', ')}`);
            }
            msgEl.innerHTML = alertBox('danger', mensajes.join('<br>'));
          } else {
            msgEl.innerHTML = alertBox(
              'danger',
              data.message || 'Error al guardar el conglomerado en el servidor.'
            );
          }
          throw data;
        }

        console.log('Guardado en backend:', data);
        showToast('Conglomerado guardado en la base de datos', 'success');
      })
      .catch((err) => {
        console.error('Error guardando en backend', err);
        showToast('Se guardó localmente pero falló el envío al servidor', 'warning');
      });

    State.borradores.conglomerado = null;
    saveBorradores();
    saveToStorage();

    msgEl.innerHTML = alertBox('success', 'Conglomerado registrado exitosamente');
    showToast('Conglomerado guardado', 'success');
    form.reset();
    form.classList.remove('was-validated');

    if (State.mapReady) {
      this.mapa.addMarker(
        [lat, lng],
        `${obj.codigo} — ${obj.municipio || ''}`,
        'conglomerado'
      );
      this.mapa.fit();
    }

    this.actualizarBorradoresUI();
  },

  saveSubparcela(ev) {
    ev.preventDefault();

    if (!this.validarPermiso('Coordinador', 'subparcela')) return;

    const form = ev.target;
    const fd   = new FormData(form);
    const obj  = Object.fromEntries(fd.entries());
    const msgEl = qs('#msgSub');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const codigoConglomerado = obj.conglomerado;
    const numeroSubparcela = parseInt(obj.numeroSubparcela, 10);

    const codigoSubparcela =
      obj.codigo && obj.codigo.trim() !== ''
        ? obj.codigo.trim()
        : `${codigoConglomerado}-SP${numeroSubparcela}`;

    const fechaLevantamiento = obj.fechaLevantamiento;
    const cobertura = obj.cobertura;

    let alteraciones = '';
    if (form.alteraciones) {
      alteraciones = Array.from(form.alteraciones.selectedOptions)
        .map(o => o.value)
        .join(', ');
    }

    const observaciones = obj.observaciones || '';

    const payload = {
      codigo_conglomerado: codigoConglomerado,
      numero_subparcela: numeroSubparcela,
      codigo_subparcela: codigoSubparcela,
      fecha_levantamiento: fechaLevantamiento,
      cobertura: cobertura,
      alteraciones: alteraciones,
      observaciones: observaciones
    };

    console.log('[IFN] Enviando subparcela al backend:', payload);

    fetch('http://127.0.0.1:8000/api/subparcelas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error('Error al crear subparcela en backend:', data);

          if (data.errors) {
            const firstField = Object.keys(data.errors)[0];
            const firstMsg   = data.errors[firstField][0] || 'Error de validación.';
            msgEl.innerHTML = alertBox('danger', `Error de validación: ${firstMsg}`);
          } else {
            msgEl.innerHTML = alertBox(
              'danger',
              data.message || 'Error al guardar la subparcela en el servidor.'
            );
          }

          throw data;
        }

        console.log('Subparcela guardada en backend:', data);

        if (!State.data.subparcelas) {
          State.data.subparcelas = [];
        }

        State.data.subparcelas.push({
          id_subparcela: data.subparcela?.id_subparcela ?? Date.now(),
          codigo_conglomerado: payload.codigo_conglomerado,
          numero_subparcela: payload.numero_subparcela,
          codigo_subparcela: payload.codigo_subparcela,
          cobertura: payload.cobertura,
          alteraciones: payload.alteraciones,
          observaciones: payload.observaciones,
          fecha_levantamiento: payload.fecha_levantamiento
        });

        saveToStorage?.();

        if (State.borradores?.subparcela) {
          State.borradores.subparcela = null;
          saveBorradores?.();
        }

        msgEl.innerHTML = alertBox('success', 'Subparcela registrada exitosamente');
        showToast('Subparcela guardada en la base de datos', 'success');

        form.reset();
        form.classList.remove('was-validated');
        this.actualizarBorradoresUI?.();

      })
      .catch((err) => {
        console.error('Error guardando subparcela en backend:', err);
        showToast('Se guardó en el navegador pero falló el envío al servidor', 'warning');
      });
  },

  // NUEVO saveArbol (sin estado, usando backend)
  saveArbol(ev) {
    ev.preventDefault();

    const form = ev.target;
    const fd   = new FormData(form);
    const obj  = Object.fromEntries(fd.entries());
    const msgEl = qs('#msgArb');

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const cong = State.data.conglomerados.find(c =>
      String(c.codigo ?? c.codigo_conglomerado) === String(obj.conglomerado)
    );

    if (!cong) {
      console.warn('[IFN] No se encontró conglomerado en State para código:', obj.conglomerado, 'lista:', State.data.conglomerados);
      msgEl.innerHTML = alertBox('danger', 'Conglomerado inexistente.');
      return;
    }

    const subp = State.data.subparcelas.find(s =>
      String(s.id_subparcela ?? s.id) === String(obj.subparcela)
    );

    if (!subp) {
      console.warn('[IFN] No se encontró subparcela en State para cong:', obj.conglomerado, 'subparcela (id):', obj.subparcela, 'lista State.data.subparcelas:', State.data.subparcelas);
      msgEl.innerHTML = alertBox('danger', 'Subparcela no pertenece a ese conglomerado.');
      return;
    }

    const payload = {
      id_conglomerado: cong.id_conglomerado ?? cong.id,
      id_subparcela:   subp.id_subparcela   ?? subp.id,

      codigo_conglomerado: obj.conglomerado,
      codigo_subparcela:   obj.subparcela,

      categoria:         obj.categoria,
      distancia:         obj.distancia || 0,
      nombre_cientifico: obj.nombreCientifico || null,
      nombre_comun:      obj.nombreComun      || null,
      especie:           obj.especie          || null,
      dap:               obj.dap              || null,
      altura_fuste:      obj.alturaFuste      || null,
      altura_total:      obj.alturaTotal      || null,
      uso_comun:         obj.usoComun         || null,
      observaciones:     obj.observaciones    || null
    };

    console.log('[IFN] Enviando árbol al backend:', payload);

    fetch('http://127.0.0.1:8000/api/arboles', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        console.log('[IFN] Respuesta al crear árbol:', data);

        if (!res.ok || data.ok === false) {
          const msg = data.message || 'Error al registrar árbol.';
          msgEl.innerHTML = alertBox('danger', msg);
          console.error('[ERR árbol]', data);
          return;
        }

        msgEl.innerHTML = alertBox('success', 'Árbol registrado correctamente.');
        showToast('Árbol registrado en la base de datos', 'success');
        form.reset();
        form.classList.remove('was-validated');
      })
      .catch(err => {
        console.error('[IFN] Error al conectar con backend', err);
        msgEl.innerHTML = alertBox('danger', 'Error al conectar con el servidor.');
        showToast('Error al conectar con el servidor', 'danger');
      });
  },

  renderPendientes() {
  const tb = qs('#tablaPendientes tbody');
  if (!tb) return;

  // Fila por defecto mientras carga
  tb.innerHTML = `
    <tr>
      <td colspan="7" class="text-center text-muted py-3">
        Cargando registros pendientes…
      </td>
    </tr>
  `;

  fetch('http://127.0.0.1:8000/api/arboles/pendientes', {
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(res => res.json())
    .then(json => {
      const rows = Array.isArray(json)
        ? json
        : (Array.isArray(json.data) ? json.data : []);

      if (!rows.length) {
        tb.innerHTML = `
          <tr>
            <td colspan="7" class="text-center text-muted py-3">
              No hay registros pendientes de validación.
            </td>
          </tr>
        `;
        return;
      }

      tb.innerHTML = rows.map(a => `
        <tr>
          <td>${a.id}</td>
          <td>${a.conglomerado || '-'}</td>
          <td>${a.subparcela || '-'}</td>
          <td><em class="nombre-cientifico">${a.nombre_cientifico || '-'}</em></td>
          <td>
            <span class="badge estado-pendiente">
              ${a.estado ? a.estado.replace('_', ' ') : 'pendiente'}
            </span>
          </td>
          <td>${a.fecha || '-'}</td>
          <td>
            <button class="btn btn-sm btn-success rounded-pill" onclick="App.validar(${a.id})">
              <i class="bi bi-check-lg me-1"></i>Validar
            </button>
            <button class="btn btn-sm btn-outline-primary rounded-pill ms-1" onclick="App.editarArbol(${a.id})">
              <i class="bi bi-pencil"></i>
            </button>
          </td>
        </tr>
      `).join('');
    })
    .catch(err => {
      console.error('[IFN] Error al cargar pendientes desde el servidor:', err);
      tb.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger py-3">
            Error al cargar datos desde el servidor.
          </td>
        </tr>
      `;
    });
},


  editarArbol(id) {
    const arbol = State.data.arboles.find(a => a.id === id);
    if (!arbol) return;
    
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
    if(!(State.user?.role==='Botanico')){ 
      showToast('Solo el Botánico puede realizar validación taxonómica', 'warning'); 
      return; 
    }
    
    const arbol = State.data.arboles.find(a => a.id === id);
    if (!arbol) return;
    
    this.mostrarModalValidacion(arbol);
  },

  mostrarModalValidacion(arbol) {
    const modalHTML = `
      <div class="modal fade" id="modalValidacion" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="bi bi-check-circle me-2"></i>Validar Árbol</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p><strong>ID:</strong> ${arbol.id}</p>
              <p><strong>Conglomerado:</strong> ${arbol.conglomerado}</p>
              <p><strong>Subparcela:</strong> ${arbol.subparcela}</p>
              
              <div class="mb-3">
                <label class="form-label"><strong>Nombre científico:</strong></label>
                <input type="text" class="form-control" id="nombreCientificoValidado" value="${arbol.nombreCientifico}" placeholder="Corrija el nombre científico si es necesario">
                <div class="form-text">Puede corregir el nombre científico durante la validación</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label"><strong>Observaciones de validación:</strong></label>
                <textarea class="form-control" id="observacionesValidacion" rows="3" placeholder="Agregue observaciones sobre la validación taxonómica"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-success" onclick="App.confirmarValidacion(${arbol.id})">
                <i class="bi bi-check-lg me-1"></i>Confirmar Validación
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    const modal = new bootstrap.Modal(document.getElementById('modalValidacion'));
    modal.show();
    
    document.getElementById('modalValidacion').addEventListener('hidden.bs.modal', function () {
      modalContainer.remove();
    });
  },

confirmarValidacion(id) {
  const nombreCientificoValidado = document.getElementById('nombreCientificoValidado').value;
  const observacionesValidacion = document.getElementById('observacionesValidacion').value || '';

  if (!nombreCientificoValidado.trim()) {
    showToast('El nombre científico es requerido', 'warning');
    return;
  }

  const payload = {
    nombre_cientifico: nombreCientificoValidado.trim(),
    observaciones_validacion: observacionesValidacion.trim() || null
  };

  fetch(`http://127.0.0.1:8000/api/arboles/${id}/validar`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(async (res) => {
      const data = await res.json().catch(() => ({}));
      console.log('[IFN] Respuesta validación árbol:', data);

      if (!res.ok || data.ok === false) {
        if (data.errors) {
          const firstField = Object.keys(data.errors)[0];
          const firstMsg   = data.errors[firstField][0] || 'Error de validación.';
          showToast(firstMsg, 'danger');
        } else {
          showToast(data.message || 'Error al validar el árbol en el servidor', 'danger');
        }
        return;
      }

      // Actualizar árbol en State (para reportes, etc.)
      State.data.arboles = State.data.arboles.map(a =>
        a.id === id
          ? {
              ...a,
              estado: 'validado',
              validadoPor: State.user?.role || a.validadoPor || 'Botanico',
              nombreCientifico: nombreCientificoValidado.trim(),
              observaciones: a.observaciones
                ? a.observaciones + (observacionesValidacion ? ` | Validación: ${observacionesValidacion}` : '')
                : (observacionesValidacion ? `Validación: ${observacionesValidacion}` : a.observaciones)
            }
          : a
      );

      saveToStorage();

      // 🔁 Volver a cargar la tabla usando el endpoint que SÍ funciona
      this.cargarPendientesValidacion();

      const modalEl = document.getElementById('modalValidacion');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }

      showToast('Registro validado exitosamente', 'success');
    })
    .catch((err) => {
      console.error('[IFN] Error al conectar al validar árbol:', err);
      showToast('Error al conectar con el servidor al validar el árbol', 'danger');
    });
},

  renderReportes(){
    const fFechaDesde = qs('#fFechaDesde').value;
    const fFechaHasta = qs('#fFechaHasta').value;
    const fZona = qs('#fZona').value.trim().toLowerCase();
    const fEspecie = qs('#fEspecie').value.trim().toLowerCase();
    const fTecnico = qs('#fTecnico').value.trim().toLowerCase();
    const fEstado = qs('#fEstado').value;
    
    let rows = State.data.arboles;
    
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
  },

  generarDatosPrueba() {
    if (confirm('¿Generar 50 registros de árboles de prueba? Esto agregará datos ficticios a la base de datos.')) {
      const count = Database.generateSampleData(50);
      showToast(`Se generaron ${count} registros de prueba`, 'success');
      this.renderReportes();
    }
  },

  limpiarDatosPrueba() {
    if (confirm('¿Eliminar todos los registros de prueba? Se conservarán solo los registros originales.')) {
      Database.clearSampleData();
      showToast('Datos de prueba eliminados', 'info');
      this.renderReportes();
    }
  },

  mostrarEstadisticas() {
    const stats = Database.getStatistics();
    
    const modalHTML = `
      <div class="modal fade" id="statsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title"><i class="bi bi-graph-up me-2"></i>Estadísticas del IFN</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="card border-0 bg-light">
                    <div class="card-body text-center">
                      <h3 class="text-primary">${stats.totalArboles}</h3>
                      <p class="mb-0">Total de árboles registrados</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="card border-0 bg-light">
                    <div class="card-body text-center">
                      <h3 class="text-success">${stats.especiesUnicas}</h3>
                      <p class="mb-0">Especies diferentes</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card border-0">
                    <div class="card-body text-center">
                      <h6>Validados</h6>
                      <h4 class="text-success">${stats.validados}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card border-0">
                    <div class="card-body text-center">
                      <h6>Pendientes</h6>
                      <h4 class="text-warning">${stats.pendientes}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card border-0">
                    <div class="card-body text-center">
                      <h6>Conglomerados</h6>
                      <h4 class="text-info">${stats.conglomeradosActivos}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-12">
                  <div class="card border-0">
                    <div class="card-body">
                      <h6>Medidas Promedio</h6>
                      <div class="row text-center">
                        <div class="col-6">
                          <strong>DAP:</strong> ${stats.dapPromedio} cm
                        </div>
                        <div class="col-6">
                          <strong>Altura:</strong> ${stats.alturaPromedio} m
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    const modal = new bootstrap.Modal(document.getElementById('statsModal'));
    modal.show();
    
    document.getElementById('statsModal').addEventListener('hidden.bs.modal', function () {
      modalContainer.remove();
    });
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
      
      if (typeof L === 'undefined') {
        mapError.classList.remove('d-none');
        mapEl.style.display = 'none';
        showToast('Error al cargar el mapa', 'danger', 5000);
        return;
      }
      
      const center = [7.119349, -73.122741];
      const map = L.map(mapEl).setView(center, 12); 
      State.map = map;
      
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

document.addEventListener('DOMContentLoaded', () => {
  try {
    localStorage.removeItem('ifn_user');
    sessionStorage.removeItem('ifn_user');

    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const body = document.body;

    if (body) {
      body.classList.remove('user-logged-in');
    }
    if (btnLogin) {
      btnLogin.classList.remove('d-none');
    }
    if (btnLogout) {
      btnLogout.classList.add('d-none');
    }

    const today = new Date().toISOString().split('T')[0];
    const dateNames = ['fechaInicio', 'fechaFinal', 'fechaLevantamiento'];

    dateNames.forEach((name) => {
      const input = document.querySelector(`input[name="${name}"]`);
      if (input) {
        input.setAttribute('max', today);
      }
    });

    console.log('[IFN] Configuración inicial de fechas y login aplicada');
  } catch (e) {
    console.error('[IFN] Error configurando fechas / login inicial', e);
  }
});

// Boot mejorado
window.App = App;

document.addEventListener('DOMContentLoaded', ()=>{
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
  
  const storedTheme = getStoredTheme();
  const systemTheme = getSystemTheme();
  setTheme(storedTheme || systemTheme);
  
  btn?.addEventListener('click', ()=>{
    const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
    const next = current==='light' ? 'dark' : 'light';
    setTheme(next);
  });
  
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!getStoredTheme()) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  App.init();
});
