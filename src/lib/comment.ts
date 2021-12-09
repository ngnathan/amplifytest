import API, { GRAPHQL_AUTH_MODE, GraphQLResult } from '@aws-amplify/api';

import {
	Comment,
	GetCommentQuery,
	ListCommentsQueryVariables,
	ListCommentsQuery,
	CreateCommentInput,
	CreateCommentMutation,
	UpdateCommentInput,
	UpdateCommentMutation
} from 'src/API';
import { getAuthenticatedUser } from 'src/contexts/AuthContext';
import * as mutations from 'src/graphql/mutations';
import * as queries from 'src/graphql/queries';
import { setGraphQLError } from 'src/utils/amplify';

// ==============================
// ===== GraphQL Queries

export const getComment = async (commentId: string, isAuthenticated?: boolean): Promise<Comment | null> => {
	try {
		const queryResponse = (await API.graphql({
			query: queries.getComment,
			variables: { id: commentId },
			authMode: isAuthenticated ? GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS : GRAPHQL_AUTH_MODE.AWS_IAM
		})) as GraphQLResult<GetCommentQuery>;
		const query = queryResponse.data as GetCommentQuery;
		const comment = (query.getComment as Comment) ?? null;
		return comment;
	} catch (error) {
		throw setGraphQLError('getComment', error);
	}
};

export const listComments = async (input?: ListCommentsQueryVariables, isAuthenticated?: boolean): Promise<[Comment[], string | null]> => {
	try {
		const queryResponse = (await API.graphql({
			query: queries.listComments,
			variables: input,
			authMode: isAuthenticated ? GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS : GRAPHQL_AUTH_MODE.AWS_IAM
		})) as GraphQLResult<ListCommentsQuery>;
		const query = queryResponse.data as ListCommentsQuery;
		const comments = query.listComments?.items as Comment[];
		const nextToken = query.listComments?.nextToken ?? null;
		return [comments, nextToken];
	} catch (error) {
		throw setGraphQLError('listComments', error);
	}
};

// ==============================
// ===== GraphQL Mutations

export const createCommentMutation = async (input?: CreateCommentInput): Promise<Comment | null> => {
	const mutationResponse = (await API.graphql({
		query: mutations.createComment,
		variables: { input },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	})) as GraphQLResult<CreateCommentMutation>;
	const mutation = mutationResponse.data as CreateCommentMutation;
	const comment = mutation.createComment as Comment;
	return comment;
};

export const updateCommentMutation = async (input?: UpdateCommentInput): Promise<Comment | null> => {
	const mutationResponse = (await API.graphql({
		query: mutations.updateComment,
		variables: { input },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	})) as GraphQLResult<UpdateCommentMutation>;
	const mutation = mutationResponse.data as UpdateCommentMutation;
	const comment = mutation.updateComment as Comment;
	return comment;
};

export const deleteCommentMutation = async (commentId: string): Promise<void> => {
	await API.graphql({
		query: mutations.deleteComment,
		variables: { input: { id: commentId } },
		authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS
	});
};

// ==============================
// ===== Client Functions

export const createComment = async (input: CreateCommentInput): Promise<Comment | null> => {
	try {
		return await createCommentMutation(input);
	} catch (error) {
		throw setGraphQLError('createComment', error);
	}
};

export const updateComment = async (input: UpdateCommentInput): Promise<Comment | null> => {
	try {
		return await updateCommentMutation(input);
	} catch (error) {
		throw setGraphQLError('updateComment', error);
	}
};

export const deleteComment = async (commentId: string): Promise<void> => {
	// Delete comment
	try {
		await deleteCommentMutation(commentId);
	} catch (error) {
		throw setGraphQLError('deleteComment', error);
	}
};
