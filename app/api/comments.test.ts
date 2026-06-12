import { describe, it, expect } from 'vitest';
import {
  listCommentsSchema,
  createCommentSchema,
  deleteCommentSchema,
} from '../contracts/schemas';

describe('listCommentsSchema', () => {
  it('accepts valid postId', () => {
    expect(listCommentsSchema.parse({ postId: 5 })).toEqual({ postId: 5 });
  });

  it('rejects missing postId', () => {
    expect(() => listCommentsSchema.parse({})).toThrow();
  });

  it('rejects string postId', () => {
    expect(() => listCommentsSchema.parse({ postId: 'five' })).toThrow();
  });
});

describe('createCommentSchema', () => {
  it('accepts valid comment', () => {
    const result = createCommentSchema.parse({ postId: 1, content: 'Great post!' });
    expect(result.content).toBe('Great post!');
    expect(result.postId).toBe(1);
  });

  it('rejects empty content', () => {
    expect(() => createCommentSchema.parse({ postId: 1, content: '' })).toThrow();
  });

  it('rejects content over 1000 chars', () => {
    expect(() => createCommentSchema.parse({ postId: 1, content: 'c'.repeat(1001) })).toThrow();
  });

  it('accepts content of exactly 1000 chars', () => {
    const result = createCommentSchema.parse({ postId: 1, content: 'c'.repeat(1000) });
    expect(result.content).toHaveLength(1000);
  });

  it('rejects missing postId', () => {
    expect(() => createCommentSchema.parse({ content: 'valid comment' })).toThrow();
  });

  it('rejects missing content', () => {
    expect(() => createCommentSchema.parse({ postId: 1 })).toThrow();
  });

  it('rejects both fields missing', () => {
    expect(() => createCommentSchema.parse({})).toThrow();
  });
});

describe('deleteCommentSchema', () => {
  it('accepts valid commentId', () => {
    expect(deleteCommentSchema.parse({ commentId: 10 })).toEqual({ commentId: 10 });
  });

  it('rejects string commentId', () => {
    expect(() => deleteCommentSchema.parse({ commentId: 'ten' })).toThrow();
  });

  it('rejects missing commentId', () => {
    expect(() => deleteCommentSchema.parse({})).toThrow();
  });
});
