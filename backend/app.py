from flask import Flask
from flask_cors import CORS
from routes.download import download_bp
from routes.youtube import youtube_bp
import logging
import logging.config
import os

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Load logging configuration
logging.config.fileConfig(os.path.join(os.path.dirname(__file__), 'logging.conf'))
logger = logging.getLogger('clipNest')

# Register blueprints
app.register_blueprint(download_bp, url_prefix='/api')
app.register_blueprint(youtube_bp, url_prefix='/api')

if __name__ == '__main__':
    # Ensure downloads directory exists
    os.makedirs('static/downloads', exist_ok=True)
    app.run(debug=True, host='0.0.0.0', port=5000)