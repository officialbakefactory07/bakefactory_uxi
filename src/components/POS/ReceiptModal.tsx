"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Bluetooth, Printer, CheckCircle2, X, Sparkles, AlertCircle } from 'lucide-react';
import { ReceiptData, printViaBluetooth } from '@/lib/escpos';
import styles from './ReceiptModal.module.css';

interface ReceiptModalProps {
  data: ReceiptData;
  onClose: () => void;
  onNewSale: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ data, onClose, onNewSale }) => {
  const [printingBt, setPrintingBt] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleBluetoothPrint = async () => {
    setPrintingBt(true);
    setStatusMsg(null);
    try {
      const res = await printViaBluetooth(data, false);
      if (res.success) {
        setStatusMsg({ type: 'success', text: 'Receipt printed via Bluetooth!' });
      } else {
        setStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      if (err.message && err.message.includes('User cancelled')) {
        setStatusMsg({ type: 'error', text: 'Bluetooth pairing was cancelled.' });
      } else {
        setStatusMsg({ type: 'error', text: err.message || 'Bluetooth connection failed.' });
      }
    } finally {
      setPrintingBt(false);
    }
  };

  // Dedicated Print-First Printing Engine (80mm Thermal & PDF Optimized)
  const handleSystemPrint = () => {
    const receiptElement = document.getElementById('printable-thermal-receipt');
    if (!receiptElement) {
      window.print();
      return;
    }

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0px';
    printFrame.style.height = '0px';
    printFrame.style.border = '0';

    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document;
    if (!frameDoc) {
      window.print();
      return;
    }

    const receiptHtml = receiptElement.outerHTML;

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>Receipt_${data.invoiceNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0mm;
            }
            @media print {
              html, body {
                width: 80mm;
                margin: 0 !important;
                padding: 0 !important;
                background: #FFFFFF !important;
                color: #000000 !important;
              }
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, monospace, sans-serif;
              width: 80mm;
              max-width: 80mm;
              margin: 0 auto;
              padding: 4mm 5mm 8mm 5mm;
              background: #FFFFFF;
              color: #000000;
              font-size: 11.5px;
              line-height: 1.35;
            }
            .logo-wrap {
              text-align: center;
              margin-bottom: 6px;
            }
            .logo-wrap img {
              width: 52px;
              height: 52px;
              object-fit: contain;
              display: block;
              margin: 0 auto;
            }
            .header-text {
              text-align: center;
              margin-bottom: 6px;
            }
            .brand-name {
              font-size: 16px;
              font-weight: 900;
              letter-spacing: 1px;
              margin: 0;
              text-transform: uppercase;
            }
            .sub-brand {
              font-size: 9.5px;
              font-weight: 700;
              letter-spacing: 0.8px;
              margin: 1px 0;
              text-transform: uppercase;
            }
            .tagline {
              font-size: 8.5px;
              font-weight: 600;
              letter-spacing: 0.5px;
              margin: 1px 0;
              text-transform: uppercase;
            }
            .store-address {
              font-size: 9.5px;
              margin: 2px 0 0 0;
              color: #222222;
            }
            .store-contact {
              font-size: 9.5px;
              font-weight: 600;
              margin: 1px 0 0 0;
            }
            .divider-dash {
              border-top: 1px dashed #000000;
              margin: 6px 0;
            }
            .divider-solid {
              border-top: 1px solid #000000;
              margin: 5px 0;
            }
            .divider-double {
              border-top: 2px double #000000;
              margin: 5px 0;
            }
            .tax-title {
              text-align: center;
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 1px;
              margin: 2px 0 4px 0;
            }
            .info-table {
              width: 100%;
              margin: 3px 0;
              font-size: 10.5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 4px 0;
              font-size: 10.5px;
            }
            .items-table th {
              text-align: left;
              padding: 3px 0;
              border-bottom: 1px solid #000000;
              font-weight: 800;
              font-size: 10px;
              text-transform: uppercase;
            }
            .items-table td {
              padding: 3px 0;
              vertical-align: top;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .item-name {
              font-weight: 700;
              word-break: break-word;
              line-height: 1.25;
            }
            .item-note {
              font-size: 9px;
              font-style: italic;
              color: #333333;
              padding-left: 4px;
              margin-top: 1px;
            }
            .totals-table {
              width: 100%;
              margin: 4px 0;
              font-size: 11px;
            }
            .total-line {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .grand-total {
              display: flex;
              justify-content: space-between;
              font-size: 14.5px;
              font-weight: 900;
              margin: 3px 0;
            }
            .payment-info {
              margin: 4px 0;
              font-size: 10.5px;
            }
            .footer-closing {
              text-align: center;
              margin-top: 8px;
              font-size: 9.5px;
              line-height: 1.4;
            }
            .footer-closing strong {
              font-size: 10.5px;
              letter-spacing: 0.5px;
            }
            .footer-closing .motto {
              font-style: italic;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          ${receiptHtml}
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 1500);
    }, 300);
  };

  const now = new Date();
  const dateStr = data.dateStr || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = data.timeStr || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        
        {/* Modal Top Bar (Web UI Only) */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <CheckCircle2 size={20} className={styles.successIcon} />
            <div>
              <h3>Bill Generated Successfully</h3>
              <span>Invoice #{data.invoiceNumber} • {data.orderType}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {statusMsg && (
          <div className={`${styles.statusBanner} ${statusMsg.type === 'error' ? styles.statusError : styles.statusSuccess}`}>
            {statusMsg.type === 'error' && <AlertCircle size={15} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* ── REAL CUSTOMER RECEIPT PREVIEW CONTAINER ── */}
        <div className={styles.previewViewport}>
          <div className={styles.receiptSheet} id="printable-thermal-receipt">
            
            {/* 1. Header: Logo & Branding */}
            <div className="logo-wrap" style={{ textAlign: 'center', marginBottom: '6px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="Bake Factory Logo" 
                style={{ width: '52px', height: '52px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
              />
            </div>

            <div className="header-text" style={{ textAlign: 'center', marginBottom: '6px' }}>
              <div className="brand-name" style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' }}>
                BAKE FACTORY
              </div>
              <div className="sub-brand" style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', margin: '1px 0' }}>
                CAKES & DESSERTS
              </div>
              <div className="tagline" style={{ fontSize: '8.5px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#555', margin: '1px 0' }}>
                ARTISANAL STUDIO
              </div>
              <div className="store-address" style={{ fontSize: '9.5px', marginTop: '2px', color: '#222' }}>
                Catholic Church Area, Tadepalle<br/>Vijayawada
              </div>
              <div className="store-contact" style={{ fontSize: '9.5px', fontWeight: 600, marginTop: '1px' }}>
                Hotline: +91 79894 99446
              </div>
            </div>

            <div className="divider-dash" style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            {/* 2. Order Information */}
            <div className="tax-title" style={{ textAlign: 'center', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', margin: '2px 0 4px' }}>
              TAX INVOICE
            </div>

            <div className="info-table" style={{ fontSize: '10.5px' }}>
              <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span><strong>Invoice No:</strong> #{data.invoiceNumber}</span>
                <span><strong>Order Type:</strong> {data.orderType.toUpperCase()}</span>
              </div>
              <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span><strong>Date:</strong> {dateStr}</span>
                <span><strong>Time:</strong> {timeStr}</span>
              </div>
              {data.customerName && (
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span><strong>Customer:</strong> {data.customerName}</span>
                  {data.customerPhone && <span>{data.customerPhone}</span>}
                </div>
              )}
              {data.cashierName && (
                <div className="info-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span><strong>Cashier:</strong> {data.cashierName}</span>
                </div>
              )}
            </div>

            <div className="divider-solid" style={{ borderTop: '1px solid #000', margin: '5px 0' }} />

            {/* 3. Items Table */}
            <table className="items-table" style={{ width: '100%', borderCollapse: 'collapse', margin: '4px 0', fontSize: '10.5px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '3px 0', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '10px', width: '50%' }}>
                    ITEM
                  </th>
                  <th style={{ textAlign: 'center', padding: '3px 0', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '10px', width: '14%' }}>
                    QTY
                  </th>
                  <th style={{ textAlign: 'right', padding: '3px 0', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '10px', width: '16%' }}>
                    RATE
                  </th>
                  <th style={{ textAlign: 'right', padding: '3px 0', borderBottom: '1px solid #000', fontWeight: 800, fontSize: '10px', width: '20%' }}>
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '3px 0', verticalAlign: 'top' }}>
                      <div className="item-name" style={{ fontWeight: 700, wordBreak: 'break-word', lineHeight: 1.25 }}>
                        {item.name}
                      </div>
                      {item.note && (
                        <div className="item-note" style={{ fontSize: '9px', fontStyle: 'italic', color: '#444', paddingLeft: '4px', marginTop: '1px' }}>
                          Note: {item.note}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '3px 0', verticalAlign: 'top' }}>
                      {item.quantity}
                    </td>
                    <td style={{ textAlign: 'right', padding: '3px 0', verticalAlign: 'top' }}>
                      ₹{item.price.toFixed(0)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '3px 0', verticalAlign: 'top', fontWeight: 700 }}>
                      ₹{(item.quantity * item.price).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divider-solid" style={{ borderTop: '1px solid #000', margin: '5px 0' }} />

            {/* 4. Financial Summary & NET TOTAL */}
            <div className="totals-table" style={{ fontSize: '11px' }}>
              <div className="total-line" style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>Subtotal:</span>
                <span>₹{data.subtotal.toFixed(0)}</span>
              </div>
              
              {data.discount > 0 && (
                <div className="total-line" style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                  <span>Discount:</span>
                  <span>-₹{data.discount.toFixed(0)}</span>
                </div>
              )}

              {data.deliveryFee && data.deliveryFee > 0 ? (
                <div className="total-line" style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                  <span>Delivery Fee:</span>
                  <span>₹{data.deliveryFee.toFixed(0)}</span>
                </div>
              ) : null}

              <div className="divider-double" style={{ borderTop: '2px double #000', margin: '5px 0' }} />

              <div className="grand-total" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', fontWeight: 900, margin: '3px 0' }}>
                <span>NET TOTAL:</span>
                <span>₹{data.total.toFixed(0)}</span>
              </div>

              <div className="divider-double" style={{ borderTop: '2px double #000', margin: '5px 0' }} />
            </div>

            {/* 5. Payment Information */}
            <div className="payment-info" style={{ fontSize: '10.5px', margin: '4px 0' }}>
              <div className="total-line" style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                <span>Payment Mode:</span>
                <strong>{data.paymentMethod.toUpperCase()}</strong>
              </div>

              {data.paymentMethod === 'Cash' && data.cashReceived !== undefined && (
                <>
                  <div className="total-line" style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                    <span>Cash Received:</span>
                    <span>₹{data.cashReceived.toFixed(0)}</span>
                  </div>
                  {data.changeDue !== undefined && (
                    <div className="total-line" style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0', fontWeight: 700 }}>
                      <span>Change Returned:</span>
                      <span>₹{data.changeDue.toFixed(0)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="divider-dash" style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

            {/* 6. Footer: Brand Closing */}
            <div className="footer-closing" style={{ textAlign: 'center', marginTop: '8px', fontSize: '9.5px', lineHeight: 1.4 }}>
              <strong>THANK YOU FOR VISITING!</strong>
              <div style={{ fontWeight: 700, marginTop: '2px' }}>BAKE FACTORY</div>
              <div style={{ fontSize: '8.5px', color: '#333' }}>CAKES & DESSERTS</div>
              <div className="motto" style={{ fontStyle: 'italic', marginTop: '3px', color: '#444' }}>
                Baked fresh. Served happy.
              </div>
            </div>

          </div>
        </div>

        {/* ── Modal Action Controls (Web UI Only) ── */}
        <div className={styles.modalActions}>
          <button 
            className={styles.bluetoothBtn} 
            onClick={handleBluetoothPrint}
            disabled={printingBt}
          >
            <Bluetooth size={16} />
            <span>{printingBt ? 'Connecting...' : 'Print Bluetooth (ESC/POS)'}</span>
          </button>

          <button 
            className={styles.thermalPrintBtn} 
            onClick={handleSystemPrint}
          >
            <Printer size={16} />
            <span>Print Bill / Download PDF</span>
          </button>

          <button 
            className={styles.newSaleBtn} 
            onClick={onNewSale}
          >
            <Sparkles size={16} />
            <span>New Sale</span>
          </button>
        </div>

      </div>
    </div>
  );
};
