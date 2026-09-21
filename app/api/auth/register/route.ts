import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { MyUser } from '@/types/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
	try {
		const data: MyUser | null = await req.json().catch(() => null);
        if (!data) return NextResponse.json({ error: 'Invalid fields.' }, { status: 400 });
		const { firstName, lastName, email, password, confirmPassword, agreement } = data;
        if ([firstName, lastName, email, password, confirmPassword].some(value => typeof value !== 'string')) {
            return NextResponse.json({ error: 'Invalid fields.' }, { status: 400 });
        }
        const normalizedEmail = email.toLowerCase().trim();

		if (!firstName || !lastName || !normalizedEmail || !password || !confirmPassword) {
			return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
		}

		if (password !== confirmPassword) {
			return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
		}

		if (agreement !== true) {
			return NextResponse.json({ error: 'You must accept terms.' }, { status: 400 });
		}

		const userExists = await prisma.user.findUnique({
			where: {
                email: normalizedEmail
			}
		})

		if (userExists) return NextResponse.json({ error: 'This user already exists!' }, { status: 400 });

		const passwordHash = await bcrypt.hash(password, 10);

		await prisma.user.create({
			data: {
				firstName,
				lastName,
                email: normalizedEmail,
				password: passwordHash
			}
		});

		return NextResponse.json({ message: 'You registered successfully!' }, { status: 200 });
	} catch (error) {
		console.error('Authentication request failed:', error);
        return NextResponse.json({ error: 'Unable to complete request.' }, { status: 500 });
	}
}