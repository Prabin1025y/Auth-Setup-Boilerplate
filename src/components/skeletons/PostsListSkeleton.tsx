
function PostsListSkeleton() {
    return (
        <div className="w-full max-w-7xl mx-auto p-5 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="h-8 w-40 bg-muted rounded animate-pulse" />
                <div className="h-10 w-24 bg-muted rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[ ...Array(6) ].map((_, i) => (
                    <div key={i} className="border rounded-xl overflow-hidden animate-pulse">
                        <div className="w-full aspect-[4/3] bg-muted" />
                        <div className="p-3 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default PostsListSkeleton