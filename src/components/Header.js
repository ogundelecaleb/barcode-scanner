import { LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import LogOutModal from "./LogOutModal";
import Modal from "./Modal";
import { CloseSquare } from "iconsax-react";

const Header = () => {
  const navigate = useNavigate();
  const [isLogout, setIsLogout] = useState(false);
  const [details, setUserDetails] = useState(null);

useEffect(()=> {
    getUser()
    console.log("user Details====>>>>",details )
})


  async function getUser(page) {
    const response = await api.getUser()
    return setUserDetails(response);
  }
  const url = 'https://bcrx-api.careapps.net'
  return (
    <>
      <div className="flex justify-between items-center ">
      <div className="h-[30px] md:h-[45px] mr-3">
                <img
                  src={
                    details?.pharmacy?.logo_path
                      ? `${url}${details?.pharmacy?.logo_path}`
                      : "./logo.png"
                  }
                  alt=""
                  className="object-contain h-[30px] md:h-[45px] "
                />
              </div>
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => {
              setIsLogout(true);
            }}
            className="p-1 rounded-full border    "
          >
            <LogOut size={16} color="red" />
          </button>
        </div>

        <Link
          to={window.location.pathname === "/" ? "data-matrix" : "/"}
          className="px-2 py-1 rounded-lg border text-[13px]  hover:bg-[#f4f3f3]"
        >
          {window.location.pathname === "/"
            ? "Scan DataMatrix"
            : "Scan Barcode"}
        </Link>
      </div>

      <Modal isOpen={isLogout} onClose={() => setIsLogout(false)}>
        <div className="inline-block relative border border-[#D6DDEB] rounded-lg  overflow-hidden text-left align-bottom transition-all transform bg-[white]   shadow-xl sm:my-8 sm:align-middle w-full min-w-[300px] md:min-w-[360px] md:max-w-[550px] ">
          <div className="bg-[#f1f1f1] px-5 py-4 flex justify-between">
            <div className="text-[18px] font-bold select-none">Log Out</div>
            <button onClick={() => setIsLogout(false)}>
              <CloseSquare variant="Bold" />
            </button>
          </div>

          <div className="my-8 flex justify-center flex-col items-center mb-7">
            <p className="mb-3 text-[14px] text-gray-600">
              Are you sure you want to log out?
            </p>
          </div>
          <div className="px-3 mb-3 flex justify-between items-center">
            {" "}
            <button
              className="bg-[#00B0AD] font-medium shadow-sm text-[14px] py-2 px-4 text-white rounded-[4px]"
              onClick={() => setIsLogout(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red-400 font-medium shadow-sm text-[14px] py-2 px-4 text-white  rounded-[4px]"
              onClick={() => {
                api.logout();
                navigate("/login");
                setIsLogout(false);
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Header;
