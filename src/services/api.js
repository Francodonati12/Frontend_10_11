const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Fallback images map based on keywords in product name
const IMAGE_LIBRARY = {
  manzana: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
  pera: "https://images.unsplash.com/photo-1514756331096-242fdeb70d4a?auto=format&fit=crop&w=800&q=80",
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
  platano: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
  fruta: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
  sticker: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=800&q=80",
  auricular: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  teclado: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
  mouse: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
  reloj: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
  default: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
};

export function getCustomImagesMap() {
  try {
    const raw = localStorage.getItem("custom_product_images");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveCustomImage(productId, imageUrl) {
  try {
    const current = getCustomImagesMap();
    current[productId] = imageUrl;
    localStorage.setItem("custom_product_images", JSON.stringify(current));
  } catch (e) {
    console.error("Error al guardar imagen personalizada:", e);
  }
}

export function removeCustomImage(productId) {
  try {
    const current = getCustomImagesMap();
    delete current[productId];
    localStorage.setItem("custom_product_images", JSON.stringify(current));
  } catch (e) {
    console.error("Error al borrar imagen personalizada:", e);
  }
}

export function getProductImage(producto) {
  if (!producto) return IMAGE_LIBRARY.default;

  // 1. Direct image property
  if (producto.imagen || producto.image || producto.foto) {
    return producto.imagen || producto.image || producto.foto;
  }

  // 2. Custom image mapped by product ID
  const customMap = getCustomImagesMap();
  if (producto.id && customMap[producto.id]) {
    return customMap[producto.id];
  }

  // 3. Name-based matching
  const nameLower = (producto.nombre || "").toLowerCase();
  for (const [key, url] of Object.entries(IMAGE_LIBRARY)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }

  // 4. Default high quality product image
  return IMAGE_LIBRARY.default;
}

export const INITIAL_PRODUCTOS = [
  { id: 1, nombre: 'Manzana Orgánica', precio_final: 1500, cuotas_cantidad: 3, cuotas_valor: 500, garantia_meses: 1, stock: 12 },
  { id: 2, nombre: 'Pera Williams', precio_final: 5000, cuotas_cantidad: 3, cuotas_valor: 1666, garantia_meses: 1, stock: 29 },
  { id: 3, nombre: 'Banana Cavendish', precio_final: 5000, cuotas_cantidad: 3, cuotas_valor: 1666, garantia_meses: 1, stock: 50 },
  { id: 4, nombre: 'Stickers Dev Pack', precio_final: 1200, cuotas_cantidad: 2, cuotas_valor: 600, garantia_meses: 6, stock: 10 },
];

export async function getProductos({ page = 0, limit = 8, nombre = "" } = {}) {
  try {
    const skip = page * limit;
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (nombre.trim() !== "") {
      params.append("nombre", nombre);
    }

    const response = await fetch(`${BASE_URL}/productos/?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();

    // Attach custom images if present
    const customMap = getCustomImagesMap();
    return data.map((item) => ({
      ...item,
      imagen: customMap[item.id] || item.imagen || getProductImage(item),
    }));
  } catch (error) {
    console.warn("Backend no alcanzable o error, retornando datos por defecto:", error);
    return INITIAL_PRODUCTOS.map((item) => ({
      ...item,
      imagen: getProductImage(item),
    }));
  }
}

function authHeaders(isJson = true) {
  const token = localStorage.getItem("access_token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

// ==========================================
// AUTENTICACIÓN (LOGIN / REGISTRO / PERFIL)
// ==========================================

export async function loginUsuario(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Credenciales inválidas. Verifica tu correo y contraseña.");
  }

  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }

  return data;
}

export async function registrarUsuario({ nombre, email, password, acepto_tratamiento = true }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nombre,
      email,
      password,
      acepto_tratamiento,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Error al registrar la cuenta.");
  }

  return data;
}

export async function getPerfil() {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders(false),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Sesión vencida o no autorizada.");
    }
    throw new Error("No se pudo obtener el perfil del usuario.");
  }

  return await res.json();
}

export function logoutUsuario() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// ==========================================
// GESTIÓN DE PRODUCTOS (ADMIN)
// ==========================================

export async function crearProducto(productoData) {
  const { imagen, ...datosServidor } = productoData;

  const res = await fetch(`${BASE_URL}/productos/`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      nombre: datosServidor.nombre,
      precio_final: parseFloat(datosServidor.precio_final),
      cuotas_cantidad: datosServidor.cuotas_cantidad ? parseInt(datosServidor.cuotas_cantidad) : 0,
      cuotas_valor: datosServidor.cuotas_valor ? parseFloat(datosServidor.cuotas_valor) : 0,
      garantia_meses: datosServidor.garantia_meses ? parseInt(datosServidor.garantia_meses) : 0,
      stock: datosServidor.stock ? parseInt(datosServidor.stock) : 0,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("Acceso denegado: No cuentas con privilegios de Administrador para agregar productos.");
    }
    if (res.status === 401) {
      throw new Error("Sesión no autenticada o token vencido.");
    }
    throw new Error(data.detail || "Error al crear el producto.");
  }

  // Si se ingresó una imagen personalizada, la vinculamos al nuevo ID
  if (imagen && data.id) {
    saveCustomImage(data.id, imagen);
  }

  return {
    ...data,
    imagen: imagen || getProductImage(data),
  };
}

/**
 * Clase 10 — Subida de imagen de producto.
 * Sube un archivo de imagen al endpoint REST.
 * IMPORTANTE: NO se envía "Content-Type" de forma manual; el navegador
 * lo genera automáticamente con el boundary correcto al usar FormData.
 *
 * @param {number} productoId
 * @param {File} archivo
 */
export async function subirImagen(productoId, archivo) {
  const fd = new FormData();
  fd.append("archivo", archivo);

  // Solo se envía el header de autorización (sin Content-Type)
  const headers = {};
  const token = localStorage.getItem("access_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/productos/${productoId}/imagen`, {
    method: "POST",
    headers,
    body: fd,
  });

  if (!res.ok) {
    if (res.status === 403) throw new Error("No tenés permisos de administrador");
    if (res.status === 404) throw new Error("Producto no encontrado");
    if (res.status === 413) throw new Error("El archivo supera el tamaño máximo de 2 MB");
    if (res.status === 415) throw new Error("El archivo enviado no es una imagen válida");
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Error al subir la imagen (HTTP ${res.status})`);
  }

  return await res.json();
}

export async function eliminarProducto(productoId) {
  const res = await fetch(`${BASE_URL}/productos/${productoId}`, {
    method: "DELETE",
    headers: authHeaders(false),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("Acceso denegado: Se requieren permisos de Administrador para quitar productos.");
    }
    if (res.status === 401) {
      throw new Error("Sesión no autenticada.");
    }
    throw new Error(data.detail || "Error al eliminar el producto.");
  }

  // Eliminar mapeo de imagen personalizada si existía
  removeCustomImage(productoId);

  return data;
}

// ==========================================
// PEDIDOS
// ==========================================

export async function crearPedido(itemsCarrito) {
  const payload = {
    items: itemsCarrito.map((item) => ({
      producto_id: item.id,
      cantidad: item.cantidad,
    })),
  };

  const res = await fetch(`${BASE_URL}/pedidos/`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Tu sesión venció. Por favor, volvé a iniciar sesión.");
    }
    if (res.status === 409) {
      const data = await res.json();
      throw new Error(data.detail || "Conflicto de stock.");
    }
    throw new Error("Ocurrió un error al procesar la compra.");
  }

  return await res.json();
}

export async function getMisPedidos() {
  const res = await fetch(`${BASE_URL}/pedidos/mios`, {
    headers: authHeaders(false),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    }
    throw new Error("Error al cargar el historial de compras.");
  }

  return await res.json();
}

// ==========================================
// REVOCACIÓN Y DATOS DE USUARIO
// ==========================================

export async function revocarPedido(pedidoId) {
  const res = await fetch(`${BASE_URL}/pedidos/${pedidoId}/revocacion`, {
    method: "POST",
    headers: authHeaders(false),
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 409) {
      throw new Error(data.detail || "No se puede revocar este pedido.");
    }
    if (res.status === 404) {
      throw new Error("El pedido no existe o no te pertenece.");
    }
    throw new Error("Error al solicitar la revocación.");
  }

  return data;
}

export async function getMisDatos() {
  const res = await fetch(`${BASE_URL}/usuarios/me/datos`, {
    headers: authHeaders(false),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    }
    throw new Error("Error al obtener la información personal.");
  }

  return await res.json();
}

export async function eliminarMiCuenta() {
  const res = await fetch(`${BASE_URL}/usuarios/me`, {
    method: "DELETE",
    headers: authHeaders(false),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Tu sesión venció. Volvé a iniciar sesión.");
    }
    throw new Error("No se pudo procesar la baja de la cuenta.");
  }

  return await res.json();
}