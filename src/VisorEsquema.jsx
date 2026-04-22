import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ReactFlow, Background, Controls, MiniMap, addEdge, 
  applyNodeChanges, applyEdgeChanges, Handle, Position, 
  NodeResizer, NodeToolbar
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, Edit2, Check, Square, Circle, StretchHorizontal, BookOpen, X, Palette, Eye, FileText } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { toPng } from 'html-to-image';

const Quill = ReactQuill?.Quill || window.Quill;
if (Quill) {
    const SizeStyle = Quill.import('attributors/style/size');
    SizeStyle.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '40px'];
    Quill.register(SizeStyle, true);
}

const IcoDownload = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
// --- NOTIFICACIONES ---
const IcoCheck = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const Toast = ({ mensaje, onClear, colors }) => {
    useEffect(() => { const timer = setTimeout(onClear, 3000); return () => clearTimeout(timer); }, [onClear]);
    return (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: colors?.texto || '#4A4F4A', color: 'white', padding: '10px 20px', borderRadius: '12px', zIndex: 9999, fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <IcoCheck color="white" size={16} /> {mensaje}
        </div>
    );
};

// ============================================================
// NODO PERSONALIZADO
// ============================================================
const CustomNode = ({ id, data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const popupRef = useRef(null);
  
  const shapeRadius = data.shape === 'ellipse' ? '50%' : data.shape === 'rectangle' ? '0px' : '12px';
  const isEditing = data.isEditMode;

  const currentHandleStyle = { 
    ...handleStyle, 
    opacity: isEditing ? 1 : 0, 
    pointerEvents: isEditing ? 'auto' : 'none' 
  };

  // Carrusel Limpio (Tema Bubble - Solo aparece al seleccionar texto)
  const modulesBubble = {
      toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          ['code', 'image', 'link', 'list']
      ]
  };

  // Función para redimensionar y guardar el tamaño fijo del Bocadillo
  const handleResizeDown = (e) => {
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = data.popupWidth || 320;
    const startH = data.popupHeight || 220;

    const onMove = (moveEvent) => {
        const newW = Math.max(250, startW + (moveEvent.clientX - startX));
        const newH = Math.max(150, startH + (moveEvent.clientY - startY));
        data.onPopupResize(id, newW, newH); // Guarda en tiempo real
    };

    const onUp = () => {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  return (
    <>
      <NodeToolbar isVisible={isEditing && selected} position={Position.Top} style={toolbarStyle}>
        <div style={{ display: 'flex', borderRight: '1px solid #e2e8f0', paddingRight: '5px', gap: '2px' }}>
          <button onClick={() => data.onStyleChange(id, { shape: 'rectangle' })} style={toolbarBtn}><Square size={14}/></button>
          <button onClick={() => data.onStyleChange(id, { shape: 'rounded' })} style={toolbarBtn}><StretchHorizontal size={14}/></button>
          <button onClick={() => data.onStyleChange(id, { shape: 'ellipse' })} style={toolbarBtn}><Circle size={14}/></button>
        </div>
        <div style={{ display: 'flex', gap: '4px', paddingLeft: '5px' }}>
          {data.customColors?.map((col, idx) => (
             <button key={idx} onClick={() => data.onStyleChange(id, { bgColor: col, borderColor: col, textColor: isDark(col) ? '#ffffff' : '#4A4F4A' })} style={{ ...colorBtn, background: col, border: '1px solid #ddd' }} />
          ))}
          <div style={{ width: '1px', background: '#e2e8f0', margin: '0 4px' }} />
          <button onClick={() => data.onStyleChange(id, { bgColor: '#ffffff', borderColor: '#E4E7E4', textColor: '#4A4F4A' })} style={{...colorBtn, background: '#ffffff', border: '1px solid #ccc'}} />
        </div>
      </NodeToolbar>

      <NodeResizer minWidth={120} minHeight={70} isVisible={isEditing && selected} handleStyle={resizerHandle} lineStyle={{ border: '1px solid #4f46e5' }} />

      <div style={{ width: '100%', height: '100%', backgroundColor: data.bgColor || '#ffffff', borderRadius: shapeRadius, border: `2px solid ${selected && isEditing ? '#4f46e5' : (data.borderColor || '#E4E7E4')}`, boxShadow: selected && isEditing ? '0 0 0 2px rgba(79, 70, 229, 0.2)' : '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', padding: '10px', boxSizing: 'border-box' }}>
        
        <Handle type="target" position={Position.Top} id="top" style={currentHandleStyle} />
        <Handle type="source" position={Position.Bottom} id="bottom" style={currentHandleStyle} />
        <Handle type="source" position={Position.Left} id="left" style={currentHandleStyle} />
        <Handle type="target" position={Position.Right} id="right" style={currentHandleStyle} />

        {/* CAMPO PRINCIPAL: Ahora usa Bubble, solo aparece al seleccionar, y no se corta */}
        <div className="nodrag nowheel" style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'visible', borderRadius: '6px' }}>
            <ReactQuill 
                className="main-concept-editor"
                theme="bubble"
                bounds=".react-flow" // Esto hace que el menú pueda salir del cuadro
                value={data.shortText || ''} 
                onChange={(val) => data.onChangeShortText(id, val)} 
                readOnly={!isEditing} 
                placeholder={isEditing ? "Nuevo Concepto" : ""} 
                modules={isEditing ? modulesBubble : { toolbar: false }} 
                style={{ flex: 1, display: 'flex', flexDirection: 'column', color: data.textColor || '#4A4F4A' }} 
            />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '5px' }}>
          <button onClick={() => setIsExpanded(!isExpanded)} className="nodrag" style={{ background: isExpanded ? '#4f46e5' : 'rgba(0,0,0,0.05)', color: isExpanded ? 'white' : (data.textColor || '#4A4F4A'), border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}>
            {isExpanded ? <X size={12} /> : <BookOpen size={12} />}
          </button>
          
          <div className="nodrag" style={{ display: 'grid', alignItems: 'center', minWidth: '40px' }}>
              <span style={{ visibility: 'hidden', gridArea: '1/1', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', whiteSpace: 'pre', padding: '0 2px' }}>
                  {data.keyword || 'Concepto'}
              </span>
              <input 
                  value={data.keyword || ''} 
                  onChange={(e) => data.onChangeKeyword(id, e.target.value)} 
                  readOnly={!isEditing} 
                  placeholder="Concepto" 
                  style={{ gridArea: '1/1', width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: '11px', fontWeight: 'bold', color: data.textColor || '#4A4F4A', textTransform: 'uppercase', opacity: 0.8, cursor: isEditing ? 'text' : 'default', padding: '0 2px' }} 
              />
          </div>
        </div>
      </div>

      {isExpanded && (
          // BOCADILLO EXPANDIDO: Mismo editor Bubble sin cortes
          <div className="nodrag nowheel" ref={popupRef} style={expandedPanelStyle(data)}>
              <div style={expandedHeaderStyle(data)}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{data.keyword || 'Concepto'}</span>
                  <button onClick={() => setIsExpanded(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><X size={16}/></button>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'visible', borderRadius: '0 0 12px 12px', backgroundColor: 'white' }}>
                  <ReactQuill 
                      className="expanded-concept-editor"
                      theme="bubble"
                      bounds=".react-flow"
                      value={data.longContent || ''} 
                      onChange={(val) => data.onChangeLongContent(id, val)} 
                      readOnly={!isEditing} 
                      placeholder={isEditing ? "Escribe tus notas detalladas aquí..." : ""} 
                      modules={isEditing ? modulesBubble : { toolbar: false }} 
                      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  />
              </div>

              {isEditing && (
                  <div onPointerDown={handleResizeDown} style={{ position: 'absolute', bottom: 2, right: 2, width: '20px', height: '20px', cursor: 'nwse-resize', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '4px', zIndex: 1001 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={data.textColor || '#4A4F4A'} strokeWidth="2.5" strokeLinecap="round" style={{ opacity: 0.4 }}>
                          <polyline points="21 15 15 21"></polyline>
                          <polyline points="21 8 8 21"></polyline>
                          <polyline points="21 1 1 21"></polyline>
                      </svg>
                  </div>
              )}
          </div>
      )}
    </>
  );
};

const isDark = (color) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    return ((r*299)+(g*587)+(b*114))/1000 < 128;
};

const nodeTypes = { custom: CustomNode };

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function VisorEsquema({ contenido, onSave, colors, nombreArchivo }) {
    const [title, setTitle] = useState("Esquema sin título");
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false); 
    const [customColors, setCustomColors] = useState(['#6B8E6B', '#C68B59', '#4A6B4A']);
    const [notificacion, setNotificacion] = useState(null);
    const [rfInstance, setRfInstance] = useState(null); 

    useEffect(() => {
        try {
            const data = typeof contenido === 'string' ? JSON.parse(contenido) : contenido;
            setTitle(data?.titulo || "Esquema sin título");
            setNodes(data?.nodes || []);
            setCustomColors(data?.customColors || ['#6B8E6B', '#C68B59', '#4A6B4A']);

            const edgesCorregidos = (data?.edges || []).map(edge => ({
                ...edge, animated: false, style: { ...edge.style, strokeDasharray: '5, 5' }
            }));
            setEdges(edgesCorregidos);
        } catch (error) { console.error(error); }
    }, [contenido]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onSave && isEditMode) { 
                onSave(JSON.stringify({ titulo: title, nodes, edges, customColors }, null, 2));
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [title, nodes, edges, customColors, onSave, isEditMode]);

    const updateNodeShortText = useCallback((id, val) => setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, shortText: val } } : n)), []);
    const updateNodeKeyword = useCallback((id, val) => setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, keyword: val } } : n)), []);
    const updateNodeLongContent = useCallback((id, val) => setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, longContent: val } } : n)), []);
    const updateNodeStyle = useCallback((id, styles) => setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, ...styles } } : n)), []);
    const updateNodePopupSize = useCallback((id, w, h) => setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, popupWidth: w, popupHeight: h } } : n)), []);

    const nodesWithEvents = nodes.map(n => ({
        ...n, data: { ...n.data, isEditMode, customColors, onChangeShortText: updateNodeShortText, onChangeKeyword: updateNodeKeyword, onChangeLongContent: updateNodeLongContent, onStyleChange: updateNodeStyle, onPopupResize: updateNodePopupSize }
    }));

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((connection) => setEdges((eds) => addEdge({ ...connection, type: 'smoothstep', animated: false, style: { stroke: '#6B8E6B', strokeWidth: 2, strokeDasharray: '5, 5' } }, eds)), []);

    const addNode = () => {
        const newNode = {
            id: `nodo_${Date.now()}`, type: 'custom',
            position: { x: window.innerWidth / 4, y: window.innerHeight / 4 },
            style: { width: 160, height: 80 },
            data: { shortText: '', keyword: 'Concepto', longContent: '', shape: 'rounded', bgColor: '#ffffff', borderColor: '#E4E7E4', textColor: '#4A4F4A', popupWidth: 320, popupHeight: 220 },
        };
        setNodes((nds) => [...nds, newNode]);
    };

    const descargarFuente = () => {
        const esquemaData = { titulo: title, nodes, edges, customColors };
        const blob = new Blob([JSON.stringify(esquemaData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo || 'esquema_exportado.esquema'; 
        a.click();
        URL.revokeObjectURL(url);
        setNotificacion("Archivo .esquema descargado");
    };

    // ============================================================
    // EXPORTADOR NATIVO A PDF 
    // ============================================================
    const exportarPDFPropio = async () => {
        try {
            setNotificacion("Encuadrando y generando PDF...");
            
            if (rfInstance) {
                rfInstance.fitView({ padding: 0.1, duration: 0 }); 
                await new Promise(resolve => setTimeout(resolve, 500)); 
            }
            
            const flowEl = document.querySelector('.react-flow');
            const dataUrl = await toPng(flowEl, { backgroundColor: '#ffffff', pixelRatio: 2 }); 

            const pdfDoc = await PDFDocument.create();
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

            const pngImage = await pdfDoc.embedPng(dataUrl);
            
            const margin = 50;
            const imgWidth = pngImage.width / 2;
            const imgHeight = pngImage.height / 2;
            
            const page1Width = Math.max(imgWidth + margin * 2, 841.89); 
            const page1Height = Math.max(imgHeight + margin * 2 + 50, 595.28);

            let page = pdfDoc.addPage([page1Width, page1Height]);
            let y = page1Height - margin;

            page.drawText(title, { x: margin, y, size: 20, font: fontBold, color: rgb(0.15, 0.15, 0.15) });
            y -= 40;
            
            const imgX = margin + Math.max(0, (page1Width - margin * 2 - imgWidth) / 2);
            page.drawImage(pngImage, { x: imgX, y: y - imgHeight, width: imgWidth, height: imgHeight });

            const glosarioWidth = 595.28; 
            const glosarioHeight = 841.89;
            const maxWidth = glosarioWidth - margin * 2;

            const sanitizeHTML = (html) => {
                if (!html) return "";
                let text = html
                    .replace(/<br\s*[\/]?>/gi, '\n')
                    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
                    .replace(/<\/p>/gi, '\n')
                    .replace(/<li[^>]*>/gi, '• ')
                    .replace(/<\/li>/gi, '\n')
                    .replace(/<[^>]+>/g, ''); 
                
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = text;
                text = tempDiv.textContent || tempDiv.innerText || "";
                
                return text.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t•]/g, "").trim();
            };

            const checkSpace = (requiredSpace) => {
                if (y - requiredSpace < margin) {
                    page = pdfDoc.addPage([glosarioWidth, glosarioHeight]); 
                    y = glosarioHeight - margin;
                }
            };

            const drawTextWrapped = (text, font, size, color, indent = 0) => {
                if (!text) return;
                const paragraphs = text.split('\n'); 
                const currentMaxWidth = maxWidth - indent;

                paragraphs.forEach(p => {
                    if (p.trim() === '') { 
                        y -= size * 1.4; 
                        checkSpace(size * 1.4);
                        return;
                    }
                    
                    const words = p.split(/\s+/); 
                    let currentLine = '';

                    words.forEach(word => {
                        const testLine = currentLine ? `${currentLine} ${word}` : word;
                        let textWidth = 0;
                        try { textWidth = font.widthOfTextAtSize(testLine, size); } catch(e) {} 

                        if (textWidth > currentMaxWidth) {
                            if (currentLine) {
                                checkSpace(size * 1.5);
                                page.drawText(currentLine, { x: margin + indent, y, size, font, color });
                                y -= (size * 1.5);
                                currentLine = word;
                            } else {
                                checkSpace(size * 1.5);
                                page.drawText(word, { x: margin + indent, y, size, font, color });
                                y -= (size * 1.5);
                                currentLine = '';
                            }
                        } else { 
                            currentLine = testLine; 
                        }
                    });

                    if (currentLine) {
                        checkSpace(size * 1.5);
                        page.drawText(currentLine, { x: margin + indent, y, size, font, color });
                        y -= (size * 1.5);
                    }
                });
            };

            const glosarioNodos = nodes.filter(n => sanitizeHTML(n.data.longContent).length > 0);

            if (glosarioNodos.length > 0) {
                page = pdfDoc.addPage([glosarioWidth, glosarioHeight]);
                y = glosarioHeight - margin;

                page.drawText("GLOSARIO DE CONCEPTOS", { x: margin, y, size: 12, font: fontBold, color: rgb(0.2, 0.4, 0.2) });
                y -= 30;

                glosarioNodos.forEach(node => {
                    const longText = sanitizeHTML(node.data.longContent);
                    checkSpace(40); 
                    
                    const shortTextClean = sanitizeHTML(node.data.shortText);
                    const titulo = shortTextClean ? shortTextClean.replace(/\n/g, ' ') : 'Concepto sin título';
                    
                    drawTextWrapped(`${(node.data.keyword || 'Concepto').toUpperCase()}: ${titulo}`, fontBold, 10, rgb(0.1, 0.1, 0.1));
                    y -= 6;
                    
                    drawTextWrapped(longText, fontNormal, 8.5, rgb(0.3, 0.3, 0.3), 10);
                    y -= 25; 
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            
            setNotificacion("PDF descargado con éxito");

        } catch (error) {
            console.error("Error al generar PDF:", error);
            setNotificacion("Error al generar el PDF. Inténtalo de nuevo.");
        }
    };

    return (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: colors?.fondoBody || '#F8F9F8', fontFamily: colors?.letra || 'sans-serif' }}>
            
            <style>{`
                /* ======================================================== */
                /* MAGIA PARA QUE LA BURBUJA FLOTE LIBRE Y NO ESTORBE AL TYPING */
                /* ======================================================== */
                .react-flow__node-custom .quill { 
                    display: flex; 
                    flex-direction: column; 
                    height: 100%; 
                    overflow: visible !important; 
                }
                .react-flow__node-custom .ql-container.ql-bubble { 
                    flex: 1; 
                    overflow: visible !important; 
                }
                
                /* Scroll individual para el texto, pero overflow-x visible para el tooltip */
                .react-flow__node-custom .ql-editor { 
                    padding: 5px !important; 
                    font-size: 15px; 
                    height: 100%; 
                    overflow-y: auto !important; 
                    overflow-x: visible !important;
                }

                /* Alineación central para el concepto principal */
                .main-concept-editor .ql-editor {
                    text-align: center;
                }

                /* Alineación izquierda y más padding para las notas expandidas */
                .expanded-concept-editor .ql-editor {
                    padding: 15px !important;
                    text-align: left;
                }
                
                /* Forzar Z-Index máximo para la burbuja */
                .react-flow__node-custom .ql-tooltip { 
                    z-index: 99999 !important; 
                    white-space: nowrap !important;
                }

                /* Estilo del placeholder para que no moleste */
                .ql-editor.ql-blank::before { 
                    color: inherit !important; 
                    opacity: 0.6 !important; 
                    font-style: normal !important; 
                }
            `}</style>

            {notificacion && <Toast mensaje={notificacion} onClear={() => setNotificacion(null)} colors={colors} />}

            <div style={headerStyle(colors)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {isEditingTitle ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} style={titleInputStyle(colors)} />
                            <button onClick={() => setIsEditingTitle(false)} style={saveTitleBtn(colors)}><Check size={16}/></button>
                        </div>
                    ) : (
                        <h2 style={{ ...titleStyle(colors), cursor: isEditMode ? 'pointer' : 'default' }} onClick={() => { if (isEditMode) setIsEditingTitle(true); }}>
                            {title} {isEditMode && <Edit2 size={14} />}
                        </h2>
                    )}

                    {isEditMode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px', padding: '0 15px', borderLeft: '1px solid #eee' }}>
                            <Palette size={16} color={colors?.textoApagado} />
                            {customColors.map((col, idx) => (
                                <input key={idx} type="color" value={col} onChange={(e) => { const newCols = [...customColors]; newCols[idx] = e.target.value; setCustomColors(newCols); }} style={{ width: '24px', height: '24px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }} />
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {!isEditMode && (
                        <>
                            <button 
                                onClick={descargarFuente} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    border: `1px solid ${colors?.borde || '#E4E7E4'}`, 
                                    background: '#edf2ed', 
                                    color: colors?.principal || '#6B8E6B', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer', 
                                    outline: 'none' 
                                }}
                            >
                                <IcoDownload size={16} /> 
                                {nombreArchivo || 'Descargar Fuente'}
                            </button>

                            {/* Tu botón original de PDF */}
                            <button 
                                onClick={exportarPDFPropio} 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px', 
                                    padding: '8px 16px', 
                                    borderRadius: '8px', 
                                    border: `1px solid ${colors?.danger || '#fca5a5'}`, 
                                    background: '#fef2f2', 
                                    color: colors?.danger || '#ef4444', 
                                    fontWeight: 'bold', 
                                    cursor: 'pointer', 
                                    outline: 'none' 
                                }}
                            >
                                <FileText size={16} /> Exportar PDF
                            </button>
                        </>
                    )}

                    {isEditMode && (
                        <>
                            <button onClick={() => setNodes(nodes.filter(n => !n.selected))} style={deleteBtn(colors)}><Trash2 size={14} /> Borrar</button>
                            <button onClick={addNode} style={addBtn(colors)}><Plus size={16} /> Nuevo</button>
                        </>
                    )}
                    <button onClick={() => setIsEditMode(!isEditMode)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: isEditMode ? (colors?.principal || '#6B8E6B') : '#f3f4f6', color: isEditMode ? 'white' : '#4b5563', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
                        {isEditMode ? <><Eye size={16} /> Ver Resultado</> : <><Edit2 size={16} /> Editar Esquema</>}
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative' }}>
                <ReactFlow 
                    onInit={(instance) => setRfInstance(instance)} 
                    nodes={nodesWithEvents} 
                    edges={edges} 
                    onNodesChange={onNodesChange} 
                    onEdgesChange={onEdgesChange} 
                    onConnect={onConnect} 
                    nodeTypes={nodeTypes} 
                    fitView 
                    deleteKeyCode={['Backspace', 'Delete']} 
                    nodesDraggable={isEditMode} 
                    nodesConnectable={isEditMode} 
                    elementsSelectable={true}
                >
                    {isEditMode && <Background color={colors?.borde || '#E4E7E4'} gap={20} size={1.5} />}
                    {isEditMode && <Controls style={{ display: 'flex', flexDirection: 'column', gap: '5px', bottom: '20px' }} />}
                    {isEditMode && <MiniMap nodeColor={colors?.principal || '#6B8E6B'} />}
                </ReactFlow>
            </div>
        </div>
    );
}

// --- ESTILOS ---
const toolbarStyle = { display: 'flex', gap: '5px', background: 'white', padding: '5px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' };
const toolbarBtn = { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563' };
const colorBtn = { width: '20px', height: '20px', borderRadius: '50%', border: 'none', cursor: 'pointer' };
const handleStyle = { background: '#6B8E6B', width: '8px', height: '8px' };
const resizerHandle = { width: 8, height: 8, borderRadius: '50%', background: '#4f46e5' };

const headerStyle = (c) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: 'white', borderBottom: `1px solid ${c?.borde || '#E4E7E4'}`, zIndex: 10 });
const titleStyle = (c) => ({ margin: 0, fontSize: '17px', color: c?.texto || '#4A4F4A', display: 'flex', alignItems: 'center', gap: '8px' });
const titleInputStyle = (c) => ({ padding: '6px 10px', borderRadius: '6px', border: `1px solid ${c?.principal || '#6B8E6B'}`, outline: 'none', fontWeight: 'bold', fontSize: '14px' });
const saveTitleBtn = (c) => ({ background: c?.principal || '#6B8E6B', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' });
const deleteBtn = (c) => ({ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: `1px solid ${c?.danger || '#C68B59'}`, background: '#fdf4ec', color: c?.danger || '#C68B59', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' });
const addBtn = (c) => ({ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: c?.principal || '#6B8E6B', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' });

const expandedPanelStyle = (data) => ({ 
    position: 'absolute', top: 'calc(100% + 15px)', left: '50%', transform: 'translateX(-50%)', 
    width: `${data.popupWidth || 320}px`, 
    height: `${data.popupHeight || 220}px`, 
    background: 'white', border: `2px solid ${data.borderColor || '#E4E7E4'}`, 
    borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1000, 
    display: 'flex', flexDirection: 'column', overflow: 'visible' 
});
const expandedHeaderStyle = (data) => ({ background: data.bgColor || '#f8fafc', padding: '6px 12px', borderBottom: `1px solid ${data.borderColor || '#E4E7E4'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: data.textColor || '#4A4F4A', borderRadius: '10px 10px 0 0' });