import os
import time
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi

import google.generativeai as genai

# Load environment variables from the .env file
load_dotenv()

# Configure the API key for Google Generative AI
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

class GenerativeAIModel:
    _instance = None

    def __new__(cls):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance.model = genai.GenerativeModel("gemini-1.5-flash")
        return cls._instance

def get_video_summary(youtube_video, summary_length="10 sentence", chunk_size=1000, max_retries=60, delay_between_retries=5):
    # Extract video ID from the URL
    video_id = youtube_video.split("=")[-1]  # Using -1 to avoid potential errors
    
    try:
        # Fetch the transcript
         transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-IN', 'hi', 'ta'])
         
    except Exception as e:
        return f"Error retrieving transcript: {e}"

    # Combine transcript segments into a single string
    result = " ".join(segment['text'] for segment in transcript)

    # Chunk the result into manageable parts for summarization
    summarized_text = []
    model = GenerativeAIModel()._instance.model  # Get the singleton instance

    # Process each chunk
    for i in range(0, len(result), chunk_size):
        input_text = result[i:i + chunk_size].strip()
        
        if len(input_text) > 0:  # Only summarize if there's text
            retries = 0
            while retries < max_retries:
                try:
                    if len(input_text) > 100:  # Only summarize if text is long
                        response = model.generate_content(f"Summarize this in {summary_length}: {input_text}")
                        summarized_text.append(response.text)
                    else:
                        summarized_text.append(input_text)  # Add original if short
                    break  # Exit retry loop if successful
                except Exception as e:
                    if "429" in str(e):  # If it's a rate-limiting error
                        retries += 1
                        time.sleep(delay_between_retries)  # Wait before retrying
                    else:
                        summarized_text.append(f"Error summarizing chunk: {e}")
                        break
                    
    return summarized_text

# Example usage:
# youtube_video = "https://www.youtube.com/watch?v=tNrNLoCqzco"
# result = get_video_summary(youtube_video)
# print(result)
