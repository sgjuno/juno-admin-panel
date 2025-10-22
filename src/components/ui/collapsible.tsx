"use client"

import * as React from "react"

interface CollapsibleProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

interface CollapsibleTriggerProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  open = false,
  onOpenChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleToggle = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onOpenChange?.(newState)
  }

  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === CollapsibleTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onClick: () => {
                handleToggle()
                child.props.onClick?.()
              }
            })
          }
          if (child.type === CollapsibleContent) {
            return isOpen ? child : null
          }
        }
        return child
      })}
    </div>
  )
}

const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  children,
  onClick,
  className = ""
}) => {
  return (
    <div onClick={onClick} className={`cursor-pointer ${className}`}>
      {children}
    </div>
  )
}

const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  className = ""
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
}