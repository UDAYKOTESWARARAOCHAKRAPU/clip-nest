from flask import Blueprint, request, jsonify
from services.youtube import get_youtube_metadata
import logging

youtube_bp = Blueprint('youtube', __name__)
logger = logging.getLogger('clipNest')

@youtube_bp.route('/youtube/metadata', methods=['POST'])
def youtube_metadata():
    try:
        data = request.get_json()
        url = data.get('url')

        if not url:
            return jsonify({'error': 'URL is required'}), 400

        metadata = get_youtube_metadata(url)
        if metadata:
            logger.info(f"Metadata fetched for {url}")
            return jsonify(metadata), 200
        else:
            return jsonify({'error': 'Failed to fetch metadata'}), 500

    except Exception as e:
        logger.error(f"Error fetching metadata for {url}: {str(e)}")
        return jsonify({'error': str(e)}), 500