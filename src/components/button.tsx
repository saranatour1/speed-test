import { cn } from "../lib";

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: 'secondary' | 'primary';
  children: React.ReactNode;
}

export const Button = ({ variant = "primary", className, children, ...props }: ButtonProps) => {
  const classnames = {
    'primary': 'text-preset-3-semi-bold text-neutral-0 px-[24px] py-[16px] bg-blue-600 rounded-[12px] transition-colors hover:bg-blue-400 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-[2px] focus:ring-offset-neutral-900',
    "secondary": "text-preset-3-semi-bold text-neutral-900 rounded-[12px] px-[16px] py-[10px] bg-neutral-0 hover:bg-neutral-0/90 hover:cursor-pointer focus: "
  }
  return <button className={cn([classnames[variant],className as string])} {...props}>
    {children}
  </button>
}


export const SelectButton = (
  { children, className, ...props }: ButtonProps
) => {
  return <button className={cn(['text-preset-5 text-white border-2 border-neutral-500 rounded-8 py-1.5 px-2.5 hover:border-blue-400 hover:text-blue-400 active:border-blue-400 active:text-blue-400 focus:ring-1 focus:ring-blue-400 bg-neutral-900', className as string])} {...props}>{children}</button>
}