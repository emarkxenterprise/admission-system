import React, { useState, useEffect } from 'react';

export const Dialog = ({ 
  open, 
  onOpenChange, 
  children, 
  ...props 
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onOpenChange} />
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4" {...props}>
        {children}
      </div>
    </div>
  );
};

export const DialogContent = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogHeader = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogTitle = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  );
};

export const DialogDescription = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
};

export const DialogFooter = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogTrigger = ({ 
  children, 
  asChild = false,
  ...props 
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        if (children.props.onClick) {
          children.props.onClick(e);
        }
        if (props.onClick) {
          props.onClick(e);
        }
      }
    });
  }

  return (
    <div {...props}>
      {children}
    </div>
  );
}; 