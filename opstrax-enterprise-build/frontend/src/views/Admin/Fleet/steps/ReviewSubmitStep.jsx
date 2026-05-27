
import React from "react";
import { useFormContext } from "react-hook-form";
import { Truck } from "lucide-react";

const ReviewItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
      {label}
    </span>
    <span className="text-sm font-semibold text-gray-200">
      {value || <span className="text-gray-600 italic">Not provided</span>}
    </span>
  </div>
);

const ReviewSubmitStep = () => {
  const { watch } = useFormContext();
  const values = watch();

  const files = values.files || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Registration Details */}
      <section className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">
          Registration Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <ReviewItem label="Vehicle ID" value={values.vehicleId} />
          <ReviewItem label="Plate Owner Master" value={values.plateOwnerMaster} />
          <ReviewItem label="Vehicle Owner Master" value={values.vehicleOwnerMaster} />
          <ReviewItem label="Owner Name" value={values.ownerName} />
          <ReviewItem label="Purchase Price" value={values.purchasePrice} />
          <ReviewItem label="Lease Amount" value={values.leaseAmount} />
          <ReviewItem label="Buyout Option" value={values.buyoutOption} />
          <ReviewItem label="Lease Start Date" value={values.leaseStartDate} />
          <ReviewItem label="Lease End Date" value={values.leaseEndDate} />
          <ReviewItem label="Lease Term" value={values.leaseTerm} />
          <ReviewItem label="Tax Rate" value={values.taxRate} />
        </div>
      </section>

      {/* Vehicle Info */}
      <section className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">Vehicle Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <ReviewItem label="Unit No" value={values.unitNo} />
          <ReviewItem label="VIN" value={values.vin} />
          <ReviewItem label="Engine No" value={values.engineNo} />
          <ReviewItem label="Make" value={values.make} />
          <ReviewItem label="Model" value={values.model} />
          <ReviewItem label="Year" value={values.year} />
          <ReviewItem label="Colour" value={values.colour} />
          <ReviewItem label="Plate No" value={values.plateNo} />
          <ReviewItem label="Front Tire Radius" value={values.frontTireRadius} />
          <ReviewItem label="Front Tire Depth" value={values.frontTireDepth} />
          <ReviewItem label="Back Tire Radius" value={values.backTireRadius} />
          <ReviewItem label="Back Tire Depth" value={values.backTireDepth} />
          <ReviewItem label="Truck Length" value={values.truckLength} />
          <ReviewItem label="Type of Vehicle" value={values.typeOfVehicle} />
          <ReviewItem label="Vehicle Status" value={values.vehicleStatus} />
          <ReviewItem label="Liftgate" value={values.liftgate} />
          <ReviewItem label="Keycode" value={values.keycode} />
        </div>
      </section>

      {/* Insurance & Safety */}
      <section className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">
          Insurance & Safety
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <ReviewItem label="Insurance Company" value={values.insuranceCompany} />
          <ReviewItem label="Policy Number" value={values.policyNumber} />
          <ReviewItem label="Insurance Start" value={values.insuranceStart} />
          <ReviewItem label="Insurance End" value={values.insuranceEnd} />
          <ReviewItem label="MVI Safety Province" value={values.mviSafetyProvince} />
          <ReviewItem label="MVI Safety Due" value={values.mviSafetyDue} />
          <ReviewItem label="Plate Type" value={values.plateType} />
          <ReviewItem label="Plate Expiry" value={values.plateExpiry} />
          <ReviewItem label="Plate Province" value={values.plateProvince} />
        </div>
      </section>

      {/* Miscellaneous */}
      <section className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">
          Miscellaneous Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
          <ReviewItem label="Tracker" value={values.tracker} />
          <ReviewItem label="Macpass Number" value={values.macpassNumber} />
          <ReviewItem label="StraightPass" value={values.straightPass} />
          <ReviewItem label="Dashcam" value={values.dashcam} />
          <ReviewItem label="Highway 104 Toll" value={values.highway104Toll} />
          <ReviewItem label="Station" value={values.station} />
          <ReviewItem label="Comments" value={values.comments} />
        </div>
      </section>

      {/* Uploaded Docs */}
      <section className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">Uploaded Docs</h3>
        {files.length === 0 ? (
          <p className="text-sm text-gray-500">No files uploaded.</p>
        ) : (
          <ul className="text-xs text-gray-300 space-y-1 max-h-40 overflow-y-auto">
            {files.map((file, idx) => (
              <li key={idx}>{file.name}</li>
            ))}
          </ul>
        )}
      </section>

      <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20 flex items-start gap-4">
        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
          <Truck size={24} />
        </div>
        <div>
          <p className="text-sm font-semibold text-blue-300">
            Ready to register this vehicle?
          </p>
          <p className="text-xs text-blue-400/80 mt-1">
            Please double check all information before submitting. You can
            always edit vehicle details later from the registry.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitStep;
