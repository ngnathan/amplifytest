import Amplify, { Logger } from 'aws-amplify';
import type { GraphQLResult } from '@aws-amplify/api';
import awsmobile from 'src/aws-exports';
import errors from './errors';

interface GraphQLError extends Error {
	[key: string]: any;
	extensions: { [key: string]: any } | undefined;
	locations: readonly { [key: string]: any; line: number; column: number }[] | undefined;
	nodes: any;
	originalError: any;
	path: readonly (string | number)[] | undefined;
	positions: readonly number[] | undefined;
	source: any;
	display?: boolean;
}

type GraphQLErrorResult = Omit<GraphQLResult, 'errors'> & { errors: GraphQLError[] };

Amplify.configure({
	...awsmobile
});

const logger = new Logger('Amplify GraphQL Error');

// If 'name' property is present, display error to user
export const createGraphQLError = (error: Error, name?: string): GraphQLErrorResult => {
	return {
		errors: [
			{
				message: error.message,
				name: name ?? error.name,
				extensions: undefined,
				locations: undefined,
				nodes: undefined,
				originalError: undefined,
				path: undefined,
				positions: undefined,
				source: undefined,
				display: Boolean(name)
			}
		]
	};
};

export const setGraphQLError = (name: string, error: GraphQLResult | unknown): Error => {
	const gqlResult = error as GraphQLResult;
	let displayError: Error | null = null;
	if (gqlResult.errors && gqlResult.errors.length > 0) {
		gqlResult.errors.map((gqlError: any) => {
			if (!gqlError) return;
			logger.error(name, gqlError.message);
			if (gqlError.display) {
				displayError = gqlError;
			}
		});
	} else {
		logger.error(name, gqlResult);
	}
	return displayError ? displayError : errors.generic;
};
