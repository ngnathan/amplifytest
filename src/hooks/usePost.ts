import { useCallback, useEffect, useRef, useState } from 'react';

import { ListPostsQueryVariables, Post } from 'src/API';
import * as subscriptions from 'src/graphql/subscriptions';
import { getPost, listPosts } from 'src/lib/post';
import useGQLSubscription from './useGqlSubscription';
import useAuth from './useAuth';

interface GetPostResponse {
	post: Post | null;
	error: Error | null;
}

interface ListPostsResponse {
	posts: Post[];
	error: Error | null;
	more: boolean;
	showMore: () => void;
}

export const usePost = (postId: string | null): GetPostResponse => {
	const { isAuthenticated } = useAuth();
	const [post, setPost] = useState<Post | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const listCurrentPost = useCallback(
		async (currentPostId: string) => {
			try {
				const currentPost = await getPost(currentPostId, isAuthenticated);
				setPost(currentPost);
			} catch (error: any) {
				if (error && error.errors && error.errors.length > 0) {
					setError(error.errors[0]);
				}
			}
		},
		[isAuthenticated]
	);

	// Initial GraphQL Query for Post By ChannelId
	useEffect(() => {
		if (postId) {
			listCurrentPost(postId);
		}
	}, [postId, listCurrentPost]);

	return {
		post,
		error
	};
};

export const usePosts = (input?: ListPostsQueryVariables): ListPostsResponse => {
	const { isAuthenticated, isLoading: authIsLoading } = useAuth();
	const [isInitialized, setIsInitialized] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [currentLimit, setCurrentLimit] = useState<number | undefined>(input?.limit ?? undefined);
	const more = useRef(true);
	const nextToken = useRef<string | null>(null);

	const showMore = () => {
		if (!input?.limit || !more) return;
		setCurrentLimit((prevState) => (prevState ?? 0) + (input.limit ?? 0));
	};

	const listCurrentPosts = useCallback(async () => {
		try {
			if (isLoading || !more.current || (currentLimit && posts.length >= currentLimit)) return;
			setIsLoading(true);
			const updatedInput: ListPostsQueryVariables = {
				...input,
				nextToken: nextToken.current
			};
			const [updatedPosts, updatedNextToken] = await listPosts(updatedInput, isAuthenticated);
			nextToken.current = updatedNextToken;
			more.current = Boolean(updatedNextToken);
			if (updatedPosts) {
				setPosts((prevState) => (prevState ? [...prevState, ...updatedPosts] : updatedPosts));
			}
			setIsLoading(false);
		} catch (error: any) {
			if (error && error.errors && error.errors.length > 0) {
				setError(error.errors[0]);
			}
			setIsLoading(false);
		}
	}, [input, currentLimit, posts.length, isAuthenticated, isLoading]);

	useEffect(() => {
		if (!authIsLoading && !isInitialized) {
			setIsInitialized(true);
		}
	}, [authIsLoading, isInitialized]);

	useEffect(() => {
		if (isInitialized) {
			listCurrentPosts();
		}
	}, [isInitialized, listCurrentPosts]);

	return {
		posts,
		error,
		more: more.current,
		showMore
	};
};

export const usePostsSubscription = (limit?: number): ListPostsResponse => {
	const { isAuthenticated, isLoading: authIsLoading } = useAuth();
	const [isInitialized, setIsInitialized] = useState(false);
	const [posts, setPosts] = useState<Post[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [currentLimit, setCurrentLimit] = useState<number | undefined>(limit);
	const more = useRef(true);
	const nextToken = useRef<string | null>(null);

	const [postCreated] = useGQLSubscription<Post>({
		config: {
			key: 'onCreatePost',
			query: subscriptions.onCreatePost
		}
	});
	const [postUpdated] = useGQLSubscription<Post>({
		config: {
			key: 'onUpdatePost',
			query: subscriptions.onUpdatePost
		}
	});
	const [postDeleted] = useGQLSubscription<Post>({
		config: {
			key: 'onDeletePost',
			query: subscriptions.onDeletePost
		}
	});

	const showMore = () => {
		if (!limit || !more.current) return;
		setCurrentLimit((prevState) => (prevState ?? 0) + limit);
	};

	const listCurrentPostsByResourceId = useCallback(
		async (refresh?: boolean) => {
			try {
				if (!refresh && (isLoading || !more.current || (currentLimit && posts.length >= currentLimit))) return;
				setIsLoading(true);
				const input: ListPostsQueryVariables = {
					limit,
					nextToken: nextToken.current
				};
				const [updatedPosts, updatedNextToken] = await listPosts(input, isAuthenticated);
				nextToken.current = updatedNextToken;
				more.current = Boolean(updatedNextToken);
				if (updatedPosts) {
					if (refresh) {
						setPosts(updatedPosts);
					} else {
						setPosts((prevState) => (prevState ? [...prevState, ...updatedPosts] : updatedPosts));
					}
				} else if (nextToken.current === null) {
					setPosts([]);
				}
				setIsLoading(false);
			} catch (error: any) {
				if (error && error.errors && error.errors.length > 0) {
					setError(error.errors[0]);
				}
				setIsLoading(false);
			}
		},
		[limit, currentLimit, posts.length, isAuthenticated, isLoading]
	);

	useEffect(() => {
		if (!authIsLoading && !isInitialized) {
			setIsInitialized(true);
		}
	}, [authIsLoading, isInitialized]);

	useEffect(() => {
		if (isInitialized) {
			listCurrentPostsByResourceId();
		}
	}, [isInitialized, listCurrentPostsByResourceId]);

	// Refreshing Posts via GraphQL Subscription to OnCreatePost
	// Sort by mediaStartTime for Annotations
	useEffect(() => {
		if (postCreated && postCreated.id) {
			setPosts((prevPosts) => prevPosts && [postCreated, ...prevPosts]);
		}
	}, [postCreated]);

	// Refreshing Posts via GraphQL Subscription to OnUpdatePost
	useEffect(() => {
		if (postUpdated && postUpdated.id) {
			setPosts((prevPosts) => prevPosts && prevPosts.map((post: Post) => (post && post.id === postUpdated.id ? postUpdated : post)));
		}
	}, [postUpdated]);

	// Refreshing Posts via GraphQL Subscription to OnDeletedPost
	useEffect(() => {
		if (postDeleted && postDeleted.id) {
			listCurrentPostsByResourceId(true);
		}
	}, [postDeleted, listCurrentPostsByResourceId]);

	return {
		posts,
		error,
		more: more.current,
		showMore
	};
};
