import { NextResponse } from 'next/server';

const fs = require('fs');

export async function GET() {
	try {
		const pathName = `${process.cwd()}/lib/orders.json`
		const data = fs.readFileSync(pathName, 'utf8');
		const orders = JSON.parse(data);
		
		return NextResponse.json({ orders }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: 'Orders not found' }, { status: 500 });
	}
}