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

        // Use gemini-2.0-flash which was confirmed present in the user's model list
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        });

        // Inject system instruction into history for compatibility
        const systemMessage = {
            role: 'user',
            parts: [{ text: `System Instruction: ${persona.systemInstruction}` }]
        };
        const systemAcknowledge = {
            role: 'model',
            parts: [{ text: "Understood. I will act according to your instructions." }]
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
        return NextResponse.json({
            error: `서버 에러: ${error.message || '알 수 없는 오류'}`
        }, { status: 500 });
    }
}
