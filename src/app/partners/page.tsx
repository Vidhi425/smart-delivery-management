// import OrderCard from "@/components/Orders/OrderCard/ordercard";

import PartnersList from "@/components/Partners/PartnerList/partnerlist";
// import PartnerForm from "@/components/Partners/PartnerRegistrationForm/partnerregistrationform";


export default function partners() {
  return (
    <>
<div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Delivery Partners</h1>
      {/* <PartnerList/> */}
      <PartnersList/>
    </div>

    </>
   
  );
}