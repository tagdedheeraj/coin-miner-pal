
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Edit } from 'lucide-react';

interface EditableFieldProps {
  value: number;
  isEditing: boolean;
  editValue: string;
  onEditStart: () => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onEditCancel: () => void;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  isEditing,
  editValue,
  onEditStart,
  onEditChange,
  onEditSave,
  onEditCancel
}) => {
  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input 
          type="number" 
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          className="w-24"
          autoFocus
        />
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onEditSave}
          className="text-green-500 hover:text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onEditCancel}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span>{value}</span>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onEditStart}
        className="opacity-50 hover:opacity-100"
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default EditableField;
