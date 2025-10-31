import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-review-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Write Review</h2>
    <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <div class="review-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Rating (1-5)</mat-label>
            <input matInput type="number" min="1" max="5" formControlName="rating">
            <mat-error *ngIf="reviewForm.get('rating')?.hasError('required')">Rating is required</mat-error>
            <mat-error *ngIf="reviewForm.get('rating')?.hasError('min') || reviewForm.get('rating')?.hasError('max')">
              Rating must be between 1 and 5
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Review</mat-label>
            <textarea matInput rows="4" formControlName="review"></textarea>
            <mat-error *ngIf="reviewForm.get('review')?.hasError('required')">Review is required</mat-error>
            <mat-error *ngIf="reviewForm.get('review')?.hasError('minlength')">
              Review must be at least 10 characters
            </mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="primary" type="submit" [disabled]="!reviewForm.valid">
          Submit Review
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .review-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class ReviewDialogComponent {
  reviewForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { purchase: any },
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      rating: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      review: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      this.dialogRef.close(this.reviewForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
