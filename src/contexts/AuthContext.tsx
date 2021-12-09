import { createContext, FC, ReactNode, useEffect, useReducer } from 'react';
import { Auth } from 'aws-amplify';

import { CognitoUserSession, CognitoUser } from 'src/types/amplify';
import { User } from 'src/types/user';

interface AuthProviderProps {
	children: ReactNode;
}

interface AuthState {
	isAuthenticated: boolean;
	isLoading: boolean;
	user: User | null;
	error: Error | null;
}

export interface AuthContextValue extends AuthState {
	checkLoginStatus: () => Promise<void>;
	logout: () => Promise<void>;
}

const initialAuthState: AuthState = {
	isAuthenticated: false,
	isLoading: true,
	user: null,
	error: null
};

const AuthContext = createContext<AuthContextValue>({
	...initialAuthState,
	checkLoginStatus: () => Promise.resolve(),
	logout: () => Promise.resolve()
});

type LoginStartAction = {
	type: 'LOGIN_START';
};

type LoginSuccessAction = {
	type: 'LOGIN_SUCCESS';
	payload: {
		user: User;
	};
};

type LoginFailedAction = {
	type: 'LOGIN_FAILED';
	payload: {
		error: Error;
	};
};

type LogoutAction = {
	type: 'LOGOUT';
};

type Action = LoginStartAction | LoginSuccessAction | LoginFailedAction | LogoutAction;

const reducer = (state: AuthState, action: Action): AuthState => {
	switch (action.type) {
		case 'LOGIN_START': {
			return {
				...state,
				isLoading: true
			};
		}
		case 'LOGIN_SUCCESS': {
			const { user } = action.payload;
			return {
				...state,
				isAuthenticated: true,
				isLoading: false,
				user
			};
		}
		case 'LOGIN_FAILED': {
			const { error } = action.payload;
			return {
				...state,
				isAuthenticated: false,
				isLoading: false,
				error
			};
		}
		case 'LOGOUT': {
			return {
				...state,
				isAuthenticated: false,
				user: null
			};
		}
		default: {
			return { ...state };
		}
	}
};

export const checkAdmin = (cognitoUserSession: CognitoUserSession): true | null => {
	if (
		cognitoUserSession &&
		cognitoUserSession.accessToken.payload['cognito:groups'] &&
		cognitoUserSession.accessToken.payload['cognito:groups'].includes('Admin')
	) {
		return true;
	}
	return null;
};

export const getAuthenticatedUser = async (): Promise<User | null> => {
	// Check User
	const checkLoginStatusResponse = await Auth.currentAuthenticatedUser();
	const cognitoUser = JSON.parse(JSON.stringify(checkLoginStatusResponse)) as CognitoUser;
	if (!cognitoUser) return null;

	// Check User Info (for attributes)
	const currentUserInfoResponse = await Auth.currentUserInfo();
	if (!currentUserInfoResponse) return null;

	const user: User = {
		id: currentUserInfoResponse.username,
		email: currentUserInfoResponse.attributes.email,
		isVerified: currentUserInfoResponse.attributes.email_verified
	};
	const isAdmin = checkAdmin(cognitoUser.signInUserSession);
	if (isAdmin) user.isAdmin = isAdmin;
	return user;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialAuthState);

	const checkLoginStatus = async () => {
		dispatch({ type: 'LOGIN_START' });
		let user: User | null = null;
		try {
			user = await getAuthenticatedUser();
			if (!user) throw new Error('User not found.');
			dispatch({
				type: 'LOGIN_SUCCESS',
				payload: {
					user
				}
			});
		} catch (error: any) {
			dispatch({
				type: 'LOGIN_FAILED',
				payload: {
					error: error
				}
			});
		}
		if (user) {
			try {
				// TODO: Update when Admin issue is resolved
				if (!user.isAdmin) {
					console.log('user', user);
					// await Analytics.updateEndpoint({
					// 	address: user.email.toLocaleLowerCase(),
					// 	channelType: 'EMAIL',
					// 	optOut: 'NONE',
					// 	userId: user.sub,
					// 	demographic: {
					// 		locale: getLang()
					// 	}
					// });
				}
			} catch (error) {}
		}
	};

	const logout = async () => {
		await Auth.signOut();
		dispatch({ type: 'LOGOUT' });
	};

	useEffect(() => {
		checkLoginStatus();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				...state,
				checkLoginStatus,
				logout
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
