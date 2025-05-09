from facebook_scraper import get_posts
import os
import requests
import logging
import re
from datetime import datetime
from time import sleep

logger = logging.getLogger(__name__)

DOWNLOAD_DIR = "downloads"

def get_facebook_metadata(url):
    if not url:
        logger.error("URL missing in request")
        return {'error': 'URL is required'}, 400

    try:
        # Extract post ID from URL
        post_id_match = re.search(r'posts/(\d+)|/videos/(\d+)|/(\d+)', url)
        if not post_id_match:
            logger.error(f"Invalid Facebook URL: {url}")
            return {'error': 'Invalid Facebook URL format'}, 400
        post_id = post_id_match.group(1) or post_id_match.group(2) or post_id_match.group(3)
        logger.debug(f"Extracted post ID: {post_id}")

        # Fetch post metadata with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                posts = get_posts(post_urls=[url], options={"allow_extra_requests": False})
                post = next(posts, None)
                if not post:
                    logger.error(f"Failed to fetch Facebook post: {url}")
                    return {'error': 'Failed to fetch post (possibly private or unavailable)'}, 400

                if not post.get('video'):
                    logger.error(f"Post is not a video: {url}")
                    return {'error': 'This URL does not point to a video'}, 400

                metadata = {
                    'type': 'Video',
                    'thumbnail': post.get('image') or '',
                    'description': post.get('text') or 'No description available',
                    'download_url': f"/api/facebook/download/{post_id}/video"
                }
                logger.debug(f"Metadata prepared for post ID {post_id}: {metadata}")
                return metadata, 200

            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"Error fetching Facebook metadata for URL {url} after {max_retries} attempts: {str(e)}")
                    return {'error': f'Failed to fetch metadata after multiple attempts: {str(e)}'}, 500
                logger.warning(f"Error on attempt {attempt + 1} for URL {url}: {str(e)}. Retrying...")
                sleep(5)  # Manual delay to avoid rate-limiting

    except Exception as e:
        logger.error(f"Error processing Facebook metadata for URL {url}: {str(e)}")
        return {'error': f'Failed to fetch metadata: {str(e)}'}, 500

def download_facebook_content(post_id):
    try:
        # Fetch the post again to get the video URL with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                posts = get_posts(post_ids=[post_id], options={"allow_extra_requests": False})
                post = next(posts, None)
                if not post or not post.get('video'):
                    logger.error(f"Failed to fetch video for post ID {post_id}")
                    return {'error': 'Video not found'}, 404

                video_url = post['video']
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"facebook_video_{post_id}_{timestamp}.mp4"
                file_path = os.path.join(DOWNLOAD_DIR, filename)

                # Download the video
                response = requests.get(video_url, stream=True)
                if response.status_code != 200:
                    logger.error(f"Failed to download video for post ID {post_id}: Status {response.status_code}")
                    return {'error': 'Failed to download video'}, 500

                with open(file_path, 'wb') as f:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
                logger.debug(f"Downloaded video to {file_path}")

                result = {
                    'file_path': file_path,
                    'filename': filename,
                    'temp_dir': None
                }
                logger.debug(f"Prepared file for download: {filename}")
                return result, 200

            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"Error downloading Facebook content for post ID {post_id} after {max_retries} attempts: {str(e)}")
                    return {'error': f'Failed to download content after multiple attempts: {str(e)}'}, 500
                logger.warning(f"Error on attempt {attempt + 1} for post ID {post_id}: {str(e)}. Retrying...")
                sleep(5)  # Manual delay to avoid rate-limiting

    except Exception as e:
        logger.error(f"Error downloading Facebook content for post ID {post_id}: {str(e)}")
        return {'error': str(e)}, 500