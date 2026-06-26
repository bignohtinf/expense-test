import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

export const registerSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
    acceptTerms: z.boolean().refine((val) => val === true, {
        message: 'Bạn phải đồng ý điều khoản',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
});

// Transaction schemas
export const transactionSchema = z.object({
    category_id: z.string().uuid(),
    wallet_id: z.string().uuid().optional().nullable(),
    type: z.enum(['income', 'expense']),
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    description: z.string().default(''),
    transaction_date: z.string(),
});

// Budget schema
export const budgetSchema = z.object({
    category_id: z.string().uuid().optional().nullable(),
    amount: z.number().positive('Số tiền phải lớn hơn 0'),
    month: z.number().min(1).max(12),
    year: z.number().min(2020).max(2100),
});

// Wallet schema
export const walletSchema = z.object({
    name: z.string().min(1, 'Tên ví không được trống'),
    type: z.enum(['cash', 'bank', 'e_wallet', 'credit_card']),
    balance: z.number().default(0),
    icon: z.string().default('wallet'),
});

// Settings schema
export const profileSchema = z.object({
    full_name: z.string().min(2),
    currency: z.string().length(3),
});

export const changePasswordSchema = z.object({
    current_password: z.string().min(6),
    new_password: z.string().min(8, 'Mật khẩu mới tối thiểu 8 ký tự'),
    confirm_password: z.string(),
}).refine((data) => data.new_password === data.confirm_password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirm_password'],
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type WalletInput = z.infer<typeof walletSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
