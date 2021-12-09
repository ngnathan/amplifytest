// ==============================
// ===== Auth Types

interface Session {
	idToken: Record<string, unknown> | unknown;
	refreshToken: Record<string, unknown> | unknown;
	accessToken: Record<string, unknown> | unknown;
}

export interface CognitoUserSession {
	idToken: {
		jwtToken: string;
		payload:
			| {
					'cognito:groups': string[];
			  }
			| any;
	};
	refreshToken: {
		token: string;
	};
	accessToken: {
		jwtToken: string;
		payload:
			| {
					'cognito:groups': string[];
			  }
			| any;
	};
}

interface UserAttributes {
	sub?: string;
	email_verified?: boolean;
	given_name?: string;
	family_name?: string;
	email?: string;
	profile?: string;
}

export interface CognitoUser {
	username: string;
	pool: Record<string, unknown> | unknown;
	Session: Session | null;
	client: Record<string, unknown> | unknown;
	signInUserSession: CognitoUserSession;
	authenticationFlowType: string;
	storage: Record<string, unknown> | unknown;
	keyPrefix: string;
	userDataKey: string;
	attributes: UserAttributes;
	preferredMFA: string;
}

// ==============================
// ===== Storage Types

export type StoragePutResponse = {
	key: string;
};

export interface S3ProviderListOutputItem {
	key?: string;
}
