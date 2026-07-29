import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

export function useAutosave<T extends Record<string, any>>(
  key: string,
  form: UseFormReturn<T>,
  isSubmitted: boolean
) {
  const { watch, reset, getValues } = form;

  // Restore draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(key);
    if (draft) {
      try {
        const parsedData = JSON.parse(draft);
        reset(parsedData);
      } catch (error) {
        console.error("Failed to restore draft", error);
      }
    }
  }, [key, reset]);

  // Save to draft on change
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [key, watch]);

  // Clear draft on submit
  useEffect(() => {
    if (isSubmitted) {
      localStorage.removeItem(key);
    }
  }, [isSubmitted, key]);
}
