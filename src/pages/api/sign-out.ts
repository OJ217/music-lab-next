import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
	const domain = process.env.NODE_ENV === 'production' ? '.music-lab.app' : 'localhost';
	res.setHeader('Set-Cookie', [
		`music-lab.x-access-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Domain=${domain}; HttpOnly; Secure; SameSite=None; Partitioned`,
		`music-lab.x-refresh-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; Domain=${domain}; HttpOnly; Secure; SameSite=None; Partitioned`
	]);
	res.status(204).end();
}
