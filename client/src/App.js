import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Home, Compass, Fish, Book, Users, LogOut, MapPin, Search, CloudSun, Calendar } from 'lucide-react'; // Importar nuevos iconos

// Componente de la Página de Inicio
const HomePage = ({ userId }) => {
  return (
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
};

// Componente de la Página de Búsqueda de Lugares
const FindSpotsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setSearchResults(null); // Limpiar resultados anteriores
    setError(null); // Limpiar errores anteriores
    console.log('Buscando lugares para:', searchTerm);

    const prompt = `Suggest 3 top fishing spots for "${searchTerm}" including the main fish type, ideal weather, and ideal season. Provide the response as a JSON array of objects, each with 'name', 'type', 'idealWeather', and 'idealDate' properties.`;
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
        contents: chatHistory,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        "name": { "type": "STRING" },
                        "type": { "type": "STRING" },
                        "idealWeather": { "type": "STRING" },
                        "idealDate": { "type": "STRING" }
                    },
                    "propertyOrdering": ["name", "type", "idealWeather", "idealDate"]
                }
            }
        }
    };

    const apiKey = ""; // Canvas will automatically provide the API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error! Status: ${response.status}, Details: ${errorText}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(json);
        setSearchResults(parsedJson);
      } else {
        setSearchResults([]); // No results found
        console.warn("Unexpected API response structure or no candidates.");
      }
    } catch (err) {
      console.error("Error calling Gemini API for search:", err);
      setError(err.message || "Failed to fetch search results from AI.");
      setSearchResults([]); // Clear results on error
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
          ) : (
            <>
              <Search className="inline-block mr-2" size={20} /> Buscar
            </>
          )}
        </button>
      </div>

      {/* Resultados de la búsqueda */}
      {isLoading && <p className="text-blue-600 mt-4 text-lg">Buscando los mejores lugares...</p>}
      {error && <p className="text-red-600 mt-4 text-lg font-semibold border border-red-300 bg-red-50 p-3 rounded-md">Error: {error}</p>}
      {searchResults && searchResults.length > 0 && (
        <div className="mt-8 text-left max-w-2xl mx-auto bg-blue-50 p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-blue-800 mb-4">Resultados Encontrados:</h3>
          {searchResults.map((spot, index) => (
            <div key={index} className="mb-4 p-4 border border-blue-200 rounded-lg bg-white shadow-sm">
              <p className="text-lg font-semibold text-gray-900">{spot.name}</p>
              <p className="text-gray-700">Tipo de pesca: {spot.type}</p>
              <p className="text-gray-700">Clima ideal: {spot.idealWeather}</p>
              <p className="text-gray-700">Mejor época: {spot.idealDate}</p>
            </div>
          ))}
        </div>
      )}
      {searchResults && searchResults.length === 0 && !isLoading && !error && (
        <p className="text-red-600 mt-4 text-lg">No se encontraron lugares para tu búsqueda.</p>
      )}

      {/* Contenedor del mapa (Placeholder) */}
      <div className="bg-gray-200 rounded-xl p-8 mt-8 shadow-inner border-2 border-dashed border-gray-400 min-h-[300px] flex items-center justify-center">
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

// Nuevo Componente de la Página de Pronóstico
const ForecastPage = () => {
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [forecastResult, setForecastResult] = useState(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [error, setError] = useState(null);

  const handleGetForecast = async () => {
    setIsLoadingForecast(true);
    setForecastResult(null);
    setError(null); // Limpiar errores anteriores
    console.log(`Obteniendo pronóstico para ${location} el ${date}`);

    const prompt = `Provide a detailed fishing forecast for "${location}" on "${date}". Include weather, wind, fish activity (e.g., Low, Medium, High, Very High), whether conditions are ideal for fishing (boolean), and suggested fish types. Provide the response as a JSON object with 'location', 'date', 'weather', 'wind', 'fishActivity', 'ideal', and 'fishType' properties. If no data, return ideal: false and a message property.`;
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
        contents: chatHistory,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "location": { "type": "STRING" },
                    "date": { "type": "STRING" },
                    "weather": { "type": "STRING" },
                    "wind": { "type": "STRING" },
                    "fishActivity": { "type": "STRING" },
                    "ideal": { "type": "BOOLEAN" },
                    "fishType": { "type": "STRING" },
                    "message": { "type": "STRING" } // For no data found
                },
                "propertyOrdering": ["location", "date", "weather", "wind", "fishActivity", "ideal", "fishType", "message"]
            }
        }
    };

    const apiKey = ""; // Canvas will automatically provide the API key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error! Status: ${response.status}, Details: ${errorText}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const json = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(json);
        setForecastResult(parsedJson);
      } else {
        setForecastResult({ ideal: false, message: "No se pudo obtener el pronóstico de la IA." });
        console.warn("Unexpected API response structure or no candidates.");
      }
    } catch (err) {
      console.error("Error calling Gemini API for forecast:", err);
      setError(err.message || "Failed to fetch forecast from AI.");
      setForecastResult({ ideal: false, message: "Error al cargar el pronóstico." }); // Set error state for UI
    } finally {
      setIsLoadingForecast(false);
    }
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-4xl font-extrabold text-purple-800 mb-6">Pronóstico Detallado de Pesca con IA</h2>
      <p className="text-xl text-gray-700 mb-8">Obtén las mejores predicciones de clima y actividad de peces.</p>

      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Ubicación (Ej: Bariloche)"
          className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <input
          type="date"
          placeholder="Fecha"
          className="p-3 border border-gray-300 rounded-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button
          onClick={handleGetForecast}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out flex items-center justify-center w-full md:w-auto"
          disabled={isLoadingForecast || !location || !date}
        >
          {isLoadingForecast ? (
            <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
          ) : (
            <>
              <CloudSun className="inline-block mr-2" size={20} /> Obtener Pronóstico
            </>
          )}
        </button>
      </div>

      {isLoadingForecast && <p className="text-blue-600 mt-4 text-lg">Obteniendo pronóstico de la IA...</p>}
      {error && <p className="text-red-600 mt-4 text-lg font-semibold border border-red-300 bg-red-50 p-3 rounded-md">Error: {error}</p>}

      {forecastResult && (
        <div className={`mt-8 text-left max-w-2xl mx-auto p-6 rounded-xl shadow-lg 
            ${forecastResult.ideal ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
            {forecastResult.ideal ? (
              <span className="text-green-700">¡Condiciones Ideales para Pescar! 🎉</span>
            ) : (
              <span className="text-red-700">Condiciones no Ideales 🌧️</span>
            )}
          </h3>
          {forecastResult.weather && (
            <>
              <p className="text-lg text-gray-800 mb-2">
                <MapPin className="inline-block mr-2 text-gray-600" size={18} />
                Ubicación: <span className="font-semibold">{forecastResult.location}</span>
              </p>
              <p className="text-lg text-gray-800 mb-2">
                <Calendar className="inline-block mr-2 text-gray-600" size={18} />
                Fecha: <span className="font-semibold">{forecastResult.date}</span>
              </p>
              <p className="text-lg text-gray-800 mb-2">
                <CloudSun className="inline-block mr-2 text-gray-600" size={18} />
                Clima: <span className="font-semibold">{forecastResult.weather}</span>
              </p>
              <p className="text-lg text-gray-800 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-gray-600 lucide lucide-wind"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 1.8L2 22"/><path d="M9.6 4.6A2.5 2.5 0 1 1 7.8 2.8L2 8.5"/><path d="M12.9 6.2A2.5 2.5 0 1 0 14.7 4.4L2 17.7"/></svg>
                Viento: <span className="font-semibold">{forecastResult.wind}</span>
              </p>
              <p className="text-lg text-gray-800 mb-2">
                <Fish className="inline-block mr-2 text-gray-600" size={18} />
                Actividad de Peces: <span className="font-semibold">{forecastResult.fishActivity}</span>
              </p>
              {forecastResult.fishType && (
                <p className="text-lg text-gray-800 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-2 text-gray-600 lucide lucide-fish-reel"><path d="M6 16v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2"/><path d="M18 16a4 4 0 0 0 0-8v2a2 2 0 0 1-2 2h-4"/><path d="M18 8c-.7 1.3-1.8 2-3 2h-2l-3.3-3.9a1 1 0 0 0-.6-.1C4.8 5.7 3.5 5 2 5c.4 2.8.5 4.8 1 6"/><path d="M2 10c.8 1 1.5 2.5 2 5"/><path d="M6 18c.3-1 .6-2.3 1-3.7"/><path d="M12 10v4"/></svg>
                  Tipo(s) de pez sugerido: <span className="font-semibold">{forecastResult.fishType}</span>
                </p>
              )}
            </>
          )}
          {forecastResult.message && (
            <p className="text-lg text-red-600 font-semibold">{forecastResult.message}</p>
          )}
        </div>
      )}
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
          <button
            className={`text-white py-2 px-4 rounded-full transition-colors duration-300 flex items-center ${currentPage === 'forecast' ? 'bg-blue-800 shadow-md' : 'hover:bg-blue-600'}`}
            onClick={() => setCurrentPage('forecast')}
          >
            <CloudSun className="inline-block mr-2" size={20} />
            Pronóstico
          </button>
          {/* Aquí podrías añadir más botones para las otras funcionalidades (Identificación de Especies, Registro de Capturas, Comunidad) */}
        </div>
      </nav>

      {/* Contenido principal de la aplicación */}
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10">
          {/* Renderizado condicional de componentes basado en la página actual */}
          {currentPage === 'home' && <HomePage userId={userId} />}
          {currentPage === 'find-spots' && <FindSpotsPage />}
          {currentPage === 'forecast' && <ForecastPage />}
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
