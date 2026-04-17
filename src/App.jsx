import React, { useState, useEffect } from 'react';
import TestViewer from './TestViewer';
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

function App() {
  const [testsGuardados, setTestsGuardados] = useState([]);
  const [carpetas, setCarpetas] = useState([]);
  const [carpetaActiva, setCarpetaActiva] = useState(null); 
  const [testActivo, setTestActivo] = useState(null);
  const [cargando, setCargando] = useState(true);

  // --- PALETA NEUTRA: VERDE SALVIA Y TONOS TIERRA ---
  const stylesApp = {
    letra: "'Nunito', 'Quicksand', 'Segoe UI', sans-serif", 
    principal: '#6B8E6B',             // Verde Salvia Apagado (Elegante y relaja la vista)
    secundario: '#F2F5F2',            // Verde-crema ultraclaro para fondos de acento
    fondoHeader: '#FFFFFF',           // Cabecera limpia
    headerText: '#3A3F3A',            // Gris verdoso oscuro (casi negro)
    fondoBody: '#F8F9F8',             // Blanco hueso / Arena muy claro
    cardBg: '#FFFFFF',
    texto: '#4A4F4A',                 // Gris oscuro cálido para lectura
    textoApagado: '#8C938C',          // Gris medio
    borde: '#E4E7E4',                 // Bordes suaves
    danger: '#C68B59'                 // Ocre / Arcilla para borrar (huye del rojo chillón)
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const tests = await get('mi_biblioteca_tests') || [];
      const folders = await get('mi_biblioteca_carpetas') || [];
      const testsAdaptados = tests.map(t => t.carpetaId !== undefined ? t : { ...t, carpetaId: null });
      setTestsGuardados(testsAdaptados);
      setCarpetas(folders);
      setCargando(false);
    };
    cargarDatos();
  }, []);

  const guardarTests = async (nuevosTests) => {
    setTestsGuardados(nuevosTests);
    await set('mi_biblioteca_tests', nuevosTests);
  };

  const guardarCarpetas = async (nuevasCarpetas) => {
    setCarpetas(nuevasCarpetas);
    await set('mi_biblioteca_carpetas', nuevasCarpetas);
  };

  const crearCarpeta = async () => {
    const nombre = window.prompt("Nombre de la nueva carpeta:");
    if (!nombre || !nombre.trim()) return;
    const nuevaCarpeta = { id: 'folder_' + Date.now(), nombre: nombre.trim() };
    await guardarCarpetas([...carpetas, nuevaCarpeta]);
  };

  const eliminarCarpeta = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que quieres eliminar esta carpeta? Los tests en su interior se moverán a la raíz.")) {
      const testsActualizados = testsGuardados.map(t => t.carpetaId === id ? { ...t, carpetaId: null } : t);
      await guardarTests(testsActualizados);
      await guardarCarpetas(carpetas.filter(c => c.id !== id));
    }
  };

  const cambiarTestDeCarpeta = async (testId, nuevoCarpetaId, e) => {
    e.stopPropagation();
    const idFinal = nuevoCarpetaId === "root" ? null : nuevoCarpetaId;
    const actualizados = testsGuardados.map(t => t.id === testId ? { ...t, carpetaId: idFinal } : t);
    await guardarTests(actualizados);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;
    setCargando(true);
    let nuevos = [...testsGuardados];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const contents = await zip.loadAsync(file);
          for (const [filename, zipEntry] of Object.entries(contents.files)) {
            if (!zipEntry.dir && filename.endsWith('.test')) {
              const content = await zipEntry.async("text");
              nuevos.push({ id: 'test_' + Date.now() + Math.random(), nombre: filename, contenido: content, carpetaId: carpetaActiva });
            }
          }
        } catch (e) { alert("Error leyendo ZIP."); }
      } else if (file.name.toLowerCase().endsWith('.test')) {
        try {
          const text = await file.text();
          nuevos.push({ id: 'test_' + Date.now() + Math.random(), nombre: file.name, contenido: text, carpetaId: carpetaActiva });
        } catch (e) { console.error(e); }
      }
    }
    await guardarTests(nuevos);
    setCargando(false);
    event.target.value = ''; 
  };

  const eliminarTest = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("¿Seguro que quieres eliminar este test?")) {
      await guardarTests(testsGuardados.filter(t => t.id !== id));
    }
  };

  const actualizarContenidoTest = async (id, nuevoContenido) => {
    const actualizados = testsGuardados.map(t => t.id === id ? { ...t, contenido: nuevoContenido } : t);
    await guardarTests(actualizados);
    setTestActivo(prev => ({ ...prev, contenido: nuevoContenido }));
  };

  const testsAMostrar = testsGuardados.filter(t => t.carpetaId === carpetaActiva);
  const nombreCarpetaActiva = carpetaActiva ? carpetas.find(c => c.id === carpetaActiva)?.nombre : "Mis Tests";

  // --- MODO VISOR ---
  if (testActivo) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: 'white', fontFamily: stylesApp.letra }}>
        <div style={{ padding: '10px 20px', background: stylesApp.fondoBody, borderBottom: `1px solid ${stylesApp.borde}`, display: 'flex', alignItems: 'center' }}>
          <button onClick={() => setTestActivo(null)} style={{ ...xpButton, background: stylesApp.secundario, color: stylesApp.principal, padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
            <IcoBack color={stylesApp.principal} /> Volver a {nombreCarpetaActiva}
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <TestViewer 
            nombreArchivo={testActivo.nombre}
            contenido={testActivo.contenido}
            onSave={(nuevoJson) => actualizarContenidoTest(testActivo.id, nuevoJson)}
            colors={stylesApp} 
          />
        </div>
      </div>
    );
  }

  // --- MODO BIBLIOTECA ---
  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: stylesApp.fondoBody, display: 'flex', flexDirection: 'column', color: stylesApp.texto, fontFamily: stylesApp.letra }}>
      <div style={{ background: stylesApp.fondoHeader, color: stylesApp.headerText, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 10, flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {carpetaActiva && (
             <button onClick={() => setCarpetaActiva(null)} style={{ background: 'transparent', border: 'none', color: stylesApp.headerText, cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
               <IcoBack color={stylesApp.headerText} /> Raíz
             </button>
          )}
          <h1 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            {carpetaActiva ? <IcoFolder size={20} color={stylesApp.principal} /> : <IcoStar size={20} color={stylesApp.principal} />} 
            {nombreCarpetaActiva}
          </h1>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {!carpetaActiva && (
            <button onClick={crearCarpeta} style={{ ...xpButton, background: 'transparent', color: stylesApp.texto, border: `1px solid ${stylesApp.borde}`, padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <IcoPlus size={14} color={stylesApp.texto} /> Carpeta
            </button>
          )}
          <label style={{ ...xpButton, background: stylesApp.principal, color: 'white', padding: '7px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <IcoPlus size={14} color="white" /> Importar
            <input type="file" accept=".test,.zip" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', alignContent: 'start' }}>
        
        {cargando && <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: stylesApp.textoApagado }}>Cargando biblioteca...</div>}
        
        {!cargando && !carpetaActiva && carpetas.length === 0 && testsAMostrar.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: stylesApp.textoApagado, background: stylesApp.cardBg, borderRadius: '12px', border: `1px solid ${stylesApp.borde}` }}>
            <IcoStar size={40} color={stylesApp.borde} />
            <h2 style={{ marginTop: '15px', color: stylesApp.texto }}>Tu biblioteca está vacía</h2>
            <p>Crea una carpeta o importa archivos .test para empezar.</p>
          </div>
        )}

        {!cargando && !carpetaActiva && carpetas.map(carpeta => {
          const cantidadTests = testsGuardados.filter(t => t.carpetaId === carpeta.id).length;
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
                  <span style={{ fontSize: '12px', color: stylesApp.textoApagado }}>{cantidadTests} tests</span>
                </div>
              </div>
              <button onClick={(e) => eliminarCarpeta(carpeta.id, e)} style={{ ...xpButton, background: 'transparent', color: stylesApp.danger, padding: '5px', cursor: 'pointer' }}>
                <IcoTrash size={16} />
              </button>
            </div>
          );
        })}

        {!cargando && testsAMostrar.map(test => {
          let numPreguntas = 0;
          try { numPreguntas = JSON.parse(test.contenido).preguntas?.length || 0; } catch(e){}

          return (
            <div 
              key={test.id} 
              onClick={() => setTestActivo(test)}
              style={{ background: stylesApp.cardBg, padding: '18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', border: `1px solid ${stylesApp.borde}` }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', color: stylesApp.texto, fontSize: '15px', fontWeight: 'bold', wordBreak: 'break-word', lineHeight: '1.4' }}>
                  {test.nombre.replace('.test', '')}
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: stylesApp.principal, fontWeight: 'bold', background: stylesApp.secundario, padding: '4px 10px', borderRadius: '8px' }}>
                    {numPreguntas} preguntas
                  </span>
                  
                  <select 
                    onClick={e => e.stopPropagation()} 
                    onChange={e => cambiarTestDeCarpeta(test.id, e.target.value, e)}
                    value={test.carpetaId || "root"}
                    style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '8px', border: `1px solid ${stylesApp.borde}`, background: stylesApp.fondoBody, color: stylesApp.textoApagado, outline: 'none', cursor: 'pointer', maxWidth: '120px', fontFamily: 'inherit' }}
                  >
                    <option value="root">Mover a Raíz</option>
                    {carpetas.map(c => <option key={c.id} value={c.id}>Mover a {c.nombre}</option>)}
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${stylesApp.borde}`, paddingTop: '10px' }}>
                <button onClick={(e) => eliminarTest(test.id, e)} style={{ ...xpButton, background: '#F9F2EB', color: stylesApp.danger, padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}>
                  <IcoTrash size={14} color={stylesApp.danger}/>
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: stylesApp.principal, fontWeight: 'bold', fontSize: '13px' }}>
                  Abrir <IcoPlay size={14} color={stylesApp.principal} />
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