import { useState, useRef, useEffect } from "react";
import { subirImagen } from "../services/api";

/**
 * Clase 10 — Modal para subir imagen de un producto.
 *
 * Props:
 *  - producto  : objeto con { id, nombre }
 *  - onCerrar  : callback al cerrar el modal
 *  - onExito   : callback(productoActualizado) al subir correctamente
 */
export default function SubirImagenModal({ producto, onCerrar, onExito }) {
  const inputRef = useRef(null);
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errorLocal, setErrorLocal] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [exito, setExito] = useState(false);

  // Liberar la object-URL anterior cada vez que preview cambia o el componente se desmonta
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo
    if (!file.type.startsWith("image/")) {
      setErrorLocal("El archivo no es una imagen válida");
      if (inputRef.current) inputRef.current.value = "";
      setArchivo(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    // Validación de tamaño (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorLocal("La imagen supera los 2 MB");
      if (inputRef.current) inputRef.current.value = "";
      setArchivo(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    setErrorLocal(null);
    setArchivo(file);

    // Liberar URL anterior antes de crear la nueva
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubir = async () => {
    if (!archivo || !producto?.id) return;

    setSubiendo(true);
    setErrorLocal(null);
    try {
      const resultado = await subirImagen(producto.id, archivo);

      // Limpiar estado local
      if (inputRef.current) inputRef.current.value = "";
      setArchivo(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setExito(true);

      // Notificar al padre con el producto actualizado
      if (onExito) onExito(resultado);

      setTimeout(() => {
        setExito(false);
        onCerrar?.();
      }, 1800);
    } catch (err) {
      setErrorLocal(err.message || "Error inesperado al subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  };

  const handleLimpiar = () => {
    if (inputRef.current) inputRef.current.value = "";
    if (preview) URL.revokeObjectURL(preview);
    setArchivo(null);
    setPreview(null);
    setErrorLocal(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar?.();
      }}
    >
      <div className="relative w-full max-w-md bg-[#13141f] border border-[#232538] rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Subir Imagen</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Producto: <span className="text-orange-400 font-semibold">{producto?.nombre ?? `#${producto?.id}`}</span>
            </p>
          </div>
          <button
            onClick={onCerrar}
            className="text-neutral-500 hover:text-white text-xl font-bold transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Input de archivo */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider">
            Seleccionar imagen (máx. 2 MB)
          </label>
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            onChange={handleFileChange}
            className="block w-full text-sm text-neutral-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20 cursor-pointer"
          />
          <p className="text-[11px] text-neutral-500">Formatos admitidos: JPG, PNG, GIF, WebP.</p>
        </div>

        {/* Error local */}
        {errorLocal && (
          <div className="p-3 bg-red-950/80 border border-red-600 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorLocal}</span>
          </div>
        )}

        {/* Éxito */}
        {exito && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
            <span>✅</span>
            <span>Imagen subida correctamente.</span>
          </div>
        )}

        {/* Vista previa */}
        {preview && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Vista previa</label>
            <div className="flex items-start gap-4">
              {/* Contenedor aspect-square como pide el requisito */}
              <div className="aspect-square w-24 overflow-hidden bg-gray-100 rounded">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="w-24 h-24 object-cover rounded"
                />
              </div>
              <div className="text-xs text-neutral-400 space-y-1">
                <p className="font-semibold text-white truncate max-w-[160px]">{archivo?.name}</p>
                <p>{archivo ? `${(archivo.size / 1024).toFixed(1)} KB` : ""}</p>
                <button
                  type="button"
                  onClick={handleLimpiar}
                  className="text-red-400 hover:text-red-300 text-[11px] underline cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCerrar}
            className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubir}
            disabled={!archivo || subiendo}
            className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-sm rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {subiendo ? "Subiendo…" : "Subir imagen"}
          </button>
        </div>
      </div>
    </div>
  );
}
