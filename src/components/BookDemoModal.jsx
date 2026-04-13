import { useCallback, useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Modal, ModalBody, ModalHeader } from "../base-components";

const BookDemoModal = ({ isOpen, onClose, project }) => {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    email: "",
    company: "",
    companySize: "",
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({ name: "", designation: "", countryCode: "", email: "", company: "", companySize: "" });
    setErrors({});
    setPhoneNumber("");
    setShowSuccess(false);
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.fullname = "Full Name is required";
    if (!formData.designation.trim()) newErrors.designation = "Designation is required";
    // if (!formData.countryCode) newErrors.countryCode = "Country code is required";
    if (!phoneNumber.trim()) newErrors.phone = "Phone Number is required";
    if (!formData.email.trim()) newErrors.email = "Email Address is required";
    if (!formData.company.trim()) newErrors.company = "Company Name is required";
    if (!formData.companySize) newErrors.companySize = "Company Size is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length > 0 ? newErrors : null;
  }, [formData]);

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen, resetForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      setErrors(validationError);
      setIsSubmitting(false);
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Please enter a valid phone number",
      }));
      setIsSubmitting(false);
      return;
    }

    // Prepare API payload
    const bookingData = {
      full_name: formData.name,
      designation: formData.designation,
      phone_number: phoneNumber,
      email: formData.email,
      company_name: formData.company,
      company_size: formData.companySize,
    };

    try {
      const result = await bookDemo(project?.title || "General Demo", bookingData);

      if (result?.success) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
          resetForm();
        }, 5000);
      } else {
        const errorMsg = result?.error || "Failed to submit booking request";
        setErrors(() => ({
          resError: `An error occurred: ${errorMsg || "Unknown error"}`,
        }));
      }
    } catch (error) {
      setErrors(() => ({
        resError: `An error occurred: ${error?.message || "Unknown error"}`,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={isOpen} onHidden={onClose}>
      <ModalHeader className="relative">
        <h2 className="text-2xl font-bold text-gray-900">Book a Demo</h2>
        <button onClick={onClose} className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 text-xl p-2">
          ✕
        </button>
      </ModalHeader>
      <ModalBody className="px-6 py-1 pb-4">
        {showSuccess ? (
          <div className="text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
              <p className="text-gray-600">Our team will contact you shortly to schedule your demo.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={formData?.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="intro-x login__input form-control py-3 px-4 block"
              />
              {errors?.fullname && <p className="text-red-500">*{errors?.fullname}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Designation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="intro-x login__input form-control py-3 px-4 block"
              />
              {errors?.designation && <p className="text-red-500">*{errors?.designation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="intro-x login__input form-control px-1 border border-gray-300 rounded-md overflow-hidden">
                <PhoneInput
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  defaultCountry="IN"
                  className="phone-input-wrapper form-control"
                />
              </div>

              {errors?.phone && <p className="text-red-500">*{errors?.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Email Address"
                value={formData?.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="intro-x login__input form-control py-3 px-4 block"
              />
              {errors?.email && <p className="text-red-500">*{errors?.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Company Name"
                value={formData?.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="intro-x login__input form-control py-3 px-4 block"
              />
              {errors?.company && <p className="text-red-500">*{errors?.company}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Size <span className="text-red-500">*</span>
              </label>
              <select
                value={formData?.companySize}
                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                className="intro-x  form-control py-3 px-4 block"
              >
                <option value="">Select Company Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
              {errors?.companySize && <p className="text-red-500">*{errors?.companySize}</p>}
            </div>
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#1a365d] text-white rounded-md hover:bg-[#2c5282] transition duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        )}
        {errors?.resError && <p className=" text-red-500 mt-2 mb-4">{errors?.resError}</p>}
      </ModalBody>
    </Modal>
  );
};

export default BookDemoModal;
