import { useCallback, useEffect, useRef, useState } from 'react';

import { ListBlogsQueryVariables, Blog } from 'src/API';
import * as subscriptions from 'src/graphql/subscriptions';
import { getBlog, listBlogs } from 'src/lib/blog';
import useGQLSubscription from './useGqlSubscription';
import useAuth from './useAuth';

interface GetBlogResponse {
	blog: Blog | null;
	error: Error | null;
}

interface ListBlogsResponse {
	blogs: Blog[];
	error: Error | null;
	more: boolean;
	showMore: () => void;
}

export const useBlog = (blogId: string | null): GetBlogResponse => {
	const { isAuthenticated } = useAuth();
	const [blog, setBlog] = useState<Blog | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const listCurrentBlog = useCallback(
		async (currentBlogId: string) => {
			try {
				const currentBlog = await getBlog(currentBlogId, isAuthenticated);
				setBlog(currentBlog);
			} catch (error: any) {
				if (error && error.errors && error.errors.length > 0) {
					setError(error.errors[0]);
				}
			}
		},
		[isAuthenticated]
	);

	// Initial GraphQL Query for Blog By ChannelId
	useEffect(() => {
		if (blogId) {
			listCurrentBlog(blogId);
		}
	}, [blogId, listCurrentBlog]);

	return {
		blog,
		error
	};
};

export const useBlogs = (input?: ListBlogsQueryVariables): ListBlogsResponse => {
	const { isAuthenticated, isLoading: authIsLoading } = useAuth();
	const [isInitialized, setIsInitialized] = useState(false);
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [currentLimit, setCurrentLimit] = useState<number | undefined>(input?.limit ?? undefined);
	const more = useRef(true);
	const nextToken = useRef<string | null>(null);

	const showMore = () => {
		if (!input?.limit || !more) return;
		setCurrentLimit((prevState) => (prevState ?? 0) + (input.limit ?? 0));
	};

	const listCurrentBlogs = useCallback(async () => {
		try {
			if (isLoading || !more.current || (currentLimit && blogs.length >= currentLimit)) return;
			setIsLoading(true);
			const updatedInput: ListBlogsQueryVariables = {
				...input,
				nextToken: nextToken.current
			};
			const [updatedBlogs, updatedNextToken] = await listBlogs(updatedInput, isAuthenticated);
			nextToken.current = updatedNextToken;
			more.current = Boolean(updatedNextToken);
			if (updatedBlogs) {
				setBlogs((prevState) => (prevState ? [...prevState, ...updatedBlogs] : updatedBlogs));
			}
			setIsLoading(false);
		} catch (error: any) {
			if (error && error.errors && error.errors.length > 0) {
				setError(error.errors[0]);
			}
			setIsLoading(false);
		}
	}, [input, currentLimit, blogs.length, isAuthenticated, isLoading]);

	useEffect(() => {
		if (!authIsLoading && !isInitialized) {
			setIsInitialized(true);
		}
	}, [authIsLoading, isInitialized]);

	useEffect(() => {
		if (isInitialized) {
			listCurrentBlogs();
		}
	}, [isInitialized, listCurrentBlogs]);

	return {
		blogs,
		error,
		more: more.current,
		showMore
	};
};

export const useBlogsSubscription = (limit?: number): ListBlogsResponse => {
	const { isAuthenticated, isLoading: authIsLoading } = useAuth();
	const [isInitialized, setIsInitialized] = useState(false);
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [currentLimit, setCurrentLimit] = useState<number | undefined>(limit);
	const more = useRef(true);
	const nextToken = useRef<string | null>(null);

	const [blogCreated] = useGQLSubscription<Blog>({
		config: {
			key: 'onCreateBlog',
			query: subscriptions.onCreateBlog
		}
	});
	const [blogUpdated] = useGQLSubscription<Blog>({
		config: {
			key: 'onUpdateBlog',
			query: subscriptions.onUpdateBlog
		}
	});
	const [blogDeleted] = useGQLSubscription<Blog>({
		config: {
			key: 'onDeleteBlog',
			query: subscriptions.onDeleteBlog
		}
	});

	const showMore = () => {
		if (!limit || !more.current) return;
		setCurrentLimit((prevState) => (prevState ?? 0) + limit);
	};

	const listCurrentBlogsByResourceId = useCallback(
		async (refresh?: boolean) => {
			try {
				if (!refresh && (isLoading || !more.current || (currentLimit && blogs.length >= currentLimit))) return;
				setIsLoading(true);
				const input: ListBlogsQueryVariables = {
					limit,
					nextToken: nextToken.current
				};
				const [updatedBlogs, updatedNextToken] = await listBlogs(input, isAuthenticated);
				nextToken.current = updatedNextToken;
				more.current = Boolean(updatedNextToken);
				if (updatedBlogs) {
					if (refresh) {
						setBlogs(updatedBlogs);
					} else {
						setBlogs((prevState) => (prevState ? [...prevState, ...updatedBlogs] : updatedBlogs));
					}
				} else if (nextToken.current === null) {
					setBlogs([]);
				}
				setIsLoading(false);
			} catch (error: any) {
				if (error && error.errors && error.errors.length > 0) {
					setError(error.errors[0]);
				}
				setIsLoading(false);
			}
		},
		[limit, currentLimit, blogs.length, isAuthenticated, isLoading]
	);

	useEffect(() => {
		if (!authIsLoading && !isInitialized) {
			setIsInitialized(true);
		}
	}, [authIsLoading, isInitialized]);

	useEffect(() => {
		if (isInitialized) {
			listCurrentBlogsByResourceId();
		}
	}, [isInitialized, listCurrentBlogsByResourceId]);

	// Refreshing Blogs via GraphQL Subscription to OnCreateBlog
	// Sort by mediaStartTime for Annotations
	useEffect(() => {
		if (blogCreated && blogCreated.id) {
			setBlogs((prevBlogs) => prevBlogs && [blogCreated, ...prevBlogs]);
		}
	}, [blogCreated]);

	// Refreshing Blogs via GraphQL Subscription to OnUpdateBlog
	useEffect(() => {
		if (blogUpdated && blogUpdated.id) {
			setBlogs((prevBlogs) => prevBlogs && prevBlogs.map((blog: Blog) => (blog && blog.id === blogUpdated.id ? blogUpdated : blog)));
		}
	}, [blogUpdated]);

	// Refreshing Blogs via GraphQL Subscription to OnDeletedBlog
	useEffect(() => {
		if (blogDeleted && blogDeleted.id) {
			listCurrentBlogsByResourceId(true);
		}
	}, [blogDeleted, listCurrentBlogsByResourceId]);

	return {
		blogs,
		error,
		more: more.current,
		showMore
	};
};
