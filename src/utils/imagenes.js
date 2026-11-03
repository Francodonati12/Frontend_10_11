// Clase 10 -- Helper de imagenes
// Construye la URL completa de la imagen de un producto a partir de su imagen_url
// relativa devuelta por la API.
//
// Retorna null si el producto o su campo imagen_url no existen,
// para que los componentes rendericen un placeholder en su lugar.


/**
 * Clase 10 — Helper de imágenes.
 * Construye la URL completa de la imagen de un producto a partir de su `imagen_url`.
 * Retorna null si el producto o producto.imagen_url es nulo o indefinido.
 *
 * @param {object|null|undefined} producto
 * @returns {string|null} URL absoluta de la imagen o null si no posee imagen.
 */
export function urlImagen(producto) {
  if (!producto || !producto.imagen_url) {
    return null;
  }

  // Si ya es una URL absoluta externa (http:// o https://), retornarla directamente
  if (producto.imagen_url.startsWith("http://") || producto.imagen_url.startsWith("https://")) {
    return producto.imagen_url;
  }

  const base = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  if (base.endsWith("/") && producto.imagen_url.startsWith("/")) {
    return base.slice(0, -1) + producto.imagen_url;
  }
  if (!base.endsWith("/") && !producto.imagen_url.startsWith("/")) {
    return `${base}/${producto.imagen_url}`;
  }
  return (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + producto.imagen_url;
}

export default urlImagen;

