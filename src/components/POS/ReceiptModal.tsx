"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Bluetooth, Printer, CheckCircle, X, Sparkles, AlertCircle } from 'lucide-react';
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
        setStatusMsg({ type: 'success', text: 'Printed successfully to Bluetooth Printer!' });
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

  // Robust Thermal & PDF print using dedicated clean iframe
  const handleSystemPrint = () => {
    const receiptEl = document.getElementById('printable-thermal-receipt');
    if (!receiptEl) {
      window.print();
      return;
    }

    const printWindow = document.createElement('iframe');
    printWindow.style.position = 'absolute';
    printWindow.style.top = '-9999px';
    printWindow.style.left = '-9999px';
    printWindow.style.width = '0px';
    printWindow.style.height = '0px';
    printWindow.style.border = 'none';

    document.body.appendChild(printWindow);

    const doc = printWindow.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    const receiptHtml = receiptEl.outerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt #${data.invoiceNumber} - Bake Factory</title>
          <style>
            @page {
              margin: 0;
              size: 80mm auto;
            }
            body {
              margin: 0;
              padding: 6mm 4mm;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #000000;
              background: #FFFFFF;
              font-size: 12px;
              line-height: 1.4;
            }
            * {
              box-sizing: border-box;
            }
            img {
              max-width: 60px;
              height: auto;
              display: block;
              margin: 0 auto 6px auto;
            }
            .brandTitle {
              font-size: 18px;
              font-weight: 800;
              text-align: center;
              margin: 0 0 2px 0;
              letter-spacing: 1px;
            }
            .brandTagline {
              font-size: 10px;
              font-weight: 700;
              text-align: center;
              margin: 0 0 4px 0;
              text-transform: uppercase;
            }
            .brandAddress, .brandPhone {
              font-size: 10px;
              text-align: center;
              margin: 0 0 2px 0;
              color: #333333;
            }
            .divider {
              border-top: 1px dashed #444444;
              margin: 6px 0;
            }
            .solidDivider {
              border-top: 1px solid #000000;
              margin: 6px 0;
            }
            .doubleDivider {
              border-top: 2px double #000000;
              margin: 6px 0;
            }
            .metaRow {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin: 2px 0;
            }
            .tableHeader {
              display: flex;
              justify-content: space-between;
              font-weight: 800;
              font-size: 11px;
              margin-bottom: 4px;
            }
            .tableRow {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin: 4px 0;
            }
            .itemNote {
              font-size: 10px;
              font-style: italic;
              color: #444444;
              padding-left: 6px;
            }
            .totalRow {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              margin: 3px 0;
            }
            .grandTotal {
              font-size: 15px;
              font-weight: 900;
              margin: 4px 0;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 8px;
              line-height: 1.4;
            }
            .footer strong {
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          ${receiptHtml}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printWindow.contentWindow?.focus();
      printWindow.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 1000);
    }, 250);
  };

  const now = new Date();
  const dateStr = data.dateStr || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = data.timeStr || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalCard}>
        
        {/* Top Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <CheckCircle size={20} className={styles.headerCheckIcon} />
            <div>
              <h3>Bill Generated Successfully</h3>
              <span>Invoice #{data.invoiceNumber} • {data.orderType}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {statusMsg && (
          <div className={`${styles.statusBanner} ${statusMsg.type === 'error' ? styles.statusError : styles.statusSuccess}`}>
            {statusMsg.type === 'error' && <AlertCircle size={15} />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Unified Luxury Receipt Body */}
        <div className={styles.receiptScrollArea}>
          <div className={styles.receiptPaper} id="printable-thermal-receipt">
            
            {/* Logo */}
            <div className={styles.logoWrap}>
              <Image 
                src="/logo.png" 
                alt="Bake Factory" 
                width={70} 
                height={70} 
                className={styles.logoImg}
                priority
              />
            </div>

            {/* Store Title */}
            <div className={styles.storeHeader}>
              <h2 className="brandTitle">BAKE FACTORY</h2>
              <p className="brandTagline">Cakes & Gourmet Desserts</p>
              <p className="brandAddress">Catholic Church Area, Tadepalle, Vijayawada</p>
              <p className="brandPhone">Hotline: +91 79894 99446</p>
            </div>

            <div className="divider" />

            {/* Meta */}
            <div className={styles.metaSection}>
              <div className="metaRow">
                <span><strong>Invoice:</strong> #{data.invoiceNumber}</span>
                <span><strong>Type:</strong> {data.orderType}</span>
              </div>
              <div className="metaRow">
                <span><strong>Date:</strong> {dateStr}</span>
                <span><strong>Time:</strong> {timeStr}</span>
              </div>
              {data.customerName && (
                <div className="metaRow">
                  <span><strong>Customer:</strong> {data.customerName}</span>
                  {data.customerPhone && <span>{data.customerPhone}</span>}
                </div>
              )}
              {data.cashierName && (
                <div className="metaRow">
                  <span><strong>Cashier:</strong> {data.cashierName}</span>
                </div>
              )}
            </div>

            <div className="solidDivider" />

            {/* Items Table */}
            <div className={styles.itemsSection}>
              <div className="tableHeader">
                <span style={{ flex: 2 }}>ITEM</span>
                <span style={{ width: '35px', textAlign: 'center' }}>QTY</span>
                <span style={{ width: '45px', textAlign: 'right' }}>RATE</span>
                <span style={{ width: '55px', textAlign: 'right' }}>TOTAL</span>
              </div>
              <div className="solidDivider" />

              {data.items.map((item, idx) => (
                <div key={idx} className={styles.itemRow}>
                  <div className="tableRow">
                    <span style={{ flex: 2, fontWeight: 600 }}>{item.name}</span>
                    <span style={{ width: '35px', textAlign: 'center' }}>{item.quantity}</span>
                    <span style={{ width: '45px', textAlign: 'right' }}>₹{item.price.toFixed(0)}</span>
                    <span style={{ width: '55px', textAlign: 'right', fontWeight: 700 }}>₹{(item.quantity * item.price).toFixed(0)}</span>
                  </div>
                  {item.note && (
                    <div className="itemNote">↳ Note: &ldquo;{item.note}&rdquo;</div>
                  )}
                </div>
              ))}
            </div>

            <div className="solidDivider" />

            {/* Totals */}
            <div className={styles.totalsSection}>
              <div className="totalRow">
                <span>Subtotal:</span>
                <span>₹{data.subtotal.toFixed(0)}</span>
              </div>
              {data.discount > 0 && (
                <div className="totalRow" style={{ color: '#C62828', fontWeight: 700 }}>
                  <span>Discount:</span>
                  <span>-₹{data.discount.toFixed(0)}</span>
                </div>
              )}
              {data.deliveryFee && data.deliveryFee > 0 ? (
                <div className="totalRow">
                  <span>Delivery Fee:</span>
                  <span>₹{data.deliveryFee.toFixed(0)}</span>
                </div>
              ) : null}

              <div className="doubleDivider" />

              <div className="totalRow grandTotal">
                <span>NET TOTAL:</span>
                <span>₹{data.total.toFixed(0)}</span>
              </div>

              <div className="doubleDivider" />

              <div className="totalRow">
                <span>Payment Mode:</span>
                <strong>{data.paymentMethod}</strong>
              </div>

              {data.paymentMethod === 'Cash' && data.cashReceived !== undefined && (
                <>
                  <div className="totalRow">
                    <span>Cash Received:</span>
                    <span>₹{data.cashReceived.toFixed(0)}</span>
                  </div>
                  {data.changeDue !== undefined && (
                    <div className="totalRow" style={{ color: '#2E7D32', fontWeight: 700 }}>
                      <span>Change Due:</span>
                      <span>₹{data.changeDue.toFixed(0)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="divider" />

            {/* Footer */}
            <div className="footer">
              <strong>THANK YOU! VISIT AGAIN</strong>
              <div>Freshly Handcrafted With Passion</div>
              <div>FSSAI Certified • www.bakefactory.in</div>
            </div>

          </div>
        </div>

        {/* Buttons */}
        <div className={styles.actions}>
          <button 
            className={styles.btBtn} 
            onClick={handleBluetoothPrint}
            disabled={printingBt}
          >
            <Bluetooth size={16} />
            <span>{printingBt ? 'Connecting...' : 'Print Bluetooth (ESC/POS)'}</span>
          </button>

          <button 
            className={styles.printBtn} 
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
