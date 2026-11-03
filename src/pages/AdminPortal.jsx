import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProductos, crearProducto, eliminarProducto, getProductImage } from '../services/api';
import ProductImage from '../components/ProductImage';
import SubirImagenModal from '../components/SubirImagenModal';
import { urlImagen } from '../utils/imagenes';

export default function AdminPortal() {
  const { user, isAdmin, loginAdmin, logout } = useAuth();

  // Estados de autenticación de admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [autenticando, setAutenticando] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState(null);
  const [exitoAcceso, setExitoAcceso] = useState(null);

  // Estados del inventario (Agregar / Quitar productos)
  const [productos, setProductos] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [accionEnCurso, setAccionEnCurso] = useState(false);
  const [notificacion, setNotificacion] = useState(null);
  // Clase 10: modal de subida de imagen
  const [modalImagen, setModalImagen] = useState(null); // producto seleccionado o null

  // Formulario para Agregar Producto
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio_final: '',
    stock: '10',
    cuotas_cantidad: '3',
    cuotas_valor: '',
    garantia_meses: '6',
    imagen: '',
  });

  // Cargar productos de la base de datos cuando el admin está autenticado
  const refrescarProductos = async () => {
    setCargandoProductos(true);
    try {
      const data = await getProductos({ limit: 50 });
      setProductos(data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setCargandoProductos(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      refrescarProductos();
    }
  }, [isAdmin]);

  // Manejar Login Exclusivo de Administrador
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAutenticando(true);
    setErrorAcceso(null);
    setExitoAcceso(null);

    try {
      const perfil = await loginAdmin(adminEmail, adminPassword);
      setExitoAcceso(`¡Autenticación de Administrador exitosa! Bienvenido ${perfil.nombre}.`);
      setAdminPassword('');
    } catch (err) {
      setErrorAcceso(err.message || 'Error al validar las credenciales de administrador.');
    } finally {
      setAutenticando(false);
    }
  };

  // Rellenar con credenciales de prueba
  const rellenarAdminValido = () => {
    setAdminEmail('donatifranco505@gmail.com');
    setAdminPassword('admin123');
    setErrorAcceso(null);
  };

  const rellenarUsuarioNoAutorizado = () => {
    setAdminEmail('cliente@tienda.com');
    setAdminPassword('cliente123');
    setErrorAcceso(null);
  };

  // Manejar Crear Producto
  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.precio_final) {
      alert('Por favor completa el nombre y precio del producto.');
      return;
    }

    setAccionEnCurso(true);
    setNotificacion(null);

    try {
      const cuotasCant = parseInt(nuevoProducto.cuotas_cantidad) || 0;
      const precio = parseFloat(nuevoProducto.precio_final) || 0;
      const cuotasVal = nuevoProducto.cuotas_valor
        ? parseFloat(nuevoProducto.cuotas_valor)
        : cuotasCant > 0
        ? Math.round(precio / cuotasCant)
        : 0;

      await crearProducto({
        ...nuevoProducto,
        precio_final: precio,
        cuotas_cantidad: cuotasCant,
        cuotas_valor: cuotasVal,
        garantia_meses: parseInt(nuevoProducto.garantia_meses) || 0,
        stock: parseInt(nuevoProducto.stock) || 0,
      });

      setNotificacion({
        tipo: 'exito',
        texto: `✅ Producto "${nuevoProducto.nombre}" agregado exitosamente a la base de datos.`,
      });

      // Reset form
      setNuevoProducto({
        nombre: '',
        precio_final: '',
        stock: '10',
        cuotas_cantidad: '3',
        cuotas_valor: '',
        garantia_meses: '6',
        imagen: '',
      });

      await refrescarProductos();
    } catch (err) {
      setNotificacion({
        tipo: 'error',
        texto: `❌ ${err.message}`,
      });
    } finally {
      setAccionEnCurso(false);
    }
  };

  // Manejar Quitar Producto
  const handleEliminarProducto = async (id, nombreProd) => {
    if (!window.confirm(`¿Confirmas eliminar permanentemente el producto "${nombreProd}" (ID: ${id}) de la base de datos?`)) {
      return;
    }

    setAccionEnCurso(true);
    setNotificacion(null);

    try {
      await eliminarProducto(id);
      setNotificacion({
        tipo: 'exito',
        texto: `🗑️ Producto #${id} ("${nombreProd}") quitado correctamente de la base de datos.`,
      });
      await refrescarProductos();
    } catch (err) {
      setNotificacion({
        tipo: 'error',
        texto: `❌ Error al eliminar producto: ${err.message}`,
      });
    } finally {
      setAccionEnCurso(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* CABECERA PRINCIPAL DEL PANEL */}
      <div className="bg-gradient-to-r from-[#13141f] via-[#1a1b2a] to-[#13141f] border border-orange-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_35px_rgba(255,107,0,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-black uppercase tracking-wider">
              <span>🛡️ Apartado 2</span>
              <span>•</span>
              <span>Control de Roles & Seguridad</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Panel de Administrador
            </h1>
            <p className="text-sm text-neutral-300 max-w-2xl">
              Acceso exclusivo restringido a usuarios con rol <code className="text-orange-400 bg-black/40 px-1.5 py-0.5 rounded font-mono">admin</code> verificado en la base de datos. Permite la administración total de productos (agregar y quitar ítems en tiempo real).
            </p>
          </div>

          {isAdmin && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="px-4 py-2.5 bg-black/50 border border-orange-500/40 rounded-2xl text-xs">
                <p className="text-neutral-400">Admin autenticado:</p>
                <p className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-orange-400">●</span> {user.nombre} ({user.email})
                </p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2.5 bg-red-950/70 hover:bg-red-600 text-red-200 hover:text-white border border-red-800 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                Cerrar Sesión Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CASO 1: SI NO ESTÁ AUTENTICADO COMO ADMIN (MOSTRAR FORMULARIO DE ACCESO EXCLUSIVO Y VALIDACIÓN DE ROL) */}
      {!isAdmin && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-[#13141f] border-2 border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-2xl flex items-center justify-center mx-auto shadow-inner">
                🔐
              </div>
              <h2 className="text-2xl font-bold text-white">Inicio de Sesión Administrador</h2>
              <p className="text-xs text-neutral-400">
                La identidad y el rol se comprobarán directamente en la base de datos.
              </p>
            </div>

            {/* AVISO DE ACCESO DENEGADO / PERMISOS INSUFICIENTES */}
            {errorAcceso && (
              <div className="p-4 bg-red-950/80 border-2 border-red-600 text-red-200 rounded-2xl space-y-2 shadow-lg animate-in fade-in duration-300">
                <div className="flex items-center gap-2 font-bold text-sm text-red-300">
                  <span className="text-xl">⛔</span>
                  <span>ACCESO DENEGADO: Permisos Insuficientes</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed pl-7">
                  {errorAcceso}
                </p>
                <div className="text-[11px] text-red-400/90 pl-7 font-mono">
                  Motivo: La base de datos requiere rol autorizado 'admin' para habilitar los controles de gestión.
                </div>
              </div>
            )}

            {exitoAcceso && (
              <div className="p-4 bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs rounded-2xl flex items-center gap-2">
                <span>✅</span>
                <span>{exitoAcceso}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Correo Electrónico de Administrador
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@tienda.com"
                  required
                  className="w-full bg-[#0b0c10] border border-[#232538] focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-2">
                  Contraseña de Administrador
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0b0c10] border border-[#232538] focus:border-orange-500 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={autenticando}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(255,107,0,0.3)] active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{autenticando ? 'Consultando rol en base de datos...' : 'Validar Rol y Acceder 🛡️'}</span>
              </button>
            </form>

            {/* BOTONES DE PRUEBA RÁPIDA PARA DEMOSTRACIÓN DE ROLES */}
            <div className="pt-4 border-t border-[#232538] space-y-2">
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
                Herramientas de Validación Rápida:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={rellenarAdminValido}
                  className="py-2 px-3 bg-neutral-900 hover:bg-neutral-800 border border-orange-500/40 hover:border-orange-500 text-orange-400 text-xs font-semibold rounded-xl transition-all text-left flex items-center gap-2"
                >
                  <span>👑</span>
                  <div className="truncate">
                    <div className="font-bold">Admin Autorizado</div>
                    <div className="text-[10px] text-neutral-400">donatifranco505...</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={rellenarUsuarioNoAutorizado}
                  className="py-2 px-3 bg-neutral-900 hover:bg-red-950/40 border border-neutral-700 hover:border-red-600 text-neutral-300 hover:text-red-300 text-xs font-semibold rounded-xl transition-all text-left flex items-center gap-2"
                >
                  <span>🚫</span>
                  <div className="truncate">
                    <div className="font-bold">Usuario Estándar</div>
                    <div className="text-[10px] text-neutral-400">cliente@tienda.com</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASO 2: ADMINISTRADOR AUTORIZADO (MOSTRAR CONTROLES DINÁMICOS PARA AGREGAR Y QUITAR PRODUCTOS) */}
      {isAdmin && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Alerta de notificación flotante o de estado */}
          {notificacion && (
            <div
              className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between shadow-lg ${
                notificacion.tipo === 'exito'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                  : 'bg-red-950/80 border-red-600 text-red-200'
              }`}
            >
              <span>{notificacion.texto}</span>
              <button
                onClick={() => setNotificacion(null)}
                className="text-neutral-400 hover:text-white ml-4 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* CONTROL DINÁMICO 1: FORMULARIO PARA AGREGAR NUEVO PRODUCTO */}
          {/* ======================================================== */}
          <div className="bg-[#13141f] border border-[#232538] rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#232538] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl">
                  ➕
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Agregar Nuevo Producto</h2>
                  <p className="text-xs text-neutral-400">
                    Crea un nuevo ítem en la base de datos con soporte para imágenes dinámicas
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Rol: Administrador
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulario */}
              <form onSubmit={handleCrearProducto} className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      value={nuevoProducto.nombre}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                      placeholder="Ej: Teclado Mecánico RGB"
                      required
                      className="w-full bg-[#0b0c10] border border-[#232538] focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Precio Final (ARS) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={nuevoProducto.precio_final}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio_final: e.target.value })}
                      placeholder="Ej: 12500"
                      required
                      className="w-full bg-[#0b0c10] border border-[#232538] focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Stock Disponible
                    </label>
                    <input
                      type="number"
                      value={nuevoProducto.stock}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
                      placeholder="Ej: 20"
                      className="w-full bg-[#0b0c10] border border-[#232538] focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Cantidad de Cuotas
                    </label>
                    <input
                      type="number"
                      value={nuevoProducto.cuotas_cantidad}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, cuotas_cantidad: e.target.value })}
                      placeholder="Ej: 3"
                      className="w-full bg-[#0b0c10] border border-[#232538] focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                      Garantía (Meses)
                    </label>
                    <input
                      type="number"
                      value={nuevoProducto.garantia_meses}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, garantia_meses: e.target.value })}
                      placeholder="Ej: 6"
                      className="w-full bg-[#0b0c10] border border-[#232538] focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                    URL de Imagen Dinámica (Opcional - Se generará automáticamente si queda vacía)
                  </label>
                  <input
                    type="url"
                    value={nuevoProducto.imagen}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, imagen: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#0b0c10] border border-[#232538] focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[11px] text-neutral-500">Ejemplos rápidos:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          imagen:
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
                        })
                      }
                      className="text-[11px] text-orange-400 hover:underline"
                    >
                      Auriculares
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          imagen:
                            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
                        })
                      }
                      className="text-[11px] text-orange-400 hover:underline"
                    >
                      Teclado
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNuevoProducto({
                          ...nuevoProducto,
                          imagen:
                            'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
                        })
                      }
                      className="text-[11px] text-orange-400 hover:underline"
                    >
                      Mouse
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={accionEnCurso}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>{accionEnCurso ? 'Guardando en Base de Datos...' : 'Guardar y Publicar Producto 🚀'}</span>
                  </button>
                </div>
              </form>

              {/* Vista Previa en Vivo de la Tarjeta del Producto */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Vista Previa en Vivo:
                </label>
                <div className="bg-[#0b0c10] border border-orange-500/40 rounded-2xl p-4 shadow-lg space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-400 font-bold">VISTA PREVIA</span>
                    <span className="text-neutral-400">Stock: {nuevoProducto.stock || 0}</span>
                  </div>
                  <h3 className="font-bold text-white text-base truncate">
                    {nuevoProducto.nombre || 'Nombre del producto'}
                  </h3>
                  <div className="text-xl font-black text-orange-500">
                    ${parseFloat(nuevoProducto.precio_final || 0).toLocaleString('es-AR')}
                  </div>
                  {/* IMAGEN RENDERIZADA DEBAJO DEL PRODUCTO */}
                  <ProductImage
                    src={nuevoProducto.imagen || getProductImage({ nombre: nuevoProducto.nombre })}
                    alt={nuevoProducto.nombre || 'Vista previa'}
                    aspectRatio="aspect-[16/10]"
                  />
                  <div className="text-[11px] text-neutral-400 text-center italic">
                    La imagen se renderiza debajo de la cabecera del elemento.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CONTROL DINÁMICO 2: GESTIÓN Y QUITAR PRODUCTOS DEL CATÁLOGO */}
          {/* ======================================================== */}
          <div className="bg-[#13141f] border border-[#232538] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232538] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl">
                  📦
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Inventario en Base de Datos</h2>
                  <p className="text-xs text-neutral-400">
                    Total de productos registrados: {productos.length}
                  </p>
                </div>
              </div>
              <button
                onClick={refrescarProductos}
                disabled={cargandoProductos}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>🔄</span>
                <span>{cargandoProductos ? 'Actualizando...' : 'Refrescar Lista'}</span>
              </button>
            </div>

            {/* TABLA / LISTADO RESPONSIVE DE PRODUCTOS CON BOTÓN PARA QUITAR */}
            {productos.length === 0 ? (
              <p className="text-center py-8 text-neutral-500 text-sm">
                No hay productos cargados en la base de datos.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {productos.map((prod) => {
                  const imgUrl = urlImagen(prod);
                  return (
                    <div
                      key={prod.id}
                      className="bg-[#0b0c10] border border-[#232538] hover:border-orange-500/40 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                          <span className="font-mono text-orange-400 font-bold">ID: #{prod.id}</span>
                          <span>Stock: {prod.stock} u.</span>
                        </div>
                        <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">
                          {prod.nombre}
                        </h4>
                        <p className="text-lg font-black text-orange-500 mb-2">
                          ${prod.precio_final.toLocaleString('es-AR')}
                        </p>
                        {/* Clase 10: aspect-square con urlImagen */}
                        <div className="aspect-square overflow-hidden bg-gray-100 rounded">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={prod.nombre}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 select-none">
                              <svg
                                className="w-10 h-10 text-gray-400 mb-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-[11px] font-medium text-gray-500">Sin imagen</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#232538] space-y-2">
                        {/* Clase 10: Botón para abrir el modal de imagen */}
                        <button
                          onClick={() => setModalImagen(prod)}
                          disabled={accionEnCurso}
                          className="w-full py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:border-orange-500/60 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <span>🖼️</span>
                          <span>Cambiar imagen</span>
                        </button>
                        {/* BOTON QUITAR PRODUCTO DINAMICAMENTE */}
                        <button
                          onClick={() => handleEliminarProducto(prod.id, prod.nombre)}
                          disabled={accionEnCurso}
                          className="w-full py-2 bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-800/60 hover:border-red-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Eliminar este producto de la base de datos"
                        >
                          <span>🗑️</span>
                          <span>Quitar Producto</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clase 10: Modal de subida de imagen */}
      {modalImagen && (
        <SubirImagenModal
          producto={modalImagen}
          onCerrar={() => setModalImagen(null)}
          onExito={() => {
            setModalImagen(null);
            refrescarProductos();
            setNotificacion({
              tipo: 'exito',
              texto: `✅ Imagen del producto "${modalImagen.nombre}" actualizada correctamente.`,
            });
          }}
        />
      )}
    </div>
  );
}
