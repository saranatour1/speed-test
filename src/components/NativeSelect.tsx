import * as React from "react"
import { cn } from "../lib"


function NativeSelect({
  className,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & { size?: "sm" | "default" }) {
  return (
    <div
      className="group/native-select relative w-fit has-[select:disabled]:opacity-50 max-sm:w-full text-center"
      data-slot="native-select-wrapper"
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn([
          "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:hover:bg-input/50 h-9 w-full min-w-0 appearance-none rounded-md border bg-transparent px-3 py-2 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-8 data-[size=sm]:py-1",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className as string]
        )}
        {...props}
      />
      <svg width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 opacity-50 select-none"

        data-slot="native-select-icon">
        <path d="M4.74219 5.83594L0.117188 1.24219C-0.0390625 1.11719 -0.0390625 0.867188 0.117188 0.710938L0.742188 0.117188C0.898438 -0.0390625 1.11719 -0.0390625 1.27344 0.117188L5.02344 3.80469L8.74219 0.117188C8.89844 -0.0390625 9.14844 -0.0390625 9.27344 0.117188L9.89844 0.710938C10.0547 0.867188 10.0547 1.11719 9.89844 1.24219L5.27344 5.83594C5.11719 5.99219 4.89844 5.99219 4.74219 5.83594Z" fill="white" />
      </svg>
    </div>
  )
}

function NativeSelectOption({ ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn(className as string)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
