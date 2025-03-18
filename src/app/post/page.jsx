import { getPosts } from 'src/actions/blog-ssr';

import { PostListHomeView } from 'src/sections/blog/view';

export default async function Page() {
  const { posts } = await getPosts();

  return <PostListHomeView posts={posts} />;
}
