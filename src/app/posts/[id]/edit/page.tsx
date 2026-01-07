"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";

function EditPostContent() {
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [ caption, setCaption ] = useState("");
    const [ image, setImage ] = useState<File | null>(null);
    const [ imagePreview, setImagePreview ] = useState<string | null>(null);
    const [ existingImageUrl, setExistingImageUrl ] = useState<string | null>(null);
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isFetching, setIsFetching ] = useState(true);
    const [ error, setError ] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`/api/posts/${postId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch post");
                }
                const post = await response.json();
                setCaption(post.caption);
                setExistingImageUrl(post.imageUrl);
                setImagePreview(post.imageUrl);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load post");
            } finally {
                setIsFetching(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [ postId ]);

    const handleImageSelect = useCallback((file: File | null) => {
        if (!file) {
            setImage(null);
            setImagePreview(existingImageUrl);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError("Image size must be less than 10MB");
            return;
        }

        setImage(file);
        setError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, [ existingImageUrl ]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[ 0 ] || null;
        handleImageSelect(file);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer.files[ 0 ] || null;
            handleImageSelect(file);
        },
        [ handleImageSelect ]
    );

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(existingImageUrl);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!caption.trim()) {
            setError("Please enter a caption");
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append("caption", caption.trim());
            if (image) {
                formData.append("image", image);
            }

            const res = await fetch(`/api/posts?id=${postId}`, {
                method: "PUT",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to update post");
            }

            // Success - redirect to post detail page
            router.push(`/posts/${postId}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update post");
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="w-full max-w-2xl mx-auto p-5 py-8">
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-5 py-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Edit Post</CardTitle>
                    <CardDescription>
                        Update your post caption or change the image.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload Section */}
                        <Field>
                            <FieldLabel>Image</FieldLabel>
                            <FieldContent>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="image-upload"
                                />

                                {imagePreview ? (
                                    <div className="relative group">
                                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                            aria-label="Remove image"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-2 right-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Change Image
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="rounded-full bg-muted p-4">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG, GIF up to 10MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {image && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Selected: {image.name}
                                    </p>
                                )}
                            </FieldContent>
                        </Field>

                        {/* Caption Input */}
                        <Field>
                            <FieldLabel htmlFor="caption">Caption</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="caption"
                                    type="text"
                                    placeholder="Write a caption for your post..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    disabled={isLoading}
                                    maxLength={500}
                                    className="w-full"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {caption.length}/500 characters
                                </p>
                            </FieldContent>
                        </Field>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg bg-destructive/10 border border-destructive/50 p-3">
                                <p className="text-sm text-destructive font-medium">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || !caption.trim()}
                                className="flex-1"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Update Post
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function EditPostPage() {
    return (
        <Suspense fallback={
            <div className="w-full max-w-2xl mx-auto p-5 py-8">
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </CardContent>
                </Card>
            </div>
        }>
            <EditPostContent />
        </Suspense>
    );
}