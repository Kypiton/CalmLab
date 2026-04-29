import { createJWT } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const data: { email: string, password: string } = await req.json();
		let { email, password } = data;
		email = email.toLowerCase().trim()

		if (!email || !password) {
			return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
		}

		const user = await prisma.user.findUnique({
			where: {
				email
			}
		})

		if (!user) {
			return NextResponse.json({ error: 'User not found.' }, { status: 401 });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (isPasswordCorrect) {
			const token = await createJWT(user.id)
			const response = NextResponse.json({ message: 'You logged in successfully!' }, { status: 200 })

			response.cookies.set({
				name: 'Auth-token',
				value: token,
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 7
			});

			return response;
		} else {
			return NextResponse.json({ error: 'Passwords do not match.' }, { status: 401 });

		}

	} catch (error) {
		return NextResponse.json({ error }, { status: 500 });
	}
}