import React from "react";

const Footer = () => {
  return (
    <div className="py-3 flex justify-center items-center gap-2 bg-[#fefefe]">
      <p className="text-[12px] text-gray-400">Powered by</p>
      <img
        src={"./logo.png"}
        alt=""
        className="object-contain h-[20px] md:h-[24px] "
      />
    </div>
  );
};

export default Footer;
