import { useState, useEffect } from 'react';
import { getProductos, eliminarProducto, INITIAL_PRODUCTOS } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Catalogo() {
  const [productos, setProductos] = useState(INITIAL_PRODUCTOS);
  const [page, setPage] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [lento, setLento] = useState(false); // Clase 11: banner de servidor en frío
  const [notificacion, setNotificacion] = useState(null);
  const limit = 8; // Mejor límite para vista en cuadrícula

  const { isAdmin } = useAuth();

  const cargarProductos = () => {
    setCargando(true);
    setLento(false);
    getProductos({ page, limit, nombre: busqueda })
      .then((data) => {
        if (data) setProductos(data);
      })
      .catch((error) => console.error('Error al cargar productos:', error))
      .finally(() => {
        setCargando(false);
        setLento(false);
      });
  };

  useEffect(() => {
    cargarProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, busqueda]);

  // Clase 11: detectar backend en frío (cold start) con temporizador de 5 segundos
  useEffect(() => {
    if (!cargando) return;
    const timer = setTimeout(() => {
      setLento(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [cargando]);

  const handleBusqueda = (e) => {
    setPage(0);
    setBusqueda(e.target.value);
  };

  const handleAnterior = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleSiguiente = () => {
    setPage(page + 1);
  };

  // Quitar producto directamente desde el catálogo (Acceso de Administrador)
  const handleEliminarProducto = async (productoId) => {
    try {
      await eliminarProducto(productoId);
      setNotificacion(`✅ Producto #${productoId} eliminado exitosamente de la base de datos.`);
      setTimeout(() => setNotificacion(null), 4000);
      cargarProductos();
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* BANNER PRINCIPAL CON ESTILO OSCURO Y NARANJA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#13141f] via-[#1a1c2e] to-[#13141f] border border-[#232538] rounded-3xl p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -mt-32"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wider">
            <span>⚡ Nueva Temporada</span>
            <span>•</span>
            <span>Envíos a todo el país</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Descubre los mejores productos al{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">
              Mejor Precio
            </span>
          </h1>

          <p className="text-sm sm:text-base text-neutral-300">
            Explora nuestro catálogo con visualización dinámica de imágenes de alta fidelidad, cuotas sin interés y garantía asegurada.
          </p>

          {/* Barra de búsqueda interactiva */}
          <div className="pt-2 max-w-md">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre (ej: manzana, banana, pera)..."
                value={busqueda}
                onChange={handleBusqueda}
                className="w-full pl-10 pr-4 py-3 bg-[#0b0c10]/90 border border-[#232538] focus:border-orange-500 rounded-2xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 shadow-inner transition-all"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DINÁMICA DE ADMINISTRADOR: CUANDO ESTÁ AUTENTICADO */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-orange-950/40 via-[#1e1713] to-orange-950/40 border-2 border-orange-500/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(255,107,0,0.15)] animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-black flex items-center justify-center font-black text-xl shadow-md">
              🛡️
            </div>
            <div>
              <div className="font-extrabold text-white text-sm flex items-center gap-2">
                <span>Modo Administrador Activo</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-500 text-black font-black uppercase">
                  Privilegios BD
                </span>
              </div>
              <p className="text-xs text-orange-200/80">
                Puedes agregar nuevos productos o quitarlos directamente con el botón de cada tarjeta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>➕</span>
              <span>Gestionar en Panel Admin</span>
            </Link>
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN FLOTANTE */}
      {notificacion && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold rounded-xl flex items-center justify-between shadow-lg">
          <span>{notificacion}</span>
          <button onClick={() => setNotificacion(null)} className="text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* LISTA DE PRODUCTOS CON IMÁGENES DINÁMICAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 font-semibold px-1">
          <span>Mostrando productos disponibles en inventario</span>
          {busqueda && (
            <span>
              Filtro activo: "<span className="text-orange-400">{busqueda}</span>"
            </span>
          )}
        </div>

        {cargando ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto"></div>
            {lento ? (
              <p className="text-amber-400 text-sm font-medium max-w-md mx-auto">
                Despertando el servidor, la primera visita puede tardar un minuto…
              </p>
            ) : (
              <p className="text-neutral-400 text-sm font-medium">Cargando productos…</p>
            )}
          </div>
        ) : productos && productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto, index) => (
              <ProductCard
                key={producto.id || producto._id || index}
                producto={producto}
                onEliminar={handleEliminarProducto}
                {...producto}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#13141f] border border-[#232538] rounded-3xl p-12 text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="text-xl font-bold text-white">No se encontraron productos</h3>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              No encontramos coincidencias para "{busqueda}". Prueba con otro término de búsqueda.
            </p>
            <button
              onClick={() => setBusqueda('')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black text-xs font-bold rounded-xl transition-all"
            >
              Restablecer búsqueda
            </button>
          </div>
        )}
      </div>

      {/* PAGINACIÓN */}
      <div className="flex items-center justify-between border-t border-[#232538] pt-6">
        <button
          onClick={handleAnterior}
          disabled={page === 0}
          className="px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl disabled:opacity-40 hover:bg-neutral-800 hover:text-white font-bold text-xs transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <span>←</span>
          <span>Anterior</span>
        </button>

        <span className="text-xs font-bold text-neutral-400 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
          Página <span className="text-orange-400 font-extrabold">{page + 1}</span>
        </span>

        <button
          onClick={handleSiguiente}
          disabled={productos.length < limit}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-black rounded-xl disabled:opacity-40 font-bold text-xs transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-orange-500/20"
        >
          <span>Siguiente</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}