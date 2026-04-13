// CategorySideBar.jsx
// Sidebar with exactly 3 fixed industry filters:
//   • All
//   • BFSI/FSI/FinTech
//   • Manufacturing & Energy
//
// The `categories` prop is still accepted (for flexibility), but the sidebar
// will only ever display the three items defined here.

import { FIXED_INDUSTRIES } from "../../views/Dashboard";

const CategorySidebar = ({ selectedCategories, onCategoryToggle, onClose }) => {
  return (
    <div className="w-full md:w-64 bg-white dark:bg-darkmode-800 border-r border-slate-200 dark:border-darkmode-400 h-full overflow-y-auto scroll-smooth rounded-lg lg:rounded-lg ml-0 md:ml-3 mt-5">
      <div className="pl-6 pr-4 pt-5 h-full flex flex-col">

        {/* Mobile header */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Industry</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Desktop header */}
        <div className="mt-4 hidden lg:block">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Industry</h3>
        </div>

        {/* Fixed category list */}
        <div
          className="flex-1 overflow-y-auto scroll-smooth pb-12 pr-2 mb-12"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <ul className="space-y-2">
            {FIXED_INDUSTRIES.map((category) => (
              <li key={category.id}>
                <div className="flex items-center py-2 w-full rounded-md text-sm hover:bg-slate-100 dark:hover:bg-darkmode-600">
                  <label className="flex items-center flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => onCategoryToggle(category.id)}
                      className="form-check-input mr-3 ml-3"
                    />
                    <span className="text-slate-600 dark:text-slate-400">{category.name}</span>
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;
