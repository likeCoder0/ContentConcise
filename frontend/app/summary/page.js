"use client";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { urlState } from "../atom/urlatom";
import YouTube from "react-youtube";

async function getSummary(url) {
  try {
    const BACKEND_URL = "http://localhost:5000";
    const res = await fetch(`${BACKEND_URL}/summarize?youtube_video=${url}`);

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching summary:", error);
    return { error: "Error fetching summary" };
  }
}

const SummaryPage = () => {
  const [url, setURL] = useRecoilState(urlState);
  const [videoId, setVideoId] = useState("");
  const [summary, setSummary] = useState("");
  const [translatedSummary, setTranslatedSummary] = useState("");

  const extractVideoId = (url) => {
    const match = url.match(/[?&]v=([^?&]+)/);
    return match && match[1];
  };

  useEffect(() => {
    if (url) {
      const newVideoId = extractVideoId(url);
      setVideoId(newVideoId || "");
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      getSummary(url).then((data) => {
        if (data.error) {
          console.error(data.error);
        } else {
          setSummary(data.summarized_text);
          setTranslatedSummary(data.translated_text);
        }
      });
    }
  }, [url]);

  return (
    <div className=" flex flex-col p-4 sm:p-8">
      <div className="flex-1">
        {videoId && (
          <div>
            <YouTube videoId={videoId} className="  " />
          </div>
        )}
      </div>
      <div className="space-y-4 text-center">
        <h1 className="text-xl sm:text-2xl font-semibold">Summary:</h1>
        <p className="text-sm sm:text-base md:text-lg">{summary}</p>
        <h1 className="text-xl sm:text-2xl font-semibold">
          Translated Summary:
        </h1>
        <p className="text-sm sm:text-base md:text-lg">{translatedSummary}</p>
      </div>
    </div>
  );
};

export default SummaryPage;
