import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import DeliveryPartner from "@/models/Partner";

export async function GET() {
  await connectDB();

  try {
    const partners = await DeliveryPartner.find();
    return NextResponse.json({ success: true, data: partners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json({ success: false, message: "Server Error"}, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    console.log("Received Body:", body);
    const { name, email, phone, status, shift , areas } = body;

   
    if (!name || !email || !phone || !status || !shift?.start || !shift?.end || !areas) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required fields", 
          missingFields: {
            name: !name,
            email: !email,
            phone: !phone,
            areas:!areas,
            status: !status,
            "shift.start": !shift?.start,
            "shift.end": !shift?.end
          }
        },
        { status: 400 }
      );
    }

   
    const existingPartner = await DeliveryPartner.findOne({ $or: [{ email }, { phone }] });
    if (existingPartner) {
      return NextResponse.json({ success: false, message: "Email or Phone already exists" }, { status: 400 });
    }

    
    const partner = new DeliveryPartner({ name, email, phone, status, shift , areas });
    await partner.save();

    return NextResponse.json({ success: true, data: partner, message: "Partner created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json({ success: false, message: "Partner not created" }, { status: 400 });
  }
}
