import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { slug } = await request.json();
    if (typeof slug !== 'string' || !slug) {
        return NextResponse.json({ error: 'invalid slug' }, { status: 400 });
    }
    // Invalidate the data cache entry for this shop (precise, synchronous)
    revalidateTag(`shop:${slug}`);
    // Also purge the full route cache
    revalidatePath(`/public/${slug}`);
    return NextResponse.json({ revalidated: true, slug });
}
