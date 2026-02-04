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
            model: "gemini-pro", // Maximum compatibility
        });

        // Inject system instruction into history for better compatibility across SDK versions
        const systemMessage = {
            role: 'user',
            parts: [{ text: `이 대화에서 당신의 역할과 규칙입니다: ${persona.systemInstruction}` }]
        };
        const systemAcknowledge = {
            role: 'model',
            parts: [{ text: "알겠습니다. 요청하신 페르소나와 규칙에 따라 대화를 진행하겠습니다." }]
        };

        const chat = model.startChat({
            history: [systemMessage, systemAcknowledge, ...(history || [])],
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
        // Debug: Return actual error message to help identify the root cause
        return NextResponse.json({
            error: `서버 에러: ${error.message || '알 수 없는 오류'}`
        }, { status: 500 });
    }
}
