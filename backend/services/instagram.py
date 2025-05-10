import instaloader
import os
import logging
import re

logger = logging.getLogger('clipNest')

def download_instagram(url):
    try:
        L = instaloader.Instaloader(download_videos=True, download_pictures=True)
        shortcode = re.search(r'instagram\.com/(?:p|reel)/([A-Za-z0-9_-]+)', url)
        if not shortcode:
            raise ValueError("Invalid Instagram URL")
        
        post = instaloader.Post.from_shortcode(L.context, shortcode.group(1))
        filename = f"static/downloads/{post.owner_username}_{post.shortcode}.mp4" if post.is_video else f"static/downloads/{post.owner_username}_{post.shortcode}.jpg"
        L.download_post(post, target='static/downloads')
        
        # Return the basename of the downloaded file
        return os.path.basename(filename)
    except Exception as e:
        logger.error(f"Instagram download failed for {url}: {str(e)}")
        return None