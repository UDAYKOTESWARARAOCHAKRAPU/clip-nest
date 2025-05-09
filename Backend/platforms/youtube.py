import yt_dlp
import os
import logging
import re
from datetime import datetime
from time import sleep

logger = logging.getLogger(__name__)

DOWNLOAD_DIR = "downloads"

def get_youtube_metadata(url):
    if not url:
        logger.error("URL missing in request")
        return {'error': 'URL is required'}, 400

    # Validate and extract video ID from URL (more permissive regex)
    video_id_match = re.search(r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:\?|$)', url)
    if not video_id_match:
        logger.error(f"Invalid YouTube URL: {url}")
        return {'error': 'Invalid YouTube URL format. Please use a URL like https://www.youtube.com/watch?v=<video_id> or https://youtu.be/<video_id>'}, 400
    video_id = video_id_match.group(1)
    logger.debug(f"Extracted video ID: {video_id}")

    # Use the standardized URL format for yt_dlp
    standardized_url = f"https://www.youtube.com/watch?v={video_id}"

    # Fetch metadata with retry logic
    max_retries = 3
    for attempt in range(max_retries):
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'ignoreerrors': False,  # Ensure errors are not ignored
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(standardized_url, download=False)
                if not info:
                    logger.error(f"No metadata found for video ID {video_id}")
                    return {'error': 'Video metadata not found. The video might be unavailable or restricted.'}, 404
                metadata = {
                    'type': 'Video',
                    'thumbnail': info.get('thumbnail') or '',
                    'description': info.get('title') or 'No title available',
                    'duration': info.get('duration'),  # Send raw duration in seconds
                    'qualities': ['360p', '480p', '720p'],
                    'download_url': f"/api/youtube/download/{video_id}/video"
                }
                logger.debug(f"Metadata prepared for video ID {video_id}: {metadata}")
                return metadata, 200

        except yt_dlp.utils.ExtractorError as e:
            if attempt == max_retries - 1:
                logger.error(f"Extractor error for video ID {video_id} after {max_retries} attempts: {str(e)}")
                return {'error': f'Failed to extract video metadata: {str(e)}'}, 500
            logger.warning(f"Extractor error on attempt {attempt + 1} for video ID {video_id}: {str(e)}. Retrying...")
            sleep(5)
        except yt_dlp.utils.DownloadError as e:
            if attempt == max_retries - 1:
                logger.error(f"Download error for video ID {video_id} after {max_retries} attempts: {str(e)}")
                return {'error': f'Video unavailable or restricted: {str(e)}'}, 403
            logger.warning(f"Download error on attempt {attempt + 1} for video ID {video_id}: {str(e)}. Retrying...")
            sleep(5)
        except Exception as e:
            if attempt == max_retries - 1:
                logger.error(f"Error fetching YouTube metadata for URL {url} after {max_retries} attempts: {str(e)}")
                return {'error': f'Failed to fetch metadata after multiple attempts: {str(e)}'}, 500
            logger.warning(f"Error on attempt {attempt + 1} for URL {url}: {str(e)}. Retrying...")
            sleep(5)  # Manual delay to avoid rate-limiting

def download_youtube_content(video_id, quality='720p'):
    try:
        temp_dir = os.path.join(DOWNLOAD_DIR, video_id)
        if not os.path.exists(temp_dir):
            os.makedirs(temp_dir)

        # Map quality to yt-dlp format with fallback
        format_map = {
            '360p': 'bestvideo[height<=360]+bestaudio/best[height<=360]',
            '480p': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
            '720p': 'bestvideo[height<=720]+bestaudio/best[height<=720]'
        }
        selected_format = format_map.get(quality, 'bestvideo[height<=720]+bestaudio/best[height<=720]')

        # Download with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                ydl_opts = {
                    'format': selected_format,
                    'outtmpl': os.path.join(temp_dir, 'video.%(ext)s'),
                    'merge_output_format': 'mp4',
                    'quiet': True,
                    'no_warnings': True,
                    'ignoreerrors': False,
                }

                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
                    logger.debug(f"Downloaded YouTube video to {temp_dir}")

                # Find the downloaded file
                video_files = [f for f in os.listdir(temp_dir) if f.endswith('.mp4')]
                if not video_files:
                    logger.error(f"No video file found for video ID {video_id}")
                    return {'error': 'Video file not found. The video might be unavailable or restricted.'}, 404

                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                filename = f"youtube_video_{video_id}_{timestamp}.mp4"
                file_path = os.path.join(DOWNLOAD_DIR, filename)
                os.rename(os.path.join(temp_dir, video_files[0]), file_path)

                result = {
                    'file_path': file_path,
                    'filename': filename,
                    'temp_dir': temp_dir
                }
                logger.debug(f"Prepared file for download: {filename}")
                return result, 200

            except yt_dlp.utils.DownloadError as e:
                if attempt == max_retries - 1:
                    logger.error(f"Download error for video ID {video_id} after {max_retries} attempts: {str(e)}")
                    return {'error': f'Failed to download video: {str(e)}'}, 500
                logger.warning(f"Download error on attempt {attempt + 1} for video ID {video_id}: {str(e)}. Retrying...")
                sleep(5)
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"Error downloading YouTube content for video ID {video_id} after {max_retries} attempts: {str(e)}")
                    return {'error': f'Failed to download content after multiple attempts: {str(e)}'}, 500
                logger.warning(f"Error on attempt {attempt + 1} for video ID {video_id}: {str(e)}. Retrying...")
                sleep(5)  # Manual delay to avoid rate-limiting

    except Exception as e:
        logger.error(f"Error downloading YouTube content for video ID {video_id}: {str(e)}")
        return {'error': f'Failed to download content: {str(e)}'}, 500