from flask import Blueprint, request, jsonify
from services.youtube import download_youtube
from services.instagram import download_instagram
from services.facebook import download_facebook
import logging
import os

download_bp = Blueprint('download', __name__)
logger = logging.getLogger('clipNest')

@download_bp.route('/download', methods=['POST'])
def download_media():
    try:
        data = request.get_json()
        url = data.get('url')
        platform = data.get('platform')
        quality = data.get('quality', '720p')  # Default to 720p

        if not url or not platform:
            return jsonify({'error': 'URL and platform are required'}), 400

        platform = platform.lower()
        filename = None
        if platform == 'youtube':
            filename = download_youtube(url, quality)
        elif platform == 'instagram':
            filename = download_instagram(url)
        elif platform == 'facebook':
            filename = download_facebook(url)
        else:
            return jsonify({'error': 'Unsupported platform'}), 400

        if filename:
            download_url = f"/static/downloads/{filename}"
            logger.info(f"Download successful for {url}: {filename}")
            return jsonify({'download_url': download_url}), 200
        else:
            return jsonify({'error': 'Download failed: No file generated'}), 500

    except Exception as e:
        logger.error(f"Error downloading {url}: {str(e)}")
        return jsonify({'error': str(e)}), 500