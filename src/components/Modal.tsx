"use client";

import React, { useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import CircularProgress from "@mui/material/CircularProgress";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  fullWidth?: boolean;
  className?: string;
  preventClose?: boolean;
}

export function Modal({
  open,
  onClose,
  children,
  maxWidth = "md",
  fullWidth = true,
  className = "",
  preventClose = false,
}: ModalProps) {
  // Handle ESC key manually as backup
  useEffect(() => {
    if (!open || preventClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, preventClose]);

  return (
    <Dialog
      open={open}
      onClose={preventClose ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={preventClose}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            transition: "all 0.2s ease-in-out",
          },
        },
      }}
      PaperProps={{
        sx: {
          bgcolor: "var(--surface)",
          color: "var(--text)",
          borderRadius: "20px",
          border: "1px solid var(--surface-border)",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.05)",
          backgroundImage: "none",
          overflow: "hidden",
          margin: { xs: 2, sm: 3 },
          transition: "transform 0.2s ease, opacity 0.2s ease",
        },
        className: `flex flex-col ${className}`,
      }}
    >
      {children}
    </Dialog>
  );
}

export interface ModalHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  iconVariant?: "purple" | "danger" | "warning" | "emerald" | "blue" | "neutral";
  onClose?: () => void;
  closeDisabled?: boolean;
  actions?: React.ReactNode;
  border?: boolean;
  className?: string;
}

export function ModalHeader({
  title,
  subtitle,
  icon,
  iconVariant = "purple",
  onClose,
  closeDisabled = false,
  actions,
  border = true,
  className = "",
}: ModalHeaderProps) {
  const iconBgClasses = {
    purple: "bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/50",
    danger: "bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-800/50",
    warning: "bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50",
    emerald: "bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50",
    blue: "bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50",
    neutral: "bg-gray-100 dark:bg-gray-800 text-[var(--text)] border border-[var(--surface-border)]",
  };

  return (
    <div
      className={`px-6 py-5 flex items-start justify-between gap-4 select-none ${
        border ? "border-b border-[var(--surface-border)]" : ""
      } ${className}`}
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
              iconBgClasses[iconVariant]
            }`}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight leading-snug truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function ModalBody({
  children,
  className = "",
  noPadding = false,
}: ModalBodyProps) {
  return (
    <div
      className={`flex-1 overflow-y-auto overscroll-contain ${
        noPadding ? "" : "px-6 py-5"
      } ${className}`}
      style={{ maxHeight: "calc(86vh - 140px)" }}
    >
      {children}
    </div>
  );
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export function ModalFooter({
  children,
  className = "",
  border = true,
}: ModalFooterProps) {
  return (
    <div
      className={`px-6 py-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 ${
        border ? "border-t border-[var(--surface-border)]" : ""
      } bg-[var(--surface)] ${className}`}
    >
      {children}
    </div>
  );
}

export interface ModalButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function ModalButton({
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  children,
  className = "",
  icon,
}: ModalButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] shrink-0";

  const variantClasses = {
    primary:
      "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white shadow-xs hover:shadow-md hover:shadow-purple-500/20",
    secondary:
      "bg-[var(--surface-hover)] border border-[var(--surface-border)] text-[var(--text)] hover:bg-[var(--surface-border)] hover:text-[var(--text)]",
    danger:
      "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs hover:shadow-md hover:shadow-red-500/20",
    ghost:
      "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? (
        <>
          <CircularProgress
            size={16}
            sx={{
              color:
                variant === "secondary" || variant === "ghost"
                  ? "var(--text)"
                  : "#ffffff",
            }}
          />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  itemName?: string;
  warningNote?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  loading?: boolean;
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  warningNote,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const iconConfig = {
    danger: {
      color: "danger" as const,
      svg: (
        <svg
          className="w-5 h-5 text-red-600 dark:text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      buttonVariant: "danger" as const,
    },
    warning: {
      color: "warning" as const,
      svg: (
        <svg
          className="w-5 h-5 text-amber-600 dark:text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
      buttonVariant: "danger" as const,
    },
    primary: {
      color: "purple" as const,
      svg: (
        <svg
          className="w-5 h-5 text-purple-600 dark:text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      buttonVariant: "primary" as const,
    },
  };

  const currentConfig = iconConfig[variant];

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      preventClose={loading}
    >
      <ModalHeader
        title={title}
        icon={currentConfig.svg}
        iconVariant={currentConfig.color}
        onClose={onClose}
        closeDisabled={loading}
        border={false}
      />

      <ModalBody noPadding className="px-6 pb-2">
        {description && (
          <div className="text-sm text-[var(--muted)] leading-relaxed mb-3">
            {description}
          </div>
        )}

        {itemName && (
          <div className="p-3 mb-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--surface-border)] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="font-semibold text-sm text-[var(--text)] truncate">
              {itemName}
            </span>
          </div>
        )}

        {warningNote && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 leading-relaxed space-y-1">
            {warningNote}
          </div>
        )}
      </ModalBody>

      <ModalFooter border={false} className="pt-3 pb-5">
        <ModalButton
          variant="secondary"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {cancelText}
        </ModalButton>
        <ModalButton
          variant={currentConfig.buttonVariant}
          onClick={onConfirm}
          loading={loading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
}
