// Application configuration
export const config = {
  // Enable mock mode for Gemini API in development
  mockGemini: typeof window !== "undefined" && import.meta.env.DEV,
};

// Set global mock flag if in development
if (config.mockGemini) {
  (window as any).__MOCK_GEMINI = true;
}