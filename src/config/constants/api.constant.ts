export const NODE_ENV = process.env.NODE_ENV;

export const API_URL = {
	api_base_url: process.env.NEXT_PUBLIC_API_URL,
	local_base_url: process.env.NEXT_PUBLIC_API_URL_LOCAL,
	get public() {
		return NODE_ENV === 'production' ? this.api_base_url : this.local_base_url;
	},
	get private() {
		return `${this.public}/api`;
	}
};

export const GOOGLE_OAUTH = {
	client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
};

export const WEB_APP_URL = {
	web_app_base_url: process.env.NEXT_PUBLIC_WEB_APP_URL,
	local_base_url: process.env.NEXT_PUBLIC_WEB_APP_URL_LOCAL,
	get base_url() {
		return NODE_ENV === 'production' ? this.web_app_base_url : this.local_base_url;
	},
	/**
	 * Returns web app api route url
	 * @param routeSegment Starts with slash (/)
	 * @returns
	 */
	API_ROUTE(routeSegment: string) {
		return this.base_url + '/api' + routeSegment;
	}
};
