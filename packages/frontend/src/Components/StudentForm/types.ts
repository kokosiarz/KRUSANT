export interface StudentFormData {
  name: string;
  email: string;
  phone?: string;
  customRate?: number;
  discount?: number;
  semester: string;
  extraNotes: string;
  active: boolean;
}

export interface StudentFormProps {
  open: boolean;
  studentId: number | undefined;
  onClose: () => void;
  onSuccess?: () => void;
}
