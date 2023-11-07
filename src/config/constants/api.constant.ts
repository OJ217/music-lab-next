export const NODE_ENV = process.env.NODE_ENV;

export const API_URL = {
	base: process.env.NEXT_PUBLIC_API_URL,
	base_local: process.env.NEXT_PUBLIC_API_URL_LOCAL,
	get public() {
		return NODE_ENV === 'production' ? this.base : this.base_local;
	},
	get private() {
		return `${this.public}/api`;
	}
};

export const GOOGLE_OAUTH = {
	client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
};
