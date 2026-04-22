import React, { useState, useEffect } from 'react';
import TestViewer from './TestViewer';           
import FlashcardViewer from './FlashcardViewer'; 
import VisorTema from './VisorTema';
import VisorEsquema from './VisorEsquema'; // <-- AÑADIR
import JSZip from 'jszip';
import { get, set } from 'idb-keyval';
import './App.css';

// --- ICONOS SVG PUROS ---
const IcoStar = ({ size = 20, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IcoFolder = ({ size = 24, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const IcoPlus = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IcoTrash = ({ size = 18, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IcoPlay = ({ size = 18, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IcoBack = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IcoCards = ({ size = 20, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="14" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IcoTest = ({ size = 20, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h6"></path><path d="M9 17h6"></path><path d="M9 9h1"></path></svg>;
const IcoDoc = ({ size = 20, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IcoMindMap = ({ size = 20, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="6" rx="1"></rect><path d="M12 8v4"></path><path d="M12 12H6v2"></path><path d="M12 12h6v2"></path><rect x="2" y="14" width="8" height="6" rx="1"></rect><rect x="14" y="14" width="8" height="6" rx="1"></rect></svg>;
const IcoDownload = ({ size = 18, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const IcoZip = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12"></path><path d="M18 7V5"></path><path d="M18 11V9"></path><path d="M18 15V13"></path><path d="M15 15h3a3 3 0 0 1 3 3v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2a3 3 0 0 1 3-3z"></path></svg>;


function App() {
  const [archivosGuardados, setArchivosGuardados] = useState([]);
  const [carpetas, setCarpetas] = useState([]);
  const [carpetaActiva, setCarpetaActiva] = useState(null); 
  const [archivoActivo, setArchivoActivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // --- PALETA NEUTRA: VERDE SALVIA Y TONOS TIERRA ---
  const stylesApp = {
    letra: "'Nunito', 'Quicksand', 'Segoe UI', sans-serif", 
    principal: '#6B8E6B',             
    secundario: '#F2F5F2',            
    fondoHeader: '#FFFFFF',           
    headerText: '#3A3F3A',            
    fondoBody: '#F8F9F8',             
    cardBg: '#FFFFFF',
    texto: '#4A4F4A',                 
    textoApagado: '#8C938C',          
    borde: '#E4E7E4',                 
    danger: '#C68B59'                 
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const archivos = await get('mi_biblioteca_unificada') || [];
      const folders = await get('mi_biblioteca_carpetas_unificada') || [];
      const archivosAdaptados = archivos.map(a => a.carpetaId !== undefined ? a : { ...a, carpetaId: null });
      setArchivosGuardados(archivosAdaptados);
      setCarpetas(folders);
      setCargando(false);
    };
    cargarDatos();
  }, []);

  const guardarArchivos = async (nuevos) => {
    setArchivosGuardados(nuevos);
    await set('mi_biblioteca_unificada', nuevos);
  };

  const descargarArchivoIndividual = (archivo, e) => {
    if(e) e.stopPropagation();
    const blob = new Blob([archivo.contenido], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = archivo.nombre;
    link.click();
    URL.revokeObjectURL(url);
  };

  const descargarBibliotecaZIP = async () => {
    if (archivosGuardados.length === 0) return alert("No hay archivos para descargar.");
    const zip = new JSZip();
    archivosGuardados.forEach(a => {
      zip.file(a.nombre, a.contenido);
    });
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = "mi_biblioteca_estudio.zip";
    link.click();
    URL.revokeObjectURL(url);
  };

  const guardarCarpetas = async (nuevasCarpetas) => {
    setCarpetas(nuevasCarpetas);
    await set('mi_biblioteca_carpetas_unificada', nuevasCarpetas);
  };

  const crearCarpeta = async () => {
    const nombre = window.prompt("Nombre de la nueva carpeta:");
    if (!nombre || !nombre.trim()) return;
    const nuevaCarpeta = { 
        id: 'folder_' + Date.now(), 
        nombre: nombre.trim(),
        parentId: carpetaActiva || null 
    };
    await guardarCarpetas([...carpetas, nuevaCarpeta]);
  };

  const eliminarCarpeta = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que quieres eliminar esta carpeta? Los archivos en su interior se moverán a la raíz.")) {
      const actualizados = archivosGuardados.map(a => a.carpetaId === id ? { ...a, carpetaId: null } : a);
      await guardarArchivos(actualizados);
      await guardarCarpetas(carpetas.filter(c => c.id !== id));
    }
  };

  const cambiarArchivoDeCarpeta = async (archivoId, nuevoCarpetaId, e) => {
    e.stopPropagation();
    const idFinal = nuevoCarpetaId === "root" ? null : nuevoCarpetaId;
    const actualizados = archivosGuardados.map(a => a.id === archivoId ? { ...a, carpetaId: idFinal } : a);
    await guardarArchivos(actualizados);
  };

  // IMPORTACIÓN UNIFICADA
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;
    setCargando(true);
    let nuevos = [...archivosGuardados];
    let ignorados = []; 

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const nombreMin = file.name.toLowerCase();

      if (nombreMin.endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          for (const [filename, zipEntry] of Object.entries(contents.files)) {
            const zName = filename.toLowerCase();
            if (!zipEntry.dir && (zName.endsWith('.cards') || zName.endsWith('.json') || zName.endsWith('.test') || zName.endsWith('.esquema'))) {
              const content = await zipEntry.async("text");
              nuevos.push({ id: 'doc_' + Date.now() + Math.random(), nombre: filename, contenido: content, carpetaId: carpetaActiva });
            }
          }
        } catch (e) { alert("Error leyendo ZIP."); }
      } 
      else if (nombreMin.endsWith('.cards') ||  nombreMin.endsWith('.test') || nombreMin.endsWith('.json') || nombreMin.endsWith('.esquema')) {
        try {
          const text = await file.text();
          nuevos.push({ id: 'doc_' + Date.now() + Math.random(), nombre: file.name, contenido: text, carpetaId: carpetaActiva });
        } catch (e) { console.error(e); }
      } 
      else {
        // <-- Si la extensión no coincide, lo guardamos para avisar
        ignorados.push(file.name);
      }
    }
    
    await guardarArchivos(nuevos);
    setCargando(false);
    event.target.value = ''; 

    // <-- Mostramos una alerta si algún archivo fue ignorado
    if (ignorados.length > 0) {
      alert("Los siguientes archivos no se importaron por no tener una extensión válida (.cards, .test, .esquema, .json, .zip):\n" + ignorados.join(", "));
    }
  };

  const crearMazoVacio = async () => {
    const nombre = window.prompt("Nombre del nuevo mazo:");
    if (!nombre || !nombre.trim()) return;
    const plantilla = JSON.stringify({ titulo: nombre.trim(), tarjetas: [] }, null, 2);
    const nuevos = [...archivosGuardados, { id: 'doc_' + Date.now(), nombre: nombre.trim() + '.cards', contenido: plantilla, carpetaId: carpetaActiva }];
    await guardarArchivos(nuevos);
  };

  const crearTestVacio = async () => {
    const nombre = window.prompt("Nombre del nuevo test:");
    if (!nombre || !nombre.trim()) return;
    const plantilla = JSON.stringify({ titulo: nombre.trim(), preguntas: [] }, null, 2);
    const nuevos = [...archivosGuardados, { id: 'doc_' + Date.now(), nombre: nombre.trim() + '.test', contenido: plantilla, carpetaId: carpetaActiva }];
    await guardarArchivos(nuevos);
  };

  const crearTemaVacio = async () => {
    const nombre = window.prompt("Nombre del nuevo tema:");
    if (!nombre || !nombre.trim()) return;
    
    // Estructura base 
    const plantilla = JSON.stringify({ 
      title: nombre.trim(), 
      contentTree: [] 
    }, null, 2);
    
    const nuevos = [...archivosGuardados, { 
      id: 'doc_' + Date.now(), 
      nombre: nombre.trim() + '.json', 
      contenido: plantilla, 
      carpetaId: carpetaActiva 
    }];
    await guardarArchivos(nuevos);
  };

  const crearEsquemaVacio = async () => {
    const nombre = window.prompt("Nombre del nuevo esquema:");
    if (!nombre || !nombre.trim()) return;
    const plantilla = JSON.stringify({ titulo: nombre.trim(), nodes: [], edges: [] }, null, 2);
    const nuevos = [...archivosGuardados, { id: 'doc_' + Date.now(), nombre: nombre.trim() + '.esquema', contenido: plantilla, carpetaId: carpetaActiva }];
    await guardarArchivos(nuevos);
  };

  const eliminarArchivo = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que quieres eliminar este archivo?")) {
      await guardarArchivos(archivosGuardados.filter(a => a.id !== id));
    }
  };

  const actualizarContenido = async (id, nuevoContenido) => {
    const actualizados = archivosGuardados.map(a => a.id === id ? { ...a, contenido: nuevoContenido } : a);
    await guardarArchivos(actualizados);
    setArchivoActivo(prev => ({ ...prev, contenido: nuevoContenido }));
  };

  const archivosAMostrar = archivosGuardados.filter(a => a.carpetaId === carpetaActiva);
  const nombreCarpetaActiva = carpetaActiva ? carpetas.find(c => c.id === carpetaActiva)?.nombre : "Mi Biblioteca";

  // --- MODO VISOR ---
  if (archivoActivo) {
    const esTest = archivoActivo.nombre.toLowerCase().endsWith('.test');
    const esTema = archivoActivo.nombre.toLowerCase().endsWith('.json');
    const esEsquema = archivoActivo.nombre.toLowerCase().endsWith('.esquema');
    
    
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', background: 'white', fontFamily: stylesApp.letra }}>
        <div style={{ padding: '10px 20px', background: stylesApp.fondoBody, borderBottom: `1px solid ${stylesApp.borde}`, display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => setArchivoActivo(null)} 
            style={{ ...xpButton, background: stylesApp.secundario, color: stylesApp.principal, padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
          >
            <IcoBack color={stylesApp.principal} /> Volver a {nombreCarpetaActiva}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {esTest ? (
             <TestViewer 
                nombreArchivo={archivoActivo.nombre}
                contenido={archivoActivo.contenido}
                onSave={(nuevoJson) => actualizarContenido(archivoActivo.id, nuevoJson)}
                colors={stylesApp} 
             />
          ) : esTema ? (
             <VisorTema 
                nombreArchivo={archivoActivo.nombre}
                contenido={archivoActivo.contenido}
                onSave={(nuevoJson) => actualizarContenido(archivoActivo.id, nuevoJson)}
                colors={stylesApp}
             />
          ) : esEsquema ? (
             <VisorEsquema 
                nombreArchivo={archivoActivo.nombre}
                contenido={archivoActivo.contenido}
                onSave={(nuevoJson) => actualizarContenido(archivoActivo.id, nuevoJson)}
                colors={stylesApp}
             />
          ) : (
             <FlashcardViewer 
                nombreArchivo={archivoActivo.nombre}
                contenido={archivoActivo.contenido}
                onSave={(nuevoJson) => actualizarContenido(archivoActivo.id, nuevoJson)}
                colors={stylesApp} 
             />
          )}
        </div>
      </div>
    );
  }

  // --- MODO BIBLIOTECA ---
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: stylesApp.fondoBody, display: 'flex', flexDirection: 'column', color: stylesApp.texto, fontFamily: stylesApp.letra }}>
      <div style={{ background: stylesApp.fondoHeader, color: stylesApp.headerText, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 10, flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {carpetaActiva !== null && (
             <button 
                onClick={() => {
                    const carpetaActual = carpetas.find(c => c.id === carpetaActiva);
                    setCarpetaActiva(carpetaActual?.parentId || null);
                }} 
                style={{ background: 'transparent', border: 'none', color: stylesApp.headerText, cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}
             >
               <IcoBack color={stylesApp.headerText} /> 
               {carpetas.find(c => c.id === carpetaActiva)?.parentId ? 'Atrás' : 'Raíz'}
             </button>
          )}
          <h1 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            {carpetaActiva ? <IcoFolder size={20} color={stylesApp.principal} /> : <IcoStar size={20} color={stylesApp.principal} />} 
            {nombreCarpetaActiva}
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={descargarBibliotecaZIP} style={{ ...xpButton, background: '#E8F0E8', color: stylesApp.principal, padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IcoZip size={14} color={stylesApp.principal} /> Backup .ZIP
          </button>

          <button onClick={crearEsquemaVacio} style={{ ...xpButton, background: 'transparent', color: stylesApp.texto, border: `1px solid ${stylesApp.borde}`, padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IcoMindMap size={14} color={stylesApp.texto} /> Nuevo Esquema
          </button>

          <button onClick={crearTemaVacio} style={{ ...xpButton, background: 'transparent', color: stylesApp.texto, border: `1px solid ${stylesApp.borde}`, padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IcoDoc size={14} color={stylesApp.texto} /> Nuevo Tema
          </button>

          <button onClick={crearMazoVacio} style={{ ...xpButton, background: 'transparent', color: stylesApp.texto, border: `1px solid ${stylesApp.borde}`, padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IcoCards size={14} color={stylesApp.texto} /> Nuevo Mazo
          </button>

          <button onClick={crearTestVacio} style={{ ...xpButton, background: 'transparent', color: stylesApp.texto, border: `1px solid ${stylesApp.borde}`, padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IcoTest size={14} color={stylesApp.texto} /> Nuevo Test
          </button>
        
          <button onClick={crearCarpeta} style={{ ...xpButton, background: 'transparent', color: stylesApp.texto, border: `1px solid ${stylesApp.borde}`, padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <IcoPlus size={14} color={stylesApp.texto} /> Carpeta
          </button>

          <label style={{ ...xpButton, background: stylesApp.principal, color: 'white', padding: '7px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <IcoPlus size={14} color="white" /> Importar
            <input type="file" accept=".cards,.json,.test, .esquema, .zip,*/*" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', alignContent: 'start' }}>
        
        {cargando && <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: stylesApp.textoApagado }}>Cargando biblioteca...</div>}
        
        {!cargando && !carpetaActiva && carpetas.length === 0 && archivosAMostrar.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: stylesApp.textoApagado, background: stylesApp.cardBg, borderRadius: '12px', border: `1px solid ${stylesApp.borde}` }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
                <IcoCards size={40} color={stylesApp.borde} />
                <IcoTest size={40} color={stylesApp.borde} />
            </div>
            <h2 style={{ marginTop: '10px', color: stylesApp.texto }}>Tu biblioteca está vacía</h2>
            <p>Crea un archivo nuevo o importa tus .cards y .test para empezar.</p>
          </div>
        )}

        {!cargando && carpetas.filter(c => (c.parentId || null) === (carpetaActiva || null)).map(carpeta => {
          const cantidad = archivosGuardados.filter(a => a.carpetaId === carpeta.id).length;
          return (
            <div 
              key={carpeta.id} 
              onClick={() => setCarpetaActiva(carpeta.id)}
              style={{ background: stylesApp.cardBg, padding: '15px 20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${stylesApp.borde}`, transition: '0.2s' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ color: stylesApp.principal }}><IcoFolder size={28} /></div>
                <div>
                  <h3 style={{ margin: '0 0 2px 0', color: stylesApp.texto, fontSize: '15px', fontWeight: 'bold' }}>{carpeta.nombre}</h3>
                  <span style={{ fontSize: '12px', color: stylesApp.textoApagado }}>{cantidad} elementos</span>
                </div>
              </div>
              <button onClick={(e) => eliminarCarpeta(carpeta.id, e)} style={{ ...xpButton, background: 'transparent', color: stylesApp.danger, padding: '5px', cursor: 'pointer' }}>
                <IcoTrash size={16} />
              </button>
            </div>
          );
        })}

        {!cargando && archivosAMostrar.map(archivo => {
          const isEsquema = archivo.nombre.toLowerCase().endsWith('.esquema');
          const isTest = archivo.nombre.toLowerCase().endsWith('.test');
          const isTema = archivo.nombre.toLowerCase().endsWith('.json');
          let conteo = 0;
          try { 
              const parseado = JSON.parse(archivo.contenido);
              conteo = isTest ? (parseado.preguntas?.length || 0) : isTema ? (parseado.contentTree?.length || 0) : isEsquema ? (parseado.nodes?.length || 0) : (parseado.tarjetas?.length || 0);
          } catch(e){}

          return (
            <div 
              key={archivo.id} 
              onClick={() => setArchivoActivo(archivo)}
              style={{ background: stylesApp.cardBg, padding: '18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid ${stylesApp.borde}` }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    {isTest ? <IcoTest size={18} color={stylesApp.principal}/> : isTema ? <IcoDoc size={18} color={stylesApp.principal}/> : isEsquema ? <IcoMindMap size={18} color={stylesApp.principal}/> : <IcoCards size={18} color={stylesApp.principal}/>}
                    <h3 style={{ margin: 0, color: stylesApp.texto, fontSize: '15px', fontWeight: 'bold', wordBreak: 'break-word', lineHeight: '1.4' }}>
                    {archivo.nombre.replace('.cards', '').replace('.json', '').replace('.test', '').replace('.esquema', '')}
                    </h3>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: stylesApp.principal, fontWeight: 'bold', background: stylesApp.secundario, padding: '4px 10px', borderRadius: '8px' }}>
                    {conteo} {isTest ? "preguntas" : isTema ? "apartados" : isEsquema ? "nodos" : "tarjetas"}
                  </span>
                  
                  <select 
                    onClick={e => e.stopPropagation()} 
                    onChange={e => cambiarArchivoDeCarpeta(archivo.id, e.target.value, e)}
                    value={archivo.carpetaId || "root"}
                    style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '8px', border: `1px solid ${stylesApp.borde}`, background: stylesApp.fondoBody, color: stylesApp.textoApagado, outline: 'none', cursor: 'pointer', maxWidth: '120px', fontFamily: 'inherit' }}
                  >
                    <option value="root">Mover a Raíz</option>
                    {carpetas.map(c => <option key={c.id} value={c.id}>Mover a {c.nombre}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${stylesApp.borde}`, paddingTop: '10px' }}>
                <button onClick={(e) => eliminarArchivo(archivo.id, e)} style={{ ...xpButton, background: '#F9F2EB', color: stylesApp.danger, padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                  <IcoTrash size={14} color={stylesApp.danger}/>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: stylesApp.principal, fontWeight: 'bold', fontSize: '13px' }}>
                  {isTest ? 'Probar' : isTema ? 'Leer' : isEsquema ? 'Diseñar' : 'Estudiar'} <IcoPlay size={14} color={stylesApp.principal} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const xpButton = { border: 'none', cursor: 'pointer', transition: 'background 0.2s', outline: 'none', fontFamily: 'inherit' };
export default App;