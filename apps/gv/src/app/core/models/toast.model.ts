export const TOAST_TYPES = {
  error: 'error',
  success: 'success',
} as const;
type ObjectValues<T> = T[keyof T];
type ToastTypes = ObjectValues<typeof TOAST_TYPES>;

export interface ToastData {
  content: string;
  progressWidth?: string;
  show?: boolean;
  title: string;
  type?: ToastTypes;
}
