import { useState } from "react";
import { Package, Truck, User, MapPin, Thermometer, AlertCircle, Plus, Edit2, Trash2, Box, Maximize, Clock, Navigation } from "lucide-react";
import { Card, DynamicTable, CommonButton, InfoCard, StatusBadge, Modal, CustomInput, PageHeader } from "@/components";
import { LOADS } from "./loads.data";

const getPriorityVariant = (priority) => {
  switch (String(priority).toLowerCase()) {
    case "critical":
      return "danger";
    case "high":
      return "warning";
    case "standard":
      return "info";
    default:
      return "neutral";
  }
};

const getStatusVariant = (status) => {
  switch (String(status).toLowerCase()) {
    case "delivered":
      return "success";
    case "in transit":
      return "info";
    case "pending":
      return "warning";
    default:
      return "neutral";
  }
};

const LoadList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const columns = [
    { label: "Shipment ID", renderCell: (row) => <span className="font-bold text-secondary">{row.id}</span> },
    { label: "Customer", accessor: "customerId" },
    {
      label: "Route",
      renderCell: (row) => (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 text-xs">
            <MapPin size={10} className="text-gray-medium" />
            <span>{row.origin}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-medium">
            <Navigation size={10} />
            <span>{row.destination}</span>
          </div>
        </div>
      ),
    },
    { label: "Status", renderCell: (row) => <StatusBadge status={row.status} variant={getStatusVariant(row.status)} size="sm" pulse={row.status === "In Transit"} /> },
    { label: "Priority", renderCell: (row) => <StatusBadge status={row.priority} variant={getPriorityVariant(row.priority)} size="sm" /> },
    { label: "Weight", accessor: "weight" },
    {
      label: "Special",
      renderCell: (row) =>
        row.tempRequired !== "None" ? (
          <div className="flex items-center gap-1 text-blue font-bold">
            <Thermometer size={14} />
            <span>{row.tempRequired}</span>
          </div>
        ) : (
          <span className="text-gray-medium italic">Standard</span>
        ),
    },
    {
      label: "Actions",
      renderCell: (row) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => {
              setSelectedRecord(row);
              setIsModalOpen(true);
            }}
            className="p-2 rounded-xl hover:bg-secondary/10 text-secondary transition-all"
          >
            <Edit2 size={16} />
          </button>
          <button className="p-2 rounded-xl hover:bg-red/10 text-red transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8">
      <PageHeader
        icon={Package}
        title="Shipment Tracking"
        subtitle="Manage consignments & global logistics"
        action={
          <CommonButton
            icon={Plus}
            onClick={() => {
              setSelectedRecord(null);
              setIsModalOpen(true);
            }}
            className="shadow-lg shadow-red/20"
          >
            Create Consignment
          </CommonButton>
        }
      />

      <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-4 gap-6">
        <InfoCard icon={Truck} label="Total Shipments" value="1,248" variant="default" trend="up" trendValue="+8%" />
        <InfoCard icon={Navigation} label="In Transit" value="45" variant="primary" />
        <InfoCard icon={AlertCircle} label="Critical Priority" value="03" variant="warning" />
        <InfoCard icon={Clock} label="Delayed" value="01" variant="danger" />
      </div>

      <div className="bg-white rounded-4xl border border-gray-light/20 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-light/10">
          <h3 className="text-sm font-extrabold text-grey">Recent Shipments</h3>
        </div>
        <DynamicTable
          columns={columns}
          data={LOADS}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={Math.ceil(LOADS.length / pageSize)}
          placeholder="Filter shipments by ID or Customer..."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRecord ? `Edit Shipment ${selectedRecord.id}` : "New Consignment"}
        subtitle="Full logistics parameter configuration"
        icon={Box}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <CommonButton variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </CommonButton>
            <CommonButton icon={Plus}>{selectedRecord ? "Save Changes" : "Dispatch Shipment"}</CommonButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6 py-4">
          <Card className="laptop:col-span-1 bg-gray-light/5 border-dashed p-4">
            <h3 className="text-xs font-bold text-gray-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={14} className="text-secondary" />
              Base Identity
            </h3>
            <div className="space-y-4">
              <CustomInput label="Shipment ID" value={selectedRecord?.id || ""} placeholder="e.g. SHP-2024-X" onChange={() => {}} />
              <CustomInput label="Customer ID" value={selectedRecord?.customerId || ""} placeholder="Select customer" onChange={() => {}} />
              <CustomInput label="Assigned Vehicle" value={selectedRecord?.vehicleId || ""} placeholder="Search vehicle ID" onChange={() => {}} />
              <CustomInput label="Assigned Driver" value={selectedRecord?.driverId || ""} placeholder="Search driver ID" onChange={() => {}} />
            </div>
          </Card>

          <Card className="laptop:col-span-1 bg-gray-light/5 border-dashed p-4">
            <h3 className="text-xs font-bold text-gray-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <Maximize size={14} className="text-secondary" />
              Cargo Details
            </h3>
            <div className="space-y-4">
              <CustomInput label="Dimensions" value={selectedRecord?.dimensions || ""} placeholder="LxWxH (cm)" onChange={() => {}} />
              <CustomInput label="Weight" value={selectedRecord?.weight || ""} placeholder="kg or tons" onChange={() => {}} />
              <CustomInput label="Material Type" value={selectedRecord?.material || ""} placeholder="e.g. Perishable" onChange={() => {}} />
              <div className="grid grid-cols-2 gap-3">
                <CustomInput label="Priority" value={selectedRecord?.priority || "Standard"} onChange={() => {}} />
                <CustomInput label="Temp Required" value={selectedRecord?.tempRequired || "None"} onChange={() => {}} />
              </div>
            </div>
          </Card>

          <Card className="laptop:col-span-1 bg-gray-light/5 border-dashed p-4">
            <h3 className="text-xs font-bold text-gray-medium uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-secondary" />
              Route & Schedule
            </h3>
            <div className="space-y-4">
              <CustomInput label="Origin Location" value={selectedRecord?.origin || ""} onChange={() => {}} />
              <CustomInput label="Destination" value={selectedRecord?.destination || ""} onChange={() => {}} />
              <CustomInput type="datetime-local" label="Scheduled Pickup" value={selectedRecord?.scheduledPickup?.replace(" ", "T") || ""} onChange={() => {}} />
              <CustomInput type="datetime-local" label="Scheduled Delivery" value={selectedRecord?.scheduledDelivery?.replace(" ", "T") || ""} onChange={() => {}} />
              <CustomInput
                type="datetime-local"
                label="Actual Delivery"
                value={selectedRecord?.actualDelivery?.replace(" ", "T") === "--" ? "" : selectedRecord?.actualDelivery?.replace(" ", "T")}
                onChange={() => {}}
              />
            </div>
          </Card>
        </div>
      </Modal>
    </div>
  );
};

export default LoadList;
