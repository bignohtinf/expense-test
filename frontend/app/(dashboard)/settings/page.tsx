'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

export default function SettingsPage() {
    const [profile, setProfile] = useState({ full_name: '', email: '', currency: 'VND' });
    const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [profileMsg, setProfileMsg] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');

    useEffect(() => {
        api.getMe().then((user: any) => {
            setProfile({ full_name: user.full_name, email: user.email, currency: user.currency });
        }).catch(console.error);
    }, []);

    const handleProfileSave = async () => {
        try {
            await api.updateProfile({ full_name: profile.full_name, currency: profile.currency });
            setProfileMsg('Đã cập nhật thành công');
            setTimeout(() => setProfileMsg(''), 3000);
        } catch (err: any) {
            setProfileMsg(err.message);
        }
    };

    const handlePasswordChange = async () => {
        if (passwords.new_password !== passwords.confirm_password) {
            setPasswordMsg('Mật khẩu xác nhận không khớp');
            return;
        }
        try {
            await api.changePassword({
                current_password: passwords.current_password,
                new_password: passwords.new_password,
            });
            setPasswordMsg('Đổi mật khẩu thành công');
            setPasswords({ current_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setPasswordMsg(''), 3000);
        } catch (err: any) {
            setPasswordMsg(err.message);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-2xl font-black text-[#121212] tracking-tight">Cài đặt</h1>

            {/* Profile */}
            <Card className="p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Thông tin cá nhân</h2>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile.email} disabled className="bg-slate-50" />
                </div>
                <div className="space-y-2">
                    <Label>Họ và tên</Label>
                    <Input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Đơn vị tiền tệ</Label>
                    <select className="w-full h-10 px-3 border rounded-md text-sm" value={profile.currency} onChange={e => setProfile({ ...profile, currency: e.target.value })}>
                        <option value="VND">VND (₫)</option>
                        <option value="USD">USD ($)</option>
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleProfileSave}>Lưu thay đổi</Button>
                    {profileMsg && <span className="text-sm text-emerald-500 flex items-center gap-1"><Check className="h-4 w-4" />{profileMsg}</span>}
                </div>
            </Card>

            {/* Password */}
            <Card className="p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đổi mật khẩu</h2>
                <div className="space-y-2">
                    <Label>Mật khẩu hiện tại</Label>
                    <Input type="password" value={passwords.current_password} onChange={e => setPasswords({ ...passwords, current_password: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <Input type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input type="password" value={passwords.confirm_password} onChange={e => setPasswords({ ...passwords, confirm_password: e.target.value })} />
                </div>
                <div className="flex items-center gap-3">
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handlePasswordChange}>Đổi mật khẩu</Button>
                    {passwordMsg && <span className="text-sm text-emerald-500">{passwordMsg}</span>}
                </div>
            </Card>
        </div>
    );
}
