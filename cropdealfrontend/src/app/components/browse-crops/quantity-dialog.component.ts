import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-quantity-dialog',
  templateUrl: './quantity-dialog.component.html',
  styleUrls: ['./quantity-dialog.component.css']
})
export class QuantityDialogComponent {
  quantityForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<QuantityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { maxQuantity: number }
  ) {
    this.quantityForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(this.data.maxQuantity)]]
    });
  }

  confirm(): void {
    if (this.quantityForm.valid) {
      this.dialogRef.close(this.quantityForm.value.quantity);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
