import React, { useEffect, useState } from 'react';
import './assets/css/customMautic.css';
import { useNavigate } from 'react-router';

export const CustomMauticForm = ({ showMautic, setShowMautic }) => {
  const [formData, setFormData] = useState({
    f_name: '',
    email: '',
    phone: '',
    designation: '',
    company_name: '',
  });
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
 
  }, []);
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const url = 'https://mautic.cloudthat.com/form/submit?formId=23';
    const data = new FormData();
    // data.append('mauticform[formId]', '23');
    // data.append('mauticform[return]', 'https://mautic.cloudthat.com/form/23');
    // data.append('mauticform[formName]', 'demoscloudthatcom');
    // data.append('mauticform[messenger]', '1');
    for (const key in formData) {
      data.append(`mauticform[${key}]`, formData[key].trim());
    }
    fetch(url, {
      method: 'POST',
      body: data,
    })
      .then((response) => response.text())
      .then((htmlResponse) => {
        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(htmlResponse, 'text/html');
        const scriptElement = htmlDoc.querySelector('script[type="text/javascript"]');
        if (scriptElement) {
          const scriptContent = scriptElement.textContent;
          if (scriptContent.includes('parent.postMessage("\x7b\x22success\x22")')) {
            setShowMautic(!showMautic);
            navigate('/');
          } else {
            console.error('Form submission error');
            setErrorMessage('Form submission error');
          }
        }
      })
      .catch((error) => {
        console.error('Form error:', error);
      });
  };
  const changeState = (param, value) => {
    setFormData({
      ...formData,
      [param]: value,
    });
  };

  // mauticform[f_name]: Sneha N
  // mauticform[email]: sneh@cloudthat.com
  // mauticform[phone]: 6360265665
  // mauticform[designation]: Software developer
  // mauticform[company_name]: CloudThat
  // mauticform[formId]: 23
  // mauticform[return]: https://mautic.cloudthat.com/form/23
  // mauticform[formName]: demoscloudthatcom
  // mauticform[messenger]: 1
  return (
    <form onSubmit={handleFormSubmit}>
      <div class="form shadow-2xl">
        <div class={`input-container ic2 `}>
          <input
            placeholder="Name"
            type="text"
            class="input"
            id="firstname"
            value={formData?.f_name}
            required
            onChange={(e) => {
              changeState('f_name', e.target.value);
            }}
          />
        </div>
        <div class="input-container ic2">
          <input
            placeholder="Email"
            type="text"
            class="input"
            id="email"
            value={formData?.email}
            required
            onChange={(e) => {
              changeState('email', e.target.value);
            }}
          />
        </div>
        <div class="input-container ic2">
          <input
            placeholder="Phone Number"
            type="text"
            class="input"
            id="phoneNumber"
            value={formData?.phone}
            required
            maxLength={10}
            minLength={10}
            onChange={(e) => {
              const numericValue = e.target.value.trim().replace(/[^0-9]/g, '');

              changeState('phone', numericValue);
            }}
            onKeyDown={(e) => {
              if (!(e.key === 'Backspace' || /\d/.test(e.key))) {
                e.preventDefault();
              }
            }}
          />
        </div>
        <div class="input-container ic2">
          <input
            placeholder="Designation"
            type="text"
            class="input"
            id="designation"
            value={formData?.designation}
            required
            onChange={(e) => {
              changeState('designation', e.target.value);
            }}
          />
        </div>
        <div class="input-container ic2">
          <input
            placeholder="Company Name"
            type="text"
            class="input"
            id="company_name"
            value={formData?.company_name}
            required
            onChange={(e) => {
              changeState('company_name', e.target.value);
            }}
          />
        </div>
        {errorMessage && <div class="text-red-500 flex mt-5 w-full items-center justify-center">{errorMessage}</div>}
        <button class="submit bg-[#0056cd] hover:scale-110" type="submit">
          submit
        </button>
      </div>
    </form>
  );
};
