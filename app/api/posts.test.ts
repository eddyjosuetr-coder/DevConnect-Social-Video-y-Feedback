import { describe, it, expect } from 'vitest';
import {
  createPostSchema,
  toggleLikeSchema,
  isLikedSchema,
  deletePostSchema,
} from '../contracts/schemas';

describe('createPostSchema', () => {
  it('accepts valid content-only post', () => {
    const result = createPostSchema.parse({ content: 'Hello world' });
    expect(result.content).toBe('Hello world');
    expect(result.code).toBeUndefined();
  });

  it('accepts post with code block', () => {
    const result = createPostSchema.parse({
      content: 'Check this out',
      code: 'const x = 1;',
      codeLanguage: 'typescript',
    });
    expect(result.code).toBe('const x = 1;');
    expect(result.codeLanguage).toBe('typescript');
  });

  it('accepts post with tags', () => {
    const result = createPostSchema.parse({ content: 'Post', tags: 'react,typescript' });
    expect(result.tags).toBe('react,typescript');
  });

  it('rejects empty content', () => {
    expect(() => createPostSchema.parse({ content: '' })).toThrow();
  });

  it('rejects content over 2000 chars', () => {
    expect(() => createPostSchema.parse({ content: 'a'.repeat(2001) })).toThrow();
  });

  it('accepts content of exactly 2000 chars', () => {
    const result = createPostSchema.parse({ content: 'a'.repeat(2000) });
    expect(result.content).toHaveLength(2000);
  });

  it('rejects code over 5000 chars', () => {
    expect(() => createPostSchema.parse({ content: 'valid', code: 'x'.repeat(5001) })).toThrow();
  });

  it('accepts code of exactly 5000 chars', () => {
    const result = createPostSchema.parse({ content: 'valid', code: 'x'.repeat(5000) });
    expect(result.code).toHaveLength(5000);
  });

  it('rejects codeLanguage over 50 chars', () => {
    expect(() => createPostSchema.parse({ content: 'valid', codeLanguage: 'l'.repeat(51) })).toThrow();
  });

  it('rejects tags over 500 chars', () => {
    expect(() => createPostSchema.parse({ content: 'valid', tags: 't'.repeat(501) })).toThrow();
  });

  it('rejects missing content field', () => {
    expect(() => createPostSchema.parse({})).toThrow();
  });
});

describe('toggleLikeSchema', () => {
  it('accepts valid numeric postId', () => {
    expect(toggleLikeSchema.parse({ postId: 1 })).toEqual({ postId: 1 });
  });

  it('accepts postId of zero', () => {
    expect(toggleLikeSchema.parse({ postId: 0 })).toEqual({ postId: 0 });
  });

  it('rejects string postId', () => {
    expect(() => toggleLikeSchema.parse({ postId: 'abc' })).toThrow();
  });

  it('rejects missing postId', () => {
    expect(() => toggleLikeSchema.parse({})).toThrow();
  });
});

describe('isLikedSchema', () => {
  it('accepts valid postId', () => {
    expect(isLikedSchema.parse({ postId: 42 })).toEqual({ postId: 42 });
  });
});

describe('deletePostSchema', () => {
  it('accepts valid postId', () => {
    expect(deletePostSchema.parse({ postId: 99 })).toEqual({ postId: 99 });
  });

  it('rejects non-integer postId', () => {
    expect(() => deletePostSchema.parse({ postId: 1.5 })).toThrow();
  });
});
