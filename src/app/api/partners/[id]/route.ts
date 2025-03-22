import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import DeliveryPartner from "@/models/Partner";

export async function PUT(req: NextRequest) {
    await connectDB();
  
    try {
      const body = await req.json();
      console.log("Received Body:", body);
  
      const { _id, name, email, phone, status, shift ,areas } = body;
  
      
      if (!_id) {
        return NextResponse.json({ success: false, message: "Partner ID is required" }, { status: 400 });
      }
  
      const existingPartner = await DeliveryPartner.findById(_id);
      if (!existingPartner) {
        return NextResponse.json({ success: false, message: "Partner not found" }, { status: 404 });
      }
  
      
      if (name) existingPartner.name = name;
      if (email) existingPartner.email = email;
      if (phone) existingPartner.phone = phone;
      if (status) existingPartner.status = status;
      if (Array.isArray(areas)) {
        existingPartner.areas = areas;
    }
      if (shift?.start) existingPartner.shift.start = shift.start;
      if (shift?.end) existingPartner.shift.end = shift.end;
  
      await existingPartner.save();
  
      return NextResponse.json({ success: true, message: "Partner updated successfully", data: existingPartner }, { status: 200 });
    } catch (error) {
      console.error("Error updating partner:", error);
      return NextResponse.json({ success: false, message: "Partner not updated" }, { status: 400 });
    }
  }


  export async function DELETE(req: NextRequest) {
    await connectDB();
   
    try {
        const body = await req.json();
        const {_id} = body;
        if (!_id) {
            return NextResponse.json({ success: false, message: "Partner ID is required" }, { status: 400 });
        }
      const partners = await DeliveryPartner.findByIdAndDelete(_id);
      return NextResponse.json({ success: true, data:partners }, { status: 200 });
    } catch (error) {
      console.error("Error deleting partners:", error);
      return NextResponse.json({ success: false, message: "Server Error"}, { status: 500 });
    }
  }