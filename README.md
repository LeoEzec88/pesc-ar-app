# API de Lugares de Pesca con IA en Argentina

Esta es una API backend construida con Flask y Python que utiliza el modelo Gemini 2.0 Flash para responder consultas sobre lugares de pesca **específicamente enfocados en Argentina**. Está diseñada para ser desplegada fácilmente en DigitalOcean App Platform.

## Contenido

- `app.py`: El código principal de la aplicación Flask.
- `requirements.txt`: Lista de dependencias de Python.
- `app.yaml`: Archivo de configuración para DigitalOcean App Platform.
- `.python-version`: Especifica la versión de Python a utilizar en el despliegue.
- `Procfile`: Define el comando de inicio para el servicio web.
- `README.md`: Este archivo.

## Requisitos

- Una cuenta de DigitalOcean.
- Un repositorio de GitHub.
- Python 3.x instalado localmente (para pruebas).
- `pip` (gestor de paquetes de Python).

## Configuración Local (Opcional, para pruebas)

1.  **Clonar el Repositorio:**
    ```bash
    git clone <URL_DE_TU_REPOSITORIO_GITHUB>
    cd tu-proyecto-api-pesca
    ```

2.  **Crear un Entorno Virtual (Recomendado):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # En Linux/macOS
    # o
    .\venv\Scripts\activate   # En Windows
    ```

3.  **Instalar Dependencias:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Ejecutar la Aplicación Flask (para desarrollo local):**
    ```bash
    python app.py
    ```
    La API estará disponible en `http://127.0.0.1:8080/api/query`.

5.  **Probar la API Localmente (Ejemplo con `curl`):**
    Abre otra terminal y ejecuta:
    ```bash
    curl -X POST -H "Content-Type: application/json" \
         -d '{"query": "¿Cuáles son los mejores lugares para pescar truchas en la Patagonia Argentina?"}' \
         [http://127.0.0.1:8080/api/query](http://127.0.0.1:8080/api/query)
    ```
    Deberías ver una respuesta de la IA.

## Despliegue en DigitalOcean App Platform

1.  **Crea un Repositorio en GitHub:**
    Si aún no lo has hecho, crea un nuevo repositorio en GitHub (por ejemplo, `fishing-api`).

2.  **Sube tus Archivos a GitHub:**
    Asegúrate de que `app.py`, `requirements.txt`, `app.yaml`, `.python-version` y el nuevo **`Procfile`** estén en la raíz de tu repositorio de GitHub.

    **Acciones Importantes:**
    * **Elimina el archivo `runtime.txt`** de tu repositorio si existe.

    ```bash
    git add .
    git commit -m "Actualización: Reintroducido Procfile y eliminado start_command de app.yaml"
    git push origin main # o master, dependiendo de tu rama principal
    ```

3.  **Crea una Nueva Aplicación en DigitalOcean:**
    * Inicia sesión en tu cuenta de DigitalOcean.
    * Ve a "Apps" en el menú de la izquierda.
    * Haz clic en "Create App".

4.  **Conecta tu Repositorio de GitHub:**
    * Selecciona GitHub como tu fuente.
    * Autoriza a DigitalOcean para acceder a tus repositorios si aún no lo has hecho.
    * Elige el repositorio que acabas de subir (e.g., `fishing-api`).
    * Selecciona la rama que deseas desplegar (normalmente `main` o `master`).

5.  **Configura el Recurso (Web Service):**
    * DigitalOcean debería detectar automáticamente que es una aplicación Python.
    * **HTTP Port:** Asegúrate de que el puerto HTTP esté configurado en `8080`. Este es el puerto que tu aplicación Flask está escuchando.
    * **Build Command:** Si no se detecta automáticamente, puedes especificarlo (generalmente no es necesario para Python estándar): `pip install -r requirements.txt`
    * **Run Command:** Este campo **NO DEBE CONFIGURARSE** en la interfaz de usuario de DigitalOcean. El `Procfile` se encargará de definir el comando de inicio.
        * **Nota:** Asegúrate de que `gunicorn` y `gevent` estén incluidos en tu `requirements.txt`.
    * **Environment Variables:** No necesitas configurar `API_KEY` aquí, ya que el entorno de Canvas lo maneja automáticamente. Sin embargo, si tuvieras otras variables de entorno (como una URL de base de datos), las añadirías aquí.

6.  **Revisa y Despliega:**
    * Revisa la configuración.
    * Haz clic en "Next" y luego en "Deploy App".

7.  **Accede a tu API:**
    Una vez que el despliegue sea exitoso, DigitalOcean te proporcionará una URL para tu aplicación (por ejemplo, `https://your-app-name.ondigitalocean.app`). Tu endpoint de API estará en `https://your-app-name.ondigitalocean.app/api/query`.

## Uso de la API

Realiza una solicitud POST a tu endpoint de API con un cuerpo JSON que contenga una clave `query`.

**Ejemplo de Solicitud (usando JavaScript en tu frontend):**

```javascript
async function getFishingAdvice(userQuery) {
    const apiUrl = "[https://your-app-name.ondigitalocean.app/api/query](https://your-app-name.ondigitalocean.app/api/query)"; // ¡Reemplaza con tu URL real!

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userQuery }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data.response); // La respuesta de la IA
        return data.response;
    } catch (error) {
        console.error("Error al obtener el consejo de pesca:", error);
        return "Lo siento, no pude obtener una respuesta en este momento.";
    }
}

// Ejemplo de cómo llamarlo
// getFishingAdvice("¿Qué equipo necesito para pescar Pejerrey en Buenos Aires?");
