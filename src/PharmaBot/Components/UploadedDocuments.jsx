import React, { useEffect, useState } from 'react';

const UploadedDocuments = ({ setDocumentToggle }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                let response = await fetch(import.meta.env.VITE_PHARMA_FAQ_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "s3_url": true
                    })
                });
                let data = await response.json();
                let resp = JSON.parse(data.body);
                console.log('questionsResponse', resp);
                resp = resp?.map((item, index) => {
                    return {
                        id: index + 1,
                        name: item.slice(item.lastIndexOf('/') + 1),
                        url: item
                    }
                });
                setDocuments(resp);
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        })();
    }, []);

    // const documents = [
    //     {
    //         id: 1,
    //         name: "Arvast A 75 150 10T_GKM NEW_Aug2024",
    //         url: "https://intaspharmafrontend.s3.ap-south-1.amazonaws.com/raw+excel+sheet/Arvast+A++75+150+10T_GKM+NEW_Aug2024.xlsx"
    //     },
    //     {
    //         id: 2,
    //         name: "Coltro AS 75 15T_GKM NEW_82024",
    //         url: "https://intaspharmafrontend.s3.ap-south-1.amazonaws.com/raw+excel+sheet/Coltro+AS+75+15T_GKM+NEW_82024.xlsx"
    //     },
    //     {
    //         id: 3,
    //         name: "Coltro AS150 15T_GKM NEW_Aug2024",
    //         url: "https://intaspharmafrontend.s3.ap-south-1.amazonaws.com/raw+excel+sheet/Coltro+AS150+15T_GKM+NEW_Aug2024.xlsx"
    //     }
    // ];

    // Function to generate Office Online viewer URL
    const getOfficeViewerUrl = (fileUrl) => {
        const encodedUrl = encodeURIComponent(fileUrl);
        return `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
    };

    const handleOpenDocument = (document) => {
        const viewerUrl = getOfficeViewerUrl(document.url);
        window.open(viewerUrl, '_blank');
    };

    const handleDownloadDocument = (document, e) => {
        e.stopPropagation();

        const link = document.createElement('a');
        link.href = document.url;
        link.download = document.name + '.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div
                className='fixed top-0 left-0 right-0 bottom-0 bg-black opacity-20 z-[990]'
                onClick={() => setDocumentToggle(false)}
            />
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-md shadow-lg p-6 w-full max-w-2xl z-[991]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Excel Documents</h2>
                    <button
                        onClick={() => setDocumentToggle(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4 max-h-80 overflow-y-auto">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="border rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleOpenDocument(doc)}
                        >
                            <div className="flex items-center">
                                <div className="flex-shrink-0 mr-4">
                                    <svg className="w-10 h-10 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19.5 2A1.5 1.5 0 0 1 21 3.5v17a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20.5v-17A1.5 1.5 0 0 1 4.5 2h15zm-7.5 15a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2h-5zm0-4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2h-5zm0-4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2h-5zm-4 8a1 1 0 1 0 0 2 1 1 0 1 0 0-2zm0-4a1 1 0 1 0 0 2 1 1 0 1 0 0-2zm0-4a1 1 0 1 0 0 2 1 1 0 1 0 0-2z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-800">{doc.name}</h3>
                                    <p className="text-sm text-gray-500">Excel Document (.xlsx)</p>
                                </div>
                                <div className="flex space-x-3">
                                    <span className="text-sm text-blue-600 hover:underline">View</span>
                                    <span
                                        className="text-sm text-gray-600 hover:underline"
                                        onClick={(e) => handleDownloadDocument(doc, e)}
                                    >
                                        Download
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Click on any document to view it in a new tab
                </div>
            </div>
        </>
    );
};

export default UploadedDocuments;