import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Button } from './button';

export const AlertDialog = ({ 
  open, 
  onOpenChange, 
  children, 
  ...props 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {children}
    </Dialog>
  );
};

export const AlertDialogContent = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <DialogContent className={className} {...props}>
      {children}
    </DialogContent>
  );
};

export const AlertDialogHeader = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <DialogHeader className={className} {...props}>
      {children}
    </DialogHeader>
  );
};

export const AlertDialogTitle = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <DialogTitle className={className} {...props}>
      {children}
    </DialogTitle>
  );
};

export const AlertDialogDescription = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <DialogDescription className={className} {...props}>
      {children}
    </DialogDescription>
  );
};

export const AlertDialogFooter = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <DialogFooter className={className} {...props}>
      {children}
    </DialogFooter>
  );
};

export const AlertDialogAction = ({ 
  children, 
  variant = 'default',
  ...props 
}) => {
  return (
    <Button variant={variant} {...props}>
      {children}
    </Button>
  );
};

export const AlertDialogCancel = ({ 
  children = 'Cancel', 
  ...props 
}) => {
  return (
    <Button variant="outline" {...props}>
      {children}
    </Button>
  );
};

export const AlertDialogTrigger = ({ 
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