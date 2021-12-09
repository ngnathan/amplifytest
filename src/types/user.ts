export interface User {
	id: string;
	email: string;
	isAdmin?: boolean | null;
	isVerified?: boolean | null;
	[key: string]: any;
}
