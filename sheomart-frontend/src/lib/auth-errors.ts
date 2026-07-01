import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

interface BackendErrorEntry {
  field?: string;
  message?: string;
}

interface BackendErrorResponse {
  message?: string;
  errors?: BackendErrorEntry[];
}

export function getApiErrorMessage(error: unknown): string {
  const response = (error as { response?: { data?: BackendErrorResponse } })?.response?.data;
  if (response?.errors?.[0]?.message) {
    return response.errors[0].message;
  }

  return response?.message || (error as Error)?.message || "Request failed";
}

export function applyServerErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  error: unknown,
  fallbackField?: Path<TFieldValues>
) {
  const response = (error as { response?: { data?: BackendErrorResponse } })?.response?.data;
  const errors = response?.errors;

  if (Array.isArray(errors)) {
    errors.forEach((entry) => {
      if (entry.field) {
        setError(entry.field as Path<TFieldValues>, {
          type: "server",
          message: entry.message || "Validation failed",
        });
      }
    });

    return true;
  }

  if (fallbackField) {
    setError(fallbackField, {
      type: "server",
      message: getApiErrorMessage(error),
    });
  }

  return false;
}
