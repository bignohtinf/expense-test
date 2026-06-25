import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Full name is required'),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'You must accept the terms and conditions',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

// Customer claim form schemas
export const claimTypeStep = z.object({
    claimType: z.enum(['inpatient', 'outpatient', 'dental', 'vision', 'pharmacy']),
    insurancePackage: z.string().min(1, 'Please select an insurance package'),
});

export const claimDocumentsStep = z.object({
    documents: z.array(
        z.object({
            id: z.string(),
            file: z.instanceof(File).optional(),
            type: z.enum(['invoice', 'prescription', 'receipt', 'diagnosis', 'other']),
            description: z.string().optional(),
        })
    ).min(1, 'At least one document is required'),
});

export const claimExamStep = z.object({
    hospitalName: z.string().min(2, 'Hospital name is required'),
    examDate: z.date(),
    claimAmount: z.number().min(0.01, 'Amount must be greater than 0'),
    notes: z.string().optional(),
});

export const claimReviewStep = z.object({
    confirmDetails: z.boolean().refine((val) => val === true, {
        message: 'Please confirm the details',
    }),
});

export const completeClaimSchema = z.object({
    claimType: z.enum(['inpatient', 'outpatient', 'dental', 'vision', 'pharmacy']),
    insurancePackage: z.string(),
    hospitalName: z.string(),
    examDate: z.date(),
    claimAmount: z.number().min(0.01),
    documents: z.array(z.object({
        id: z.string(),
        type: z.enum(['invoice', 'prescription', 'receipt', 'diagnosis', 'other']),
        description: z.string().optional(),
    })).min(1),
    confirmDetails: z.boolean(),
});

// Adjudicator schemas
export const decisionSchema = z.object({
    caseId: z.string(),
    decision: z.enum(['approved', 'rejected', 'request_info']),
    reason: z.string().optional(),
    amount: z.number().optional(),
    notes: z.string().optional(),
});

// Admin schemas
export const ruleSchema = z.object({
    name: z.string().min(1, 'Rule name is required'),
    condition: z.string().min(1, 'Condition is required'),
    action: z.enum(['approve', 'reject', 'flag_for_review']),
    enabled: z.boolean(),
    description: z.string().optional(),
});

export const insurancePackageSchema = z.object({
    name: z.string().min(1, 'Package name is required'),
    premium: z.number().min(0, 'Premium must be non-negative'),
    maxBenefits: z.number().min(0, 'Max benefits must be non-negative'),
    deductible: z.number().min(0, 'Deductible must be non-negative'),
    copayPercentage: z.number().min(0).max(100, 'Copay must be between 0-100%'),
    description: z.string().optional(),
});

export const fraudConfigSchema = z.object({
    priceAnomalyThreshold: z.number().min(0).max(100),
    frequencyLimit: z.number().min(0),
    enableFraudDetection: z.boolean(),
    whitelistProviders: z.array(z.string()),
    blacklistProviders: z.array(z.string()),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CompleteClaimInput = z.infer<typeof completeClaimSchema>;
export type DecisionInput = z.infer<typeof decisionSchema>;
export type RuleInput = z.infer<typeof ruleSchema>;
export type InsurancePackageInput = z.infer<typeof insurancePackageSchema>;
export type FraudConfigInput = z.infer<typeof fraudConfigSchema>;
