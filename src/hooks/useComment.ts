import { useCallback, useEffect, useRef, useState } from 'react';

import { ListCommentsQueryVariables, Comment } from 'src/API';
import * as subscriptions from 'src/graphql/subscriptions';
import { getComment, listComments } from 'src/lib/comment';
import useGQLSubscription from './useGqlSubscription';
import useAuth from './useAuth';

interface GetCommentResponse {
	comment: Comment | null;
	error: Error | null;
}

interface ListCommentsResponse {
	comments: Comment[];
	error: Error | null;
	more: boolean;
	showMore: () => void;
}

export const useComment = (commentId: string | null): GetCommentResponse => {
	const { isAuthenticated } = useAuth();
	const [comment, setComment] = useState<Comment | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const listCurrentComment = useCallback(
		async (currentCommentId: string) => {
			try {
				const currentComment = await getComment(currentCommentId, isAuthenticated);
				setComment(currentComment);
			} catch (error: any) {
				if (error && error.errors && error.errors.length > 0) {
					setError(error.errors[0]);
				}
			}
		},
		[isAuthenticated]
	);

	// Initial GraphQL Query for Comment By ChannelId
	useEffect(() => {
		if (commentId) {
			listCurrentComment(commentId);
		}
	}, [commentId, listCurrentComment]);

	return {
		comment,
		error
	};
};

export const useComments = (input?: ListCommentsQueryVariables): ListCommentsResponse => {
	const { isAuthenticated, isLoading: authIsLoading } = useAuth();
	const [isInitialized, setIsInitialized] = useState(false);
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [currentLimit, setCurrentLimit] = useState<number | undefined>(input?.limit ?? undefined);
	const more = useRef(true);
	const nextToken = useRef<string | null>(null);

	const showMore = () => {
		if (!input?.limit || !more) return;
		setCurrentLimit((prevState) => (prevState ?? 0) + (input.limit ?? 0));
	};

	const listCurrentComments = useCallback(async () => {
		try {
			if (isLoading || !more.current || (currentLimit && comments.length >= currentLimit)) return;
			setIsLoading(true);
			const updatedInput: ListCommentsQueryVariables = {
				...input,
				nextToken: nextToken.current
			};
			const [updatedComments, updatedNextToken] = await listComments(updatedInput, isAuthenticated);
			nextToken.current = updatedNextToken;
			more.current = Boolean(updatedNextToken);
			if (updatedComments) {
				setComments((prevState) => (prevState ? [...prevState, ...updatedComments] : updatedComments));
			}
			setIsLoading(false);
		} catch (error: any) {
			if (error && error.errors && error.errors.length > 0) {
				setError(error.errors[0]);
			}
			setIsLoading(false);
		}
	}, [input, currentLimit, comments.length, isAuthenticated, isLoading]);

	useEffect(() => {
		if (!authIsLoading && !isInitialized) {
			setIsInitialized(true);
		}
	}, [authIsLoading, isInitialized]);

	useEffect(() => {
		if (isInitialized) {
			listCurrentComments();
		}
	}, [isInitialized, listCurrentComments]);

	return {
		comments,
		error,
		more: more.current,
		showMore
	};
};

export const useCommentsSubscription = (limit?: number): ListCommentsResponse => {
	const { isAuthenticated, isLoading: authIsLoading } = useAuth();
	const [isInitialized, setIsInitialized] = useState(false);
	const [comments, setComments] = useState<Comment[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [currentLimit, setCurrentLimit] = useState<number | undefined>(limit);
	const more = useRef(true);
	const nextToken = useRef<string | null>(null);

	const [commentCreated] = useGQLSubscription<Comment>({
		config: {
			key: 'onCreateComment',
			query: subscriptions.onCreateComment
		}
	});
	const [commentUpdated] = useGQLSubscription<Comment>({
		config: {
			key: 'onUpdateComment',
			query: subscriptions.onUpdateComment
		}
	});
	const [commentDeleted] = useGQLSubscription<Comment>({
		config: {
			key: 'onDeleteComment',
			query: subscriptions.onDeleteComment
		}
	});

	const showMore = () => {
		if (!limit || !more.current) return;
		setCurrentLimit((prevState) => (prevState ?? 0) + limit);
	};

	const listCurrentCommentsByResourceId = useCallback(
		async (refresh?: boolean) => {
			try {
				if (!refresh && (isLoading || !more.current || (currentLimit && comments.length >= currentLimit))) return;
				setIsLoading(true);
				const input: ListCommentsQueryVariables = {
					limit,
					nextToken: nextToken.current
				};
				const [updatedComments, updatedNextToken] = await listComments(input, isAuthenticated);
				nextToken.current = updatedNextToken;
				more.current = Boolean(updatedNextToken);
				if (updatedComments) {
					if (refresh) {
						setComments(updatedComments);
					} else {
						setComments((prevState) => (prevState ? [...prevState, ...updatedComments] : updatedComments));
					}
				} else if (nextToken.current === null) {
					setComments([]);
				}
				setIsLoading(false);
			} catch (error: any) {
				if (error && error.errors && error.errors.length > 0) {
					setError(error.errors[0]);
				}
				setIsLoading(false);
			}
		},
		[limit, currentLimit, comments.length, isAuthenticated, isLoading]
	);

	useEffect(() => {
		if (!authIsLoading && !isInitialized) {
			setIsInitialized(true);
		}
	}, [authIsLoading, isInitialized]);

	useEffect(() => {
		if (isInitialized) {
			listCurrentCommentsByResourceId();
		}
	}, [isInitialized, listCurrentCommentsByResourceId]);

	// Refreshing Comments via GraphQL Subscription to OnCreateComment
	// Sort by mediaStartTime for Annotations
	useEffect(() => {
		if (commentCreated && commentCreated.id) {
			setComments((prevComments) => prevComments && [commentCreated, ...prevComments]);
		}
	}, [commentCreated]);

	// Refreshing Comments via GraphQL Subscription to OnUpdateComment
	useEffect(() => {
		if (commentUpdated && commentUpdated.id) {
			setComments(
				(prevComments) =>
					prevComments &&
					prevComments.map((comment: Comment) => (comment && comment.id === commentUpdated.id ? commentUpdated : comment))
			);
		}
	}, [commentUpdated]);

	// Refreshing Comments via GraphQL Subscription to OnDeletedComment
	useEffect(() => {
		if (commentDeleted && commentDeleted.id) {
			listCurrentCommentsByResourceId(true);
		}
	}, [commentDeleted, listCurrentCommentsByResourceId]);

	return {
		comments,
		error,
		more: more.current,
		showMore
	};
};
