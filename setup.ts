import { vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('@cloudflare/next-on-pages', () => ({}))
