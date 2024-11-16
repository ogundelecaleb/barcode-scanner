export default function NormalSelectInputField(props) {
  const values = props.values;
  return (
    <div>
      <div className="font-semibold uppercase text-[12px] text-gray-600">
        {props.title}{" "}
        <span className="text-red-500">{props.isRequired ? "*" : null}</span>
      </div>
      <select
        onChange={props.onChange}
        value={props.value}
        className="border text-sm border-gray-300 focus:border-primary duration-300 bg-inherit p-2 w-full rounded-[4px] font-medium"
        disabled={props.disabled}
      >
        {!props.noEmpty && <option value="">--Select--</option>}
        {values.map((item, index) =>
          item?.value ? (
            <option key={index} value={item.value} className="block">
              {item.label}
            </option>
          ) : (
            <option key={index} value={item} className="block">
              {item}
            </option>
          )
        )}
      </select>
    </div>
  );
}
