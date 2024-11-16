import Spinner from "../spinners/Spinner";

export default function PrimaryAddButton(props) {
  return (
    <button
      disabled={props.disabled}
      onClick={props.onClick}
      type={props.type}
      className={`cursor-pointer ${props.bg ? props.bg : 'bg-primary'} text-white disabled:cursor-not-allowed disabled:opacity-50 min-w-[200px] flex justify-center items-center py-3 px-3 shadow-sm rounded-[4px] font-semibold text-[14px]`}
    >
      {props.isLoading ? (
        <span className="px-10 block">
          <Spinner color={props.color} />
        </span>
      ) : (
        props.title
      )}
    </button>
  );
}
