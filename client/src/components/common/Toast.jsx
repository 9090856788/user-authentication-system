import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearToast } from "../../features/ui/uiSlice.js";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((state) => state.ui.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dispatch(clearToast());
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type}`}>
        {toast.type === "success" && <CheckCircle2 size={18} style={{ flexShrink: 0 }} />}
        {toast.type === "error" && <AlertTriangle size={18} style={{ flexShrink: 0 }} />}
        {toast.type === "info" && <Info size={18} style={{ flexShrink: 0 }} />}
        <span style={{ flex: 1 }}>{toast.message}</span>
        <button
          onClick={() => dispatch(clearToast())}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", padding: 0 }}
          aria-label="Close toast"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
