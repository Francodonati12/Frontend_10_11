import { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from './ProductImage';
import { getProductImage } from '../services/api';
import { urlImagen } from '../utils/imagenes';

export function ProductCard({
  producto,
  nombre,
  precio_final,
  cuotas_cantidad,
  cuotas_valor,
  garantia_meses,
  stock,
  onEliminar,
}) {
  const { agregar } = useCarrito();
  const { isAdmin } = useAuth();
  const [eliminando, setEliminando] = useState(false);
  const [agregadoAnim, setAgregadoAnim] = useState(false);

  const p = producto || {};

  const name = nombre ?? p.nombre ?? 'Producto sin nombre';
  const precioFinal = precio_final ?? p.precio_final ?? 0;
  const cuotasCantidad = cuotas_cantidad ?? p.cuotas_cantidad;
  const cuotasValor = cuotas_valor ?? p.cuotas_valor;
  const garantiaMeses = garantia_meses ?? p.garantia_meses;
  const stockUnidades = stock ?? p.stock ?? 0;
  // Clase 10: intentar primero la URL real de la API (imagen_url),
  // con fallback a la imagen local o a la librería de Unsplash.
  const imagenApiUrl = urlImagen(p);
  const imagen = imagenApiUrl || p.imagen || getProductImage(p);

  const productoParaCarrito = producto || {
    id: p.id,
    nombre: name,
    precio_final: precioFinal,
    stock: stockUnidades,
    imagen,
  };

  const handleAgregar = () => {
    agregar(productoParaCarrito, 1);
    setAgregadoAnim(true);
    setTimeout(() => setAgregadoAnim(false), 900);
  };

  const handleEliminar = async () => {
    if (!window.confirm(`¿Estás seguro de que deseas quitar el producto "${name}" (ID: ${p.id}) del catálogo?`)) {
      return;
    }
    setEliminando(true);
    try {
      if (onEliminar) {
        await onEliminar(p.id);
      }
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="group relative bg-[#13141f] border border-[#232538] hover:border-orange-500/50 rounded-2xl p-5 shadow-lg hover:shadow-[0_8px_30px_rgba(255,107,0,0.12)] transition-all duration-300 flex flex-col justify-between">
      {/* 1. SECCIÓN SUPERIOR: IDENTIFICACIÓN Y CABECERA DEL PRODUCTO */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Producto #{p.id ?? '—'}
          </span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              stockUnidades > 0
                ? 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                : 'bg-red-950/70 text-red-400 border border-red-800/40'
            }`}
          >
            {stockUnidades > 0 ? `${stockUnidades} disponibles` : 'Sin stock'}
          </span>
        </div>

        {/* Nombre del Producto */}
        <h2 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">
          {name}
        </h2>

        {/* Precio destacado en naranja vibrante */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-orange-500 tracking-tight">
            ${typeof precioFinal === 'number' ? precioFinal.toLocaleString('es-AR') : precioFinal}
          </span>
          <span className="text-xs text-neutral-400 font-medium">ARS</span>
        </div>

        {/* 2. GESTIÓN DE IMÁGENES — Clase 10: aspect-square, placeholder si no hay URL */}
        <div className="pt-1">
          <div className="aspect-square overflow-hidden bg-gray-100 rounded">
            {imagenApiUrl ? (
              <img
                src={imagenApiUrl}
                alt={name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : imagen && imagen !== '' ? (
              /* Fallback: imagen de Unsplash u otras fuentes locales */
              <img
                src={imagen}
                alt={name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              /* Placeholder gris con ícono cuando no hay imagen */
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-neutral-500 gap-2">
                <span className="text-3xl">🖼️</span>
                <span className="text-[11px] font-medium">Sin imagen</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN INFERIOR: FINANCIACIÓN, GARANTÍA Y CONTROLES */}
      <div className="mt-4 pt-3 border-t border-[#232538]/80 space-y-3">
        <div className="space-y-1 text-xs text-neutral-400">
          {cuotasCantidad > 0 && cuotasValor > 0 && (
            <p className="flex items-center justify-between text-neutral-300">
              <span>Financiación:</span>
              <span className="font-semibold text-orange-400">
                {cuotasCantidad} cuotas de ${typeof cuotasValor === 'number' ? cuotasValor.toLocaleString('es-AR') : cuotasValor}
              </span>
            </p>
          )}
          {garantiaMeses > 0 && (
            <p className="flex items-center justify-between">
              <span>Garantía:</span>
              <span className="text-neutral-300 font-medium">{garantiaMeses} meses</span>
            </p>
          )}
        </div>

        {/* Botón estándar: Agregar al carrito */}
        <button
          onClick={handleAgregar}
          disabled={stockUnidades <= 0}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            agregadoAnim
              ? 'bg-emerald-500 text-black scale-98 shadow-emerald-500/25'
              : stockUnidades > 0
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black hover:shadow-orange-500/25 active:scale-97'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
          }`}
        >
          {agregadoAnim ? (
            <>✓ Agregado al carrito</>
          ) : stockUnidades > 0 ? (
            <>
              <span>Agregar al carrito</span>
              <span className="text-base">🛒</span>
            </>
          ) : (
            'Producto Agotado'
          )}
        </button>

        {/* CONTROLES EXCLUSIVOS DE ADMINISTRADOR: QUITAR PRODUCTO DINÁMICAMENTE */}
        {isAdmin && (
          <div className="pt-2 border-t border-dashed border-orange-500/20 flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400/80 flex items-center gap-1">
              <span>🛡️</span> Admin
            </span>
            <button
              onClick={handleEliminar}
              disabled={eliminando}
              className="px-3 py-1.5 bg-red-950/40 hover:bg-red-600 text-red-400 hover:text-white border border-red-800/50 hover:border-red-600 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Quitar este producto del catálogo (Acceso de Administrador)"
            >
              <span>🗑️</span>
              <span>{eliminando ? 'Quitando...' : 'Quitar Producto'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductCard;