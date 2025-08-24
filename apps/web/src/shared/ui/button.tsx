import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  asChild = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent",
    outline:
      "border border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground",
  };

  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-11 px-8",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (asChild) {
    return React.cloneElement(
      children as React.ReactElement,
      {
        className: classes,
        ...props,
      } as any
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
