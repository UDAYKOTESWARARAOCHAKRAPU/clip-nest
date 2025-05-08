from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import instaloader
import os
import shutil
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

# Initialize instaloader
L = instaloader.Instaloader()

# Directory to store downloaded files temporarily
DOWNLOAD_DIR = "downloads"
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

@app.route('/api/instagram/metadata', methods=['POST'])
def get_metadata():
    data = request.get_json()
    url = data.get('url')
    content_type = data.get('contentType')  # 'Photo' or 'Reel'

    if not url or not content_type:
        return jsonify({'error': 'URL and content type are required'}), 400

    try:
        # Extract shortcode from the URL
        shortcode = url.split('/')[-2] if url.split('/')[-1] == '' else url.split('/')[-1]
        if '?' in shortcode:
            shortcode = shortcode.split('?')[0]

        # Fetch the post
        post = instaloader.Post.from_shortcode(L.context, shortcode)

        # Prepare metadata based on content type
        metadata = {
            'type': content_type,
            'thumbnail': post.url if content_type == 'Photo' else post.video_url,
            'description': post.caption or 'No caption available'
        }

        if content_type == 'Reel':
            metadata['duration'] = str(post.video_duration) + 's' if post.is_video else 'N/A'
            metadata['qualities'] = ['360p', '480p', '720p']  # Simulated qualities for simplicity
            metadata['download_url'] = f"/api/instagram/download/{shortcode}/reel"
        else:
            metadata['download_url'] = f"/api/instagram/download/{shortcode}/photo"

        return jsonify(metadata), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/instagram/download/<shortcode>/<content_type>', methods=['GET'])
def download_content(shortcode, content_type):
    try:
        # Fetch the post
        post = instaloader.Post.from_shortcode(L.context, shortcode)

        # Generate a unique filename using timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        if content_type.lower() == 'reel':
            filename = f"reel_{shortcode}_{timestamp}.mp4"
        else:
            filename = f"photo_{shortcode}_{timestamp}.jpg"

        file_path = os.path.join(DOWNLOAD_DIR, filename)

        # Download the content
        if content_type.lower() == 'reel' and post.is_video:
            L.download_video(post.video_url, file_path)
        else:
            L.download_pic(filename=file_path, url=post.url, mtime=post.date_utc)

        # Send the file to the client
        response = send_file(file_path, as_attachment=True, download_name=filename)

        # Clean up the file after sending
        os.remove(file_path)

        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)