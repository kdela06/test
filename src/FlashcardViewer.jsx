import React, { useState, useEffect } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// --- ICONOS SVG ---
const IcoEdit = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
const IcoSave = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
const IcoPlay = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;
const IcoTrash = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const IcoPDF = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IcoCheck = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IcoBrain = ({ size = 48, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;
const IcoFlip = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>;
const IcoDownload = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;

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

const FlashcardViewer = ({ contenido, onSave, nombreArchivo, colors }) => {
    const [deckData, setDeckData] = useState(() => {
        try { 
            const parsed = JSON.parse(contenido);
            return parsed.tarjetas ? parsed : { titulo: "Mazo de Flashcards", tarjetas: [] };
        } catch { return { titulo: "Mazo de Flashcards", tarjetas: [] }; }
    });

    const [checkpoint, setCheckpoint] = useState(contenido);
    const [notificacion, setNotificacion] = useState(null);
    const [modo, setModo] = useState('edit');
    const [confirmarBorrado, setConfirmarBorrado] = useState(null); 

    // Estados Modo Estudio
    const [idx, setIdx] = useState(0);
    const [volteada, setVolteada] = useState(false);
    const [finalizado, setFinalizado] = useState(false);

    const guardarCambiosReal = () => {
        const nuevoContenido = JSON.stringify(deckData, null, 2);
        if (onSave) onSave(nuevoContenido);
        setCheckpoint(nuevoContenido); 
        setNotificacion("Mazo guardado correctamente");
    };

    const iniciarEstudio = () => {
        setIdx(0); setVolteada(false); setFinalizado(false); setModo('study');
    };

    const pedirEliminar = (tIdx) => setConfirmarBorrado(tIdx);

    const ejecutarEliminar = () => {
        if (confirmarBorrado === null) return;
        const nuevasTarjetas = deckData.tarjetas.filter((_, i) => i !== confirmarBorrado);
        const nuevoDeckData = { ...deckData, tarjetas: nuevasTarjetas };
        setDeckData(nuevoDeckData);
        
        const nuevoContenido = JSON.stringify(nuevoDeckData, null, 2);
        if (onSave) onSave(nuevoContenido);
        setCheckpoint(nuevoContenido);
        setNotificacion("Tarjeta eliminada");
        setConfirmarBorrado(null);
    };

    const descargarFuente = () => {
        const blob = new Blob([JSON.stringify(deckData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo || 'mazo_exportado.cards'; 
        a.click();
        URL.revokeObjectURL(url);
        setNotificacion("Archivo .cards descargado");
    };

    // --- FUNCIÓN DE EXPORTACIÓN PDF ---
    const exportarPDFPropio = async () => {
        try {
            setNotificacion("Generando PDF de estudio...");
            const pdfDoc = await PDFDocument.create();
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const width = 595.28; 
            const height = 841.89;
            const margin = 50;
            const cardHeight = 120; 
            
            let page = pdfDoc.addPage([width, height]);
            let y = height - margin;

            const checkSpace = (needed) => {
                if (y - needed < margin) {
                    page = pdfDoc.addPage([width, height]);
                    y = height - margin;
                }
            };

            const sanitize = (str) => str ? String(str).replace(/[^\x20-\x7E\xA0-\xFF\n]/g, "") : "";

            const title = sanitize(nombreArchivo ? nombreArchivo.replace('.cards', '') : (deckData.titulo || "Flashcards"));
            page.drawText(title, { x: margin, y, size: 16, font: fontBold, color: rgb(0.25, 0.30, 0.25) });
            y -= 40;

            deckData.tarjetas.forEach((t, i) => {
                checkSpace(cardHeight + 20);
                
                page.drawRectangle({
                    x: margin, y: y - cardHeight,
                    width: width - margin * 2, height: cardHeight,
                    borderWidth: 1, borderColor: rgb(0.8, 0.8, 0.8),
                    dashArray: [5, 5]
                });

                page.drawText(`TARJETA ${i + 1} - PREGUNTA:`, { x: margin + 15, y: y - 25, size: 9, font: fontBold, color: rgb(0.5, 0.5, 0.5) });
                page.drawText(sanitize(t.anverso), { x: margin + 15, y: y - 45, size: 12, font: fontNormal, maxWidth: width - margin * 2 - 30 });

                page.drawLine({
                    start: { x: margin + 10, y: y - 65 },
                    end: { x: width - margin - 10, y: y - 65 },
                    thickness: 0.5, color: rgb(0.9, 0.9, 0.9)
                });

                page.drawText(`RESPUESTA:`, { x: margin + 15, y: y - 85, size: 9, font: fontBold, color: rgb(0.42, 0.55, 0.42) });
                page.drawText(sanitize(t.reverso), { x: margin + 15, y: y - 105, size: 11, font: fontNormal, maxWidth: width - margin * 2 - 30 });

                y -= (cardHeight + 20);
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (nombreArchivo || 'flashcards').replace('.cards', '.pdf');
            a.click();
            URL.revokeObjectURL(url);
            setNotificacion("PDF descargado con éxito");
        } catch (error) {
            console.error(error);
            setNotificacion("Error al generar PDF");
        }
    };

    // --- MODO EDITOR ---
    if (modo === 'edit') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: colors.fondoBody, position: 'relative', color: colors.texto, fontFamily: colors.letra }}>
                
                {notificacion && <Toast mensaje={notificacion} onClear={() => setNotificacion(null)} colors={colors} />}
                
                {confirmarBorrado !== null && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', maxWidth: '320px', width: '100%', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: `1px solid ${colors.borde}` }}>
                            <div style={{ background: '#f4ece6', display: 'inline-flex', padding: '12px', borderRadius: '50%', marginBottom: '10px' }}>
                                <IcoTrash size={28} color={colors.danger} />
                            </div>
                            <h3 style={{ margin: '5px 0 10px 0', color: colors.texto, fontWeight: 'bold' }}>¿Eliminar tarjeta?</h3>
                            <p style={{ margin: '0 0 25px 0', color: colors.textoApagado, fontSize: '14px', lineHeight: '1.5' }}>
                                Esta acción no se puede deshacer.
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
                        <span style={{ fontSize: '12px', color: colors.textoApagado }}>{deckData.tarjetas.length} tarjetas creadas</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={descargarFuente} 
                                style={{ ...xpButton, background: '#edf2ed', color: colors.principal, border: `1px solid ${colors.borde}`, borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                            <IcoDownload color={colors.principal}/> Fuente .{nombreArchivo.split('.').pop()}
                        </button>
                        <button onClick={exportarPDFPropio} 
                                style={{ ...xpButton, background: '#f4ece6', color: colors.danger, border: `1px solid #eadad1`, borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                            <IcoPDF color={colors.danger}/> Exportar PDF
                        </button>
                        <button onClick={iniciarEstudio} disabled={deckData.tarjetas.length === 0} 
                                style={{ ...xpButton, background: colors.principal, color: 'white', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <IcoPlay color="white"/> Estudiar Mazo
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', WebkitOverflowScrolling: 'touch' }}>
                    {deckData.tarjetas.map((t, tIdx) => {
                        const modificado = (() => {
                            try { return JSON.stringify(JSON.parse(checkpoint).tarjetas[tIdx]) !== JSON.stringify(t); } 
                            catch { return true; }
                        })();

                        return (
                            <div key={tIdx} style={{ background: colors.cardBg, padding: '25px', borderRadius: '20px', marginBottom: '20px', border: modificado ? `2px solid ${colors.principal}` : `1px solid ${colors.borde}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                                    <span style={{ padding: '6px 14px', background: colors.secundario, color: colors.principal, borderRadius: '20px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>TARJETA {tIdx + 1}</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {modificado && (
                                            <button onClick={guardarCambiosReal} style={{ ...xpButton, display: 'flex', alignItems: 'center', gap: '6px', background: '#edf2ed', color: '#4a6b4a', border: 'none', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                                <IcoSave color="#4a6b4a"/> Guardar
                                            </button>
                                        )}
                                        <button onClick={() => pedirEliminar(tIdx)} style={{ ...xpButton, display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', color: colors.danger, border: 'none', padding: '6px', cursor: 'pointer' }}>
                                            <IcoTrash color={colors.danger}/>
                                        </button>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '1 1 250px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textoApagado, marginBottom: '8px', display: 'block' }}>ANVERSO (Pregunta)</label>
                                        <textarea 
                                            value={t.anverso} 
                                            onChange={(e) => { const n = [...deckData.tarjetas]; n[tIdx].anverso = e.target.value; setDeckData({...deckData, tarjetas: n}); }} 
                                            placeholder="Ej: ¿En qué año se descubrió América?"
                                            style={{ ...xpInput, width: '100%', borderRadius: '12px', minHeight: '80px', boxSizing: 'border-box', border: `1px solid ${colors.borde}`, fontSize: '15px' }} 
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 250px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textoApagado, marginBottom: '8px', display: 'block' }}>REVERSO (Respuesta)</label>
                                        <textarea 
                                            value={t.reverso} 
                                            onChange={(e) => { const n = [...deckData.tarjetas]; n[tIdx].reverso = e.target.value; setDeckData({...deckData, tarjetas: n}); }} 
                                            placeholder="Ej: En 1492"
                                            style={{ ...xpInput, width: '100%', borderRadius: '12px', minHeight: '80px', boxSizing: 'border-box', border: `1px solid ${colors.borde}`, background: colors.fondoBody, fontSize: '15px' }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    <button 
                        onClick={() => setDeckData({ ...deckData, tarjetas: [...deckData.tarjetas, { anverso: "", reverso: "" }] })} 
                        style={{ ...xpButton, display: 'block', width: '100%', background: colors.cardBg, border: `2px dashed ${colors.borde}`, color: colors.textoApagado, borderRadius: '16px', padding: '18px', fontWeight: 'bold', fontSize: '15px', textAlign: 'center', marginBottom: '20px' }}
                    >
                        + Añadir nueva tarjeta
                    </button>
                </div>
            </div>
        );
    }

    // --- MODO VISOR ESTUDIO ---
    const tarjeta = deckData.tarjetas[idx];

    if (finalizado) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: 'white', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: colors.letra }}>
                <IcoBrain size={80} color={colors.principal} />
                <h2 style={{ color: colors.principal, fontSize: '28px', fontWeight: 'bold', marginTop: '20px' }}>¡Mazo completado!</h2>
                <p style={{ color: colors.textoApagado, fontSize: '16px' }}>Has repasado {deckData.tarjetas.length} tarjetas.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '350px', marginTop: '30px' }}>
                    <button onClick={iniciarEstudio} style={{ ...xpButton, background: colors.principal, color: 'white', borderRadius: '14px', padding: '16px', fontSize: '16px', fontWeight: 'bold' }}>Repasar de nuevo</button>
                    <button onClick={() => setModo('edit')} style={{ ...xpButton, background: colors.fondoBody, color: colors.texto, borderRadius: '14px', padding: '16px', fontWeight: 'bold', fontSize: '15px', border: `1px solid ${colors.borde}` }}>Volver al Editor</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', color: colors.texto, fontFamily: colors.letra }}>
            <div style={{ padding: '20px', borderBottom: `1px solid ${colors.borde}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ background: colors.fondoBody, padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', color: colors.principal }}>
                    Tarjeta {idx + 1} de {deckData.tarjetas.length}
                </div>
                <button onClick={() => setModo('edit')} style={{ ...xpButton, background: 'transparent', color: colors.textoApagado, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                    <IcoEdit size={16} color={colors.textoApagado}/> Editor
                </button>
            </div>
            
            <div style={{ flex: 1, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', perspective: '1000px', background: colors.fondoBody }}>
                
                {/* TARJETA CON EFECTO 3D FLIP */}
                <div 
                    onClick={() => setVolteada(!volteada)}
                    style={{ 
                        width: '100%', maxWidth: '500px', 
                        height: '60vh', minHeight: '380px', maxHeight: '500px', // <-- Altura dinámica
                        cursor: 'pointer',
                        transformStyle: 'preserve-3d', transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                        transform: volteada ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        position: 'relative'
                    }}
                >
                    {/* ANVERSO */}
                    <div style={{ 
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                        background: 'white', border: `2px solid ${colors.borde}`, borderRadius: '24px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '30px 20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
                    }}>
                        <span style={{ position: 'absolute', top: 20, left: 20, fontSize: '12px', fontWeight: '900', color: colors.textoApagado, letterSpacing: '1px', zIndex: 2 }}>PREGUNTA</span>
                        {/* Contenedor scrolleable interno */}
                        <div style={{ width: '100%', maxHeight: '100%', overflowY: 'auto', padding: '20px 0', boxSizing: 'border-box' }}>
                            <h2 style={{ fontSize: '20px', color: colors.texto, margin: 0, lineHeight: '1.4' }}>{tarjeta?.anverso}</h2>
                        </div>
                        <div style={{ position: 'absolute', bottom: 20, color: colors.textoApagado, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 'bold', zIndex: 2 }}>
                            <IcoFlip size={18} color={colors.textoApagado}/> Toca para girar
                        </div>
                    </div>

                    {/* REVERSO */}
                    <div style={{ 
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                        background: colors.secundario, border: `3px solid ${colors.principal}`, borderRadius: '24px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '30px 20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        transform: 'rotateY(180deg)' 
                    }}>
                        <span style={{ position: 'absolute', top: 20, left: 20, fontSize: '12px', fontWeight: '900', color: colors.principal, letterSpacing: '1px', zIndex: 2 }}>RESPUESTA</span>
                        {/* Contenedor scrolleable interno */}
                        <div style={{ width: '100%', maxHeight: '100%', overflowY: 'auto', padding: '20px 0', boxSizing: 'border-box' }}>
                            <h2 style={{ fontSize: '18px', color: colors.texto, margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{tarjeta?.reverso}</h2>
                        </div>
                    </div>
                </div>

                {/* CONTROLES DE NAVEGACIÓN */}
                <div style={{ marginTop: '50px', display: 'flex', gap: '15px', width: '100%', maxWidth: '500px' }}>
                    <button 
                        onClick={() => { setIdx(idx - 1); setVolteada(false); }} 
                        disabled={idx === 0} 
                        style={{ ...xpButton, background: idx === 0 ? 'transparent' : 'white', color: idx === 0 ? colors.borde : colors.textoApagado, flex: 1, borderRadius: '16px', height: '60px', fontWeight: 'bold', fontSize: '18px', border: `1px solid ${idx === 0 ? 'transparent' : colors.borde}` }}
                    >
                        ◀
                    </button>
                    
                    <button 
                        onClick={() => {
                            if (idx + 1 < deckData.tarjetas.length) { setIdx(idx + 1); setVolteada(false); } 
                            else { setFinalizado(true); } 
                        }} 
                        style={{ ...xpButton, background: colors.principal, color: 'white', flex: 3, borderRadius: '16px', height: '60px', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                    >
                        {idx + 1 < deckData.tarjetas.length ? 'Siguiente Tarjeta ▶' : 'Terminar Repaso'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlashcardViewer;