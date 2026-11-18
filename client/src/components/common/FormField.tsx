import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const FormField = ({
    label, error, id, ...props
}: FormFieldProps) => {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
            <input id={id} {...props} className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 ${error
                    ? "border-red-400 focus:border-red-500"
                    : "border-slate-200 focus:border-blue-500"
                }`} />

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    )
}

export default FormField;