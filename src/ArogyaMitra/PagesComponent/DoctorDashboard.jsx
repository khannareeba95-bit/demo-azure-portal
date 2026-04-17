import { useState, useEffect, useContext } from "react";
import { Lucide } from "@/base-components";
import ReportDonutChart from "@/components/report-donut-chart/Main";
// import "react-calendar/dist/Calendar.css";
import UserContext from "../../Context/UserContext";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { LoadingIcon } from "@/base-components";

function DoctorDashboard() {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userDetails } = useContext(UserContext);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const userEmail = userDetails?.attributes?.email || "";

  useEffect(() => {
    if (!userEmail) {
      console.error("User email is missing");
      setLoading(false);
      return;
    }

    // Fetch the data from the API
    fetch(import.meta.env.VITE_AROGYA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
        dashboard: true,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.body && Array.isArray(data.body)) {
          setDashboardData(data.body);
        } else {
          console.error("Invalid response format", data);
          setDashboardData([]); // Set to empty array in case of invalid response
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [userEmail]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <LoadingIcon
            icon="spinning-circles"
            color="#1e3a8a"
            className="w-8 h-8 ml-2 inline-block"
          />
          <p className="text-base font-sans text-primary font-semibold my-4">
            Loading your Patients Summary ...
          </p>
        </div>
      </div>
    );
  }

  // Safely access data
  const totalPatients =
    dashboardData.find(
      (item) => item.category_type === "Total number of patients"
    )?.data[0]?.total_patients || 0;
  const pendingPatients =
    dashboardData.find(
      (item) =>
        item.category_type ===
        "Total number of patients where the state is 'Pending'"
    )?.data[0]?.pending_patients || 0;
  const completedPatients =
    dashboardData.find(
      (item) =>
        item.category_type ===
        "Total number of patients where the state is 'Completed'"
    )?.data[0]?.completed_patients || 0;
  const tomorrowPatients =
    dashboardData.find(
      (item) => item.category_type === "Total number of patients for tomorrow"
    )?.data[0]?.tomorrow_patients || 0;
  const pieChartData =
    dashboardData.find((item) => item.category_type === "Pie chart")?.data ||
    [];

  const tomorrowPatientApportionments =
    dashboardData.find(
      (item) => item.category_type === "Tomorrow's patient apportionment"
    )?.data || [];
  const nextPatientApportionments =
    dashboardData.find(
      (item) => item.category_type === "Next patient's apportionment"
    )?.data || [];

  const formatAppointmentTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const AppointmentCard = ({ patient, isNext = false }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <User className="w-5 h-5 text-primary" />
        <span className="font-medium">{patient?.patient_name}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Patient ID</p>
          <p className="font-medium">{patient?.patient_id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Specialty</p>
          <p className="font-medium">{patient?.booked_specialty}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Time</p>
          <p className="font-medium">
            {formatAppointmentTime(patient?.appointment_time)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium">{patient?.status}</p>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500">Reason</p>
        <p className="font-medium">{patient?.reason}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Email</p>
        <p className="font-medium">{patient?.email}</p>
      </div>
    </div>
  );
  const AppointmentDetails = ({ patient }) => (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User className="w-5 h-5 text-[#1e3b8b]" />
        <span className="font-medium">{patient?.patient_name}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p className="text-gray-500 text-sm mb-1">Patient ID</p>
          <p className="font-medium">{patient?.patient_id}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm mb-1">Specialty</p>
          <p className="font-medium">{patient?.booked_specialty}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm mb-1">Time</p>
          <p className="font-medium">{patient?.appointment_time}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm mb-1">Status</p>
          <p className="font-medium">{patient?.status}</p>
        </div>
      </div>

      <div>
        <p className="text-gray-500 text-sm mb-1">Reason</p>
        <p className="font-medium">{patient?.reason}</p>
      </div>

      <div>
        <p className="text-gray-500 text-sm mb-1">Email</p>
        <p className="font-medium">{patient?.email}</p>
      </div>
    </div>
  );
  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === tomorrowPatientApportionments?.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? tomorrowPatientApportionments?.length - 1 : prev - 1
    );
  };

  return (
    <div className="grid grid-cols-12 gap-5 p-4">
      <div className="col-span-12 mx-3">
        <div className="grid grid-cols-12 gap-6 mt-2 mb-5">
          {/* General Report */}
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <div className="report-box zoom-in">
              <div className="box p-5">
                <Lucide icon="User" className="report-box__icon text-primary" />
                <div className="text-3xl font-medium leading-8 mt-6">
                  {totalPatients}
                </div>
                <div className="text-base text-slate-500 mt-1">
                  Total Patients
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <div className="report-box zoom-in">
              <div className="box p-5">
                <Lucide
                  icon="Clock"
                  className="report-box__icon text-warning"
                />
                <div className="text-3xl font-medium leading-8 mt-6">
                  {pendingPatients}
                </div>
                <div className="text-base text-slate-500 mt-1">
                  Pending Patients
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <div className="report-box zoom-in">
              <div className="box p-5">
                <Lucide
                  icon="CheckCircle"
                  className="report-box__icon text-success"
                />
                <div className="text-3xl font-medium leading-8 mt-6">
                  {completedPatients}
                </div>
                <div className="text-base text-slate-500 mt-1">
                  Completed Patients
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 xl:col-span-3">
            <div className="report-box zoom-in">
              <div className="box p-5">
                <Lucide
                  icon="Calendar"
                  className="report-box__icon text-pending"
                />
                <div className="text-3xl font-medium leading-8 mt-6">
                  {tomorrowPatients}
                </div>
                <div className="text-base text-slate-500 mt-1">
                  Tomorrow's Patients
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Summary */}
        <h2 className="text-lg font-medium mt-12">Patients Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-5">
          <div className="w-full mt-3 ">
            <div className="mt-5">
              <div className="box p-5">
                <div className=" pb-3  border-b">
                  <h2 className="text-lg font-medium">Today's Patients</h2>
                </div>
                {pieChartData?.length > 0 ? (
                  <ReportDonutChart
                    height={330}
                    data={pieChartData}
                    className="mt-3"
                  />
                ) : (
                  <div className="w-full flex items-center justify-center mt-6">
                    <p>No data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {tomorrowPatientApportionments?.length > 0 ? (
            <>
              <div className="report-box-2 mt-8">
                <div className="box p-5">
                  <div className="border-b flex items-center justify-between pb-2">
                    <h2 className="text-lg font-medium">
                      Tomorrow's Appointments
                    </h2>
                    {tomorrowPatientApportionments?.length > 0 && (
                      <div className="flex space-x-2">
                        <button
                          onClick={prevSlide}
                          className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                            currentSlide === 0
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          disabled={currentSlide === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={nextSlide}
                          className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                            currentSlide ===
                            tomorrowPatientApportionments?.length - 1
                              ? "cursor-not-allowed"
                              : "cursor-pointer"
                          }`}
                          disabled={
                            currentSlide ===
                            tomorrowPatientApportionments?.length - 1
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {tomorrowPatientApportionments?.length > 0 && (
                    <div className="p-4">
                      <div className="relative overflow-hidden min-h-[300px]">
                        <div className="transition-all duration-300 ease-in-out">
                          <div className="w-full">
                            <AppointmentCard
                              patient={
                                tomorrowPatientApportionments?.[currentSlide]
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-center mt-4 space-x-2">
                          {tomorrowPatientApportionments?.map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                                index === currentSlide
                                  ? "bg-[#1e3b8b]"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="box p-5 mt-8 text-center">
              <div className="flex  items-center border-b  pb-2 flex-col gap-5">
                <h2 className="text-lg font-medium">Tomorrow's Appointments</h2>
              </div>
              <p className="mt-6">No data available</p>
            </div>
          )}

          {nextPatientApportionments?.length > 0 ? (
            <div className="report-box-2 mt-8">
              <div className="box p-5">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className=" pb-3  border-b">
                    <h2 className="text-lg font-medium">Next Appointment</h2>
                  </div>
                  <div className="p-3">
                    {nextPatientApportionments?.length > 0 && (
                      <AppointmentDetails
                        patient={nextPatientApportionments[0]}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="box p-5 mt-8 text-center">
              <div className="flex  items-center border-b  pb-2 flex-col gap-5">
                <h2 className="text-lg font-medium">Next Appointment</h2>
              </div>
              <p className="mt-6">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
