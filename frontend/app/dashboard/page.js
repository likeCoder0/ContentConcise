"use client";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { urlState } from "../atom/urlatom";
import { summaryState } from "../atom/summaryatom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare, VideoIcon, Headphones, Search } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { ProgressBar } from "react-loader-spinner"; // Add a loading spinner or bar (use a suitable package for this)

const tools = [
  {
    label: "Questions and Answers",
    icon: MessageSquare,
    desc: "Efficient learning with smart Q&A for precise information retrieval.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    href: "/dashboard",
  },
  {
    label: "Access YouTube Videos",
    icon: VideoIcon,
    desc: "Direct access to diverse educational content through seamless YouTube integration.",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: "/dashboard",
  },
  {
    label: "Customer Support",
    icon: Headphones,
    desc: "Instant tech support via chatbot, ensuring a smooth learning experience.",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: "/dashboard",
  },
];

const getSummary = async (url) => {
  try {
    const BACKEND_URL = "http://localhost:5000";
    const res = await axios.get(`${BACKEND_URL}/summarize`, {
      params: {
        youtube_video: url,
      },
    });

    const { summarized_text, translated_text } = res.data;
    return { summarized_text, translated_text };
  } catch (error) {
    console.error("Error fetching summary:", error);
    return { error: "Error fetching summary" };
  }
};

export default function DashBoardPage() {
  const [url, setURL] = useRecoilState(urlState);
  const [summaryData, setSummaryData] = useRecoilState(summaryState);
  const [loading, setLoading] = useState(false); // Loading state to manage button and spinner
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true); // Start loading
    const data = await getSummary(url);
    setLoading(false); // Stop loading after fetching summary

    if (data.error) {
      console.error(data.error);
    } else {
      setSummaryData(data);
      router.push("/summary");
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-8 space-y-4 text-center">
        <h1 className="text-2xl sm:text-4xl font-semibold">
          <span className="text-[#333333]">Explore the Power of</span>
          <span className="text-[#FF0204]"> AI.</span>
        </h1>
        <p className="text-muted-foreground font-light text-sm sm:text-base md:text-lg">
          Elevate Your Learning Experience with AI-Driven Conversations and Insights.
        </p>
      </div>

      <div className="flex items-center justify-center mt-4 sm:mt-6 md:mt-10 lg:mt-14 xl:mt-20 w-full">
        <div className="w-full max-w-xl border border-black/20 rounded-md flex">
          <Search className="my-auto ml-2 h-5 w-5 text-gray-400" />
          <Input
            className="flex-1 outline-none border-0 focus:ring-0 rounded-md"
            placeholder="Enter the Youtube video URL..."
            value={url}
            onChange={(e) => setURL(e.target.value)}
            style={{ boxShadow: "none" }}
          />
          <button
            disabled={!url.trim() || loading} // Disable when URL is empty or during loading
            className={`px-4 font-bold ${
              !url.trim() || loading
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#FF0204] text-[#ebe4e4]"
            }`}
            onClick={handleGenerate}
          >
            {loading ? "Generating..." : "Generate"} {/* Show loading text */}
          </button>
        </div>
      </div>

      {/* Display a loading bar when fetching summary */}
      {loading && (
        <div className="mt-4">
          <ProgressBar // You can customize the progress bar or use any spinner library
            height="4"
            width="100%"
            color="#FF0204"
          />
        </div>
      )}

      <div className="space-y-4 flex flex-col items-center mt-8">
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className="p-4 border-black/5 flex items-center w-full max-w-xl justify-between hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <div>
                <div className="font-semibold">{tool.label}</div>
                <p className="text-gray-400 font-light text-sm sm:text-base md:text-sm">
                  {tool.desc}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
