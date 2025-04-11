
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeletePlanDialogProps {
  planToDelete: string | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const DeletePlanDialog: React.FC<DeletePlanDialogProps> = ({
  planToDelete,
  onClose,
  onConfirm
}) => {
  return (
    <AlertDialog open={!!planToDelete} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>क्या आप वाकई इस योजना को हटाना चाहते हैं?</AlertDialogTitle>
          <AlertDialogDescription>
            यह क्रिया अपरिवर्तनीय है। योजना के सभी डेटा स्थायी रूप से हटा दिए जाएंगे।
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>रद्द करें</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            हां, हटाएं
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeletePlanDialog;
