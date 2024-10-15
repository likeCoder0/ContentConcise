# from langchain_community.llms import Ollama
# from youtube_transcript_api import YouTubeTranscriptApi

# class OllamaModel:
#     _instance = None

#     def __new__(cls, *args, **kwargs):
#         if not cls._instance:
#             cls._instance = super(OllamaModel, cls).__new__(cls)
#             cls._instance.llm = Ollama(model="gemma2")  # Replace with your specific model name if different
#         return cls._instance

# def get_video_summary(youtube_video):
#     # Extract video ID from the URL
#     video_id = youtube_video.split("=")[1]
    
#     try:
#         # Fetch the transcript
#         transcript = YouTubeTranscriptApi.get_transcript(video_id)
#     except Exception as e:
#         return f"Error retrieving transcript: {e}"

#     # Combine transcript segments into a single string
#     result = " ".join([i['text'] for i in transcript])

#     # Chunk the result into manageable parts for summarization
#     num_iters = len(result) // 1000 + 1
#     summarized_text = []
    
#     llm = OllamaModel()._instance.llm  # Get the singleton instance

#     for i in range(num_iters):
#         start = i * 1000
#         end = (i + 1) * 1000
#         input_text = result[start:end]
        
#         # Summarize each chunk using Ollama
#         if input_text.strip():  # Only summarize if there's text
#             try:
#                 summary = llm.invoke(f"Summarize this: {input_text}")
#                 summarized_text.append(summary)
#             except Exception as e:
#                 summarized_text.append(f"Error summarizing chunk: {e}")

#     return summarized_text

# # Example usage:
# youtube_video = "https://www.youtube.com/watch?v=s2skans2dP4"
# result = get_video_summary(youtube_video)
# print(result)

# # Configure the Google Generative AI with the API key
# import os

# from youtube_transcript_api import YouTubeTranscriptApi
# from google.generativeai import configure, GenerativeModel  # Import necessary classes
# print(dir(GenerativeModel))

# # Configure the Google Generative AI with the API key
# configure(api_key=os.getenv('GOOGLE_API_KEY'))  # Replace with your actual API key
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

def get_video_summary(youtube_video, summary_length="1 sentence", chunk_size=1000, max_retries=3, delay_between_retries=5):
    # Extract video ID from the URL
    video_id = youtube_video.split("=")[-1]  # Using -1 to avoid potential errors
    
    try:
        # Fetch the transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
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
