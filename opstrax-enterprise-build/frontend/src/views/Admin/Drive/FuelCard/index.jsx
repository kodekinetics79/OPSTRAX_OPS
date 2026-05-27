
import React, { useState } from "react";
import { CreditCard, Plus, Edit2, Trash2 } from "lucide-react";
import { DynamicTable, CommonButton, InfoCard, Modal, CustomInput, StatsCard, PremiumHeader } from "@/components/index";
import { FUEL_CARD_DATA, FUEL_CARD_COLUMNS, FUEL_CARD_TITLE, FUEL_CARD_SUBTITLE, FUEL_CARD_GRADIENT, createFuelCardStats } from "@/constants/admin/drive/fuelCard";

const data = FUEL_CARD_DATA;

const FuelCard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const stats = createFuelCardStats(data);

  const columns = [
    ...FUEL_CARD_COLUMNS,
    {
      label: "Actions",
      renderCell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => {
              setSelectedRecord(row);
              setIsModalOpen(true);
            }}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-primary transition-all duration-200 hover:scale-110"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-110">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8">
      <PremiumHeader icon={CreditCard} title={FUEL_CARD_TITLE} subtitle={FUEL_CARD_SUBTITLE} gradient="from-emerald-900/40 via-gray-900 to-fade" onAddClick={() => { setSelectedRecord(null); setIsModalOpen(true); }} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 tablet:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-card-dark rounded-2xl shadow-lg border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-sm font-extrabold text-gray-400">Fuel Card Records</h3>
        </div>
        <DynamicTable
          columns={columns}
          data={data}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={Math.ceil(data.length / pageSize)}
          placeholder="Search by card number or employee..."
          filters={
            <CommonButton
              icon={Plus}
              size="sm"
              onClick={() => {
                setSelectedRecord(null);
                setIsModalOpen(true);
              }}
            >
              Issue Card
            </CommonButton>
          }
        />
      </div>

      {/* Enhanced Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRecord ? "Edit Fuel Card" : "Issue New Fuel Card"}
        subtitle="Fill in the card details below"
        icon={CreditCard}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <CommonButton
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </CommonButton>
            <CommonButton icon={selectedRecord ? CreditCard : Plus}>
              {selectedRecord ? "Update Card" : "Issue Card"}
            </CommonButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 tablet:grid-cols-2 gap-5">
          <CustomInput
            label="Employee ID"
            placeholder="Enter employee ID"
            name="employeeId"
            value={selectedRecord?.employeeId || ""}
            onChange={() => { }}
            required
          />
          <CustomInput
            label="Employee Name"
            placeholder="Enter employee name"
            name="employeeName"
            value={selectedRecord?.employeeName || ""}
            onChange={() => { }}
            required
          />
          <CustomInput
            label="Vehicle Plate"
            placeholder="Enter vehicle plate"
            name="vehiclePlate"
            value={selectedRecord?.vehiclePlate || ""}
            onChange={() => { }}
            required
          />
          <CustomInput
            label="Monthly Limit ($)"
            placeholder="Enter monthly limit"
            name="monthlyLimit"
            value={selectedRecord?.monthlyLimit?.replace("$", "") || ""}
            onChange={() => { }}
            required
          />
          <CustomInput
            type="date"
            label="Issue Date"
            name="issueDate"
            value={selectedRecord?.issueDate || ""}
            onChange={() => { }}
            required
          />
          <CustomInput
            type="date"
            label="Expiry Date"
            name="expiryDate"
            value={selectedRecord?.expiryDate || ""}
            onChange={() => { }}
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default FuelCard;
