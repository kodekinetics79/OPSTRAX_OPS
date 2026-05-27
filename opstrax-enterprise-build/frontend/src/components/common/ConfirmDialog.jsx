import Modal from "./Modal";
import CommonButton from "./Button";

const ConfirmDialog = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  subtitle,
  icon: Icon,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  size = "sm",
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      subtitle={subtitle}
      icon={Icon}
      size={size}
      footer={
        <div className="flex justify-end gap-3">
          <CommonButton variant="outline" onClick={onCancel}>
            {cancelLabel}
          </CommonButton>
          <CommonButton onClick={onConfirm}>{confirmLabel}</CommonButton>
        </div>
      }
    >
      {children}
    </Modal>
  );
};

export default ConfirmDialog;
