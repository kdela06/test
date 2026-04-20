import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// --- ICONOS SVG ---
const IcoEdit = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const IcoSave = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IcoPlay = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IcoTrash = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IcoPDF = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IcoBombilla = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.37-2.06.31-3.13C15.24 8.02 13.19 6 10.94 6 8.68 6 6.64 8.02 6.5 10.87c-.06 1.07.13 2.15.31 3.13a11.5 11.5 0 0 1 1 3h4.38a11.5 11.5 0 0 1 1-3z"/><path d="M12 2v3"/><path d="m4.9 4.9 1.5 1.5"/><path d="m17.6 17.6 1.5 1.5"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="M4.9 19.1 6.4 17.6"/><path d="m17.6 6.4 1.5-1.5"/></svg>;
const IcoX = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IcoTrophy = ({ size = 48, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
const IcoCheck = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

const Toast = ({ mensaje, onClear, colors }) => {
    useEffect(() => {
        const timer = setTimeout(onClear, 3000);
        return () => clearTimeout(timer);
    }, [onClear]);

    return (
        <div style={{
            position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
            background: colors.texto, color: 'white', padding: '10px 20px', borderRadius: '12px',
            zIndex: 999, fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontFamily: colors.letra
        }}>
            <IcoCheck color="white" size={16} />
            {mensaje}
        </div>
    );
};

const xpButton = { border: 'none', cursor: 'pointer', transition: '0.2s', outline: 'none', fontFamily: 'inherit' };
const xpInput = { border: 'none', padding: '12px 16px', outline: 'none', background: 'white', fontSize: '14px', fontFamily: 'inherit' };

const TestViewer = ({ contenido, onSave, nombreArchivo, colors }) => {
    const [testData, setTestData] = useState(() => {
        try { 
            const parsed = JSON.parse(contenido);
            return parsed.preguntas ? parsed : { titulo: "Test", preguntas: [] };
        } catch { return { titulo: "Test", preguntas: [] }; }
    });

    const [checkpoint, setCheckpoint] = useState(contenido);
    const [notificacion, setNotificacion] = useState(null);
    const [modo, setModo] = useState('edit'); 
    const [confirmarBorrado, setConfirmarBorrado] = useState(null);
    
    const [idx, setIdx] = useState(0);
    const [seleccionados, setSeleccionados] = useState([]);
    const [respuestas, setRespuestas] = useState({}); 
    const [finalizado, setFinalizado] = useState(false);

    const guardarCambiosReal = () => {
        const nuevoContenido = JSON.stringify(testData, null, 2);
        if (onSave) onSave(nuevoContenido);
        setCheckpoint(nuevoContenido); 
        setNotificacion("Test guardado correctamente");
    };

    const iniciarQuiz = () => {
        setIdx(0); setSeleccionados([]); setRespuestas({}); setFinalizado(false); setModo('quiz');
    };

    const pedirEliminar = (pIdx) => setConfirmarBorrado(pIdx);

    const ejecutarEliminar = () => {
        if (confirmarBorrado === null) return;
        const nuevasPreguntas = testData.preguntas.filter((_, i) => i !== confirmarBorrado);
        const nuevoTestData = { ...testData, preguntas: nuevasPreguntas };
        setTestData(nuevoTestData);
        
        const nuevoContenido = JSON.stringify(nuevoTestData, null, 2);
        if (onSave) onSave(nuevoContenido);
        setCheckpoint(nuevoContenido);
        setNotificacion("Pregunta eliminada");
        setConfirmarBorrado(null);
    };

    // --- GENERADOR PDF NATIVO (pdf-lib) ---
    const exportarPDFPropio = async () => {
        try {
            setNotificacion("Generando documento PDF...");
            const pdfDoc = await PDFDocument.create();
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

            const margin = 50;
            const width = 595.28; // A4
            const height = 841.89; // A4
            const maxWidth = width - margin * 2;

            let page = pdfDoc.addPage([width, height]);
            let y = height - margin;

            const checkSpace = (requiredSpace) => {
                if (y - requiredSpace < margin) {
                    page = pdfDoc.addPage([width, height]);
                    y = height - margin;
                }
            };

            const sanitize = (str) => str ? String(str).replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "") : "";

            const breakTextIntoLines = (text, size, font, maxW) => {
                const lines = [];
                const paragraphs = text.split('\n');
                for (const p of paragraphs) {
                    const words = p.split(' ');
                    let currentLine = '';
                    for (const word of words) {
                        const testLine = currentLine ? `${currentLine} ${word}` : word;
                        const w = font.widthOfTextAtSize(testLine, size);
                        if (w > maxW) {
                            if (currentLine) lines.push(currentLine);
                            currentLine = word;
                        } else {
                            currentLine = testLine;
                        }
                    }
                    if (currentLine) lines.push(currentLine);
                }
                return lines;
            };

            const drawTextWrapped = (text, font, size, color, indent = 0) => {
                const lines = breakTextIntoLines(sanitize(text), size, font, maxWidth - indent);
                lines.forEach(line => {
                    checkSpace(size + 6);
                    page.drawText(line, { x: margin + indent, y, size, font, color });
                    y -= (size + 6);
                });
            };

            // Título PDF (Gris muy oscuro verdoso para mantener la estética tierra)
            const title = sanitize(nombreArchivo ? nombreArchivo.replace('.test', '') : (testData.titulo || "Examen"));
            drawTextWrapped(title, fontBold, 16, rgb(0.25, 0.30, 0.25)); 
            y -= 20;

            // Preguntas
            testData.preguntas.forEach((p, i) => {
                checkSpace(40);
                y -= 5;
                drawTextWrapped(`${i + 1}. ${p.pregunta || "_________________"}`, fontBold, 11, rgb(0.15, 0.15, 0.15));
                y -= 2;

                p.opciones.forEach((opc, j) => {
                    const esCorrecta = p.correctas.includes(j);
                    const bullet = esCorrecta ? "■" : "□";
                    drawTextWrapped(`${bullet}  ${opc || "_________________"}`, esCorrecta ? fontBold : fontNormal, 10.5, rgb(0.3, 0.3, 0.3), 15);
                });

                if (p.explicacion) {
                    y -= 3;
                    drawTextWrapped(`Solución: ${p.explicacion}`, fontItalic, 9.5, rgb(0.4, 0.4, 0.4), 15);
                }
                y -= 15; 
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (nombreArchivo || 'test').replace('.test', '.pdf');
            a.click();
            URL.revokeObjectURL(url);
            
            setNotificacion("PDF descargado con éxito");
        } catch (error) {
            console.error(error);
            setNotificacion("Error al generar PDF");
        }
    };

    if (modo === 'edit') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.fondoBody, position: 'relative', color: colors.texto, fontFamily: colors.letra }}>
                
                {notificacion && <Toast mensaje={notificacion} onClear={() => setNotificacion(null)} colors={colors} />}
                
                {/* MODAL INTERNO DE CONFIRMACIÓN */}
                {confirmarBorrado !== null && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', maxWidth: '320px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: `1px solid ${colors.borde}` }}>
                            <div style={{ background: '#f4ece6', display: 'inline-flex', padding: '12px', borderRadius: '50%', marginBottom: '10px' }}>
                                <IcoTrash size={28} color={colors.danger} />
                            </div>
                            <h3 style={{ margin: '5px 0 10px 0', color: colors.texto, fontWeight: 'bold' }}>¿Eliminar pregunta?</h3>
                            <p style={{ margin: '0 0 25px 0', color: colors.textoApagado, fontSize: '14px', lineHeight: '1.5' }}>
                                Esta acción no se puede deshacer. La pregunta se borrará permanentemente del test.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button onClick={() => setConfirmarBorrado(null)} style={{ ...xpButton, padding: '10px 20px', borderRadius: '8px', border: `1px solid ${colors.borde}`, background: 'white', cursor: 'pointer', fontWeight: 'bold', color: colors.textoApagado, fontSize: '14px' }}>Cancelar</button>
                                <button onClick={ejecutarEliminar} style={{ ...xpButton, padding: '10px 20px', borderRadius: '8px', border: 'none', background: colors.danger, color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Sí, eliminar</button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ padding: '15px 20px', background: colors.cardBg, display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.borde}` }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', color: colors.texto, fontSize: '16px' }}>{nombreArchivo}</span>
                        <span style={{ fontSize: '12px', color: colors.textoApagado }}>{testData.preguntas.length} preguntas creadas</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={exportarPDFPropio} 
                                style={{ ...xpButton, background: '#f4ece6', color: colors.danger, border: `1px solid #eadad1`, borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                            <IcoPDF color={colors.danger}/> PDF Nativo
                        </button>
                        <button onClick={iniciarQuiz} disabled={testData.preguntas.length === 0} 
                                style={{ ...xpButton, background: colors.principal, color: 'white', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <IcoPlay color="white"/> Probar Test
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', WebkitOverflowScrolling: 'touch' }}>
                    {testData.preguntas.map((p, pIdx) => {
                        const original = JSON.parse(checkpoint).preguntas?.[pIdx];
                        const modificado = JSON.stringify(original) !== JSON.stringify(p);
                        
                        return (
                            <div key={pIdx} style={{ background: colors.cardBg, padding: '25px', borderRadius: '20px', marginBottom: '20px', border: modificado ? `2px solid ${colors.principal}` : `1px solid ${colors.borde}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                    <span style={{ padding: '6px 14px', background: colors.secundario, color: colors.principal, borderRadius: '20px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>PREGUNTA {pIdx + 1}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {modificado && (
                                            <button onClick={guardarCambiosReal} style={{ ...xpButton, display: 'flex', alignItems: 'center', gap: '6px', background: '#edf2ed', color: '#4a6b4a', border: 'none', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                                <IcoSave color="#4a6b4a"/> Guardar
                                            </button>
                                        )}
                                        <button onClick={() => pedirEliminar(pIdx)} style={{ ...xpButton, display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: colors.danger, border: 'none', padding: '6px', cursor: 'pointer' }}>
                                            <IcoTrash color={colors.danger}/>
                                        </button>
                                    </div>
                                </div>
                                
                                <textarea 
                                    value={p.pregunta} 
                                    onChange={(e) => { const n = [...testData.preguntas]; n[pIdx].pregunta = e.target.value; setTestData({...testData, preguntas: n}); }} 
                                    placeholder="Escribe la pregunta aquí..."
                                    style={{ ...xpInput, width: '100%', borderRadius: '12px', minHeight: '70px', marginBottom: '20px', boxSizing: 'border-box', border: `1px solid ${colors.borde}`, fontSize: '15px' }} 
                                />
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                    {p.opciones.map((opc, oIdx) => (
                                        <div key={oIdx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: colors.fondoBody, padding: '10px 15px', borderRadius: '12px', border: `1px solid ${colors.borde}` }}>
                                            <input type="checkbox" checked={p.correctas.includes(oIdx)} onChange={() => { const n = [...testData.preguntas]; const c = n[pIdx].correctas; n[pIdx].correctas = c.includes(oIdx) ? c.filter(i => i !== oIdx) : [...c, oIdx]; setTestData({...testData, preguntas: n}); }} style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: colors.principal }} />
                                            <input 
                                                value={opc} 
                                                onChange={(e) => { const n = [...testData.preguntas]; n[pIdx].opciones[oIdx] = e.target.value; setTestData({...testData, preguntas: n}); }} 
                                                placeholder={`Escribe la opción ${oIdx + 1}...`}
                                                style={{ ...xpInput, flex: 1, border: 'none', background: 'transparent', padding: '4px', fontSize: '14px' }} 
                                            />
                                            <button onClick={() => { const n = [...testData.preguntas]; n[pIdx].opciones.splice(oIdx,1); n[pIdx].correctas = n[pIdx].correctas.filter(x=>x!==oIdx).map(x=>x>oIdx?x-1:x); setTestData({...testData, preguntas: n}); }} style={{ ...xpButton, border: 'none', background: 'none', color: colors.textoApagado, padding: '4px' }}>
                                                <IcoX size={18} color={colors.textoApagado}/>
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={() => { const n = [...testData.preguntas]; n[pIdx].opciones.push(""); setTestData({...testData, preguntas: n}); }} style={{ ...xpButton, border: `2px dashed ${colors.borde}`, background: 'none', padding: '12px', borderRadius: '12px', color: colors.textoApagado, fontSize: '13px', fontWeight: 'bold' }}>
                                        + Añadir opción
                                    </button>
                                </div>

                                <div style={{ marginTop: '15px', padding: '20px', background: colors.secundario, borderRadius: '14px', border: 'none' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: colors.principal, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                        <IcoBombilla size={18} color={colors.principal} /> Explicación de la respuesta (Opcional)
                                    </span>
                                    <textarea 
                                        value={p.explicacion || ""} 
                                        onChange={(e) => { const n = [...testData.preguntas]; n[pIdx].explicacion = e.target.value; setTestData({...testData, preguntas: n}); }} 
                                        placeholder="Escribe la solución detallada que verá el usuario..."
                                        style={{ ...xpInput, width: '100%', borderRadius: '10px', minHeight: '60px', background: colors.cardBg, border: 'none', boxSizing: 'border-box' }} 
                                    />
                                </div>
                            </div>
                        );
                    })}
                    
                    <button 
                        onClick={() => setTestData({ ...testData, preguntas: [...testData.preguntas, { pregunta: "", opciones: ["", ""], correctas: [0], explicacion: "" }] })} 
                        style={{ ...xpButton, display: 'block', width: '100%', background: colors.cardBg, border: `2px dashed ${colors.borde}`, color: colors.textoApagado, borderRadius: '16px', padding: '18px', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginBottom: '20px' }}
                    >
                        + Añadir nueva pregunta
                    </button>
                </div>
            </div>
        );
    }

    // --- MODO QUIZ ---
    const pregunta = testData.preguntas[idx];
    const esMultiple = pregunta?.correctas.length > 1;
    const yaRespondido = !!respuestas[idx];

    if (finalizado) {
        const aciertos = Object.values(respuestas).filter(r => r.correcta).length;
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: colors.letra }}>
                <IcoTrophy size={70} color={colors.principal} />
                <h2 style={{ color: colors.principal, fontSize: '28px', fontWeight: 'bold', marginTop: '20px' }}>¡Test finalizado!</h2>
                <div style={{ fontSize: '55px', fontWeight: '900', color: colors.texto, margin: '20px 0' }}>{aciertos} / {testData.preguntas.length}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '350px', marginTop: '20px' }}>
                    <button onClick={iniciarQuiz} style={{ ...xpButton, background: colors.principal, color: 'white', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}>Repetir Test</button>
                    <button onClick={() => setModo('edit')} style={{ ...xpButton, background: colors.fondoBody, color: colors.texto, borderRadius: '14px', padding: '16px', fontWeight: 'bold', fontSize: '15px', border: `1px solid ${colors.borde}` }}>Volver al Editor</button>
                </div>
            </div>
        );
    }

    if (!pregunta) return (
        <div style={{padding: '40px', textAlign: 'center', color: colors.textoApagado, fontFamily: colors.letra, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>No hay preguntas disponibles en este test.</p>
            <button onClick={() => setModo('edit')} style={{ ...xpButton, background: colors.principal, color: 'white', padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                <IcoEdit size={16} color="white"/> Volver al Editor
            </button>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', color: colors.texto, fontFamily: colors.letra }}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${colors.borde}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: colors.fondoBody, padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', color: colors.principal }}>
                    Pregunta {idx + 1} de {testData.preguntas.length}
                </div>
                <button onClick={() => setModo('edit')} style={{ ...xpButton, background: 'transparent', color: colors.textoApagado, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                    <IcoEdit size={16} color={colors.textoApagado}/> Editor
                </button>
            </div>
            
            <div style={{ flex: 1, padding: '30px 20px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '15px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: esMultiple ? colors.principal : '#588b58', background: esMultiple ? colors.secundario : '#eff4ef', display: 'inline-block', padding: '6px 12px', borderRadius: '10px' }}>
                        {esMultiple ? "● Selección Múltiple" : "● Selección Única"}
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', color: colors.texto, marginBottom: '30px', lineHeight: '1.5' }}>{pregunta.pregunta}</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {pregunta.opciones.map((opc, i) => {
                            let borderColor = colors.borde; let bgColor = 'white'; let textColor = colors.texto; let grosor = '1px';
                            if (yaRespondido) {
                                if (pregunta.correctas.includes(i)) { borderColor = '#588b58'; bgColor = '#eff4ef'; textColor = '#2d4f2d'; grosor='2px';}
                                else if (respuestas[idx].opciones.includes(i)) { borderColor = colors.danger; bgColor = '#fdf4ec'; textColor = '#8a5a38'; grosor='2px'; }
                            } else if (seleccionados.includes(i)) { borderColor = colors.principal; bgColor = colors.secundario; textColor = colors.principal; grosor = '2px'; }
                            
                            return (
                                <div key={i} onClick={() => {
                                    if (yaRespondido) return;
                                    setSeleccionados(prev => {
                                        if (prev.includes(i)) return prev.filter(x => x !== i);
                                        if (pregunta.correctas.length === 1) return [i];
                                        if (prev.length >= pregunta.correctas.length) return prev;
                                        return [...prev, i];
                                    });
                                }} 
                                     style={{ padding: '18px 20px', borderRadius: '14px', border: `${grosor} solid ${borderColor}`, background: bgColor, color: textColor, cursor: yaRespondido ? 'default' : 'pointer', transition: 'all 0.15s ease', fontWeight: '600', fontSize: '16px' }}>
                                    {opc}
                                </div>
                            );
                        })}
                    </div>

                    {yaRespondido && pregunta?.explicacion && (
                        <div style={{ 
                            marginTop: '30px', padding: '20px', background: colors.secundario, 
                            borderLeft: `5px solid ${colors.principal}`, borderRadius: '0 16px 16px 0',
                            animation: 'fadeIn 0.4s ease-in-out'
                        }}>
                            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: colors.principal, display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                <IcoBombilla size={20} color={colors.principal} /> Explicación de la respuesta
                            </h4>
                            <p style={{ margin: 0, fontSize: '15px', color: colors.texto, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {pregunta.explicacion}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ padding: '20px', background: 'white', borderTop: `1px solid ${colors.borde}`, display: 'flex', gap: '15px' }}>
                <button onClick={() => { setIdx(idx - 1); setSeleccionados(respuestas[idx - 1]?.opciones || []); }} 
                        disabled={idx === 0} style={{ ...xpButton, background: idx === 0 ? colors.fondoBody : 'white', color: idx === 0 ? colors.borde : colors.textoApagado, borderRadius: '12px', padding: '0 20px', fontWeight: 'bold', border: `1px solid ${idx === 0 ? 'transparent' : colors.borde}` }}>
                    ◀
                </button>
                
                {!yaRespondido ? (
                    <button onClick={() => { const esCorrecto = seleccionados.length === pregunta.correctas.length && seleccionados.every(val => pregunta.correctas.includes(val)); setRespuestas({ ...respuestas, [idx]: { opciones: seleccionados, correcta: esCorrecto } }); }} 
                            disabled={seleccionados.length === 0} style={{ ...xpButton, background: colors.principal, color: 'white', flex: 1, borderRadius: '12px', padding: '18px 0', fontWeight: 'bold', fontSize: '16px', opacity: seleccionados.length === 0 ? 0.5 : 1 }}>
                        Comprobar Respuesta
                    </button>
                ) : (
                    <button onClick={() => { if (idx + 1 < testData.preguntas.length) { setIdx(idx + 1); setSeleccionados(respuestas[idx + 1]?.opciones || []); } else { setFinalizado(true); } }} 
                            style={{ ...xpButton, background: '#222222', color: 'white', flex: 1, borderRadius: '12px', padding: '18px 0', fontWeight: 'bold', fontSize: '16px' }}>
                        {idx + 1 < testData.preguntas.length ? 'Siguiente Pregunta ▶' : 'Ver Resultados Finales'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default TestViewer;