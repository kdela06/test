import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Eye, Edit2, X, Check, FileText } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const Quill = ReactQuill?.Quill || window.Quill;

if (Quill) {
    const SizeStyle = Quill.import('attributors/style/size');
    SizeStyle.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '40px'];
    Quill.register(SizeStyle, true);

    const FontStyle = Quill.import('attributors/style/font');
    Quill.register(FontStyle, true);
}

// --- ICONOS Y COMPONENTES EXTRAS ---
const IcoCheck = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IcoDownload = ({ size = 16, color = "currentColor" }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const xpButton = { border: 'none', cursor: 'pointer', transition: '0.2s', outline: 'none', fontFamily: 'inherit' };

const Toast = ({ mensaje, onClear, colors }) => {
    useEffect(() => {
        const timer = setTimeout(onClear, 3000);
        return () => clearTimeout(timer);
    }, [onClear]);

    return (
        <div style={{
            position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
            background: colors?.texto || '#4A4F4A', color: 'white', padding: '10px 20px', borderRadius: '12px',
            zIndex: 9999, fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontFamily: colors?.letra || 'sans-serif'
        }}>
            <IcoCheck color="white" size={16} />
            {mensaje}
        </div>
    );
};

// ============================================================
// COMPONENTE SECTION (NODO DEL ÁRBOL DE APUNTES)
// ============================================================
const SectionNode = ({ node, level, onChangeNode, onAddChild, onDeleteNode, isEditMode, onImageClick }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);

  useEffect(() => {
    if (!isEditMode) {
      setIsEditingTitle(false);
      setIsEditingContent(false);
    }
  }, [isEditMode]);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      ['code'], 
      ['image', 'link', 'list'], 
      [{ 'font': [] }, { 'size': ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px', '40px'] }],
      ['clean']
    ]
  };

  return (
    <div id={`node-${node.id}`} className="section-node" style={{ marginLeft: level > 0 ? '20px' : '0', marginTop: '10px', borderLeft: level > 0 ? '1px solid #e5e7eb' : 'none', paddingLeft: level > 0 ? '15px' : '0' }}>
      
      {/* --- ZONA DEL TÍTULO --- */}
      <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button className="no-print" onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
          {isOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
        </button>
        
        {isEditMode && isEditingTitle ? (
          <div style={{ flex: 1, minWidth: '150px', background: '#f3f4f6', borderRadius: '8px', padding: '4px', display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <ReactQuill className="title-editor" theme="bubble" value={node.title} onChange={(value) => onChangeNode({ ...node, title: value })} modules={modules} placeholder="Añadir título..." />
            </div>
            <button onClick={() => setIsEditingTitle(false)} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer', marginLeft: '8px' }}><Check size={16} /></button>
          </div>
        ) : (
          <div className="quill" style={{ flex: 1 }}>
            <div className="ql-container ql-bubble" style={{ border: 'none', background: 'transparent' }}>
              <div className="title-display ql-editor" style={{ padding: '4px 8px', cursor: isEditMode ? 'pointer' : 'default', borderRadius: '6px', background: 'transparent' }} dangerouslySetInnerHTML={{ __html: node.title || (isEditMode ? '<span style="color:#9ca3af !important; font-size: 16px; font-weight: normal !important; font-style: italic;">+ Título...</span>' : 'Sin título') }} onClick={() => { if (isEditMode) setIsEditingTitle(true); }} />
            </div>
          </div>
        )}

        {isEditMode && (
          <button className="no-print" onClick={() => onDeleteNode(node.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
        )}
      </div>

      {/* --- ZONA DEL CONTENIDO --- */}
      {isOpen && (
        <div style={{ paddingTop: '5px', paddingLeft: '24px' }}>
          <div className="apuntes-content">
            {isEditMode && isEditingContent ? (
            <div style={{ marginBottom: '10px', minHeight: '40px' }}>
              <ReactQuill theme="bubble" value={node.content} onChange={(value) => onChangeNode({ ...node, content: value })} modules={modules} placeholder="Escribe aquí..." />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button onClick={() => setIsEditingContent(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#323235', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}><Check size={14} /> Finalizar edición</button>
              </div>
            </div>
            ) : (
              <div className="quill">
                <div className="ql-container ql-bubble" style={{ border: 'none', background: 'transparent' }}>
                  <div className="ql-editor" style={{ marginBottom: '15px', color: '#374151', cursor: isEditMode ? 'pointer' : 'default', padding: '0', borderRadius: '8px', minHeight: isEditMode && !node.content ? '25px' : 'auto' }} onClick={(e) => { if (e.target.tagName === 'IMG') { onImageClick(e); } else if (isEditMode) { setIsEditingContent(true); } }} dangerouslySetInnerHTML={{ __html: node.content || (isEditMode ? '<span style="color:#d1d5db; font-style: italic;">+ Añadir apuntes aquí...</span>' : '') }} />
                </div>
              </div>
            )}
          </div>

          {node.children && node.children.map(childNode => (
            <SectionNode key={childNode.id} node={childNode} level={level + 1} onChangeNode={onChangeNode} onAddChild={onAddChild} onDeleteNode={onDeleteNode} isEditMode={isEditMode} onImageClick={onImageClick} />
          ))}

          {isEditMode && (
            <button className="no-print" onClick={() => onAddChild(node.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#a5b4fc', fontSize: '0.85rem', cursor: 'pointer', marginTop: '8px', padding: '4px 0', fontStyle: 'italic' }}><Plus size={14} /> Añadir Subtítulo</button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// CONTENEDOR PRINCIPAL DEL VISOR 
// ============================================================
export default function VisorTema({ contenido, onSave, colors, nombreArchivo }) {
    const containerRef = useRef(null);
    const [parsedData, setParsedData] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [notificacion, setNotificacion] = useState(null); // <-- Estado para notificaciones

    useEffect(() => {
        try {
            const data = typeof contenido === 'string' ? JSON.parse(contenido) : contenido;
            setParsedData(data && data.contentTree ? data : { title: "Tema sin título", contentTree: [] });
        } catch (error) {
            console.error("Error parseando contenido:", error);
            setParsedData({ title: "Tema sin título", contentTree: [] });
        }
    }, [contenido]);

    const guardarEnDisco = (newData) => {
        if (onSave) onSave(JSON.stringify(newData, null, 2));
    };

    const handleUpdateNode = (updatedNode) => {
        const updateInTree = (nodes) => nodes.map(n => n.id === updatedNode.id ? updatedNode : { ...n, children: updateInTree(n.children || []) });
        const newData = { ...parsedData, contentTree: updateInTree(parsedData.contentTree || []) };
        setParsedData(newData);
        guardarEnDisco(newData);
    };

    const handleAddChild = (parentId) => {
        const newChild = { id: `nodo-${Date.now()}`, title: 'Nuevo Sub-apartado', content: '', children: [] };
        const addToParent = (nodes) => nodes.map(n => {
            if (n.id === parentId) return { ...n, children: [...(n.children || []), newChild] };
            return { ...n, children: addToParent(n.children || []) };
        });
        const newData = { ...parsedData, contentTree: addToParent(parsedData.contentTree || []) };
        setParsedData(newData);
        guardarEnDisco(newData);
    };

    const handleDeleteNode = (nodeId) => {
        const removeFromTree = (nodes) => nodes.filter(n => n.id !== nodeId).map(n => ({ ...n, children: removeFromTree(n.children || []) }));
        const newData = { ...parsedData, contentTree: removeFromTree(parsedData.contentTree || []) };
        setParsedData(newData);
        guardarEnDisco(newData);
    };

    const handleAddMainSection = () => {
        const newSection = { id: `nodo-${Date.now()}`, title: 'Nuevo Apartado', content: '', children: [] };
        const newData = { ...parsedData, contentTree: [...(parsedData.contentTree || []), newSection] };
        setParsedData(newData);
        guardarEnDisco(newData);
    };

    const handleImageClick = (e) => { if (e.target.tagName === 'IMG') setZoomedImage(e.target.src); };

    const descargarFuente = () => {
        const blob = new Blob([JSON.stringify(parsedData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo || 'tema_exportado.json'; 
        a.click();
        URL.revokeObjectURL(url);
        setNotificacion("Archivo fuente .json descargado");
    };

    // ============================================================
    // NUEVO EXPORTADOR NATIVO PDF (PDF-LIB)
    // ============================================================
    const exportarPDFPropio = async () => {
        try {
            setNotificacion("Generando PDF nativo...");
            const pdfDoc = await PDFDocument.create();
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

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

            // Transforma HTML a texto plano manteniendo listas y saltos de línea
            const sanitizeHTML = (html) => {
                if (!html) return "";
                let preProcessed = html.replace(/<p[^>]*>/g, '').replace(/<\/p>/g, '\n').replace(/<br\s*[\/]?>/gi, '\n').replace(/<li[^>]*>/g, '• ').replace(/<\/li>/g, '\n');
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = preProcessed;
                let text = tempDiv.textContent || tempDiv.innerText || "";
                return text.replace(/[^\x20-\x7E\xA0-\xFF\n•áéíóúÁÉÍÓÚñÑ¿¡]/g, "").trim();
            };

            const drawTextWrapped = (text, font, size, color, indent = 0) => {
                if (!text) return;
                const paragraphs = text.split('\n');
                paragraphs.forEach(p => {
                    const words = p.split(' ');
                    let currentLine = '';
                    words.forEach(word => {
                        const testLine = currentLine ? `${currentLine} ${word}` : word;
                        if (font.widthOfTextAtSize(testLine, size) > maxWidth - indent) {
                            checkSpace(size + 6);
                            page.drawText(currentLine, { x: margin + indent, y, size, font, color });
                            y -= (size + 6);
                            currentLine = word;
                        } else {
                            currentLine = testLine;
                        }
                    });
                    if (currentLine) {
                        checkSpace(size + 6);
                        page.drawText(currentLine, { x: margin + indent, y, size, font, color });
                        y -= (size + 6);
                    }
                });
            };

            // Dibuja el título principal
            const docTitle = sanitizeHTML(parsedData.title) || "Tema";
            drawTextWrapped(docTitle, fontBold, 18, rgb(0.15, 0.15, 0.15));
            y -= 20;

            // Función recursiva para iterar sobre el árbol de apuntes
            const drawNode = (node, level) => {
                const indent = level * 15;
                if (node.title) {
                    checkSpace(30);
                    y -= 5;
                    drawTextWrapped(sanitizeHTML(node.title), fontBold, level === 0 ? 13 : 11.5, rgb(0.2, 0.2, 0.2), indent);
                    y -= 6;
                }
                if (node.content) {
                    drawTextWrapped(sanitizeHTML(node.content), fontNormal, 10.5, rgb(0.3, 0.3, 0.3), indent);
                    y -= 12;
                }
                if (node.children) node.children.forEach(child => drawNode(child, level + 1));
            };

            parsedData.contentTree.forEach(node => drawNode(node, 0));

            // Descarga el archivo
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docTitle.substring(0, 25).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            setNotificacion("PDF descargado con éxito");

        } catch (error) {
            console.error("Error al generar PDF:", error);
            setNotificacion("Error al generar PDF");
        }
    };

    if (!parsedData) return <div style={{ padding: '40px', color: colors?.textoApagado || '#64748b' }}>Cargando tus apuntes...</div>;

    return (
        <div id="visor-scroll-container" ref={containerRef} style={{ height: '100%', width: '100%', overflowY: 'auto', background: 'white', position: 'relative' }}>
            
            {notificacion && <Toast mensaje={notificacion} onClear={() => setNotificacion(null)} colors={colors} />}

            <style>{`
                .ql-bubble .ql-tooltip { border-radius: 50px !important; padding: 4px 12px !important; }
                .ql-bubble .ql-toolbar { display: flex !important; flex-wrap: nowrap !important; align-items: center !important; width: max-content !important; overflow: visible !important; }
                .ql-bubble .ql-toolbar .ql-formats { display: inline-flex !important; align-items: center !important; margin: 0 4px !important; flex-wrap: nowrap !important; }
                .ql-bubble .ql-toolbar::-webkit-scrollbar { display: none; }
                .ql-editor code { padding: 2px 6px !important; border-radius: 6px !important; font-weight: bold !important; border: 1px dashed #d1d5db; background-color: transparent; color: inherit; font-family: inherit; }
                .ql-editor { font-family: inherit !important; font-size: 18px !important; line-height: 1.6 !important; padding: 0 !important; min-height: 40px; }
                .title-editor .ql-editor, .title-editor .ql-editor p, .title-display, .title-display p { font-size: 20px !important; font-weight: 700 !important; color: #000000 !important; margin: 0 !important; }
                .main-title-editor .ql-editor, .main-title-editor .ql-editor p, .main-title, .main-title p { font-size: 36px !important; font-weight: 700 !important; color: #000000 !important; margin: 0 !important; }
                .ql-editor strong, .ql-editor b, .ql-editor strong *, .ql-editor b * { font-weight: 700 !important; color: #000000 !important; }
                .ql-bubble .ql-picker.ql-size .ql-picker-label[data-value]::before, .ql-bubble .ql-picker.ql-size .ql-picker-item[data-value]::before { content: attr(data-value) !important; }
                .apuntes-content img, .ql-editor img { max-width: 250px !important; max-height: 150px !important; object-fit: contain; display: inline-block !important; vertical-align: middle; margin: 0 6px; border-radius: 8px; cursor: zoom-in; border: 1px solid #e2e8f0; background: #f8fafc; }
                .image-zoom-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 99999; display: flex; justify-content: center; align-items: center; cursor: zoom-out; }
                .image-zoom-overlay img { max-width: 90vw !important; max-height: 90vh !important; object-fit: contain; border-radius: 8px; border: none; background: transparent; display: block !important; margin: auto; }
            `}</style>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px', padding: '15px 30px', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', zIndex: 10, borderBottom: '1px solid #f1f5f9', maxWidth: '1300px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    
                    <button onClick={descargarFuente} 
                            style={{ ...xpButton, background: '#edf2ed', color: colors.principal, border: `1px solid ${colors.borde}`, borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', fontSize: '13px' }}>
                        <IcoDownload color={colors.principal}/> Fuente .{nombreArchivo.split('.').pop()}
                    </button>
                    <button onClick={exportarPDFPropio} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${colors?.danger || '#fca5a5'}`, background: '#fef2f2', color: colors?.danger || '#ef4444', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
                        <FileText size={16} /> Exportar PDF
                    </button>

                    <button onClick={() => setIsEditMode(!isEditMode)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: isEditMode ? (colors?.principal || '#4f46e5') : '#f3f4f6', color: isEditMode ? 'white' : '#4b5563', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}>
                        {isEditMode ? <><Eye size={16} /> Ver Resultado</> : <><Edit2 size={16} /> Editar Tema</>}
                    </button>
                </div>
            </div>

            <div id="visor-print-area" style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 2rem 100px 2rem' }}>
                <div style={{ marginBottom: '30px' }}>
                    {isEditMode ? (
                        <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px', border: '1px solid #e2e8f0' }}>
                            <ReactQuill className="main-title-editor" theme="bubble" value={parsedData.title} onChange={(value) => { const newData = {...parsedData, title: value}; setParsedData(newData); guardarEnDisco(newData); }} modules={{ toolbar: [['bold', 'italic', 'underline', 'strike'], [{ 'color': [] }, { 'background': [] }]] }} placeholder="Título del Tema..." />
                        </div>
                    ) : (
                        <div className="quill">
                            <div className="ql-container ql-bubble" style={{ border: 'none', background: 'transparent' }}>
                                <div className="main-title ql-editor" style={{ padding: '0', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }} dangerouslySetInnerHTML={{ __html: parsedData.title || 'Tema sin título' }} />
                            </div>
                        </div>
                    )}
                </div>

                {(parsedData.contentTree || []).map(node => (
                    <SectionNode key={node.id} node={node} level={0} onChangeNode={handleUpdateNode} onAddChild={handleAddChild} onDeleteNode={handleDeleteNode} isEditMode={isEditMode} onImageClick={handleImageClick} />
                ))}
                
                {isEditMode && (
                    <div className="no-print" style={{ marginTop: '30px' }}>
                        <button onClick={handleAddMainSection} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#4b5563', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none' }}><Plus size={20} /> Añadir Apartado Principal</button>
                    </div>
                )}
            </div>

            {zoomedImage && (
                <div className="image-zoom-overlay no-print" onClick={() => setZoomedImage(null)}>
                    <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}><X size={24} color="black" /></button>
                    <img src={zoomedImage} alt="Ampliación" />
                </div>
            )}
        </div>
    );
}