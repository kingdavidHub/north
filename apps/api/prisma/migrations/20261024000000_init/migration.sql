-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('MAIN', 'SAVINGS', 'VIRTUAL', 'WALLET', 'SETTLEMENT');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'FROZEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('DEBIT', 'VIRTUAL', 'TRAVEL');

-- CreateEnum
CREATE TYPE "CardBrand" AS ENUM ('VISA', 'MASTERCARD', 'VERVE');

-- CreateEnum
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'FROZEN', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'CARD_PAYMENT', 'BILL_PAYMENT', 'AIRTIME', 'REFUND', 'FEE', 'REVERSAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LedgerEntryDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "AccountHoldStatus" AS ENUM ('ACTIVE', 'RELEASED', 'CAPTURED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('BANK_ACCOUNT', 'NORTH_USER');

-- CreateEnum
CREATE TYPE "LinkedAccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "CategoryKind" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "BudgetPeriod" AS ENUM ('WEEKLY', 'MONTHLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "BillerCategory" AS ENUM ('AIRTIME', 'DATA', 'ELECTRICITY', 'CABLE_TV', 'INTERNET', 'WATER', 'EDUCATION', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PAID', 'DECLINED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320),
    "phone" VARCHAR(20),
    "passwordHash" TEXT,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "displayName" VARCHAR(120),
    "dateOfBirth" DATE,
    "avatarUrl" VARCHAR(2048),
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "emailVerifiedAt" TIMESTAMPTZ(3),
    "phoneVerifiedAt" TIMESTAMPTZ(3),
    "passcodeHash" TEXT,
    "pinHash" TEXT,
    "biometricsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" VARCHAR(128) NOT NULL,
    "deviceId" VARCHAR(120),
    "deviceName" VARCHAR(120),
    "platform" VARCHAR(40),
    "appVersion" VARCHAR(40),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(512),
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "lastUsedAt" TIMESTAMPTZ(3),
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "transactionAlerts" BOOLEAN NOT NULL DEFAULT true,
    "securityAlerts" BOOLEAN NOT NULL DEFAULT true,
    "productUpdates" BOOLEAN NOT NULL DEFAULT false,
    "marketing" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "AccountType" NOT NULL DEFAULT 'MAIN',
    "name" VARCHAR(120) NOT NULL,
    "accountNumber" VARCHAR(20) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "ledgerBalance" BIGINT NOT NULL DEFAULT 0,
    "availableBalance" BIGINT NOT NULL DEFAULT 0,
    "balanceVersion" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "openedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" "CardType" NOT NULL,
    "brand" "CardBrand" NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "cardholderName" VARCHAR(120) NOT NULL,
    "last4" VARCHAR(4) NOT NULL,
    "expiryMonth" INTEGER NOT NULL,
    "expiryYear" INTEGER NOT NULL,
    "status" "CardStatus" NOT NULL DEFAULT 'ACTIVE',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "processorToken" VARCHAR(255),
    "fingerprint" VARCHAR(255),
    "onlinePaymentsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "atmWithdrawalsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "contactlessEnabled" BOOLEAN NOT NULL DEFAULT true,
    "internationalEnabled" BOOLEAN NOT NULL DEFAULT false,
    "dailySpendLimit" BIGINT,
    "frozenAt" TIMESTAMPTZ(3),
    "cancelledAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(40) NOT NULL,
    "externalReference" VARCHAR(120),
    "idempotencyKey" VARCHAR(120),
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" BIGINT NOT NULL,
    "fee" BIGINT NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "description" VARCHAR(255),
    "note" VARCHAR(500),
    "initiatorUserId" TEXT NOT NULL,
    "categoryId" TEXT,
    "cardId" TEXT,
    "recipientId" TEXT,
    "counterpartyName" VARCHAR(120),
    "counterpartyAccountNumber" VARCHAR(20),
    "counterpartyBankName" VARCHAR(120),
    "merchantName" VARCHAR(120),
    "merchantLocation" VARCHAR(160),
    "failureCode" VARCHAR(60),
    "failureMessage" VARCHAR(500),
    "authorizedAt" TIMESTAMPTZ(3),
    "completedAt" TIMESTAMPTZ(3),
    "failedAt" TIMESTAMPTZ(3),
    "reversedAt" TIMESTAMPTZ(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "direction" "LedgerEntryDirection" NOT NULL,
    "amount" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "balanceAfter" BIGINT,
    "sequence" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountHold" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "status" "AccountHoldStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" VARCHAR(255),
    "expiresAt" TIMESTAMPTZ(3),
    "releasedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AccountHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RecipientType" NOT NULL DEFAULT 'BANK_ACCOUNT',
    "name" VARCHAR(120) NOT NULL,
    "nickname" VARCHAR(80),
    "bankName" VARCHAR(120),
    "bankCode" VARCHAR(20),
    "accountNumber" VARCHAR(20),
    "accountName" VARCHAR(120),
    "recipientUserId" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "color" VARCHAR(20),
    "lastUsedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedBankAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankName" VARCHAR(120) NOT NULL,
    "bankCode" VARCHAR(20) NOT NULL,
    "accountNumber" VARCHAR(20) NOT NULL,
    "accountName" VARCHAR(120) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "status" "LinkedAccountStatus" NOT NULL DEFAULT 'PENDING',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "providerReference" VARCHAR(255),
    "verifiedAt" TIMESTAMPTZ(3),
    "lastSyncedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "deletedAt" TIMESTAMPTZ(3),

    CONSTRAINT "LinkedBankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "kind" "CategoryKind" NOT NULL DEFAULT 'EXPENSE',
    "icon" VARCHAR(80),
    "color" VARCHAR(20),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL DEFAULT 'Monthly budget',
    "period" "BudgetPeriod" NOT NULL DEFAULT 'MONTHLY',
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "totalLimit" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetCategory" (
    "id" TEXT NOT NULL,
    "budgetId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "limitAmount" BIGINT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BudgetCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Biller" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "category" "BillerCategory" NOT NULL,
    "logoUrl" VARCHAR(2048),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Biller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillPayment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billerId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "customerReference" VARCHAR(120) NOT NULL,
    "customerName" VARCHAR(120),
    "providerReference" VARCHAR(120),
    "token" VARCHAR(255),
    "paidAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BillPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(40) NOT NULL,
    "requesterId" TEXT NOT NULL,
    "payerId" TEXT,
    "recipientId" TEXT,
    "transactionId" TEXT,
    "amount" BIGINT NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'NGN',
    "note" VARCHAR(500),
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMPTZ(3),
    "paidAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshTokenHash_key" ON "UserSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "UserSession_userId_revokedAt_idx" ON "UserSession"("userId", "revokedAt");

-- CreateIndex
CREATE INDEX "UserSession_expiresAt_idx" ON "UserSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_accountNumber_key" ON "Account"("accountNumber");

-- CreateIndex
CREATE INDEX "Account_userId_status_idx" ON "Account"("userId", "status");

-- CreateIndex
CREATE INDEX "Account_type_status_idx" ON "Account"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Card_processorToken_key" ON "Card"("processorToken");

-- CreateIndex
CREATE INDEX "Card_userId_status_idx" ON "Card"("userId", "status");

-- CreateIndex
CREATE INDEX "Card_accountId_idx" ON "Card"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_idempotencyKey_key" ON "Transaction"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Transaction_initiatorUserId_createdAt_idx" ON "Transaction"("initiatorUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Transaction_initiatorUserId_status_createdAt_idx" ON "Transaction"("initiatorUserId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Transaction_status_createdAt_idx" ON "Transaction"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Transaction_type_createdAt_idx" ON "Transaction"("type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Transaction_categoryId_createdAt_idx" ON "Transaction"("categoryId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Transaction_cardId_idx" ON "Transaction"("cardId");

-- CreateIndex
CREATE INDEX "Transaction_recipientId_idx" ON "Transaction"("recipientId");

-- CreateIndex
CREATE INDEX "Transaction_externalReference_idx" ON "Transaction"("externalReference");

-- CreateIndex
CREATE INDEX "LedgerEntry_accountId_createdAt_idx" ON "LedgerEntry"("accountId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "LedgerEntry_transactionId_idx" ON "LedgerEntry"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_transactionId_sequence_key" ON "LedgerEntry"("transactionId", "sequence");

-- CreateIndex
CREATE INDEX "AccountHold_accountId_status_idx" ON "AccountHold"("accountId", "status");

-- CreateIndex
CREATE INDEX "AccountHold_transactionId_idx" ON "AccountHold"("transactionId");

-- CreateIndex
CREATE INDEX "AccountHold_status_expiresAt_idx" ON "AccountHold"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "Recipient_userId_deletedAt_idx" ON "Recipient"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "Recipient_userId_isFavorite_lastUsedAt_idx" ON "Recipient"("userId", "isFavorite", "lastUsedAt");

-- CreateIndex
CREATE INDEX "Recipient_recipientUserId_idx" ON "Recipient"("recipientUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipient_userId_type_bankCode_accountNumber_key" ON "Recipient"("userId", "type", "bankCode", "accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Recipient_userId_recipientUserId_key" ON "Recipient"("userId", "recipientUserId");

-- CreateIndex
CREATE INDEX "LinkedBankAccount_userId_status_idx" ON "LinkedBankAccount"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedBankAccount_userId_bankCode_accountNumber_key" ON "LinkedBankAccount"("userId", "bankCode", "accountNumber");

-- CreateIndex
CREATE INDEX "Category_userId_kind_isArchived_idx" ON "Category"("userId", "kind", "isArchived");

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_slug_key" ON "Category"("userId", "slug");

-- CreateIndex
CREATE INDEX "Budget_userId_periodStart_idx" ON "Budget"("userId", "periodStart" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_periodStart_periodEnd_key" ON "Budget"("userId", "periodStart", "periodEnd");

-- CreateIndex
CREATE INDEX "BudgetCategory_categoryId_idx" ON "BudgetCategory"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "BudgetCategory_budgetId_categoryId_key" ON "BudgetCategory"("budgetId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Biller_slug_key" ON "Biller"("slug");

-- CreateIndex
CREATE INDEX "Biller_category_isActive_idx" ON "Biller"("category", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BillPayment_transactionId_key" ON "BillPayment"("transactionId");

-- CreateIndex
CREATE INDEX "BillPayment_userId_createdAt_idx" ON "BillPayment"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BillPayment_billerId_createdAt_idx" ON "BillPayment"("billerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BillPayment_customerReference_idx" ON "BillPayment"("customerReference");

-- CreateIndex
CREATE INDEX "BillPayment_providerReference_idx" ON "BillPayment"("providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_reference_key" ON "PaymentRequest"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_transactionId_key" ON "PaymentRequest"("transactionId");

-- CreateIndex
CREATE INDEX "PaymentRequest_requesterId_status_createdAt_idx" ON "PaymentRequest"("requesterId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PaymentRequest_payerId_status_createdAt_idx" ON "PaymentRequest"("payerId", "status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "PaymentRequest_recipientId_idx" ON "PaymentRequest"("recipientId");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_initiatorUserId_fkey" FOREIGN KEY ("initiatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountHold" ADD CONSTRAINT "AccountHold_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountHold" ADD CONSTRAINT "AccountHold_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkedBankAccount" ADD CONSTRAINT "LinkedBankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_billerId_fkey" FOREIGN KEY ("billerId") REFERENCES "Biller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillPayment" ADD CONSTRAINT "BillPayment_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Business-rule checks not expressible in the Prisma schema
ALTER TABLE "User" ADD CONSTRAINT "User_identity_required" CHECK ("email" IS NOT NULL OR "phone" IS NOT NULL);
ALTER TABLE "Card" ADD CONSTRAINT "Card_expiry_month_valid" CHECK ("expiryMonth" BETWEEN 1 AND 12);
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fee_non_negative" CHECK ("fee" >= 0);
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "AccountHold" ADD CONSTRAINT "AccountHold_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_total_limit_non_negative" CHECK ("totalLimit" >= 0);
ALTER TABLE "BudgetCategory" ADD CONSTRAINT "BudgetCategory_limit_non_negative" CHECK ("limitAmount" >= 0);
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_amount_positive" CHECK ("amount" > 0);
ALTER TABLE "Recipient" ADD CONSTRAINT "Recipient_target_valid" CHECK (
    ("type" = 'BANK_ACCOUNT' AND "bankName" IS NOT NULL AND "bankCode" IS NOT NULL AND "accountNumber" IS NOT NULL)
    OR ("type" = 'NORTH_USER' AND "recipientUserId" IS NOT NULL)
);
