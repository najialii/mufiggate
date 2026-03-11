import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WidgetConfig, Bank, TransactionStatus } from '@sudanpay/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const SudanPayWidget: React.FC<WidgetConfig> = ({
  merchantId,
  apiKey,
  orderId,
  amount,
  currency = 'SDG',
  onSuccess,
  onError
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'approved' | 'rejected'>('idle');
  const [copied, setCopied] = useState(false);
  const [refCodeCopied, setRefCodeCopied] = useState(false);
  const [referenceCode] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SP-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  });
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/merchants/${merchantId}/banks`, {
      headers: { 'X-API-Key': apiKey }
    })
      .then(res => res.json())
      .then(data => {
        setBanks(data.banks);
        if (data.banks.length > 0) setSelectedBank(data.banks[0]);
      })
      .catch(err => onError?.(err));
  }, [merchantId, apiKey]);

  useEffect(() => {
    if (status === 'pending') {
      socketRef.current = io(API_URL);
      socketRef.current.on(`transaction:${orderId}`, (data) => {
        if (data.status === TransactionStatus.APPROVED) {
          setStatus('approved');
          onSuccess?.(data.transaction);
        } else if (data.status === TransactionStatus.REJECTED) {
          setStatus('rejected');
        }
      });
      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [status, orderId]);

  const handleCopy = () => {
    if (selectedBank) {
      navigator.clipboard.writeText(selectedBank.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyRefCode = () => {
    navigator.clipboard.writeText(referenceCode);
    setRefCodeCopied(true);
    setTimeout(() => setRefCodeCopied(false), 2000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setReceipt(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBank || !transactionId || !receipt) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('merchantId', merchantId);
    formData.append('orderId', orderId);
    formData.append('amount', amount.toString());
    formData.append('currency', currency);
    formData.append('bankCode', selectedBank.code);
    formData.append('transactionId', transactionId);
    formData.append('referenceCode', referenceCode);
    formData.append('receipt', receipt);

    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: 'POST',
        headers: { 'X-API-Key': apiKey },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus('pending');
    } catch (err) {
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'approved') {
    return (
      <div className="sp-max-w-lg sp-mx-auto sp-bg-white sp-rounded-lg sp-shadow-sm sp-border sp-border-gray-200 sp-p-8 sp-text-center">
        <div className="sp-w-14 sp-h-14 sp-mx-auto sp-mb-4 sp-bg-green-100 sp-rounded-full sp-flex sp-items-center sp-justify-center">
          <svg className="sp-w-7 sp-h-7 sp-text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="sp-text-xl sp-font-semibold sp-text-gray-900 sp-mb-2">Payment successful</h3>
        <p className="sp-text-sm sp-text-gray-600">Your payment has been verified and approved.</p>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="sp-max-w-lg sp-mx-auto sp-bg-white sp-rounded-lg sp-shadow-sm sp-border sp-border-gray-200 sp-p-8 sp-text-center">
        <div className="sp-w-14 sp-h-14 sp-mx-auto sp-mb-4 sp-bg-red-100 sp-rounded-full sp-flex sp-items-center sp-justify-center">
          <svg className="sp-w-7 sp-h-7 sp-text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="sp-text-xl sp-font-semibold sp-text-gray-900 sp-mb-2">Payment declined</h3>
        <p className="sp-text-sm sp-text-gray-600">Please contact support for assistance.</p>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="sp-max-w-lg sp-mx-auto sp-bg-white sp-rounded-lg sp-shadow-sm sp-border sp-border-gray-200 sp-p-8 sp-text-center">
        <div className="sp-w-14 sp-h-14 sp-mx-auto sp-mb-4 sp-border-4 sp-border-gray-200 sp-border-t-blue-600 sp-rounded-full sp-animate-spin"></div>
        <h3 className="sp-text-xl sp-font-semibold sp-text-gray-900 sp-mb-2">Verifying payment</h3>
        <p className="sp-text-sm sp-text-gray-600">Please wait while we confirm your transaction...</p>
      </div>
    );
  }

  return (
    <div className="sp-max-w-lg sp-mx-auto sp-bg-white sp-rounded-lg sp-shadow-sm sp-border sp-border-gray-200">
      <div className="sp-px-6 sp-py-5 sp-border-b sp-border-gray-200">
        <div className="sp-flex sp-justify-between sp-items-center">
          <div>
            <h3 className="sp-text-lg sp-font-semibold sp-text-gray-900">Pay {amount.toLocaleString()} {currency}</h3>
            <p className="sp-text-sm sp-text-gray-500 sp-mt-1">Order #{orderId}</p>
          </div>
          <div className="sp-flex sp-items-center sp-gap-1">
            <svg className="sp-w-5 sp-h-5 sp-text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="sp-text-xs sp-text-gray-500">Secure</span>
          </div>
        </div>
      </div>

      <div className="sp-px-6 sp-py-6 sp-space-y-6">
        <div>
          <label className="sp-block sp-text-sm sp-font-medium sp-text-gray-700 sp-mb-3">Select your bank</label>
          <div className="sp-grid sp-grid-cols-3 sp-gap-2">
            {banks.map(bank => (
              <button
                key={bank.code}
                onClick={() => setSelectedBank(bank)}
                className={`sp-relative sp-p-3 sp-rounded-md sp-border sp-transition-all sp-text-center ${
                  selectedBank?.code === bank.code
                    ? 'sp-border-blue-500 sp-bg-blue-50 sp-ring-2 sp-ring-blue-500'
                    : 'sp-border-gray-300 hover:sp-border-gray-400 sp-bg-white'
                }`}
              >
                <div className="sp-text-xs sp-font-semibold sp-text-gray-900">{bank.code}</div>
                {selectedBank?.code === bank.code && (
                  <div className="sp-absolute sp-top-1 sp-right-1">
                    <svg className="sp-w-4 sp-h-4 sp-text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedBank && (
          <div className="sp-bg-gray-50 sp-rounded-lg sp-p-4 sp-space-y-4">
            <div className="sp-flex sp-justify-between sp-text-sm">
              <span className="sp-text-gray-600">Account name</span>
              <span className="sp-font-medium sp-text-gray-900">{selectedBank.accountName}</span>
            </div>
            
            <div className="sp-flex sp-items-center sp-justify-between sp-gap-3">
              <div className="sp-flex-1">
                <div className="sp-text-xs sp-text-gray-600 sp-mb-1">Account number</div>
                <div className="sp-font-mono sp-text-sm sp-font-semibold sp-text-gray-900">{selectedBank.accountNumber}</div>
              </div>
              <button
                onClick={handleCopy}
                className="sp-px-3 sp-py-1.5 sp-text-xs sp-font-medium sp-text-gray-700 sp-bg-white sp-border sp-border-gray-300 sp-rounded-md hover:sp-bg-gray-50 sp-transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="sp-pt-3 sp-border-t sp-border-gray-200">
              <div className="sp-bg-blue-50 sp-border sp-border-blue-200 sp-rounded-md sp-p-3">
                <div className="sp-flex sp-items-start sp-gap-2 sp-mb-2">
                  <svg className="sp-w-4 sp-h-4 sp-text-blue-600 sp-mt-0.5 sp-flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="sp-text-xs sp-font-medium sp-text-blue-900">Include this code in your transfer note</p>
                </div>
                <div className="sp-flex sp-items-center sp-justify-between sp-gap-3">
                  <div className="sp-flex-1">
                    <div className="sp-text-xs sp-text-blue-700 sp-mb-0.5">Reference code</div>
                    <div className="sp-font-mono sp-text-lg sp-font-bold sp-text-blue-900">{referenceCode}</div>
                  </div>
                  <button
                    onClick={handleCopyRefCode}
                    className="sp-px-3 sp-py-1.5 sp-text-xs sp-font-semibold sp-text-blue-700 sp-bg-blue-100 sp-border sp-border-blue-300 sp-rounded-md hover:sp-bg-blue-200 sp-transition-colors"
                  >
                    {refCodeCopied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="txn-id" className="sp-block sp-text-sm sp-font-medium sp-text-gray-700 sp-mb-2">
            Transaction ID
          </label>
          <input
            id="txn-id"
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter the transaction ID from your receipt"
            className="sp-w-full sp-px-3 sp-py-2 sp-text-sm sp-border sp-border-gray-300 sp-rounded-md focus:sp-outline-none focus:sp-ring-2 focus:sp-ring-blue-500 focus:sp-border-transparent sp-transition-shadow"
          />
        </div>

        <div>
          <label className="sp-block sp-text-sm sp-font-medium sp-text-gray-700 sp-mb-2">
            Payment receipt
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`sp-relative sp-border-2 sp-border-dashed sp-rounded-lg sp-p-6 sp-text-center sp-cursor-pointer sp-transition-colors ${
              dragActive 
                ? 'sp-border-blue-400 sp-bg-blue-50' 
                : receipt 
                ? 'sp-border-green-300 sp-bg-green-50'
                : 'sp-border-gray-300 sp-bg-gray-50 hover:sp-border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sp-hidden"
            />
            {receipt ? (
              <div className="sp-flex sp-items-center sp-justify-center sp-gap-2">
                <svg className="sp-w-5 sp-h-5 sp-text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="sp-text-sm sp-font-medium sp-text-green-900">{receipt.name}</span>
              </div>
            ) : (
              <div>
                <svg className="sp-w-8 sp-h-8 sp-mx-auto sp-mb-2 sp-text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="sp-text-sm sp-text-gray-600">
                  <span className="sp-font-medium sp-text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="sp-text-xs sp-text-gray-500 sp-mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sp-px-6 sp-py-4 sp-bg-gray-50 sp-border-t sp-border-gray-200 sp-rounded-b-lg">
        <button
          onClick={handleSubmit}
          disabled={!selectedBank || !transactionId || !receipt || loading}
          className="sp-w-full sp-px-4 sp-py-2.5 sp-text-sm sp-font-semibold sp-text-white sp-bg-blue-600 sp-rounded-md hover:sp-bg-blue-700 focus:sp-outline-none focus:sp-ring-2 focus:sp-ring-blue-500 focus:sp-ring-offset-2 disabled:sp-bg-gray-300 disabled:sp-cursor-not-allowed sp-transition-colors"
        >
          {loading ? (
            <span className="sp-flex sp-items-center sp-justify-center sp-gap-2">
              <svg className="sp-animate-spin sp-h-4 sp-w-4" fill="none" viewBox="0 0 24 24">
                <circle className="sp-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="sp-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Submit payment'
          )}
        </button>
        <p className="sp-text-xs sp-text-center sp-text-gray-500 sp-mt-3">
          Your payment will be verified within 5-10 minutes
        </p>
      </div>
    </div>
  );
};
