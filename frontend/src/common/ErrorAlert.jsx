// components/ErrorAlert.jsx
import { useEffect, useState } from "react";
import { MdErrorOutline } from "react-icons/md";

export default function ErrorAlert({ error, onClear }) {
  const [visibleError, setVisibleError] = useState(null);
  const [doAlertAnimate, setDoAlertAnimate] = useState(false);

  useEffect(() => {
    if (error) {
      setVisibleError(error);
      setTimeout(() => setDoAlertAnimate(true), 1);

      const timer = setTimeout(() => {
        setDoAlertAnimate(false);
        const hideTimer = setTimeout(() => {
          setVisibleError(null);
          if (onClear) onClear();
        }, 300);
        return () => clearTimeout(hideTimer);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setDoAlertAnimate(false);
      }, 3000);
    }
  }, [error, onClear]);

  if (!visibleError) {
    return null;
  }
  return (
    <div
      role="alert"
      className={`
        alert alert-error fixed bottom-4 left-1/2 w-auto max-w-sm z-50 flex items-center gap-2
        transform transition-all duration-300
        ${
          doAlertAnimate
            ? "translate-x-[-50%] translate-y-0"
            : "translate-x-[-50%] translate-y-32"
        }
      `}
    >
      <MdErrorOutline className="text-lg" />
      <span>{visibleError}</span>
    </div>
  );
}
