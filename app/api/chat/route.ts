import OpenAI from "openai";
import { NextResponse } from 'next/server'

// Initialize OpenAI client with xAI configuration
const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    
    // Make sure we have the API key
    if (!process.env.XAI_API_KEY) {
      throw new Error('API key not configured')
    }

    // Call the xAI API with the message
    const completion = await openai.chat.completions.create({
      model: "grok-beta",
      messages: [
        { 
          role: "system", 
          content: "You are GloGPT, a helpful and knowledgeable AI assistant." 
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    // Extract the assistant's response
    const assistantMessage = completion.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    )
  }
}