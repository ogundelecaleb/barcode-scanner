import { EyeSlash, Lock, Eye } from "iconsax-react";
import { useState } from "react";

export default function PasswordField(props) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function toggleVisibility() {
    setIsPasswordVisible(!isPasswordVisible);
  }

  return (
    <div
      className={`${
        isFocused ? "border-primary" : null
      } flex border p-2 max-w-[350px] gap-2 items-center rounded-[8px] w-full`}
    >
      <Lock
        size={16}
        variant="Bold"
        color={`${isFocused ? "#00B0AD" : "#6B7280"}`}
      />
      <input
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 placeholder:text-[14px]  w-full focus:outline-none focus:ring-0 focus:border-transparent"
        type={isPasswordVisible ? "text" : "password"}
        placeholder={props.placeholder}
        onChange={props.onChange}
      />
      <button onClick={toggleVisibility} type="button">
        {isPasswordVisible ? (
          <Eye size={16} color="#6B7280" />
        ) : (
          <EyeSlash size={16} color="#6B7280" />
        )}
      </button>
    </div>
  );
}
