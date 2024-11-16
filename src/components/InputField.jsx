import { useState } from "react"

export default function InputField(props) {

    const [isFocused, setIsFocused] = useState(false)


    return (
        <div className={`${isFocused ? "border-primary" : null} flex border p-2 w-[350px] gap-2 items-center rounded-[8px]`}>
            <div className={`${isFocused ? "text-primary" : "text-[#6B7280]"}`}>
                {props.icon}
            </div>
            <input 
                onFocus={() => setIsFocused(true)} 
                onBlur={() => setIsFocused(false)}
                className="flex-1 outline-none placeholder:text-[14px]" 
                type={props.type} 
                placeholder={props.placeholder} 
                onChange={props.onChange}
                disabled={props.disabled}
            />
        </div>
    )
}