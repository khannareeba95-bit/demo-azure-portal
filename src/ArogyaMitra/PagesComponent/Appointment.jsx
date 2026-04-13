import { useEffect, useRef, useState, useContext } from "react";
import { createIcons, icons } from "lucide";
import Tabulator from "tabulator-tables";
import UserContext from "../../Context/UserContext";
import { LoadingIcon } from "@/base-components";

function Appointment() {
  const { userDetails } = useContext(UserContext);
  const userEmail = userDetails?.attributes?.email;

  const tableRef = useRef();
  const tabulator = useRef();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterValue, setFilterValue] = useState("");

  const fetchAppointments = async (email) => {
    if (!email) {
      console.error("User email is not available");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://nl1wxwxyjh.execute-api.ap-south-1.amazonaws.com/dev/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();

      if (data.statusCode === 200 && Array.isArray(data.body)) {
        setAppointments(data.body);
      } else {
        console.error("Response is not in the expected format");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(userEmail);
  }, [userEmail]);

  const generateColumns = () => {
    if (appointments.length === 0) return [];

    const firstAppointment = appointments[0];
    const columns = Object.keys(firstAppointment).map((key) => ({
      title: key.replace(/_/g, " ").toUpperCase(),
      field: key,
      hozAlign: "center",
      minWidth: 150,
      resizable: true,
    }));

    return columns;
  };

  const initTabulator = () => {
    tabulator.current = new Tabulator(tableRef.current, {
      data: appointments,
      layout: "fitDataTable",
      columns: generateColumns(),
      responsiveLayout: "hide",
      placeholder: "No matching records found",
      movableColumns: true,
      minHeight: "70vh",
      renderComplete() {
        createIcons({ icons, "stroke-width": 1.5, nameAttr: "data-lucide" });
      },
    });
  };

  const onFilter = () => {
    const filteredData = appointments.filter((appointment) => {
      return Object.values(appointment).some((value) =>
        value.toString().toLowerCase().includes(filterValue.toLowerCase())
      );
    });
    tabulator.current.setData(filteredData);
  };

  const onResetFilter = () => {
    setFilterValue("");
    tabulator.current.setData(appointments);
  };

  useEffect(() => {
    if (appointments.length > 0) {
      initTabulator();
    }
  }, [appointments]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <LoadingIcon
              icon="spinning-circles"
              color="#1e3a8a"
              className="w-8 h-8 ml-2 inline-block"
            />
            <p className="text-base font-sans text-primary font-semibold my-4">
              Loading your appointments ...
            </p>
          </div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-auto h-auto flex mx-auto items-center justify-center px-6 py-5">
            <p className="text-base font-sans text-red-500 font-semibold">
              {" "}
              No appointments found. Please check back later ...
            </p>
          </div>
        </div>
      ) : (
        <div className="intro-y box mt-5 p-5 mx-5">
          <div className="flex flex-col sm:flex-row sm:items-end xl:items-start mb-5">
            <form
              id="tabulator-html-filter-form"
              className="xl:flex sm:mr-auto"
            >
              <div className="sm:flex items-center sm:mr-4 mt-2 xl:mt-0">
                <label className="w-12 flex-none xl:w-auto xl:flex-initial mr-2">
                  Value
                </label>
                <input
                  id="tabulator-html-filter-value"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  type="text"
                  className="form-control sm:w-40 2xl:w-full mt-2 sm:mt-0"
                  placeholder="Search..."
                />
              </div>
              <div className="mt-2 xl:mt-0">
                <button
                  id="tabulator-html-filter-go"
                  type="button"
                  className="btn btn-primary w-full sm:w-16"
                  onClick={onFilter}
                >
                  Go
                </button>
                <button
                  id="tabulator-html-filter-reset"
                  type="button"
                  className="btn btn-secondary w-full sm:w-16 mt-2 sm:mt-0 sm:ml-1"
                  onClick={onResetFilter}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
          <div className="overflow-x-auto">
            <div
              id="tabulator"
              ref={tableRef}
              className="mt-5 table-report table-report--tabulator"
            ></div>
          </div>
        </div>
      )}
    </>
  );
}

export default Appointment;
