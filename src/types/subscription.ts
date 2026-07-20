export type SubscriptionCategory = 'Software' | 'AI' | 'Domain' | 'Hosting' | 'Cloud' | 'Email' | 'Marketing' | 'Finance' | 'Security' | 'Productivity' | 'Communication' | 'Storage' | 'API' | 'Other';
export type SubscriptionType = 'Monthly' | 'Quarterly' | 'Semi Annual' | 'Annual' | 'Lifetime' | 'One-Time';
export type SubscriptionStatus = 'Active' | 'Trial' | 'Cancelled' | 'Expired' | 'Suspended';
export type PaymentMethodCardType = 'Visa' | 'Mastercard' | 'American Express' | 'Virtual Card' | 'Debit Card' | 'Credit Card' | 'Bank Transfer' | 'Mobile Money' | 'PayPal' | 'Stripe' | 'Other';
export type BankType = 'Commercial' | 'Mobile Money' | 'Virtual Bank' | 'Digital Wallet';

export interface SubscriptionRecord {
  id: string;
  userId: string;
  
  // Basic Information
  platformName: string;
  vendorName?: string;
  category: SubscriptionCategory;
  websiteUrl?: string;
  loginUrl?: string;
  description?: string;
  notes?: string;
  department?: string;
  businessUnit?: string;
  owner?: string;

  // Subscription Details
  subscriptionType: SubscriptionType;
  planName?: string;
  seats?: number;
  costPerSeat?: number;
  totalCost: number;
  currency: string;
  tax?: number;
  discount?: number;
  billingCycle: string;
  autoRenewal: boolean;
  status: SubscriptionStatus;

  // Payment Information
  paymentMethod?: string;
  cardType?: PaymentMethodCardType;
  cardNickname?: string;
  last4Digits?: string;
  cardHolderName?: string;
  bankName?: string;
  bankType?: BankType;
  paymentEmail?: string;
  billingEmail?: string;
  invoiceEmail?: string;
  paymentReference?: string;
  transactionId?: string;
  paymentReason?: string;
  invoiceNumber?: string;
  purchaseOrderNumber?: string;

  // Renewal Information
  purchaseDate?: string;
  activationDate?: string;
  renewalDate?: string;
  expiryDate?: string;
  gracePeriodDays?: number;
  nextBillingDate?: string;
  cancellationDate?: string;
  lastPaymentDate?: string;
  reminderSchedule?: ('90' | '60' | '30' | '15' | '7' | '3' | '1')[];

  // Vendor Information
  vendorContactPerson?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  vendorWebsite?: string;
  vendorCountry?: string;
  vendorSupportEmail?: string;
  vendorSupportPortal?: string;
  vendorCustomerId?: string;
  vendorAccountId?: string;

  // Account Information
  accountUsername?: string;
  accountRegisteredEmail?: string;
  workspaceName?: string;
  organizationName?: string;
  licenseKey?: string;
  apiKeyReference?: string;
  authenticationType?: string;
  mfaEnabled?: boolean;

  createdAt: string;
  updatedAt: string;
}
