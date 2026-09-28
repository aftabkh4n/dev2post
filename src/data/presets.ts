import { SampleSnippet } from '../types';

export const SAMPLE_SNIPPETS: SampleSnippet[] = [
  {
    id: 'use-debounce',
    name: 'React Hook: useDebounce with Cancellation',
    category: 'frontend',
    language: 'TypeScript',
    code: `import { useState, useEffect, useRef } from 'react';

// Custom hook to debounce fast-changing state (e.g. search queries)
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any prior pending timer when value updates
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    // Cleanup on unmount or delay changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delayMs]);

  return debouncedValue;
}`,
  },
  {
    id: 'fastapi-redis-task',
    name: 'FastAPI + Redis Queue with Exponential Backoff',
    category: 'backend',
    language: 'Python',
    code: `from fastapi import FastAPI, BackgroundTasks, HTTPException
import asyncio
import redis.asyncio as aioredis
import logging

app = FastAPI(title="Async Webhook Dispatcher")
redis_client = aioredis.from_url("redis://localhost:6379/0", decode_responses=True)

async def dispatch_webhook_with_retry(payload: dict, max_retries: int = 4):
    """Sends webhook payload with exponential backoff and jitter."""
    attempt = 0
    while attempt < max_retries:
        try:
            # Simulate outbound HTTP POST
            await asyncio.sleep(0.1)
            logging.info(f"Delivered payload {payload['id']} on attempt {attempt + 1}")
            await redis_client.hset(f"job:{payload['id']}", "status", "delivered")
            return
        except Exception as exc:
            attempt += 1
            backoff_secs = (2 ** attempt) + (0.1 * attempt)
            logging.warning(f"Delivery failed for {payload['id']}. Retrying in {backoff_secs}s")
            await asyncio.sleep(backoff_secs)

    await redis_client.hset(f"job:{payload['id']}", "status", "dead_letter")

@app.post("/events")
async def create_event(payload: dict, tasks: BackgroundTasks):
    tasks.add_task(dispatch_webhook_with_retry, payload)
    return {"status": "enqueued", "id": payload.get("id")}`,
  },
  {
    id: 'rust-zero-copy',
    name: 'Rust Zero-Copy Token Stream Parser',
    category: 'systems',
    language: 'Rust',
    code: `/// Zero-copy byte slice parser that tokenizes headers without heap allocations.
pub struct ByteHeaderParser<'a> {
    buffer: &'a [u8],
    cursor: usize,
}

impl<'a> ByteHeaderParser<'a> {
    #[inline(always)]
    pub fn new(buffer: &'a [u8]) -> Self {
        Self { buffer, cursor: 0 }
    }

    /// Returns next key-value tuple referencing the original underlying buffer
    pub fn next_header(&mut self) -> Option<(&'a [u8], &'a [u8])> {
        let remaining = &self.buffer[self.cursor..];
        let colon_pos = remaining.iter().position(|&b| b == b':')?;
        let newline_pos = remaining[colon_pos..].iter().position(|&b| b == b'\\n')?;

        let key = &remaining[..colon_pos];
        let value = &remaining[colon_pos + 1..colon_pos + newline_pos].trim_ascii();

        self.cursor += colon_pos + newline_pos + 1;
        Some((key, value))
    }
}`,
  },
  {
    id: 'readme-microcache',
    name: 'GitHub README: MicroCache (Ultra-Lightweight LRU)',
    category: 'readme',
    language: 'Markdown',
    code: `# MicroCache

An ultra-fast, zero-dependency in-memory LRU cache for Node.js & edge runtimes with TTL expiration and sub-millisecond lookups.

## Why MicroCache?
Most caching libraries ship with dozens of dependencies and heavy lock structures. MicroCache uses an unrolled doubly linked list backed by a standard JavaScript \`Map\`, delivering O(1) operations with virtually zero memory overhead.

- Under 1.2 KB minified & gzipped
- Per-item TTL with automatic lazy eviction
- Atomic mutation guarantees in single-threaded runtimes
- 2.4x faster than typical heavy LRU packages on benchmark runs

## Quickstart

\`\`\`ts
import { MicroCache } from 'microcache';

const cache = new MicroCache<string, UserProfile>({
  maxEntries: 1000,
  defaultTtlMs: 60_000, // 1 minute
});

cache.set('user:42', { name: 'Elena', tier: 'pro' });
const user = cache.get('user:42');
\`\`\`

## Benchmarks
| Operation | MicroCache | Standard LRU |
|-----------|------------|--------------|
| \`get()\`   | 14.8M ops/s | 6.2M ops/s   |
| \`set()\`   | 11.2M ops/s | 4.9M ops/s   |
`,
  },
];
