import { twMerge } from 'tailwind-merge'

export const cn = (classNames: string[] | string) => {
  return twMerge(...classNames)
}