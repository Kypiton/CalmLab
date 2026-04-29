import { cookies } from 'next/headers';
import { verifyJWT } from './jwt';
import prisma from './prisma';

export async function getCurrentUser() {
	const cookieStore = await cookies();
	const authToken = cookieStore.get('Auth-token');

	if (!authToken) return null;

	const payload = await verifyJWT(authToken.value);

	if (payload === null) return null;

	const userId = payload.userId

	if (typeof userId === 'number') {
		const user = await prisma.user.findUnique({
			where: {
				id: userId
			}
		})
		return user;
	} else return null;
}