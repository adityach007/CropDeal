import { Component } from '@angular/core';

@Component({
  selector: 'app-dealer-dashboard',
  templateUrl: './dealer-dashboard.component.html',
  styleUrls: ['../components/dealer-dashboard/dealer-dashboard.component.css']
})
export class DealerDashboardComponent {
  showPurchaseRequestForm = false;

  openPurchaseRequestForm() {
    this.showPurchaseRequestForm = true;
  }
}
