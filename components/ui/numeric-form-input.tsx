"use client";

import { useEffect, useState } from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import {
  formatNumericFieldDisplay,
  parseNumericInputString,
  sanitizeNumericInput,
  shouldClearNumericOnFocus,
} from "@/lib/client/numeric-input";
import { cn } from "@/lib/utils";

interface NumericFormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  id?: string;
  className?: string;
  inputMode?: "decimal" | "numeric";
  placeholder?: string;
  /** Vide le champ au focus si la valeur actuelle correspond (0 = PU HT, 1 = Qté) */
  clearOnFocusValue?: number;
  /** Valeur au blur si vide + affichage par défaut */
  emptyValue?: number;
  allowDecimal?: boolean;
}

export function NumericFormInput<T extends FieldValues>({
  control,
  name,
  id,
  className,
  inputMode = "decimal",
  placeholder = "0",
  clearOnFocusValue = 0,
  emptyValue = 0,
  allowDecimal = true,
}: NumericFormInputProps<T>) {
  const { field } = useController({ control, name });
  const emptyDisplay = String(emptyValue);
  const [isFocused, setIsFocused] = useState(false);
  const [editValue, setEditValue] = useState(() =>
    formatNumericFieldDisplay(
      field.value as number | undefined | null,
      emptyDisplay,
    ),
  );

  useEffect(() => {
    if (!isFocused) {
      setEditValue(
        formatNumericFieldDisplay(
          field.value as number | undefined | null,
          emptyDisplay,
        ),
      );
    }
  }, [field.value, isFocused, emptyDisplay]);

  const displayValue = isFocused
    ? editValue
    : formatNumericFieldDisplay(
        field.value as number | undefined | null,
        emptyDisplay,
      );

  function commitValue(raw: string) {
    const cleaned = sanitizeNumericInput(raw, allowDecimal);
    const parsed = parseNumericInputString(cleaned);
    if (parsed !== undefined) {
      field.onChange(parsed);
      return;
    }
    field.onChange(emptyValue);
  }

  return (
    <Input
      id={id}
      type="text"
      inputMode={inputMode}
      placeholder={placeholder}
      className={cn(className)}
      value={displayValue}
      onFocus={() => {
        setIsFocused(true);
        const current = formatNumericFieldDisplay(
          field.value as number | undefined | null,
          emptyDisplay,
        );
        if (
          shouldClearNumericOnFocus(
            field.value as number | undefined | null,
            clearOnFocusValue,
          )
        ) {
          setEditValue("");
        } else {
          setEditValue(current);
        }
      }}
      onBlur={() => {
        setIsFocused(false);
        const cleaned = sanitizeNumericInput(editValue, allowDecimal);
        if (cleaned === "" || cleaned === ".") {
          field.onChange(emptyValue);
          setEditValue(formatNumericFieldDisplay(emptyValue, emptyDisplay));
          field.onBlur();
          return;
        }
        commitValue(cleaned);
        setEditValue(
          formatNumericFieldDisplay(
            field.value as number | undefined | null,
            emptyDisplay,
          ),
        );
        field.onBlur();
      }}
      onChange={(e) => {
        const cleaned = sanitizeNumericInput(e.target.value, allowDecimal);
        setEditValue(cleaned);
        if (cleaned === "" || cleaned === ".") {
          field.onChange(emptyValue);
          return;
        }
        const parsed = parseNumericInputString(cleaned);
        if (parsed !== undefined) {
          field.onChange(parsed);
        }
      }}
    />
  );
}
