export default function NormalInputField(props) {
  return (
    <div>
      <div className="font-semibold uppercase text-[12px] text-gray-600">
        {props.title}{" "}
        <span className="text-red-500">{props.isRequired ? "*" : null}</span>
      </div>
      <input
        onChange={props.onChange}
        type={props.type}
        disabled={props.disabled}
        placeholder={props.placeholder}
        className="border text-sm focus:border-primary duration-300 font-medium outline-none border-gray-300 p-2 w-full rounded-[4px] disabled:cursor-not-allowed"
        value={props.value}
        autoFocus={props.autoFocus}
        {...props}
      />
    </div>
  );
}
