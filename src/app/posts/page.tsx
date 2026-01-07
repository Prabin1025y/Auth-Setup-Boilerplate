import { Suspense } from "react";
import PostsList from "@/components/posts/PostsLists";
import PostsListSkeleton from "@/components/skeletons/PostsListSkeleton";

export default function PostsPage() {
  return (
    <Suspense fallback={<PostsListSkeleton />}>
      <PostsList />
    </Suspense>
  );
}


