import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const SimpleAlert = ({ 
  type = 'info', 
  title, 
  message, 
  isVisible, 
  onClose,
  autoClose = true,
  duration = 4000 
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const alertStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-500'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500'
    }
  };

  const style = alertStyles[type];
  const IconComponent = style.icon;

  return (
    <div className={`
      fixed top-20 right-0 z-50 max-w-md w-full mx-auto
      ${style.bg} ${style.text} border rounded-lg shadow-lg p-4
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${style.iconColor}`} />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className={`inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none ${style.iconColor}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const useSimpleAlert = () => {
  const [alert, setAlert] = useState({
    isVisible: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (type, title, message, options = {}) => {
    setAlert({
      isVisible: true,
      type,
      title,
      message,
      ...options
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isVisible: false }));
  };

  const showSuccess = (title, message) => showAlert('success', title, message);
  const showError = (title, message) => showAlert('error', title, message);
  const showWarning = (title, message) => showAlert('warning', title, message);
  const showInfo = (title, message) => showAlert('info', title, message);

  return {
    alert,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    AlertComponent: () => (
      <SimpleAlert
        {...alert}
        onClose={hideAlert}
      />
    )
  };
};

export default SimpleAlert;