from langchain_community.llms import Ollama
from youtube_transcript_api import YouTubeTranscriptApi

class OllamaModel:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(OllamaModel, cls).__new__(cls)
            cls._instance.llm = Ollama(model="llama3.2")  # Replace with your specific model name if different
        return cls._instance

def get_video_summary_local(youtube_video):
    # Extract video ID from the URL
    video_id = youtube_video.split("=")[1]
    
    try:
        # Fetch the transcript
         transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-IN', 'hi', 'ta'])
         
    except Exception as e:
        return f"Error retrieving transcript: {e}"

    # Combine transcript segments into a single string
    result = " ".join([i['text'] for i in transcript])

    # Chunk the result into manageable parts for summarization
    num_iters = len(result) // 1000 + 1
    summarized_text = []
    
    llm = OllamaModel()._instance.llm  # Get the singleton instance

    for i in range(num_iters):
        start = i * 1000
        end = (i + 1) * 1000
        input_text = result[start:end]
        
        # Summarize each chunk using Ollama
        if input_text.strip():  # Only summarize if there's text
            try:
                summary = llm.invoke(f"Summarize this: {input_text}")
                summarized_text.append(summary)
            except Exception as e:
                summarized_text.append(f"Error summarizing chunk: {e}")

    return summarized_text

# # Example usage:
# youtube_video = "https://www.youtube.com/watch?v=s2skans2dP4"
# result = get_video_summary(youtube_video)
# print(result)