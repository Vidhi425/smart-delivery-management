"use client"
import { useEffect, useState } from "react";
import axios from "axios"
import { PartnerFormData } from "../../../types";
import PartnerCard from "../PartnerCard/partnercard";
import PartnerForm from "../PartnerRegistrationForm/partnerregistrationform";


const PartnersList = () => {
  const [partners, setPartners] = useState<PartnerFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const[isFormOpen,setFormOpen] =useState(false);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const response = await axios.get("/api/partners");
        if (!response) throw new Error("Failed to fetch partners");
        const data = await response.data.data;
        console.log(data)
        setPartners(data);
      } catch (err) {
        console.log(err);
        setError("Could not load partners.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) return <p>Loading partners...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex-col space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {partners.map((partner) => (
        <PartnerCard key={partner._id} partner={partner} />
      ))}
    </div>
    <button className="bg-blue-500 text-white px-8 py-2 rounded-xl hover:bg-blue-300"  onClick={() => setFormOpen(true)}>
      Register A partner
    </button>

    {isFormOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className=" p-6 rounded-xl shadow-lg w-96">
            <PartnerForm closeForm={() => setFormOpen(false)} isEdit={false} initialData={{
              _id:" ",
    name: "",
    phone: "",
    email: "",
    areas: [],
    shift: { start: "", end: "" },
    status: "active"
  }}  />
          </div>
        </div>
      )}
    </div>
   
  );
};

export default PartnersList
