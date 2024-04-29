import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractTitles(content: string) {
  const titles = []
  const regex = /<h(\d)>(.*?)<\/h\1>/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const title = match[2]
    titles.push({ level, title })
  }
  return titles
}
