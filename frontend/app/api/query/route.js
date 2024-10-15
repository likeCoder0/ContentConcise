// import { auth } from "@clerk/nextjs"; // Uncomment and import if needed
// import { NextResponse } from "next/server";
// import { Configuration, OpenAIApi } from "openai";


// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(configuration);

// const instructionMessage = {
//   role: "system",
//   content:
//     "You are a query answering bot based on the query received from user. The user will give you query based on the summarize text from youotube video.You just have to answer it in simple and easy terms and in short",
// };

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { messages } = body;

//     // if (!userId) {
//     //   return new NextResponse("Unauthorized user", { status: 401 });
//     // }

//     if (!configuration.apiKey) {
//       return new NextResponse("OpenAi API key not configured", { status: 500 });
//     }

//     if (!messages) {
//       return new NextResponse("Messages are required", { status: 400 });
//     }

//     const response = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [instructionMessage, ...messages],
//     });

//     return NextResponse.json(response.data.choices[0].message);
//   } catch (error) {
//     console.log("[CONVERSATION_ERROR]", error);
//     return new NextResponse("Internal error", { status: 500 });
//   }
// }

// // Uncomment and import if needed
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI({
  apiKey: process.env.GEMINI_SECRET_KEY,
});

const instructionMessage = {
  role: "system",
  content:
    "You are a query answering bot based on the query received from user. The user will give you a query based on the summarized text from a YouTube video. You just have to answer it in simple and easy terms, and keep it short.",
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized user", { status: 401 });
    }

    if (!process.env.GEMINI_SECRET_KEY) {
      return new NextResponse("Google Generative AI API key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messages are required", { status: 400 });
    }

    const prompt = messages.map(msg => msg.content).join(" ");

    // Request a response from the Gemini-1.5-Flash model
    const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      prompt,
      maxTokens: 200,
    });

    return NextResponse.json(result.response.text());
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
