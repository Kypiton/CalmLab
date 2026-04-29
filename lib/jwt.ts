import { SignJWT, jwtVerify } from 'jose';

export async function createJWT(userId: number) {
	const secret = new TextEncoder().encode(process.env.JWT_SECRET);
	return await new SignJWT({ userId })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setSubject(String(userId))
		.setIssuer('CalmLab')
		.setExpirationTime('7d')
		.sign(secret);
}

export async function verifyJWT(token: string) {
	const secret = new TextEncoder().encode(process.env.JWT_SECRET);
	try {
		const result = jwtVerify(token, secret)
		return (await result).payload;
	} catch {
		return null
	}
}