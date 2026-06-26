'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Wallet, CreditCard, Building2, Smartphone } from 'lucide-react';
import type { Wallet as WalletType } from '@/types';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const walletIcons: Record<string, React.ReactNode> = {
    cash: <Wallet className="h-5 w-5" />,
    bank: <Building2 className="h-5 w-5" />,
    e_wallet: <Smartphone className="h-5 w-5" />,
    credit_card: <CreditCard className="h-5 w-5" />,
};

const walletLabels: Record<string, string> = {
    cash: 'Tiền mặt',
    bank: 'Ngân hàng',
    e_wallet: 'Ví điện tử',
    credit_card: 'Thẻ tín dụng',
};

export default function WalletsPage() {
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ name: '', type: 'cash', balance: '0' });

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api.getWallets() as WalletType[];
            setWallets(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    const handleCreate = async () => {
        if (!form.name) return;
        await api.createWallet({ ...form, balance: parseFloat(form.balance) });
        setDialogOpen(false);
        setForm({ name: '', type: 'cash', balance: '0' });
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Xóa ví này?')) return;
        await api.deleteWallet(id);
        loadData();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-[#121212] tracking-tight">Ví tiền</h1>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2" onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4" /> Thêm ví
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle className="font-black">Thêm ví mới</DialogTitle></DialogHeader>
                        <div className="space-y-4 pt-2">
                            <Input placeholder="Tên ví" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <select className="w-full h-10 px-3 border rounded-md text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                <option value="cash">Tiền mặt</option>
                                <option value="bank">Ngân hàng</option>
                                <option value="e_wallet">Ví điện tử</option>
                                <option value="credit_card">Thẻ tín dụng</option>
                            </select>
                            <Input type="number" placeholder="Số dư ban đầu" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} />
                            <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleCreate}>Tạo ví</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Total Balance */}
            <Card className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                <p className="text-sm font-medium opacity-80">Tổng số dư</p>
                <p className="text-3xl font-black mt-1">{formatCurrency(totalBalance)}</p>
                <p className="text-xs opacity-60 mt-1">{wallets.length} ví đang hoạt động</p>
            </Card>

            {loading ? (
                <div className="text-center py-12 text-slate-400">Đang tải...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wallets.map((w) => (
                        <Card key={w.id} className="p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                        {walletIcons[w.type] || <Wallet className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-700">{w.name}</p>
                                        <p className="text-xs text-slate-400">{walletLabels[w.type] || w.type}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(w.id)} className="text-slate-300 hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-xl font-black text-[#121212] mt-4">{formatCurrency(Number(w.balance))}</p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
