"use client";
import { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { urlState } from "../atom/urlatom";
import { summaryState } from "../atom/summaryatom";
import YouTube from "react-youtube";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { TailSpin } from "react-loader-spinner";
import { Sumana } from "next/font/google"; // Import Sumana font
import remarkGfm from 'remark-gfm';

// Load Sumana font with specific weights and styles
const sumana = Sumana({ subsets: ['latin'], weight: ['400', '700'] });

const SummaryPage = () => {
  const [url, setURL] = useRecoilState(urlState);
  const initialSummaryData = useRecoilValue(summaryState);
  const [videoId, setVideoId] = useState("");
  const [summary, setSummary] = useState([]);
  const [translatedSummary, setTranslatedSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [error, setError] = useState("");

  // Function to extract video ID from the YouTube URL
  const extractVideoId = (url) => {
    const match = url.match(/[?&]v=([^?&]+)/);
    return match ? match[1] : "";
  };

  // Effect to set video ID when URL changes
  useEffect(() => {
    if (url) {
      const newVideoId = extractVideoId(url);
      setVideoId(newVideoId);
    }
  }, [url]);

  // Effect to set summary and translated summary when initialSummaryData changes
  useEffect(() => {
    if (initialSummaryData) {
      setSummary(initialSummaryData.summarized_text ? [initialSummaryData.summarized_text] : []);
      setTranslatedSummary(initialSummaryData.translated_text || "");
    }
  }, [initialSummaryData]);

  // Function to ask a question about the summary
  const askQuestion = async (e) => {
    e.preventDefault();
    setError("");
    setAnswer("");
    const BACKEND_URL = "http://localhost:5000";

    setLoadingAnswer(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/ask`, {
        question,
        context: summary,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setAnswer(response.data.answer);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Join the array into a single string
  const fullContent = summary.join("\n\n");
  const maxCharLength = 300;
  const isLongSummary = fullContent.length > maxCharLength;
  const displayedContent = showFullSummary ? fullContent : `${fullContent.substring(0, maxCharLength)}...`;

  return (
    <div className={`${sumana.className} flex flex-col sm:flex-row justify-between p-4 sm:p-8 space-y-4 sm:space-y-0 sm:space-x-4`}>
      {/* Left Side: YouTube Video */}
      <div className="flex-1 sm:w-1/2">
        {videoId && <YouTube videoId={videoId} className="w-full h-auto" />}

        {/* Q&A Section moved below the summary */}
        <div className="flex-1 sm:w-5/6 mt-8">
          <h2 className="text-xl font-semibold">Ask a Question About the Summary</h2>
          <form onSubmit={askQuestion} className="flex items-center space-x-2 mt-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow p-2 border border-gray-300 rounded-md"
              required
            />
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              Ask
            </button>
          </form>

          {loadingAnswer ? (
            <div className="flex justify-center items-center mt-4">
              <TailSpin color="#00BFFF" height={50} width={50} />
            </div>
          ) : (
            answer && (
              <div className="mt-4 bg-gray-100 p-4 rounded-md text-lg">
                <strong>Answer:</strong>
                <ReactMarkdown>{answer}</ReactMarkdown>
              </div>
            )
          )}
          {error && <div className="mt-4 text-red-500">{error}</div>}
        </div>
      </div>

      {/* Right Side: Summary and Translated Summary Section */}
      <div className="flex-1 sm:w-1/2 space-y-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-center">Summary:</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <TailSpin color="#00BFFF" height={50} width={50} />
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-md text-sm sm:text-base md:text-lg text-justify">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayedContent}</ReactMarkdown>
            {isLongSummary && (
              <button
                onClick={() => setShowFullSummary(!showFullSummary)}
                className="text-blue-500 hover:text-blue-700 mt-2"
              >
                {showFullSummary ? "Read Less" : "Read More"}
              </button>
            )}
          </div>
        )}

        {/* Button to toggle translated summary */}
        <button
          onClick={() => setShowTranslated(!showTranslated)}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          {showTranslated ? "Hide Translated Summary into HINDI" : "Show Translated Summary into HINDI"}
        </button>

        {/* Translated Summary: Visible only when the button is clicked */}
        {showTranslated && (
          <div className="bg-gray-100 p-4 rounded-md text-sm sm:text-base md:text-lg text-justify">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedSummary}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryPage;
