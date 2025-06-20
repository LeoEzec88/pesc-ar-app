# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS # Importa Flask-CORS para manejar solicitudes de origen cruzado
import os
import json

# Inicializa la aplicación Flask
app = Flask(__name__)
# Habilita CORS para permitir solicitudes desde tu frontend (ajusta según sea necesario para la seguridad en producción)
CORS(app)

# Variable global para simular la configuración de Firebase
# En un entorno real de Canvas, __app_id y __firebase_config se inyectarían automáticamente.
# Para pruebas locales, proporcionamos valores predeterminados.
app_id = os.environ.get('__APP_ID', 'default-app-id')
firebase_config_str = os.environ.get('__FIREBASE_CONFIG', '{}')
firebase_config = json.loads(firebase_config_str)

@app.route('/')
def health_check():
    """
    Endpoint de verificación de estado.
    Útil para comprobar si la aplicación está funcionando.
    """
    return jsonify({"status": "healthy", "message": "API de pesca con IA está funcionando!"})

@app.route('/api/query', methods=['POST'])
def handle_query():
    """
    Endpoint principal para recibir consultas y responder con IA.
    """
    try:
        # Obtener los datos JSON de la solicitud
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({"error": "Falta el parámetro 'query' en el cuerpo de la solicitud JSON."}), 400

        user_query = data['query']
        print(f"Consulta recibida: {user_query}")

        # ** Lógica para llamar al modelo de IA (Gemini 2.0 Flash) **
        # La clave API se manejará automáticamente en el entorno de Canvas.
        # Para pruebas locales, si necesitas una clave, la configurarías aquí
        # o como una variable de entorno.
        api_key = os.environ.get('GEMINI_API_KEY', "") # La clave API será inyectada por Canvas

        # Construir el payload para la API de Gemini
        chat_history = []
        chat_history.append({"role": "user", "parts": [{"text": user_query}]})

        payload = {
            "contents": chat_history,
            "generationConfig": {
                "responseMimeType": "text/plain" # Puedes ajustar esto si esperas JSON de la IA
            }
        }

        # URL de la API de Gemini para gemini-2.0-flash
        api_url = f"[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=){api_key}"

        # Realizar la llamada a la API de Gemini
        # En un entorno de servidor como Flask, usamos requests en lugar de fetch
        import requests
        response = requests.post(api_url, json=payload)
        response.raise_for_status() # Lanza una excepción para códigos de estado de error (4xx o 5xx)

        result = response.json()

        # Extraer la respuesta del modelo
        ai_response_text = "No se pudo obtener una respuesta de la IA."
        if result and result.get('candidates') and len(result['candidates']) > 0 and \
           result['candidates'][0].get('content') and result['candidates'][0]['content'].get('parts') and \
           len(result['candidates'][0]['content']['parts']) > 0:
            ai_response_text = result['candidates'][0]['content']['parts'][0]['text']
        else:
            print(f"Estructura de respuesta inesperada de Gemini: {result}")

        # Devolver la respuesta de la IA
        return jsonify({"response": ai_response_text})

    except requests.exceptions.RequestException as e:
        # Manejo de errores de red o de la API de Gemini
        print(f"Error al llamar a la API de Gemini: {e}")
        return jsonify({"error": f"Error en el servicio de IA: {str(e)}"}), 500
    except Exception as e:
        # Manejo de cualquier otro error inesperado
        print(f"Error inesperado: {e}")
        return jsonify({"error": f"Un error inesperado ocurrió: {str(e)}"}), 500

# Punto de entrada para la aplicación Flask
if __name__ == '__main__':
    # DigitalOcean App Platform usará Gunicorn, pero esto es para pruebas locales.
    # Escucha en el puerto 8080 como lo espera DigitalOcean App Platform por defecto.
    app.run(host='0.0.0.0', port=8080)
