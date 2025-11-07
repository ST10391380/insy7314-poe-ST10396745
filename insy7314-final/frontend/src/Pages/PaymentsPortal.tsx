import React, { useState } from 'react';
import { LogOut, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface FormData {
    username: string;
    accountNumber: string;
    password: string;
    confirmPassword: string;
}

interface PaymentForm {
    amount: string;
    currency: string;
    swiftCode: string;
    payee: string;
}

interface Payment {
    _id?: string;
    payee: string;
    swiftCode: string;
    status: string;
    currency: string;
    amount: string | number;
    createdAt: string;
}

interface MessageState {
    type: string;
    text: string;
}

type AuthMode = 'login' | 'register';

export default function PaymentsPortal() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [formData, setFormData] = useState<FormData>({
        username: '',
        accountNumber: '',
        password: '',
        confirmPassword: ''
    });

    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentForm, setPaymentForm] = useState<PaymentForm>({
        amount: '',
        currency: 'USD',
        swiftCode: '',
        payee: ''
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<MessageState>({ type: '', text: '' });
    const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);

    const API_URL = 'https://localhost:3001/api';

    const validateAuthInput = (data: FormData): string[] => {
        const errors: string[] = [];

        if (!data.username || data.username.trim().length < 3) {
            errors.push('Username must be at least 3 characters');
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
            errors.push('Username can only contain letters, numbers, underscores, and hyphens');
        }

        if (authMode === 'register' || data.accountNumber) {
            if (!data.accountNumber || data.accountNumber.trim().length < 10) {
                errors.push('Account number must be at least 10 characters');
            }
            if (!/^[A-Z0-9]+$/.test(data.accountNumber)) {
                errors.push('Account number must contain only uppercase letters and numbers');
            }
        }

        if (!data.password || data.password.length < 8) {
            errors.push('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(data.password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[0-9]/.test(data.password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*]/.test(data.password)) {
            errors.push('Password must contain at least one special character (!@#$%^&*)');
        }

        if (authMode === 'register' && data.password !== data.confirmPassword) {
            errors.push('Passwords do not match');
        }

        return errors;
    };

    const handleAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors = validateAuthInput(formData);

        if (errors.length > 0) {
            setMessage({ type: 'error', text: errors.join('. ') });
            return;
        }

        setLoading(true);
        try {
            const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
            const payload = authMode === 'login'
                ? { username: formData.username, password: formData.password }
                : { username: formData.username, accountNumber: formData.accountNumber, password: formData.password };

            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                setIsAuthenticated(true);
                setMessage({ type: 'success', text: `${authMode === 'login' ? 'Logged in' : 'Registered'} successfully!` });
                setFormData({ username: '', accountNumber: '', password: '', confirmPassword: '' });
                await fetchPayments();
            } else {
                setMessage({ type: 'error', text: data.message || 'Authentication failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Connection error. Ensure backend is running on HTTPS.' });
        } finally {
            setLoading(false);
        }
    };

    const validatePaymentInput = (data: PaymentForm): string[] => {
        const errors: string[] = [];

        const amount = parseFloat(data.amount);
        if (isNaN(amount) || amount <= 0) {
            errors.push('Amount must be a positive number');
        }
        if (amount > 999999999) {
            errors.push('Amount is too large');
        }

        const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'ZAR'];
        if (!validCurrencies.includes(data.currency)) {
            errors.push('Invalid currency selected');
        }

        if (!/^[A-Z]{4}$/.test(data.swiftCode)) {
            errors.push('SWIFT code must be exactly 4 uppercase letters (e.g., ABCD)');
        }

        if (!data.payee || data.payee.trim().length < 2) {
            errors.push('Payee name must be at least 2 characters');
        }
        if (!/^[a-zA-Z\s'-]+$/.test(data.payee)) {
            errors.push('Payee name can only contain letters, spaces, hyphens, and apostrophes');
        }

        return errors;
    };

    const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const errors = validatePaymentInput(paymentForm);

        if (errors.length > 0) {
            setMessage({ type: 'error', text: errors.join('. ') });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/payments/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    amount: parseFloat(paymentForm.amount),
                    currency: paymentForm.currency,
                    swiftCode: paymentForm.swiftCode,
                    payee: paymentForm.payee
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Payment created successfully!' });
                setPaymentForm({ amount: '', currency: 'USD', swiftCode: '', payee: '' });
                setShowPaymentForm(false);
                await fetchPayments();
            } else {
                setMessage({ type: 'error', text: data.message || 'Payment creation failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to create payment' });
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await fetch(`${API_URL}/payments/list`, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setPayments(data.payments || []);
            }
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setPayments([]);
            setMessage({ type: '', text: '' });
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                        International Payments
                    </h1>
                    <p className="text-gray-600 text-center mb-8">Secure Cross-Border Transactions</p>

                    {message.text && (
                        <div className={`mb-6 p-3 rounded-lg flex items-start gap-2 ${
                            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                            <span className="text-sm">{message.text}</span>
                        </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                placeholder="Enter username"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {authMode === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                                <input
                                    type="text"
                                    value={formData.accountNumber}
                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                    placeholder="Enter account number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Enter password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {authMode === 'register' && (
                                <p className="text-xs text-gray-600 mt-2">
                                    Must contain: 8+ chars, uppercase, number, and special character (!@#$%^&*)
                                </p>
                            )}
                        </div>

                        {authMode === 'register' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Confirm password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                            {loading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Register')}
                        </button>
                    </form>

                    <button
                        onClick={() => {
                            setAuthMode(authMode === 'login' ? 'register' : 'login');
                            setMessage({ type: '', text: '' });
                            setFormData({ username: '', accountNumber: '', password: '', confirmPassword: '' });
                        }}
                        className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        {authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow">
                <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">International Payments Portal</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                        message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                        {message.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
                        <span>{message.text}</span>
                    </div>
                )}

                <button
                    onClick={() => setShowPaymentForm(!showPaymentForm)}
                    className="mb-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
                >
                    <Send size={20} />
                    {showPaymentForm ? 'Cancel' : 'New Payment'}
                </button>

                {showPaymentForm && (
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Payment</h2>
                        <form onSubmit={handlePaymentSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select
                                        value={paymentForm.currency}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="JPY">JPY - Japanese Yen</option>
                                        <option value="CAD">CAD - Canadian Dollar</option>
                                        <option value="AUD">AUD - Australian Dollar</option>
                                        <option value="CHF">CHF - Swiss Franc</option>
                                        <option value="CNY">CNY - Chinese Yuan</option>
                                        <option value="INR">INR - Indian Rupee</option>
                                        <option value="ZAR">ZAR - South African Rand</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">SWIFT Code</label>
                                    <input
                                        type="text"
                                        value={paymentForm.swiftCode}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, swiftCode: e.target.value.toUpperCase() })}
                                        placeholder="ABCD"
                                        maxLength={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                                    />
                                    <p className="text-xs text-gray-600 mt-1">4 uppercase letters</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payee Name</label>
                                    <input
                                        type="text"
                                        value={paymentForm.payee}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, payee: e.target.value })}
                                        placeholder="Recipient name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
                            >
                                {loading ? 'Processing...' : 'Submit Payment'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Payment History</h2>
                    {payments.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">No payments yet. Create your first payment to get started.</p>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{payment.payee}</h3>
                                            <p className="text-sm text-gray-600">{payment.swiftCode}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {payment.status === 'PENDING' && <Clock size={20} className="text-yellow-500" />}
                                            {payment.status === 'COMPLETED' && <CheckCircle size={20} className="text-green-500" />}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                            }`}>
                        {payment.status}
                      </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-700">
                                        <span>{payment.currency} {typeof payment.amount === 'number' ? payment.amount.toFixed(2) : parseFloat(String(payment.amount)).toFixed(2)}</span>
                                        <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}