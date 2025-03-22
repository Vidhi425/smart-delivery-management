import { connectDB } from "@/lib/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
    await connectDB();
    return NextResponse.json({ message: "MongoDB Connected!" });
}
