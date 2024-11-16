import { ClipLoader } from "react-spinners";

export default function AuthButton(props) {
  return (
    <button
      className="bg-[#000] py-3 disabled:cursor-not-allowed disabled:bg-primary-light disabled:text-primary shadow-md font-semibold flex items-center justify-center text-white rounded-[8px] text-[14px]"
      type={props.type}
      disabled={props.disabled}
    >
      {props.isLoading ? <ClipLoader color="white" /> : props.title}
    </button>
  );
}
