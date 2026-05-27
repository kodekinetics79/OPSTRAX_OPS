import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CommonButton, CustomInput, Modal } from "@/components";
import moment from "moment";
import {
  DRIVERS,
  RECURRENCE_PATTERNS,
  ALLOWED_DOC_TYPES,
} from "@/constants/admin/orders";
import { FileText, Trash2 } from "lucide-react";
import RecurringLoadsTable from "./RecurringLoadsTable";

const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

const schema = yup.object({
  clientName: yup.string().required("Client Name is required"),
  referenceId: yup.string().required("Reference ID is required"),
  startLocation: yup.string().required("Start Location is required"),
  endLocation: yup.string().required("End Location is required"),
  forceLoad: yup.boolean().default(false),
  startDate: yup.string().required("Start Date is required"),
  endDate: yup
    .string()
    .required("End Date is required")
    .test("after-start", "End Date must be after Start Date", function (value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      const s = moment(startDate, "YYYY-MM-DD", true);
      const e = moment(value, "YYYY-MM-DD", true);
      if (!s.isValid() || !e.isValid()) return true;
      return e.isAfter(s, "day");
    })
    .test(
      "within-30",
      "End Date must be within 30 days of Start Date",
      function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        const s = moment(startDate, "YYYY-MM-DD", true);
        const e = moment(value, "YYYY-MM-DD", true);
        if (!s.isValid() || !e.isValid()) return true;
        const diffDays = e.diff(s, "days");
        return diffDays <= 30;
      },
    ),
  startTime: yup
    .string()
    .matches(timeRegex, "Format HH:MM AM/PM")
    .required("Start Time is required"),
  endTime: yup
    .string()
    .matches(timeRegex, "Format HH:MM AM/PM")
    .required("End Time is required"),
  payRateDefined: yup.string().oneOf(["defined", "not_defined"]).required(),
  totalMiles: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .when("payRateDefined", {
      is: "defined",
      then: (s) => s.required().min(0),
    }),
  ratePerMile: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .when("payRateDefined", {
      is: "defined",
      then: (s) => s.required().min(0),
    }),
  totalHours: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .when("payRateDefined", {
      is: "defined",
      then: (s) => s.required().min(0),
    }),
  ratePerHour: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .when("payRateDefined", {
      is: "defined",
      then: (s) => s.required().min(0),
    }),
  ratePerStop: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .when("payRateDefined", {
      is: "defined",
      then: (s) => s.required().min(0),
    }),
  ratePerTrip: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .when("payRateDefined", {
      is: "defined",
      then: (s) => s.required().min(0),
    }),
  extras: yup
    .number()
    .transform((v, o) => (o === "" ? 0 : v))
    .default(0),
  comments: yup.string().default(""),
  stops: yup
    .array()
    .of(
      yup.object({
        name: yup.string().required(),
        date: yup.string().required(),
        time: yup.string().required(),
      }),
    )
    .default([]),
  recurringEnabled: yup.boolean().default(false),
  recurrencePattern: yup
    .string()
    .oneOf(["daily", "weekly"])
    .when("recurringEnabled", {
      is: true,
      then: (s) => s.required(),
    }),
  driverMode: yup
    .string()
    .oneOf(["single", "multiple"])
    .when("recurringEnabled", {
      is: true,
      then: (s) => s.required(),
    }),
  selectDriver: yup.string().when(["recurringEnabled", "driverMode"], {
    is: (rec, mode) => (rec && mode === "single") || !rec,
    then: (s) => s.required("Select a driver"),
  }),
  recurrences: yup
    .array()
    .of(
      yup.object({
        date: yup.string().required(),
        driverId: yup.string().when(["recurringEnabled", "driverMode"], {
          is: (rec, mode) => rec && mode === "multiple",
          then: (s) => s.required("Driver is required"),
          otherwise: (s) => s.optional(),
        }),
      }),
    )
    .default([]),
});

const LoadManagementForm = ({ onClose, initialValues = {} }) => {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      clientName: "",
      referenceId: "",
      startLocation: "",
      endLocation: "",
      forceLoad: false,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      payRateDefined: "not_defined",
      totalMiles: "",
      ratePerMile: "",
      totalHours: "",
      ratePerHour: "",
      ratePerStop: "",
      ratePerTrip: "",
      extras: 0,
      comments: "",
      recurringEnabled: false,
      recurrencePattern: "daily",
      driverMode: "single",
      selectDriver: "",
      stops: [],
      recurrences: [],
      documents: [],
      ...initialValues,
    },
  });

  const {
    fields: stopFields,
    append: appendStop,
    remove: removeStop,
  } = useFieldArray({ control, name: "stops" });
  const {
    fields: recurrenceFields,
    replace: replaceRecurrences,
    update: updateRecurrence,
  } = useFieldArray({ control, name: "recurrences" });

  const [isStopsModalOpen, setIsStopsModalOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);

  const payRateDefined = watch("payRateDefined");
  const recurringEnabled = watch("recurringEnabled");
  const recurrencePattern = watch("recurrencePattern");
  const driverMode = watch("driverMode");
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const selectDriver = watch("selectDriver");

  useEffect(() => {
    if (!recurringEnabled) {
      replaceRecurrences([]);
    }
  }, [recurringEnabled, replaceRecurrences]);

  const miles = Number(watch("totalMiles") || 0);
  const rateMile = Number(watch("ratePerMile") || 0);
  const hours = Number(watch("totalHours") || 0);
  const rateHour = Number(watch("ratePerHour") || 0);
  const rateStop = Number(watch("ratePerStop") || 0);
  const rateTrip = Number(watch("ratePerTrip") || 0);
  const extras = Number(watch("extras") || 0);
  const totalMilesCost = miles * rateMile;
  const totalHourlyPay = hours * rateHour;
  const totalStopPay = rateStop * (stopFields.length || 0);
  const totalPay =
    totalMilesCost + totalHourlyPay + totalStopPay + rateTrip + extras;

  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const filtered = files.filter((f) => ALLOWED_DOC_TYPES.includes(f.type));
    setUploadFiles((prev) => [...prev, ...filtered]);
    setValue("documents", [...uploadFiles, ...filtered]);
  };
  const removeFile = (idx) => {
    const next = uploadFiles.filter((_, i) => i !== idx);
    setUploadFiles(next);
    setValue("documents", next);
  };

  const onDriverChange = (idx, value) => {
    updateRecurrence(idx, { ...recurrenceFields[idx], driverId: value });
  };

  const onAddStop = (stop) => {
    appendStop(stop);
    setIsStopsModalOpen(false);
  };

  const submit = (values) => {
    const payload = {
      ...values,
      totals: { totalMilesCost, totalHourlyPay, totalStopPay, totalPay },
      recurrences: values.recurringEnabled
        ? values.recurrences.map((r) => ({
            ...r,
            driverId:
              values.driverMode === "single" ? values.selectDriver : r.driverId,
          }))
        : [],
    };
    console.log("Load Form Submit", payload);
    if (onClose) onClose();
  };

  const driverOptions = DRIVERS;
  const recurrenceOptions = RECURRENCE_PATTERNS;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="clientName"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Client Name"
              placeholder="Enter client name"
              {...field}
              error={errors.clientName?.message}
            />
          )}
        />
        <Controller
          name="referenceId"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Reference ID"
              placeholder="Ref-123"
              {...field}
              error={errors.referenceId?.message}
            />
          )}
        />
        <Controller
          name="startLocation"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Start Location"
              placeholder="City, State"
              {...field}
              error={errors.startLocation?.message}
            />
          )}
        />
        <Controller
          name="endLocation"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="End Location"
              placeholder="City, State"
              {...field}
              error={errors.endLocation?.message}
            />
          )}
        />
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("forceLoad")} className="accent-primary" />
          <span className="text-sm font-bold text-gray-300">Force Load</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <CustomInput
              type="date"
              label="Start Date"
              {...field}
              error={errors.startDate?.message}
            />
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <CustomInput
              type="date"
              label="End Date"
              {...field}
              error={errors.endDate?.message}
            />
          )}
        />
        <Controller
          name="startTime"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Start Time"
              placeholder="HH:MM AM/PM"
              {...field}
              error={errors.startTime?.message}
            />
          )}
        />
        <Controller
          name="endTime"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="End Time"
              placeholder="HH:MM AM/PM"
              {...field}
              error={errors.endTime?.message}
            />
          )}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-soft-gray/70 uppercase tracking-wide">
            Stops
          </h3>
          <CommonButton onClick={() => setIsStopsModalOpen(true)} size="sm">
            Add Stop
          </CommonButton>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Stop List
            </h4>
          </div>
          <div className="p-4 space-y-3">
            {stopFields.length === 0 && (
              <p className="text-sm text-gray-500 italic text-center py-4">No stops added yet</p>
            )}
            {stopFields.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3 bg-card-dark p-3 rounded-xl border border-white/5">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <CustomInput label="Name" readOnly value={s.name} className="mb-0" />
                  <CustomInput label="Date" readOnly value={s.date} className="mb-0" />
                  <CustomInput label="Time" readOnly value={s.time} className="mb-0" />
                </div>
                <button 
                  onClick={() => removeStop(idx)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors mt-4"
                  title="Remove Stop"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-soft-gray/70 uppercase tracking-wide">
          Pay Rate
        </h3>
        <div className="flex items-center gap-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-200 cursor-pointer">
            <input
              type="radio"
              value="not_defined"
              {...register("payRateDefined")}
              className="accent-primary"
            />
            Not Defined
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-gray-200 cursor-pointer">
            <input
              type="radio"
              value="defined"
              {...register("payRateDefined")}
              className="accent-primary"
            />
            Defined
          </label>
        </div>
        {payRateDefined === "defined" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <Controller
              name="totalMiles"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label="Total Miles"
                  placeholder="0"
                  {...field}
                  error={errors.totalMiles?.message}
                />
              )}
            />
            <Controller
              name="ratePerMile"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label="Rate Per Mile"
                  placeholder="0"
                  {...field}
                  error={errors.ratePerMile?.message}
                />
              )}
            />
            <CustomInput
              label="Total Miles Cost"
              readOnly
              value={totalMilesCost ? `$${totalMilesCost.toFixed(2)}` : "$0.00"}
              className="bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/20"
            />
            <Controller
              name="totalHours"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label="Total Hours"
                  placeholder="0"
                  {...field}
                  error={errors.totalHours?.message}
                />
              )}
            />
            <Controller
              name="ratePerHour"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label="Rate Per Hour"
                  placeholder="0"
                  {...field}
                  error={errors.ratePerHour?.message}
                />
              )}
            />
            <CustomInput
              label="Total Hourly Pay"
              readOnly
              value={totalHourlyPay ? `$${totalHourlyPay.toFixed(2)}` : "$0.00"}
              className="bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/20"
            />
            <Controller
              name="ratePerStop"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label="Rate Per Stop"
                  placeholder="0"
                  {...field}
                  error={errors.ratePerStop?.message}
                />
              )}
            />
            <CustomInput
              label="Total Stop Pay"
              readOnly
              value={totalStopPay ? `$${totalStopPay.toFixed(2)}` : "$0.00"}
              className="bg-emerald-500/10 text-emerald-400 font-bold border-emerald-500/20"
            />
            <Controller
              name="ratePerTrip"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label="Rate Per Trip"
                  placeholder="0"
                  {...field}
                  error={errors.ratePerTrip?.message}
                />
              )}
            />
            <Controller
              name="extras"
              control={control}
              render={({ field }) => (
                <CustomInput
                  label="Extras"
                  placeholder="0"
                  {...field}
                />
              )}
            />
            <div className="md:col-span-2">
              <Controller
                name="comments"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    label="Comments"
                    type="textarea"
                    rows={3}
                    {...field}
                  />
                )}
              />
            </div>
            <CustomInput
              label="Total Pay"
              readOnly
              value={totalPay ? `$${totalPay.toFixed(2)}` : "$0.00"}
              className="bg-primary text-black font-extrabold shadow-[0_0_15px_rgba(240,249,65,0.4)]"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-soft-gray/70 uppercase tracking-wide">
          Driver Assignment
        </h3>
        {!recurringEnabled && (
          <Controller
            name="selectDriver"
            control={control}
            render={({ field }) => (
              <CustomInput
                type="select"
                label="Select Driver"
                options={driverOptions}
                {...field}
                error={errors.selectDriver?.message}
              />
            )}
          />
        )}

        <div className="flex items-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10">
          <input type="checkbox" {...register("recurringEnabled")} className="accent-primary" />
          <span className="text-sm font-bold text-gray-300">Recurring Loads</span>
        </div>

        {recurringEnabled && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Controller
                name="recurrencePattern"
                control={control}
                render={({ field }) => (
                  <CustomInput
                    type="select"
                    label="Recurrence Pattern"
                    options={recurrenceOptions}
                    {...field}
                    error={errors.recurrencePattern?.message}
                  />
                )}
              />
              <div className="flex items-center gap-6 md:col-span-2 p-4 bg-white/5 rounded-xl border border-white/10 mt-6">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-200 cursor-pointer">
                  <input
                    type="radio"
                    value="single"
                    {...register("driverMode")}
                    className="accent-primary"
                  />
                  Single Driver
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-gray-200 cursor-pointer">
                  <input
                    type="radio"
                    value="multiple"
                    {...register("driverMode")}
                    className="accent-primary"
                  />
                  Multiple Drivers
                </label>
              </div>
              {driverMode === "single" && (
                <Controller
                  name="selectDriver"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      type="select"
                      label="Select Driver"
                      options={driverOptions}
                      {...field}
                      error={errors.selectDriver?.message}
                    />
                  )}
                />
              )}
            </div>

            <RecurringLoadsTable
              startDate={startDate}
              endDate={endDate}
              recurrencePattern={recurrencePattern}
              driverMode={driverMode}
              selectDriver={selectDriver}
              driverOptions={driverOptions}
              rows={recurrenceFields.map((r) => ({
                id: r.id,
                date: r.date,
                driverId: r.driverId,
              }))}
              onRowsChange={(next) =>
                replaceRecurrences(
                  next.map(({ date, driverId }) => ({ date, driverId })),
                )
              }
            />
          </>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-soft-gray/70 uppercase tracking-wide">
          Documents
        </h3>
        <input
          type="file"
          multiple
          onChange={onFilesChange}
          className="block w-full text-sm text-soft-gray
            file:mr-4 file:py-2.5 file:px-6
            file:rounded-xl file:border-0
            file:text-xs file:font-bold file:uppercase file:tracking-wide
            file:bg-primary file:text-black
            hover:file:bg-primary/90 file:transition-colors
            cursor-pointer bg-card-dark border border-white/10 rounded-xl 
            focus:outline-none focus:border-primary/50 transition-all duration-200
            hover:border-white/20 py-2 px-2"
        />
        <div className="space-y-2">
          {uploadFiles.map((f, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 border border-white/5"
            >
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                  <FileText size={16} />
                </div>
                <span>{f.name}</span>
              </div>
              <CommonButton
                variant="outline"
                size="sm"
                onClick={() => removeFile(idx)}
                className="hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
              >
                Remove
              </CommonButton>
            </div>
          ))}
          {uploadFiles.length === 0 && (
            <p className="text-sm text-gray-500 italic">No documents uploaded</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <CommonButton variant="outline" onClick={onClose} className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5">
          Cancel
        </CommonButton>
        <CommonButton type="submit">Create Load</CommonButton>
      </div>

      <Modal
        isOpen={isStopsModalOpen}
        onClose={() => setIsStopsModalOpen(false)}
        title="Add Stop"
        subtitle="Add a stop to the load"
        size="md"
      >
        <StopForm
          onCancel={() => setIsStopsModalOpen(false)}
          onSubmit={onAddStop}
        />
      </Modal>
    </form>
  );
};

const StopForm = ({ onCancel, onSubmit }) => {
  const [stop, setStop] = useState({ name: "", date: "", time: "" });
  const onChange = (e) =>
    setStop((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const submit = () => {
    if (!stop.name || !stop.date || !stop.time) return;
    onSubmit(stop);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <CustomInput
        label="Name"
        name="name"
        value={stop.name}
        onChange={onChange}
        required
      />
      <CustomInput
        type="date"
        label="Date"
        name="date"
        value={stop.date}
        onChange={onChange}
        required
      />
      <CustomInput
        label="Time"
        name="time"
        value={stop.time}
        onChange={onChange}
        required
      />
      <div className="md:col-span-2 flex justify-end gap-3 mt-4">
        <CommonButton variant="outline" onClick={onCancel} className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5">
          Cancel
        </CommonButton>
        <CommonButton onClick={submit}>Add Stop</CommonButton>
      </div>
    </div>
  );
};

export default LoadManagementForm;
