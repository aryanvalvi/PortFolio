import React from "react"
import {cn} from "../../lib/utils"

const Container = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div
      className={cn("max-w-6xl mx-auto bg-white dark:bg-[#171717] ", className)}
    >
      {children}
    </div>
  )
}

export default Container
