import yt_dlp
import os
import logging
import re
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

logger = logging.getLogger('clipNest')

def clean_youtube_url(url):
    """Strip unnecessary query parameters from YouTube URL, keeping only 'v' for watch URLs."""
    parsed_url = urlparse(url)
    query_params = parse_qs(parsed_url.query)
    
    # For youtube.com/watch URLs, keep only 'v' parameter
    if 'youtube.com' in parsed_url.netloc and parsed_url.path == '/watch':
        clean_query = {'v': query_params.get('v', [''])[0]} if 'v' in query_params else {}
    # For youtu.be URLs, remove all query parameters
    else:
        clean_query = {}
    
    clean_url = urlunparse((
        parsed_url.scheme,
        parsed_url.netloc,
        parsed_url.path,
        parsed_url.params,
        urlencode(clean_query, doseq=True),
        parsed_url.fragment
    ))
    return clean_url

def get_youtube_metadata(url):
    try:
        clean_url = clean_youtube_url(url)
        ydl_opts = {
            'noplaylist': True,
            'quiet': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)
            qualities = ['144p', '240p', '360p', '480p', '720p', '1080p']
            return {
                'thumbnail': info.get('thumbnail'),
                'type': info.get('title'),
                'description': info.get('description') or 'No description available',
                'duration': info.get('duration'),
                'qualities': qualities,
                'download_url': f"/api/download?url={clean_url}"
            }
    except Exception as e:
        logger.error(f"YouTube metadata failed for {url}: {str(e)}")
        return None

def download_youtube(url, quality='720p'):
    try:
        # Clean the URL
        clean_url = clean_youtube_url(url)
        
        # Validate URL
        if not re.match(r'^(https:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+|https:\/\/youtu\.be\/[\w-]+)$', clean_url):
            logger.error(f"Invalid YouTube URL after cleaning: {clean_url}")
            raise ValueError(f"Invalid YouTube URL: {clean_url}")

        # Ensure downloads directory exists
        downloads_dir = 'static/downloads'
        os.makedirs(downloads_dir, exist_ok=True)

        # Map quality to yt-dlp format selector
        format_selector = 'bestvideo[height<=720]+bestaudio/best'  # Default to 720p
        if quality == '1080p':
            format_selector = 'bestvideo[height<=1080]+bestaudio/best'
        elif quality in ['144p', '240p', '360p', '480p']:
            format_selector = f'bestvideo[height<={quality[:-1]}]+bestaudio/best'

        ydl_opts = {
            'outtmpl': f'{downloads_dir}/%(title)s.%(ext)s',
            'format': format_selector,
            'noplaylist': True,
            'merge_output_format': 'mp4',
            'ffmpeg_location': 'C:\\ffmpeg\\bin\\ffmpeg.exe',  # Adjust to your FFmpeg path
        }

        logger.info(f"Starting download for {clean_url} with quality {quality}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=True)
            filename = ydl.prepare_filename(info)
            filename = filename.replace('.webm', '.mp4').replace('.mkv', '.mp4')
            if not os.path.exists(filename):
                logger.error(f"Downloaded file not found: {filename}")
                raise FileNotFoundError(f"Downloaded file not found: {filename}")
            logger.info(f"Download completed: {filename}")
            return os.path.basename(filename)

    except yt_dlp.utils.DownloadError as de:
        logger.error(f"YouTube download failed for {url}: DownloadError - {str(de)}")
        raise Exception(f"DownloadError: {str(de)}")
    except yt_dlp.utils.ExtractorError as ee:
        logger.error(f"YouTube download failed for {url}: ExtractorError - {str(ee)}")
        raise Exception(f"ExtractorError: {str(ee)}")
    except FileNotFoundError as fne:
        logger.error(f"YouTube download failed for {url}: FileNotFoundError - {str(fne)}")
        raise Exception(f"FileNotFoundError: {str(fne)}")
    except Exception as e:
        logger.error(f"YouTube download failed for {url}: Unexpected error - {str(e)}")
        raise Exception(f"Unexpected error: {str(e)}")