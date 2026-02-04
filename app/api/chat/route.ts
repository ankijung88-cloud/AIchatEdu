import { PERSONAS } from '@/lib/personas';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { message, history, mode } = await req.json();

        // Server-side security: Map mode to system instruction
        // Client never sees the systemInstruction
        const persona = PERSONAS[mode] || PERSONAS.friend;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your-api-key-here') {
            return NextResponse.json({ error: '인증 설정 오류: Vercel 환경 변수에 API 키를 등록해주세요.' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", // More stable and widely available version
            systemInstruction: persona.systemInstruction
        });

        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ text });
    } catch (error: any) {
        console.error('Chat API Error:', error);
        // Provide a clearer error message for the user
        const errorMessage = error.message?.includes('API_KEY_INVALID')
            ? '유효하지 않은 API 키입니다.'
            : 'AI 연결에 실패했습니다. (Vercel 로그를 확인해주세요)';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
