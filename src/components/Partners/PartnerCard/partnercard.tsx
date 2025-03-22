"use client"
import { useState } from "react";
import { PartnerFormData } from "../../../types";
import PartnerForm from "../PartnerRegistrationForm/partnerregistrationform";


interface PartnerProps {
    partner: PartnerFormData;
  }
  
  const PartnerCard: React.FC<PartnerProps> = ({ partner }) => {
      const[isFormOpen,setFormOpen] =useState(false);
    
    return (
        <div className="bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-700">

        <h3 className="text-lg font-bold text-white">{partner.name}</h3>
        <p className="text-gray-400">📞 {partner.phone}</p>
        <p className="text-gray-400">✉️ {partner.email}</p>
        <p className="text-gray-400">📍 {partner.areas.join(", ")}</p>
       
        <p className="text-gray-400">⏰ {partner.shift.start} - {partner.shift.end}</p>
        <p className={`text-sm font-semibold ${partner.status === "active" ? "text-green-400" : "text-red-400"}`}>
          {partner.status.toUpperCase()}
        </p>
        <button className="bg-blue-500 text-white px-8 py-2 rounded-xl hover:bg-blue-300"  onClick={() => setFormOpen(true)}>
      Edit
    </button>

    {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className=" p-6 rounded-xl shadow-lg w-96">
            <PartnerForm isEdit={true} initialData={partner} closeForm={() => setFormOpen(false)} />
          </div>
        </div>
      )}
      </div>
      
    );
  };
  
  export default PartnerCard;
  