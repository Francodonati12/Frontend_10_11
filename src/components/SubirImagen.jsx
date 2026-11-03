import { useState, useRef, useEffect } from "react";
import { subirImagen } from "../services/api";

/**
 * Clase 10 — Componente de Subida de Imagen (Administrador)
 *
 * Props:
 *  - productoId       : ID del producto a actualizar
 *  - producto         : Objeto del producto (opcional, para extraer el ID si productoId no se pasa)
 *  - onExito          : Callback tras la subida exitosa con el producto actualizado
 *  - onSubidaExitosa  : Callback alternativo de éxito
 */
export default function SubirImagen({
  productoId,
  producto,
  onExito,
  onSubidaExitosa,
}) {
  const id = productoId ?? producto?.id;
  const inputRef = useRef(null);
  const [archivo, setArchivo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [exito, setExito] = useState(false);

  // Destruir la URL del objeto al cambiar la previsualización o al desmontar el componente
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación antes de previsualizar: tipo imagen
    if (!file.type.startsWith("image/")) {
      setError("El archivo no es una imagen válida");
      if (inputRef.current) inputRef.current.value = "";
      setArchivo(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    // Validación antes de previsualizar: peso máximo 2 MB (2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen supera los 2 MB");
      if (inputRef.current) inputRef.current.value = "";
      setArchivo(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    // Archivo válido: limpiar error previo y generar vista previa con URL.createObjectURL
    setError(null);
    setArchivo(file);

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubir = async () => {
    if (!archivo || !id) return;

    setSubiendo(true);
    setError(null);

    try {
      const res = await subirImagen(id, archivo);

      // Al finalizar con éxito, resetear input y estados
      if (inputRef.current) inputRef.current.value = "";
      setArchivo(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setExito(true);

      // Notificar la actualización
      if (onExito) onExito(res);
      if (onSubidaExitosa) onSubidaExitosa(res);

      setTimeout(() => setExito(false), 3000);
    } catch (err) {
      setError(err.message || "Error al subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
          Seleccionar imagen (máx. 2 MB)
        </label>
        {/* Input de archivo SIN atributo value */}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          className="block w-full text-sm text-neutral-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-400 hover:file:bg-orange-500/20 cursor-pointer"
        />
        <p className="text-[11px] text-neutral-500 mt-1">
          Formatos compatibles: JPG, PNG, WebP, GIF.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/80 border border-red-600 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {exito && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <span>✅</span>
          <span>Imagen subida con éxito.</span>
        </div>
      )}

      {preview && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Vista previa
          </label>
          <div className="aspect-square w-28 overflow-hidden bg-gray-100 rounded">
            <img
              src={preview}
              alt="Vista previa"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Manejo de 3 estados del botón:
          1. Deshabilitado sin archivo (!archivo)
          2. Habilitado con archivo válido (archivo && !subiendo)
          3. Deshabilitado con texto "Subiendo…" durante la petición (subiendo)
      */}
      <button
        type="button"
        onClick={handleSubir}
        disabled={!archivo || subiendo}
        className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-sm rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        <span>{subiendo ? "Subiendo…" : "Subir imagen"}</span>
      </button>
    </div>
  );
}
