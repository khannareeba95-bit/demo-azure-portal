import { Lucide } from "@/base-components";

const SuccessModal = ({ show, onClose, message, isError = false }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-[10000]" style={{ alignItems: 'flex-start', paddingTop: '20vh' }}>
      <div className="bg-white rounded-lg p-10 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="mb-10">
          <Lucide
            icon={isError ? "XCircle" : "CheckCircle"}
            className={`w-16 h-16 ${isError ? "text-danger" : "text-success"} mx-auto mt-3`}
          />
          <div className="text-2xl mt-5">{isError ? "Error" : "Success"}</div>
          <div className="text-slate-500 mt-5">{message}</div>
        </div>
        <div className="mt-5">
          <button
            type="button"
            className="btn btn-primary w-24"
            onClick={() => onClose?.()}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
