import instaloader
import os
import re
import logging
from time import sleep
from datetime import datetime
import shutil

# Set up logging
logger = logging.getLogger(__name__)

# Initialize instaloader with rate control (for instaloader>=4.14.0)
L = instaloader.Instaloader(rate_controller=lambda ctx: instaloader.RateController(ctx, sleep=True))

# Optional: Add authentication (uncomment and set credentials if needed)
# L.login(os.getenv('INSTAGRAM_USERNAME'), os.getenv('INSTAGRAM_PASSWORD'))

# Increase request timeout
L.context._session.timeout = 30

# Directory to store downloaded files temporarily
DOWNLOAD_DIR = "downloads"

def get_instagram_metadata(url, content_type):
    if not url or not content_type:
        logger.error("URL or content type missing in request")
        return {'error': 'URL and content type are required'}, 400

    # Improved shortcode extraction
    try:
        shortcode_match = re.search(r'instagram\.com/(?:p|reel)/([A-Za-z0-9_-]+)(?:/|\?|$)', url)
        if not shortcode_match:
            logger.error(f"Invalid Instagram URL: {url}")
            return {'error': 'Invalid Instagram URL format'}, 400
        shortcode = shortcode_match.group(1)
        logger.debug(f"Extracted shortcode: {shortcode}")
    except Exception as e:
        logger.error(f"Error extracting shortcode from URL {url}: {str(e)}")
        return {'error': 'Failed to extract shortcode from URL'}, 400

    # Fetch the post with retry logic and manual rate-limiting
    max_retries = 3
    for attempt in range(max_retries):
        try:
            post = instaloader.Post.from_shortcode(L.context, shortcode)
            logger.debug(f"Successfully fetched post with shortcode: {shortcode}")
            break
        except instaloader.exceptions.ConnectionException as e:
            if attempt == max_retries - 1:
                logger.error(f"Connection error for shortcode {shortcode} after {max_retries} attempts: {str(e)}")
                return {'error': f'Failed to connect to Instagram after multiple attempts. Detailed error: {str(e)}'}, 503
            logger.warning(f"Connection error on attempt {attempt + 1} for shortcode {shortcode}: {str(e)}. Retrying...")
            sleep(10)  # Increased delay to avoid rate-limiting
        except instaloader.exceptions.BadRequestException as e:
            logger.error(f"Bad request for shortcode {shortcode}: {str(e)}")
            return {'error': 'Invalid or inaccessible post (possibly private or deleted)'}, 400
        except Exception as e:
            logger.error(f"Error fetching post with shortcode {shortcode}: {str(e)}")
            return {'error': f'Failed to fetch post: {str(e)}'}, 500
    else:
        logger.error(f"Failed to fetch post with shortcode {shortcode} after {max_retries} attempts")
        return {'error': 'Failed to fetch post after multiple attempts'}, 500

    # Validate content type
    if content_type == 'Reel' and not post.is_video:
        logger.error(f"Content type mismatch: Expected Reel but got Photo for shortcode {shortcode}")
        return {'error': 'This URL points to a Photo, not a Reel. Please select Photo as the content type.'}, 400
    if content_type == 'Photo' and post.is_video:
        logger.error(f"Content type mismatch: Expected Photo but got Reel for shortcode {shortcode}")
        return {'error': 'This URL points to a Reel, not a Photo. Please select Reel as the content type.'}, 400

    # Prepare metadata
    try:
        # Handle carousel posts for photos
        thumbnail_url = post.url
        if content_type == 'Photo' and post.typename == 'GraphSidecar':
            for node in post.get_sidecar_nodes():
                if not node.is_video:
                    thumbnail_url = node.display_url
                    break

        metadata = {
            'type': content_type,
            'thumbnail': thumbnail_url if content_type == 'Photo' else post.video_url,
            'description': post.caption or 'No caption available'
        }

        if content_type == 'Reel':
            metadata['duration'] = str(post.video_duration) + 's' if post.is_video else 'N/A'
            metadata['qualities'] = ['360p', '480p', '720p']
            metadata['download_url'] = f"/api/instagram/download/{shortcode}/reel"
        else:
            metadata['download_url'] = f"/api/instagram/download/{shortcode}/photo"

        logger.debug(f"Metadata prepared for shortcode {shortcode}: {metadata}")
        return metadata, 200
    except Exception as e:
        logger.error(f"Error preparing metadata for shortcode {shortcode}: {str(e)}")
        return {'error': f'Failed to prepare metadata: {str(e)}'}, 500

def download_instagram_content(shortcode, content_type):
    try:
        post = instaloader.Post.from_shortcode(L.context, shortcode)
        logger.debug(f"Successfully fetched post for download with shortcode: {shortcode}")

        # Validate content type
        if content_type.lower() == 'reel' and not post.is_video:
            logger.error(f"Content type mismatch during download: Expected Reel but got Photo for shortcode {shortcode}")
            return {'error': 'This URL points to a Photo, not a Reel.'}, 400
        if content_type.lower() == 'photo' and post.is_video:
            logger.error(f"Content type mismatch during download: Expected Photo but got Reel for shortcode {shortcode}")
            return {'error': 'This URL points to a Reel, not a Photo.'}, 400

        # Generate a unique filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        temp_dir = os.path.join(DOWNLOAD_DIR, shortcode)
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        # Download the post
        L.download_post(post, target=temp_dir)
        logger.debug(f"Downloaded post to {temp_dir}")

        # Handle the download based on content type
        if content_type.lower() == 'reel':
            filename = f"reel_{shortcode}_{timestamp}.mp4"
            file_path = os.path.join(DOWNLOAD_DIR, filename)
            video_files = [f for f in os.listdir(temp_dir) if f.endswith('.mp4')]
            if not video_files:
                logger.error(f"No video file found for shortcode {shortcode}")
                return {'error': 'Video file not found'}, 404
            os.rename(os.path.join(temp_dir, video_files[0]), file_path)
        else:
            filename = f"photo_{shortcode}_{timestamp}.jpg"
            file_path = os.path.join(DOWNLOAD_DIR, filename)
            image_files = [f for f in os.listdir(temp_dir) if f.endswith('.jpg')]
            if not image_files:
                logger.error(f"No image file found for shortcode {shortcode}")
                return {'error': 'Image file not found'}, 404
            os.rename(os.path.join(temp_dir, image_files[0]), file_path)

        # Prepare the file for sending
        result = {
            'file_path': file_path,
            'filename': filename,
            'temp_dir': temp_dir
        }
        logger.debug(f"Prepared file for download: {filename}")
        return result, 200

    except Exception as e:
        logger.error(f"Error downloading content for shortcode {shortcode}: {str(e)}")
        return {'error': str(e)}, 500