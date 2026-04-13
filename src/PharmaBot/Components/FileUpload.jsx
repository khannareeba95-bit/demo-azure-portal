import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { baseURL } from '../helpers';

const FileUpload = ({ setFileUploadToggle }) => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [loader, setLoader] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
 

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const uploadedFile = e.dataTransfer.files[0];
            if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
                setFile(uploadedFile);
            } else {
                alert('Only Excel files are supported');
            }
        }
    };

    const handleBrowse = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const uploadedFile = e.target.files[0];
            if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
                setFile(uploadedFile);
            } else {
                alert('Only Excel files are supported');
            }
        }
    };

    const handleCancel = () => {
        setFileUploadToggle(false);
    };

    const handleUpload = async () => {
        if (file) {
            setLoader(true);
            setUploadStatus(null);
            try {
                const data = {
                    "getPresignedUrl": true,
                    "filename": file.name
                };
                
                const response = await fetch(baseURL, {
                    method: "POST",
                    body: JSON.stringify(data),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const presignedUrl = await response.json();
                console.log('getPresignedUrl', presignedUrl);

                await fetch(presignedUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    }
                });

                setUploadStatus('success');
                
                setTimeout(() => {
                    setFile(null);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                    setFileUploadToggle(false);
                }, 2000);

            } catch (error) {
                console.log('errorUpload', error);
                setUploadStatus('error');
            } finally {
                setLoader(false);
            }
        }
    };

    return (
        <>
            <div onClick={() => setFileUploadToggle(false)} className='fixed top-0 left-0 right-0 bottom-0 bg-black opacity-20' />
            <div className="flex rounded-md fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] items-center justify-center w-[400px] bg-gray-100">
                <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
                    {uploadStatus === 'success' ? (
                        <div className="py-6 flex flex-col items-center justify-center text-center">
                            <CheckCircle className="text-green-500 mb-3" size={48} />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Successful!</h3>
                            <p className="text-gray-500">Your file has been uploaded successfully.</p>
                        </div>
                    ) : uploadStatus === 'error' ? (
                        <div className="py-6 flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="text-red-500 mb-3" size={48} />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Upload Failed</h3>
                            <p className="text-gray-500 mb-4">There was a problem uploading your file. Please try again.</p>
                            <button 
                                onClick={() => setUploadStatus(null)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <>
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 mb-4 flex flex-col items-center justify-center cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-blue-300'}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleBrowse}
                            >
                                <Upload className="text-blue-500 mb-4" size={32} />

                                <p className="text-gray-600 text-center">
                                    Drag and drop files here or {' '}
                                    <span className="text-blue-500 font-medium">Browse</span>
                                </p>

                                <p className="text-gray-400 text-sm mt-2">Supported Files: Excel files</p>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                />
                            </div>

                            <div>
                                {file && (
                                    <div className="max-h-40 overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
                                        <div className="flex items-center justify-between bg-gray-200 p-2.5 rounded-lg mb-2 group transition-colors duration-200">
                                            <span className="text-sm text-gray-600 truncate max-w-[80%] group-hover:text-gray-700">{file.name}</span>
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFile(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors duration-200"
                                            >
                                                <X size={16} />
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2">
                                <div
                                    onClick={handleCancel}
                                    className="px-4 cursor-pointer py-2 bg-gray-200 text-gray-600 rounded-sm hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </div>
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || loader}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-sm hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow"
                                >
                                    {loader ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload Files'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </>
    );
};

export default FileUpload;