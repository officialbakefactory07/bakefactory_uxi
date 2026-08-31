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

  const handleSystemPrint = () => {
    const printContent = document.getElementById('printable-thermal-receipt');
    if (!printContent) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt_${data.invoiceNumber}</title>
          <style>
            @page {
              margin: 0;
              size: 80mm auto;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              margin: 0;
              padding: 15px 12px;
              color: #000;
              background: #fff;
              font-size: 12px;
              line-height: 1.4;
            }
            * { box-sizing: border-box; }
            .logo-center { text-align: center; margin-bottom: 8px; }
            .logo-center img { width: 55px; height: 55px; object-fit: contain; }
            .title { font-size: 18px; font-weight: 800; text-align: center; margin: 0; }
            .tagline { font-size: 10px; font-weight: 700; text-align: center; margin: 2px 0 4px; }
            .address { font-size: 10px; text-align: center; margin: 0; color: #444; }
            .hr-dash { border-top: 1px dashed #000; margin: 8px 0; }
            .hr-solid { border-top: 1px solid #000; margin: 8px 0; }
            .hr-double { border-top: 2px double #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 3px 0; font-size: 11px; }
            table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 11px; }
            th { text-align: left; padding: 4px 0; border-bottom: 1px solid #000; font-weight: 700; }
            td { padding: 4px 0; vertical-align: top; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .note { font-size: 10px; font-style: italic; color: #444; padding-left: 6px; }
            .grand-total { font-size: 15px; font-weight: 900; }
            .footer { text-align: center; font-size: 10px; margin-top: 10px; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="logo-center">
            <img src="/logo.png" alt="Bake Factory" />
          </div>
          <div class="title">BAKE FACTORY</div>
          <div class="tagline">CAKES & GOURMET DESSERTS</div>
          <div class="address">Catholic Church Area, Tadepalle, Vijayawada</div>
          <div class="address">Hotline: +91 79894 99446</div>
          
          <div class="hr-dash"></div>
          
          <div class="row"><span><strong>Invoice:</strong> #${data.invoiceNumber}</span><span><strong>Type:</strong> ${data.orderType}</span></div>
          <div class="row"><span><strong>Date:</strong> ${data.dateStr || new Date().toLocaleDateString('en-IN')}</span><span><strong>Time:</strong> ${data.timeStr || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
          ${data.customerName ? `<div class="row"><span><strong>Customer:</strong> ${data.customerName}</span><span>${data.customerPhone || ''}</span></div>` : ''}
          ${data.cashierName ? `<div class="row"><span><strong>Cashier:</strong> ${data.cashierName}</span></div>` : ''}

          <div class="hr-solid"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%;">ITEM</th>
                <th class="text-center" style="width: 15%;">QTY</th>
                <th class="text-right" style="width: 15%;">RATE</th>
                <th class="text-right" style="width: 20%;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.name}</strong>
                    ${item.note ? `<div class="note">↳ "${item.note}"</div>` : ''}
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">₹${item.price.toFixed(0)}</td>
                  <td class="text-right"><strong>₹${(item.quantity * item.price).toFixed(0)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="hr-solid"></div>

          <div class="row"><span>Subtotal:</span><span>₹${data.subtotal.toFixed(0)}</span></div>
          ${data.discount > 0 ? `<div class="row" style="color: #c00;"><span>Discount:</span><span>-₹${data.discount.toFixed(0)}</span></div>` : ''}
          ${data.deliveryFee && data.deliveryFee > 0 ? `<div class="row"><span>Delivery:</span><span>₹${data.deliveryFee.toFixed(0)}</span></div>` : ''}

          <div class="hr-double"></div>
          <div class="row grand-total"><span>NET TOTAL:</span><span>₹${data.total.toFixed(0)}</span></div>
          <div class="hr-double"></div>

          <div class="row"><span>Payment Mode:</span><strong>${data.paymentMethod}</strong></div>
          ${data.paymentMethod === 'Cash' && data.cashReceived !== undefined ? `
            <div class="row"><span>Cash Received:</span><span>₹${data.cashReceived.toFixed(0)}</span></div>
            <div class="row" style="font-weight: 700;"><span>Change Return:</span><span>₹${(data.changeDue || 0).toFixed(0)}</span></div>
          ` : ''}

          <div class="hr-dash"></div>

          <div class="footer">
            <strong>THANK YOU! VISIT AGAIN</strong><br/>
            Freshly Handcrafted With Passion & Love<br/>
            FSSAI Certified • www.bakefactory.in
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
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
            <CheckCircle size={22} className={styles.headerCheckIcon} />
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

        {/* Scrollable Receipt Body */}
        <div className={styles.receiptScrollArea}>
          <div className={styles.receiptPaper} id="printable-thermal-receipt">
            
            {/* Logo */}
            <div className={styles.logoWrap}>
              <div className={styles.logoCircle}>
                <Image 
                  src="/logo.png" 
                  alt="Bake Factory" 
                  width={64} 
                  height={64} 
                  className={styles.logoImg}
                  priority
                />
              </div>
            </div>

            {/* Store Title */}
            <div className={styles.storeHeader}>
              <h2 className={styles.brandTitle}>BAKE FACTORY</h2>
              <p className={styles.brandTagline}>✦ ARTISANAL CAKES & DESSERT STUDIO ✦</p>
              <p className={styles.brandAddress}>Catholic Church Area, Tadepalle, Vijayawada</p>
              <p className={styles.brandPhone}>Hotline: +91 79894 99446</p>
            </div>

            <div className={styles.dashedDivider} />

            {/* Metadata */}
            <div className={styles.metaSection}>
              <div className={styles.metaRow}>
                <span><strong>Invoice:</strong> #{data.invoiceNumber}</span>
                <span className={styles.orderTypeBadge}>{data.orderType.toUpperCase()}</span>
              </div>
              <div className={styles.metaRow}>
                <span><strong>Date:</strong> {dateStr}</span>
                <span><strong>Time:</strong> {timeStr}</span>
              </div>
              {data.customerName && (
                <div className={styles.metaRow}>
                  <span><strong>Customer:</strong> {data.customerName}</span>
                  {data.customerPhone && <span>{data.customerPhone}</span>}
                </div>
              )}
              {data.cashierName && (
                <div className={styles.metaRow}>
                  <span><strong>Cashier:</strong> {data.cashierName}</span>
                </div>
              )}
            </div>

            <div className={styles.solidDivider} />

            {/* Items Table with Guaranteed Table Structure */}
            <table className={styles.billTable}>
              <thead>
                <tr>
                  <th style={{ width: '48%' }}>ITEM</th>
                  <th style={{ width: '16%', textAlign: 'center' }}>QTY</th>
                  <th style={{ width: '16%', textAlign: 'right' }}>RATE</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className={styles.itemName}>{item.name}</div>
                      {item.note && (
                        <div className={styles.itemNote}>↳ &ldquo;{item.note}&rdquo;</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(0)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      ₹{(item.quantity * item.price).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.solidDivider} />

            {/* Totals Section */}
            <div className={styles.totalsSection}>
              <div className={styles.totalRow}>
                <span>Subtotal:</span>
                <span>₹{data.subtotal.toFixed(0)}</span>
              </div>

              {data.discount > 0 && (
                <div className={`${styles.totalRow} ${styles.discountRow}`}>
                  <span>Discount Applied:</span>
                  <span>-₹{data.discount.toFixed(0)}</span>
                </div>
              )}

              {data.deliveryFee && data.deliveryFee > 0 ? (
                <div className={styles.totalRow}>
                  <span>Delivery Charge:</span>
                  <span>₹{data.deliveryFee.toFixed(0)}</span>
                </div>
              ) : null}

              <div className={styles.doubleDivider} />

              <div className={`${styles.totalRow} ${styles.grandTotalRow}`}>
                <span>NET TOTAL:</span>
                <span>₹{data.total.toFixed(0)}</span>
              </div>

              <div className={styles.doubleDivider} />

              <div className={styles.totalRow}>
                <span>Payment Mode:</span>
                <span className={styles.paymentBadge}>{data.paymentMethod}</span>
              </div>

              {data.paymentMethod === 'Cash' && data.cashReceived !== undefined && (
                <>
                  <div className={styles.totalRow}>
                    <span>Cash Received:</span>
                    <span>₹{data.cashReceived.toFixed(0)}</span>
                  </div>
                  {data.changeDue !== undefined && (
                    <div className={`${styles.totalRow} ${styles.changeDueRow}`}>
                      <span>Change Return:</span>
                      <strong>₹{data.changeDue.toFixed(0)}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.dashedDivider} />

            {/* Footer */}
            <div className={styles.receiptFooter}>
              <strong className={styles.thankYou}>THANK YOU! VISIT AGAIN</strong>
              <p>Freshly Handcrafted With Passion & Love</p>
              <p>FSSAI Certified • www.bakefactory.in</p>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            className={styles.btBtn} 
            onClick={handleBluetoothPrint}
            disabled={printingBt}
          >
            <Bluetooth size={16} />
            <span>{printingBt ? 'Connecting Printer...' : 'Print Bluetooth (ESC/POS)'}</span>
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
