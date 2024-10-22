from flask import Flask, request, jsonify
from model import get_video_summary
from model_with_local import get_video_summary_local
from googletrans import Translator
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()  # Load environment variables
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))  # Configure the API key for Google Generative AI

app = Flask(__name__)
CORS(app)

def translate_to_hindi(text):
    if not text:  # Check if the text is empty or None
        return "No text to translate."

    translator = Translator()
    try:
        # Assuming `text` is a string, so no need to join a list
        translated_text = translator.translate(text, src='en', dest='hi').text
        print(text)
        return translated_text
    except Exception as e:
        print(f"Error translating to Hindi: {e}")
        return "Translation failed"

@app.route('/')
def home():
    return "Hello world"

@app.route('/summarize', methods=['GET'])
def summarize():
    youtube_video = request.args.get('youtube_video', default=None)

    if youtube_video:
        result = get_video_summary(youtube_video)
        # result = get_video_summary_local(youtube_video)
        
        if not result:  # Check if result is an empty list
            return jsonify({'error': 'Failed to summarize the video or no transcript available.'})

        translated_result = translate_to_hindi(result)
        response_data = {
            'summarized_text': result,
            'translated_text': translated_result
        }

        response = jsonify(response_data)
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
    else:
        return jsonify({'error': 'Please provide a YouTube video URL as a query parameter.'})

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    question = data.get('question')
    context = data.get('context')

    if not question or not context:
        return jsonify({'error': 'Question and context are required.'}), 400

    try:
        # Initialize the Gemini model
        model = genai.GenerativeModel("gemini-1.5-flash")
        # Generate a response based on the question and context
        response = model.generate_content(f"Answer the following question (1 SENTENCES) based on the context: {question}\nContext: {context}")
        
        # Extract the answer text
        answer_text = response.text
        return jsonify({'answer': answer_text})
    except Exception as e:
        print(f"Error generating answer: {e}")
        return jsonify({'error': 'Failed to generate an answer.'}), 500

if __name__ == '__main__':
    app.run(debug=True)

# .\venv\Scripts\activate 
# python app.py