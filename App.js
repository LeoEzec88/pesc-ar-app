// App.js
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Home, Compass, Fish, Book, Users, LogOut, MapPin, Search } from 'lucide-react'; // Importar iconos de lucide-react

// Componente de la Página de Inicio
const HomePage = ({ userId }) => (
  <div className="p-6 text-center">
    <h2 className="text-4xl font-extrabold text-blue-800 mb-6">Bienvenido a FishAI</h2>
    <p className="text-xl text-gray-700 mb-8">Tu compañero inteligente para la aventura de pesca.</p>
    {userId && <p className="text-base text-gray-500 mt-2">ID de Usuario: {userId}</p>}
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <FeatureCard icon={<Compass className="w-12 h-12 text-blue-600" />} title="Buscar Lugares" description="Encuentra los mejores puntos de pesca cercanos con predicciones de IA." />
      <FeatureCard icon={<Fish className="w-12 h-12 text-green-600" />} title="Pronóstico de Pesca" description="Predicciones detalladas de actividad de peces, clima y mareas." />
      <FeatureCard icon={<Book className="w-12 h-12 text-yellow-600" />} title="Identificación de Especies" description="Identifica peces con una foto y accede a información clave y regulaciones." />
      <FeatureCard icon={<LogOut className="w-12 h-12 text-red-600 rotate-180" />} title="Registro de Capturas" description="Guarda tus capturas, analiza tus estadísticas y mejora tu estrategia." />
      <FeatureCard icon={<Users className="w-12 h-12 text-purple-600" />} title="Comunidad" description="Conéctate, comparte experiencias y aprende de otros pescadores." />
      <FeatureCard icon={<MapPin className="w-12 h-12 text-teal-600" />} title="Mapas Interactivos" description="Visualiza tus lugares favoritos y descubre nuevas zonas de pesca." />
    </div>
  </div>
);

// Componente de la Página de Búsqueda de Lugares
const FindSpotsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    // Lógica para iniciar la búsqueda de lugares (placeholder)
    console.log('Buscando lugares para:', searchTerm);
    // Aquí se integraría la llamada a la API de mapas y el modelo de IA
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-4xl font-extrabold text-green-800 mb-6">Búsqueda Inteligente de Lugares de Pesca</h2>
      <p className="text-xl text-gray-700 mb-8">Utilizando IA para encontrar tu próximo lugar favorito.</p>

      {/* Barra de búsqueda */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Busca por ubicación o tipo de pez..."
          className="p-3 border border-gray-300 rounded-l-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center"
        >
          <Search className="inline-block mr-2" size={20} /> Buscar
        </button>
      </div>

      {/* Contenedor del mapa (Placeholder) */}
      <div className="bg-gray-200 rounded-xl p-8 mt-8 shadow-inner border-2 border-dashed border-gray-400 min-h-[400px] flex items-center justify-center">
        <p className="text-gray-600 text-lg">
          [Aquí se cargaría el mapa interactivo y se mostrarían los resultados de la búsqueda inteligente con IA.]
          <br />
          <span className="text-sm">Por ejemplo: Google Maps, Mapbox, o una implementación de Three.js para visualizaciones más avanzadas.</span>
        </p>
      </div>

      <button className="mt-10 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition duration-300 ease-in-out text-lg">
        Ver Más Opciones de Lugares
      </button>
    </div>
  );
};

// Componente de Tarjeta de Característica (Reutilizable)
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl shadow-lg p-7 flex flex-col items-center text-center hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 border border-gray-100">
    <div className="mb-5">{icon}</div>
    <h3 className="text-2xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Componente principal de la aplicación FishAI
function App() {
  // Estado para la página actual
  const [currentPage, setCurrentPage] = useState('home');
  // Estados para Firebase
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // Nuevo estado para controlar si Firebase está listo

  // Efecto para inicializar Firebase y autenticar al usuario
  useEffect(() => {
    try {
      // Obtener la configuración de Firebase y el token de autenticación
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
      // Corregido: Usar __initial_auth_token directamente
      const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null; 

      // Inicializar la aplicación Firebase
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const firebaseAuth = getAuth(app);

      setDb(firestore);
      setAuth(firebaseAuth);

      // Escuchar cambios en el estado de autenticación
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        if (user) {
          // Usuario autenticado
          setUserId(user.uid);
        } else {
          // No hay usuario autenticado, intentar con el token personalizado o de forma anónima
          if (initialAuthToken) {
            try {
              await signInWithCustomToken(firebaseAuth, initialAuthToken);
            } catch (error) {
              console.error("Error al iniciar sesión con token personalizado:", error);
              // Si el token personalizado falla, intentar inicio de sesión anónimo
              await signInAnonymously(firebaseAuth);
            }
          } else {
            await signInAnonymously(firebaseAuth); // Iniciar sesión anónimamente si no hay token
          }
        }
        setIsAuthReady(true); // La autenticación inicial ha terminado
      });

      // Limpiar la suscripción al desmontar el componente
      return () => unsubscribe();
    } catch (error) {
      console.error("Error al inicializar Firebase:", error);
      // Aquí podrías mostrar un mensaje de error en la UI si lo deseas
    }
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar

  if (!isAuthReady) {
    // Muestra un indicador de carga mientras Firebase se inicializa
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800">
        <div className="flex flex-col items-center p-8 bg-white rounded-lg shadow-xl">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
          <p className="text-xl font-semibold text-blue-700">Cargando FishAI...</p>
        </div>
        <style>{`
          .loader {
            border-top-color: #3b82f6; /* Tailwind blue-500 */
            -webkit-animation: spinner 1.5s linear infinite;
            animation: spinner 1.5s linear infinite;
          }
          @-webkit-keyframes spinner {
            0% { -webkit-transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); }
          }
          @keyframes spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    // Contenedor principal con estilos de Tailwind CSS para una interfaz responsive y agradable
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 flex flex-col">
      {/* Script para cargar Tailwind CSS */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Configuración de la fuente Inter */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      {/* Meta viewport para asegurar la responsividad en dispositivos móviles */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Barra de navegación superior */}
      <nav className="bg-blue-700 shadow-lg p-4 flex flex-col sm:flex-row justify-between items-center rounded-b-lg">
        <h1 className="text-white text-4xl font-extrabold px-4 mb-4 sm:mb-0">FishAI</h1>
        <div className="flex flex-wrap justify-center sm:justify-start space-x-2 sm:space-x-4">
          <button
            className={`text-white py-2 px-4 rounded-full transition-colors duration-300 flex items-center ${currentPage === 'home' ? 'bg-blue-800 shadow-md' : 'hover:bg-blue-600'}`}
            onClick={() => setCurrentPage('home')}
          >
            <Home className="inline-block mr-2" size={20} />
            Inicio
          </button>
          <button
            className={`text-white py-2 px-4 rounded-full transition-colors duration-300 flex items-center ${currentPage === 'find-spots' ? 'bg-blue-800 shadow-md' : 'hover:bg-blue-600'}`}
            onClick={() => setCurrentPage('find-spots')}
          >
            <Compass className="inline-block mr-2" size={20} />
            Encontrar Lugares
          </button>
          {/* Puedes añadir más botones para otras secciones aquí, siguiendo el mismo patrón */}
          {/* <button
            className={`text-white py-2 px-4 rounded-full transition-colors duration-300 flex items-center ${currentPage === 'forecast' ? 'bg-blue-800 shadow-md' : 'hover:bg-blue-600'}`}
            onClick={() => setCurrentPage('forecast')}
          >
            <Fish className="inline-block mr-2" size={20} />
            Pronóstico
          </button>
          <button
            className={`text-white py-2 px-4 rounded-full transition-colors duration-300 flex items-center ${currentPage === 'identify' ? 'bg-blue-800 shadow-md' : 'hover:bg-blue-600'}`}
            onClick={() => setCurrentPage('identify')}
          >
            <Book className="inline-block mr-2" size={20} />
            Identificar
          </button>
          <button
            className={`text-white py-2 px-4 rounded-full transition-colors duration-300 flex items-center ${currentPage === 'log' ? 'bg-blue-800 shadow-md' : 'hover:bg-blue-600'}`}
            onClick={() => setCurrentPage('log')}
          >
            <LogOut className="inline-block mr-2 rotate-180" size={20} />
            Mis Capturas
          </button>
          <button
            className={`text-white py-2 px-4 rounded-full transition-colors duration-300 flex items-center ${currentPage === 'community' ? 'bg-blue-800 shadow-md' : 'hover:bg-blue-600'}`}
            onClick={() => setCurrentPage('community')}
          >
            <Users className="inline-block mr-2" size={20} />
            Comunidad
          </button> */}
        </div>
      </nav>

      {/* Contenido principal de la aplicación */}
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
          {/* Renderizado condicional de componentes basado en la página actual */}
          {currentPage === 'home' && <HomePage userId={userId} />}
          {currentPage === 'find-spots' && <FindSpotsPage />}
          {/* Puedes añadir más lógica para renderizar otros componentes aquí */}
        </div>
      </main>

      {/* Pie de página (opcional) */}
      <footer className="bg-blue-700 text-white text-center p-4 rounded-t-lg mt-8">
        <p>&copy; {new Date().getFullYear()} FishAI. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
