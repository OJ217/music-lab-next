import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(_: NextApiRequest, res: NextApiResponse) {
	res.setHeader('Set-Cookie', [
		'music-lab.x-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly; Secure; SameSite=None; Partitioned',
		'music-lab.x-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; HttpOnly; Secure; SameSite=None; Partitioned'
	]);
	res.status(204).end();
}
