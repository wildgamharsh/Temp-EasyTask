import { NextRequest, NextResponse } from "next/server";
import { calculateCartTotals } from "@/lib/pricing/server-pricing";


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, promoCode } = body;
        const result = await calculateCartTotals(items, promoCode);

        if (!result.success) {
            return NextResponse.json({ success: false, message: result.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result.data });

    } catch (error) {
        console.error("Pricing calculation error:", error);
        return NextResponse.json({ success: false, message: "Calculation failed" }, { status: 500 });
    }
}
