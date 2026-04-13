import React, { useEffect, useRef, useState } from 'react'
import Tabulator from "tabulator-tables";
import { createIcons, icons } from "lucide";
import { ChevronDown, ExternalLink, FileText, Sheet } from 'lucide-react'
import * as XLSX from 'xlsx';
import { capitalizeWord } from '../helpers';
import './botstyles.css';

const ResponseTable = ({ tableData, responseQuery, type }) => {
    const tableRef = useRef();
    const tabulator = useRef();
    const exportRef = useRef();

    const [fileToggle, setFileToggle] = useState(false);

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const totalRecords = tableData.length;
    const totalPages = Math.ceil(totalRecords / pageSize);
    const [showSqlQuery, setShowSqlQuery] = useState(false);

    useEffect(() => {
        window.XLSX = XLSX;
    }, []);

    const getPageNumbers = () => {
        const maxVisiblePages = 3;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = startPage + maxVisiblePages - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    };

    const paginatedData = tableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const generateColumns = () => {
        if (tableData.length === 0) return [];
        const firstData = tableData[0];
        return Object.keys(firstData).map((key) => ({
            title: capitalizeWord(key),
            field: key,
            headerFilter: "input",
            headerFilterPlaceholder: `Filter ${capitalizeWord(key)}`,
            hozAlign: "left",
            headerHozAlign: "center",
            minWidth: Object.keys(firstData).length > 3 ? 300 : 400,
            widthGrow: 1,
            resizable: true,
        }));
    };

    const initTabulator = () => {
        if (tabulator.current) {
            tabulator.current.destroy();
        }

        tabulator.current = new Tabulator(tableRef.current, {
            data: paginatedData,
            columns: generateColumns(),
            layout: "fitDataTable",
            responsiveLayout: false,
            placeholder: "No matching records found",
            movableRows: true,
            movableColumns: true,
            resizableColumns: true,
            resizableRows: true,
            tooltips: true,
            tooltipGenerationMode: "hover",
            renderComplete() {
                createIcons({ icons, "stroke-width": 1.5, nameAttr: "data-lucide" });
            },
        });
        tableRef.current.classList.add("custom-tabulator");
    };

    useEffect(() => {
        if (tableData.length > 0) {
            initTabulator();
        }

        return () => {
            if (tabulator.current) {
                tabulator.current.destroy();
            }
        };
    }, [paginatedData]);

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    const pageNumbers = getPageNumbers();

    useEffect(() => {
        window.addEventListener('mousedown', (e) => {
          if (exportRef.current && !exportRef.current.contains(e.target)) {
            setFileToggle(false);
          }
        })
    
        return () => {
          window.removeEventListener('mousedown', (e) => {
            if (exportRef.current && !exportRef.current.contains(e.target)) {
              setFileToggle(false);
            }
          })
        }
      }, [])

    return (
        <>
            <div className="mb-3 w-full">
                <div className="flex items-center gap-3">
                    <div ref={exportRef} className="w-fit relative">
                        <ExternalLink onClick={() => setFileToggle(prev => !prev)} className='cursor-pointer' size={18} />
                        {fileToggle && <div className="absolute z-[990] bg-white p-1 rounded-md shadow-2xl w-[100px]">
                            <div onClick={() => { tabulator.current.download("xlsx", "data_export.xlsx", { sheetname: "My Table Data" }); setFileToggle(false); }} className="p-2 flex items-center gap-1 cursor-pointer hover:bg-gray-200"><Sheet size={15} /> Excel</div>
                            <div onClick={() => { tabulator.current.download('csv', "data.csv"); setFileToggle(false); }} className="p-2 flex items-center gap-1 cursor-pointer hover:bg-gray-200"><FileText size={15} /> CSV</div>
                        </div>}
                    </div>
                    {type === 'bot' && <div className="">
                        <span
                            onClick={() => setShowSqlQuery(prev => !prev)}
                            className='text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium text-sm flex items-center gap-1.5 bg-indigo-50 px-4 py-2 rounded-lg transition-colors duration-200'
                        >
                            <span>Query</span>
                            <ChevronDown
                                size={18}
                                className={`transform transition-transform duration-200 ${showSqlQuery ? 'rotate-180' : ''}`}
                            />
                        </span>
                    </div>}
                </div>
                {showSqlQuery && (
                    <div className="mt-4 bg-white p-6 rounded-xl border border-gray-100 ">
                        <pre className="text-sm  text-gray-700 font-mono whitespace-pre-wrap">
                            {responseQuery}
                        </pre>
                    </div>
                )}
            </div>
            <div className="w-full overflow-x-auto">
                <div
                    ref={tableRef}
                    className=''
                />
            </div>
            <div className={`flex rounded-b-md bg-[#e8e8e8]   justify-between items-center p-4  ${Object.keys(tableData[0]).length === 1 ? 'flex-col gap-3 ' : 'flex-col md:flex-row'}`}>
                <div className="flex flex-col md:flex-row items-center gap-4 ">
                    <span className=''>Total Records: {totalRecords}</span>
                    <div className="flex items-center">
                        <span className="mr-5 block">Page Size</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border rounded px-2 py-1 w-[80px]"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center mt-3 md:mt-0">
                    <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="border px-3 py-1 mx-1 bg-white hover:bg-gray-200 disabled:opacity-50"
                    >
                        First
                    </button>
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="border px-3 py-1 mx-1 bg-white hover:bg-gray-200 disabled:opacity-50"
                    >
                        Prev
                    </button>

                    {pageNumbers.map(number => (
                        <button
                            key={number}
                            onClick={() => goToPage(number)}
                            className={`border px-2 py-1 mx-1  rounded-[4px] ${currentPage === number
                                ? 'bg-red-200 text-black'
                                : 'bg-white hover:bg-gray-200'
                                }`}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="border px-3 py-1 mx-1 bg-white hover:bg-gray-200 disabled:opacity-50"
                    >
                        Next
                    </button>
                    <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="border px-3 py-1 mx-1 bg-white hover:bg-gray-200 disabled:opacity-50"
                    >
                        Last
                    </button>
                </div>
            </div>
        </>
    )
}

export default ResponseTable
