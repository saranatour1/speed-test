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