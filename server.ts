import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Core writing rules applied to all generated outputs
const CORE_WRITING_RULES = `
MANDATORY WRITING RULES (STRICTLY ENFORCED ACROSS ALL OUTPUTS):
1. Never use em dashes (—) or en dashes (–) in any generated content. Replace em dashes with a comma, a colon, or rewrite the sentence to avoid them entirely.
2. Write in plain human language. No corporate buzzwords (e.g., "leverage", "seamless", "synergy", "paradigm", "holistic", "game changer", "supercharge"). No filler phrases like "in conclusion", "it is worth noting", "in today's fast-paced world", "let's dive in", or "delve into". No excessive adjectives.
3. Keep sentences short and direct. One idea per sentence.
4. Never start a sentence with "Additionally", "Furthermore", "Moreover", or "In summary".
5. For Twitter threads: write like a developer talking to another developer, casual and direct.
6. For LinkedIn: write confident and professional but not salesy or self-promotional.
7. For Dev.to: write like a technical blog post, practical and example driven.
`;

// Helper to remove any em dashes or en dashes from text (defense-in-depth)
function cleanEmDashes(text: string): string {
  if (!text) return text;
  return text
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*–\s*/g, ', ')
    .replace(/\s*--\s*/g, ', ');
}

function sanitizeGeneratedContent(data: any): any {
  if (!data) return data;
  if (typeof data === 'string') return cleanEmDashes(data);
  if (Array.isArray(data)) return data.map(sanitizeGeneratedContent);
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      cleaned[key] = sanitizeGeneratedContent(data[key]);
    }
    return cleaned;
  }
  return data;
}

// Generation schema for the 3 simultaneous outputs
const generationSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Crisp, descriptive title for this code or project. No em dashes.' },
    summary: { type: Type.STRING, description: '1-2 sentence plain English summary of what this code does. Short direct sentences. No em dashes.' },
    language: { type: Type.STRING, description: 'Detected language or format (e.g. TypeScript, Python, Rust, GitHub README)' },
    twitterThread: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          tweetNumber: { type: Type.INTEGER },
          text: { type: Type.STRING, description: 'Tweet content under 275 characters. Casual and direct, developer to developer. Short sentences. One idea per sentence. No em dashes.' },
        },
        required: ['tweetNumber', 'text'],
      },
      description: 'A cohesive 3 to 5 tweet thread explaining what the code does in simple terms for everyday developers.',
    },
    linkedinPost: {
      type: Type.STRING,
      description: 'A complete LinkedIn post. Confident and professional, not salesy or self-promotional. Short direct sentences. No em dashes. No corporate buzzwords. Clean line breaks and 3-5 hashtags.',
    },
    devtoIntro: {
      type: Type.OBJECT,
      properties: {
        articleTitle: { type: Type.STRING, description: 'Practical and example-driven article headline for Dev.to. No em dashes.' },
        hookParagraph: { type: Type.STRING, description: 'Practical opening hook paragraph addressing a real developer problem. Short direct sentences. No em dashes.' },
        bodyParagraph: { type: Type.STRING, description: 'Example-driven transition paragraph establishing technical context. Short direct sentences. No em dashes.' },
        takeawayBullets: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-4 clear takeaways or section previews. Practical and example driven. No em dashes.'
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: '3-4 lowercase tags without hashtags (e.g. webdev, typescript, architecture)'
        },
        estimatedReadTime: { type: Type.STRING, description: 'e.g. 4 min read' }
      },
      required: ['articleTitle', 'hookParagraph', 'bodyParagraph', 'takeawayBullets', 'tags', 'estimatedReadTime'],
    },
  },
  required: ['title', 'summary', 'language', 'twitterThread', 'linkedinPost', 'devtoIntro'],
};

// Helper to generate content with fallback models in case of high demand / 503
async function generateWithFallback(params: {
  contents: string;
  systemInstruction: string;
  responseSchema?: any;
  temperature?: number;
}) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature ?? 0.7,
          responseMimeType: 'application/json',
          responseSchema: params.responseSchema,
        },
      });

      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${model} attempt failed: ${err.message || err}. Trying next fallback...`);
      // Brief pause before trying fallback
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  throw lastError || new Error('All model attempts failed');
}

// API: Generate all 3 outputs at once
app.post('/api/generate', async (req, res) => {
  try {
    const { code, tone = 'direct', audience = 'developers', customInstructions = '' } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ error: 'Code or README content is required' });
    }

    const systemInstruction = `You are a developer evangelist and technical writer.
Your job is to convert any code snippet or GitHub README into three distinct, high-impact content formats at once:
1. Twitter/X Thread: Break it down tweet by tweet. Keep each tweet strictly under 275 characters.
2. LinkedIn Post: Focus on real-world engineering value, architectural decisions, and clean takeaways. Use clean line breaks for skimmability.
3. Dev.to Article Intro: Headline, hook paragraph, setup context, takeaways, tags, and read time.

${CORE_WRITING_RULES}

ADDITIONAL CONSTRAINTS:
- No generic decorative emojis (such as 🧵, 👇, 🚀, ⚡, 💡, 🧠, 🔥, 🎯). Write purely clean, direct prose with natural language formatting.
- Respect the requested tone: ${tone}.
- Target audience: ${audience}.
${customInstructions ? `Additional context or user instructions: ${customInstructions}` : ''}
`;

    const prompt = `Here is the code snippet / GitHub README:

\`\`\`
${code.trim()}
\`\`\`

Analyze the code and generate all 3 outputs strictly adhering to the mandatory writing rules:
1. Twitter/X Thread (3-5 tweets, each under 275 characters, casual and direct developer voice, no em dashes)
2. LinkedIn Post (confident and professional, not salesy or self-promotional, short direct sentences, no em dashes, 3-5 hashtags)
3. Dev.to Article Intro (practical and example driven, no em dashes, short direct sentences)
`;

    const response = await generateWithFallback({
      contents: prompt,
      systemInstruction,
      responseSchema: generationSchema,
      temperature: 0.7,
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response generated from Gemini');
    }

    const parsed = JSON.parse(text);
    const sanitized = sanitizeGeneratedContent(parsed);
    return res.json(sanitized);
  } catch (error: any) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate content',
    });
  }
});

// API: Regenerate single channel (Twitter, LinkedIn, or Devto)
app.post('/api/regenerate-channel', async (req, res) => {
  try {
    const { channel, code, tone = 'direct', customInstructions = '' } = req.body;

    if (!code || !channel) {
      return res.status(400).json({ error: 'Code and channel are required' });
    }

    let prompt = '';
    let channelSchema: any = null;

    if (channel === 'twitter') {
      channelSchema = {
        type: Type.OBJECT,
        properties: {
          twitterThread: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                tweetNumber: { type: Type.INTEGER },
                text: { type: Type.STRING },
              },
              required: ['tweetNumber', 'text'],
            },
          },
        },
        required: ['twitterThread'],
      };
      prompt = `Generate a fresh Twitter/X thread (3-5 tweets, each under 275 characters). Write like a developer talking to another developer, casual and direct. Short sentences, one idea per sentence. Never use em dashes.
Additional guidance: ${customInstructions || 'Keep it casual and direct.'}

Code:
\`\`\`
${code}
\`\`\``;
    } else if (channel === 'linkedin') {
      channelSchema = {
        type: Type.OBJECT,
        properties: {
          linkedinPost: { type: Type.STRING },
        },
        required: ['linkedinPost'],
      };
      prompt = `Generate a fresh LinkedIn post based on this code. Write confident and professional, but not salesy or self-promotional. Short direct sentences, one idea per sentence. Never use em dashes. Include clean line breaks and 3-5 hashtags.
Additional guidance: ${customInstructions || 'Focus on real engineering trade-offs.'}

Code:
\`\`\`
${code}
\`\`\``;
    } else if (channel === 'devto') {
      channelSchema = {
        type: Type.OBJECT,
        properties: {
          devtoIntro: {
            type: Type.OBJECT,
            properties: {
              articleTitle: { type: Type.STRING },
              hookParagraph: { type: Type.STRING },
              bodyParagraph: { type: Type.STRING },
              takeawayBullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              estimatedReadTime: { type: Type.STRING },
            },
            required: ['articleTitle', 'hookParagraph', 'bodyParagraph', 'takeawayBullets', 'tags', 'estimatedReadTime'],
          },
        },
        required: ['devtoIntro'],
      };
      prompt = `Generate a fresh Dev.to article intro. Write like a technical blog post, practical and example driven. Short direct sentences, one idea per sentence. Never use em dashes. Include headline, hook paragraph, context paragraph, takeaways, tags, and read time.
Additional guidance: ${customInstructions || 'Practical and example driven.'}

Code:
\`\`\`
${code}
\`\`\``;
    } else {
      return res.status(400).json({ error: 'Invalid channel specified' });
    }

    const response = await generateWithFallback({
      contents: prompt,
      systemInstruction: `You are an expert developer advocate.\n${CORE_WRITING_RULES}`,
      responseSchema: channelSchema,
      temperature: 0.8,
    });

    const text = response.text;
    const parsed = JSON.parse(text || '{}');
    const sanitized = sanitizeGeneratedContent(parsed);
    return res.json(sanitized);
  } catch (error: any) {
    console.error('Error regenerating channel:', error);
    return res.status(500).json({ error: error.message || 'Failed to regenerate' });
  }
});

// Helper to parse GitHub repository owner and name from any format
function parseGitHubUrl(inputUrl: string): { owner: string; repo: string } | null {
  let cleaned = inputUrl.trim();

  // Handle git SSH format: git@github.com:owner/repo.git
  const sshMatch = cleaned.match(/^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2].replace(/\.git$/i, '') };
  }

  // Remove protocols and domain prefixes
  cleaned = cleaned
    .replace(/^https?:\/\//i, '')
    .replace(/^(?:www\.)?github\.com\//i, '')
    .replace(/^raw\.githubusercontent\.com\//i, '');

  // Strip query strings or hashes
  cleaned = cleaned.split('?')[0].split('#')[0];

  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length < 2) {
    return null;
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, '');

  if (!owner || !repo) return null;
  return { owner, repo };
}

// API: Fetch GitHub README from a repository URL
app.post('/api/fetch-github', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'GitHub URL is required' });
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return res.status(400).json({
        error: 'Please enter a valid GitHub repository URL (e.g. aftabkh4n/RebelDesk or https://github.com/aftabkh4n/RebelDesk.git)',
      });
    }

    const { owner, repo } = parsed;

    // Strategy 1: GitHub raw HEAD redirect (Fast, no API rate limits, follows default branch)
    const rawHeadUrl = `https://github.com/${owner}/${repo}/raw/HEAD/README.md`;
    try {
      const headRes = await fetch(rawHeadUrl, {
        headers: { 'User-Agent': 'CodeToContent-App' },
        redirect: 'follow',
      });
      if (headRes.ok) {
        const text = await headRes.text();
        if (text && text.trim() && !text.startsWith('<!DOCTYPE html>')) {
          return res.json({ readme: text, repo: `${owner}/${repo}` });
        }
      }
    } catch (e) {
      console.warn('Strategy 1 raw HEAD failed:', e);
    }

    // Strategy 2: raw.githubusercontent.com for common branches and filename variants
    const candidateUrls = [
      `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/main/readme.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/readme.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/main/README`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/README`,
      `https://raw.githubusercontent.com/${owner}/${repo}/main/Readme.md`,
      `https://raw.githubusercontent.com/${owner}/${repo}/master/Readme.md`,
    ];

    for (const candUrl of candidateUrls) {
      try {
        const candRes = await fetch(candUrl, {
          headers: { 'User-Agent': 'CodeToContent-App' },
        });
        if (candRes.ok) {
          const candText = await candRes.text();
          if (candText && candText.trim() && !candText.startsWith('<!DOCTYPE html>')) {
            return res.json({ readme: candText, repo: `${owner}/${repo}` });
          }
        }
      } catch (e) {
        // continue to next candidate
      }
    }

    // Strategy 3: GitHub REST API (handles custom default branch names and filenames)
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    try {
      const apiRes = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'CodeToContent-App',
          'Accept': 'application/vnd.github.raw+json',
        },
      });

      if (apiRes.ok) {
        const readmeText = await apiRes.text();
        if (readmeText && readmeText.trim()) {
          return res.json({ readme: readmeText, repo: `${owner}/${repo}` });
        }
      }
    } catch (e) {
      console.warn('Strategy 3 GitHub API failed:', e);
    }

    return res.status(404).json({
      error: `Could not find a public README for repository "${owner}/${repo}". Please ensure the repository is public or paste the README text directly into the editor.`,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch GitHub README' });
  }
});

// Mount Vite middleware for dev or serve built static files for prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`CodeToContent server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
