// Clase 10 -- Helper de imagenes
// Construye la URL completa de la imagen de un producto a partir de su imagen_url
// relativa devuelta por la API.
//
// Retorna null si el producto o su campo imagen_url no existen,
// para que los componentes rendericen un placeholder en su lugar.

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * @param {object|null|undefined} producto
 * @returns {string|null} URL absoluta de la imagen, o null si no hay imagen.
 */
export function urlImagen(producto) {
  if (!producto || !producto.imagen_url) {
    return null;
  }
  return API_BASE + producto.imagen_url;
}
