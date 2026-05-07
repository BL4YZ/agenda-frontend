import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { slug } = await request.json();
    if (typeof slug !== 'string' || !slug) {
        return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
    }
    // 'page' type purges both the full route cache and the data cache for this path
    revalidatePath(`/public/${slug}`, 'page');
    return NextResponse.json({ revalidated: true, slug });
}
