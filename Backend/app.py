from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
# from platforms.instagram import get_instagram_metadata, download_instagram_content
from platforms.facebook import get_facebook_metadata, download_facebook_content
from platforms.youtube import get_youtube_metadata, download_youtube_content

app = Flask(__name__)
CORS(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Ensure downloads directory exists
DOWNLOAD_DIR = "downloads"
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

# Instagram Routes
@app.route('/api/instagram/metadata', methods=['POST'])
def instagram_metadata():
    data = request.get_json()
    url = data.get('url')
    content_type = data.get('contentType')
    metadata, status = get_instagram_metadata(url, content_type)
    return jsonify(metadata), status

@app.route('/api/instagram/download/<shortcode>/<content_type>', methods=['GET'])
def instagram_download(shortcode, content_type):
    result, status = download_instagram_content(shortcode, content_type)
    if status != 200:
        return jsonify(result), status

    # Send the file
    response = send_file(result['file_path'], as_attachment=True, download_name=result['filename'])
    logger.debug(f"File sent for download: {result['filename']}")

    # Clean up
    if result.get('temp_dir'):
        os.remove(result['file_path'])
        os.rmdir(result['temp_dir'])
        logger.debug(f"Cleaned up files: {result['temp_dir']}, {result['file_path']}")
    return response

# Facebook Routes
@app.route('/api/facebook/metadata', methods=['POST'])
def facebook_metadata():
    data = request.get_json()
    url = data.get('url')
    metadata, status = get_facebook_metadata(url)
    return jsonify(metadata), status

@app.route('/api/facebook/download/<post_id>/<content_type>', methods=['GET'])
def facebook_download(post_id, content_type):
    if content_type.lower() != 'video':
        return jsonify({'error': 'Only video downloads are supported for Facebook'}), 400

    result, status = download_facebook_content(post_id)
    if status != 200:
        return jsonify(result), status

    # Send the file
    response = send_file(result['file_path'], as_attachment=True, download_name=result['filename'])
    logger.debug(f"File sent for download: {result['filename']}")

    # Clean up
    os.remove(result['file_path'])
    logger.debug(f"Cleaned up file: {result['file_path']}")
    return response

# YouTube Routes
@app.route('/api/youtube/metadata', methods=['POST'])
def youtube_metadata():
    data = request.get_json()
    url = data.get('url')
    metadata, status = get_youtube_metadata(url)
    return jsonify(metadata), status

@app.route('/api/youtube/download/<video_id>/<content_type>', methods=['GET'])
def youtube_download(video_id, content_type):
    if content_type.lower() != 'video':
        return jsonify({'error': 'Only video downloads are supported for YouTube'}), 400

    quality = request.args.get('quality', '720p')
    result, status = download_youtube_content(video_id, quality)
    if status != 200:
        return jsonify(result), status

    # Send the file
    response = send_file(result['file_path'], as_attachment=True, download_name=result['filename'])
    logger.debug(f"File sent for download: {result['filename']}")

    # Clean up
    os.remove(result['file_path'])
    os.rmdir(result['temp_dir'])
    logger.debug(f"Cleaned up files: {result['temp_dir']}, {result['file_path']}")
    return response

@app.route('/api/health', methods=['GET'])
def health_check():
    logger.debug("Health check endpoint called")
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)