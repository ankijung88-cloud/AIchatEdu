# Secure AI Chat PWA

Next.js 기반의 보안 AI 채팅 애플리케이션입니다. Google Gemini API를 사용하며, API 키는 서버 사이드(Next.js API Routes)에 안전하게 보관됩니다.

## 시작하기

1. **의존성 설치**:
   ```bash
   npm install
   ```

2. **환경 변수 설정**:
   `.env.local` 파일을 열고 Gemini API 키를 입력하세요.
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **개발 서버 실행**:
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000`으로 접속하세요.

## 기능
- **보안 프록시**: API 키가 클라이언트에 노출되지 않습니다.
- **페르소나 모드**: 친구, 연인, 비서 등 다양한 AI 성격을 선택할 수 있습니다.
- **글래스모피즘 UI**: 현대적이고 투명한 디자인.
- **PWA 지원**: 모바일 기기에 앱처럼 설치할 수 있습니다.
