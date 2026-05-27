import { Modal, CustomInput } from "@/components";
import { Truck } from "lucide-react";

const CarrierModal = ({ isOpen, onClose, onSave }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Onboard Carrier"
      subtitle="Enter carrier details below"
      icon={Truck}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-medium hover:bg-gray-light/10 font-bold transition-colors urbanist cursor-pointer">
            Cancel
          </button>
          <button onClick={onSave} className="flex items-center gap-2 bg-secondary text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-black/10 hover:opacity-90 transition-all active:scale-95 cursor-pointer urbanist">
            <span>Save Record</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CustomInput label="Carrier Name" placeholder="DHL Supply Chain" />
        <CustomInput label="Region" placeholder="North America" />
        <CustomInput type="select" label="Type" options={[{ value: "3pl", label: "3PL" }]} />
        <CustomInput label="Contact" placeholder="Email / Phone" />
      </div>
    </Modal>
  );
};

export default CarrierModal;
