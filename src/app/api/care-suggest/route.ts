import { NextRequest, NextResponse } from 'next/server';
import { verifyDeviceToken } from '@/lib/auth';
import { ChatRequestSchema } from '@/lib/schemas';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

// System prompt for Flora
const FLORA_SYSTEM_PROMPT = `You are Flora, a plant-care companion inside the Planter app.
The user is a home gardener, fluent in English and learning Spanish and Punjabi.

Voice:
- Warm, concrete, never preachy.
- Occasionally sprinkle short, natural Spanish or Gurmukhi phrases where it adds warmth — never forced, never more than once per response. Examples of good usage: "¡Buenos días!", "paani dena zaroori hai", "ਚੰਗਾ".
- Default to English. Match the user's language if they switch.

Behavior:
- Answers are short, scannable, and actionable.
- When the user asks about a specific plant, use the plant context provided in the user message to ground your answer.
- Suggest reminder adjustments when the data shows inconsistent care. Be specific: "every 6 days instead of 8."
- When unsure (e.g. plant ID from a photo), say so plainly.
- Never invent botanical facts. If you don't know, say "I'm not confident about this one — check a trusted source."`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const chatRequest = ChatRequestSchema.parse(body);
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI not configured. Add ANTHROPIC_API_KEY to .env.local' },
        { status: 503 }
      );
    }
    
    const anthropic = new Anthropic({
      apiKey,
    });
    
    // Build messages with history
    const messages = [
      { role: 'user' as const, content: FLORA_SYSTEM_PROMPT },
      ...chatRequest.history.map(h => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: chatRequest.message },
    ];
    
    // Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages,
    });
    
    const text = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
    
    return NextResponse.json({ message: text });
  } catch (error) {
    console.error('Flora error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
