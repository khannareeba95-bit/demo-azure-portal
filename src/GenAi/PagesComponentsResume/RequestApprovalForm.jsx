import React, { useState, useEffect, useContext } from 'react';
import '../utils/ReqApproval.css';
import UserContext from '../../Context/UserContext';
import fetchData from '../../config/ApiCall';
import { Loader } from '../Pages/Dashboard';
import { useNavigate } from 'react-router-dom';

export const ReqApproval = () => {
  const { userDetails } = useContext(UserContext);
  const [form, setForm] = useState({
    name: userDetails?.attributes?.name,
    email: userDetails?.attributes?.email,
    purpose: 'Consulting',
    duration: 0,
    cost: 15,
    totalCost: 0,
    description: '',
  });
  const chatURL = `https://teams.microsoft.com/l/chat/0/0?users=prarthit@cloudthat.com`;
  const [loader, setLoader] = useState(false);
  const [error, setError] = useState({});
  const navigate = useNavigate();
  useEffect(() => {
    setForm((prev) => ({ ...prev, name: userDetails?.attributes?.name, email: userDetails?.attributes?.email }));
  }, [userDetails]);

  const submitRequest = async () => {
    let errorResponse = handleError();
    if (Object.keys(errorResponse).length > 0) {
      setError(errorResponse);
      return;
    }
    setLoader(true);
    try {
      let payload = {
        name: form?.name,
        email: form?.email,
        purpose: form?.purpose,
        duration: Number(form?.duration),
        description: form?.description,
        cost: form?.cost,
        totalCost: Math.ceil((form?.cost / 60) * (Number(form?.duration) + 10)),
      };
      let url =
        'https://prod-13.centralindia.logic.azure.com:443/workflows/58432455fa3b491187652b153c2db6ad/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=pBhXzgrD9chSvh-IqeTYefvy2rFlIoTCyZIAQBvV0v4';
      const response = await fetchData(payload, url);
      if (response) {
        setLoader(false);
        navigate('/genai');
      }
    } catch (error) {
      console.log('error', error);
      setLoader(false);
    }
  };

  function handleError() {
    let errorObj = {};
    if (form?.name?.length === 0 || !form?.name) {
      errorObj['name'] = 'Please enter your name.';
    }
    if (form?.email?.length === 0 || !form?.email) {
      errorObj['email'] = 'Please enter your email.';
    }
    if (form?.description?.length === 0) {
      errorObj['description'] = 'Please enter description.';
    }
    if (form?.duration?.length === 0) {
      errorObj['duration'] = 'Please enter duration.';
    }

    return errorObj;
  }
  function redirectToChat() {
    window.open(chatURL, '_blank');
  }
  return (
    <>
      {loader && (
        <>
          <div
            style={{
              background: 'rgba(0,0,0,0.3)',
            }}
            class="fixed top-0 left-0 right-0 bottom-0 "
          />
          <div class="fixed top-[50%] left-[50%] w-[300px] bg-white p-[20px] h-[200px] flex flex-col justify-evenly z-[9999] rounded-md translate-x-[-50%] translate-y-[-50%] shadow-md">
            <div class="flex flex-col items-center justify-center gap-[10px]">
              <Loader />
              <h6 class="text-xs">Approval request pending...</h6>
            </div>

            <button
              class="mt-5 font-semibold border-none p-[10px] bg-[#20629b] text-white outline-none"
              onClick={redirectToChat}
            >
              Chat with Prarthit
            </button>
          </div>
        </>
      )}
      <div className="gen-ai-container w-screen h-screen flex items-center justify-center">
        <div className="lg:w-[500px] md:w-[400px] w-[300px] max-h-[350px] md:max-h-[500px] xl:max-h-[700px] overflow-y-scroll custom-scrollbar overflow-x-hidden bg-white rounded-md shadow-xl p-5">
          <div className="flex flex-col w-full">
            <label htmlFor="registeredName " class="text-sm md:text-base">
              Registered Name:
            </label>
            <input
              type="text"
              id="registeredName"
              name="registeredName"
              class="ring-0 focus:outline-0 !border-0 !border-b-[2px] focus:border-red-300 !rounded-none !p-1 text-sm md:text-base"
              value={form?.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {error['name'] && <p class="text-red-400">{error['name']}</p>}
          </div>
          <div className="flex flex-col w-full mt-5 ">
            <label htmlFor="registeredEmail" class="text-sm md:text-base">
              Email:
            </label>
            <input
              type="text"
              id="registeredEmail"
              name="registeredEmail"
              class="ring-0 focus:outline-0 !border-0 !border-b-[2px] focus:border-red-300 !rounded-none !p-1 text-sm md:text-base"
              value={form?.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {error['email'] && <p class="text-red-400">{error['email']}</p>}
          </div>
          <div className="form-row w-full mt-5">
            <label htmlFor="training" class="w-[40%] text-sm md:text-base">
              Purchase Type:
            </label>
            <div class="flex flex-col w-[60%]">{form?.purpose}</div>
          </div>
          <div className="flex w-full mt-10">
            <label htmlFor="training" class="w-[40%] text-sm md:text-base">
              Description:
            </label>

            <div class="flex flex-col w-[60%]">
              <textarea
                rows="3"
                cols="50"
                class="ring-0 focus:outline-0 border-[1.7px] rounded-md p-2 text-sm md:text-base"
                value={form?.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                autoFocus={true}
              ></textarea>
              {error['description'] && <p class="text-red-400">{error['description']}</p>}
            </div>
          </div>
          <div className="form-row flex w-full mt-5">
            <div class="w-[40%]">
              <label class="w-[40%] mr-[10px] text-sm md:text-base" htmlFor="consultingResponse">
                Duration (in mins):
              </label>
            </div>

            <div class="flex flex-col w-[60%]">
              <input
                type="text"
                id="consultingResponse"
                name="consultingResponse"
                class="ring-0 focus:outline-0 border-none"
                value={form.duration}
                onChange={(e) => {
                  setForm({ ...form, duration: e?.target?.value });
                }}
              />
              {error['duration'] && <p class="text-red-400">{error['duration']}</p>}
            </div>
          </div>

          <div className="form-row w-full mt-5">
            <label htmlFor="" class="w-[40%] text-sm md:text-base">
              Implementation Time:
            </label>
            <div class="flex flex-col w-[60%]">10 mins</div>
          </div>

          <div className="form-row w-full mt-5 text-sm md:text-base">
            <label htmlFor="" class="w-[40%]">
              Cost (Per Hr):
            </label>
            <div class="flex flex-col w-[60%]">${form.cost}</div>
          </div>

          <div className="form-row w-full mt-5 text-sm md:text-base">
            <label htmlFor="" class="w-[40%]">
              Total Cost:
            </label>
            <div class="flex flex-col w-[60%]">${Math.ceil((form.cost / 60) * (form.duration + 10))}</div>
          </div>
          <div className="form-row">
            <button className="submit-button hover:scale-105 text-sm md:text-base" onClick={submitRequest}>
              Request Approval
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
