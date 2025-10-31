export interface Dealer {
    dealerId: number;
    dealerName: string;
    dealerLocation: string;
    dealerEmailAddress: string;
    dealerPhoneNumber: string;
}

export interface Farmer {
    farmerId: number;
    farmerName: string;
    emailAddressFarmer: string;
    farmerPhoneNumber: string;
    farmerLocation: string;
    farmerBankAccount: string;
    farmerIFSCCode: string;
    farmerAadharNumber: string;
    isFarmerIdActive: boolean;
    isVerified: boolean;
    subscriberCount: number;
}

export interface Crop {
    cropId: number;
    cropName: string;
    cropType: string;
    quantityInKg: number;
    location: string;
    pricePerUnit: number;
}

export interface CropPurchase {
    purchaseId: number;
    dealerId: number;
    cropId: number;
    quantityRequested: number;
    requestedAt: Date;
    isConfirmed: boolean;
    rating?: number;
    reviewText?: string;
    reviewDate?: Date;
    hasBeenReviewed: boolean;
    crop?: Crop;
    dealer?: Dealer;
}

export interface Payment {
  paymentId: number;
  farmerId: number;
  dealerId: number;
  cropId: number;
  purchaseId: number;
  amount: number;
  transactionDate: Date;
  transactionStatus: string;
  canBeReviewed: boolean;
}
