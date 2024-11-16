/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { CloseSquare } from "iconsax-react";
import React from "react";

const LogOutModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <>
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } fixed min-w-[400px] w-[600px] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-40 bg-white overflow-y-scroll scrollbar-hide rounded-md`}
      >
        <div className="sticky left-0 right-0 top-0">
          <div className="bg-[#f1f1f1] px-5 py-4 flex justify-between">
            <div className="text-[18px] font-bold select-none">Log Out</div>
            <button onClick={onClose}>
              <CloseSquare variant="Bold" />
            </button>
          </div>

          <div className="my-8 flex justify-center flex-col items-center mb-7">
            <p className="mb-3 text-[14px] text-gray-400">
              Are you sure you want to log out?
            </p>
          </div>
          <div>
            {" "}
            <button
              className="bg-[#00B0AD] font-medium shadow-sm text-[14px] py-2 px-4 text-white rounded-[4px]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="bg-red-400 font-medium shadow-sm text-[14px] py-2 px-4 text-white  rounded-[4px]"
              onClick={() => onConfirm()}
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="fixed z-20 inset-0 bg-[rgba(0,0,0,.2)]"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default LogOutModal;
