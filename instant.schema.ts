import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    memes: i.entity({
      imageUrl: i.string(),
      createdAt: i.number(),
      upvotes: i.number(),
      authorId: i.string().optional(),
    }),
    upvotes: i.entity({
      memeId: i.string(),
      userId: i.string().optional(),
      createdAt: i.number(),
    }),
  },
  links: {
    memeUpvotes: {
      forward: { on: 'memes', has: 'many', label: 'upvotes' },
      reverse: { on: 'upvotes', has: 'one', label: 'meme' },
    },
  },
  rooms: {},
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export default schema;
export type { AppSchema };
