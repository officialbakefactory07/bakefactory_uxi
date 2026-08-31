"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Bluetooth, Printer, CheckCircle, X, Download, Share2, Sparkles, Heart } from 'lucide-react';
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
      setStatusMsg({ type: 'error', text: err.message || 'Bluetooth connection failed.' });
    } finally {
      setPrintingBt(false);
    }
  };

  const handleSystemPrint = () => {
    window.print();
  };

  const now = new Date();
  const dateStr = data.dateStr || now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = data.timeStr || now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalWrapper}>
        
        {/* Action Header */}
        <div className={styles.topBar}>
          <div className={styles.topBarTitle}>
            <CheckCircle size={22} className={styles.successIcon} />
            <div>
              <h3>Bill Generated Successfully</h3>
              <span>Invoice #{data.invoiceNumber} • {data.orderType}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {statusMsg && (
          <div className={`${styles.statusBanner} ${statusMsg.type === 'error' ? styles.statusError : styles.statusSuccess}`}>
            {statusMsg.text}
          </div>
        )}

        {/* Thermal Receipt Visual Preview */}
        <div className={styles.receiptContainer}>
          <div className={styles.thermalReceipt} id="printable-thermal-receipt">
            
            {/* Logo Badge */}
            <div className={styles.receiptLogoWrap}>
              <div className={styles.receiptLogoCircle}>
                <Image 
                  src="/logo.png" 
                  alt="Bake Factory" 
                  width={68} 
                  height={68} 
                  className={styles.receiptLogoImg}
                  priority
                />
              </div>
            </div>

            {/* Brand Header */}
            <div className={styles.receiptHeader}>
              <h2 className={styles.brandTitle}>BAKE FACTORY</h2>
              <p className={styles.brandTagline}>✦ ARTISANAL CAKES & DESSERT STUDIO ✦</p>
              <p className={styles.brandAddress}>Catholic Church Area, Tadepalle, Vijayawada</p>
              <p className={styles.brandPhone}>Hotline: +91 79894 99446</p>
            </div>

            <div className={styles.goldDivider} />

            {/* Meta Info */}
            <div className={styles.receiptMeta}>
              <div className={styles.metaRow}>
                <span><strong>INVOICE:</strong> #{data.invoiceNumber}</span>
                <span className={styles.orderTypeBadge}>{data.orderType.toUpperCase()}</span>
              </div>
              <div className={styles.metaRow}>
                <span><strong>DATE:</strong> {dateStr}</span>
                <span><strong>TIME:</strong> {timeStr}</span>
              </div>
              {data.customerName && (
                <div className={styles.metaRow}>
                  <span><strong>CUSTOMER:</strong> {data.customerName}</span>
                  {data.customerPhone && <span>{data.customerPhone}</span>}
                </div>
              )}
              {data.cashierName && (
                <div className={styles.metaRow}>
                  <span><strong>CASHIER:</strong> {data.cashierName}</span>
                  <span><strong>COUNTER:</strong> Main Register</span>
                </div>
              )}
            </div>

            <div className={styles.dashedDivider} />

            {/* Items Table */}
            <div className={styles.itemsTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colItem}>ITEM DESCRIPTION</span>
                <span className={styles.colQty}>QTY</span>
                <span className={styles.colPrice}>RATE</span>
                <span className={styles.colTotal}>AMOUNT</span>
              </div>
              <div className={styles.solidDivider} />
              
              {data.items.map((item, idx) => (
                <div key={idx} className={styles.itemRowWrapper}>
                  <div className={styles.tableRow}>
                    <span className={styles.colItem}>
                      <strong>{item.name}</strong>
                    </span>
                    <span className={styles.colQty}>{item.quantity}</span>
                    <span className={styles.colPrice}>₹{item.price.toFixed(0)}</span>
                    <span className={styles.colTotal}>₹{(item.quantity * item.price).toFixed(0)}</span>
                  </div>
                  {item.note && (
                    <span className={styles.itemNote}>↳ Custom Note: &ldquo;{item.note}&rdquo;</span>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.solidDivider} />

            {/* Bill Summary */}
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
                <span>NET PAYABLE AMOUNT:</span>
                <span>₹{data.total.toFixed(0)}</span>
              </div>

              <div className={styles.doubleDivider} />

              <div className={styles.totalRow}>
                <span>Payment Mode:</span>
                <strong className={styles.paymentBadge}>{data.paymentMethod}</strong>
              </div>

              {data.paymentMethod === 'Cash' && data.cashReceived !== undefined && (
                <>
                  <div className={styles.totalRow}>
                    <span>Cash Tendered:</span>
                    <span>₹{data.cashReceived.toFixed(0)}</span>
                  </div>
                  {data.changeDue !== undefined && (
                    <div className={`${styles.totalRow} ${styles.changeDueRow}`}>
                      <span>Change Returned:</span>
                      <strong>₹{data.changeDue.toFixed(0)}</strong>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles.goldDivider} />

            {/* Footer */}
            <div className={styles.receiptFooter}>
              <p className={styles.thankYou}>THANK YOU FOR YOUR PATRONAGE!</p>
              <p className={styles.footerTagline}>Freshly Handcrafted With Pure Passion & Love</p>
              <p className={styles.certText}>FSSAI Certified • 100% Artisanal Quality</p>
              <p className={styles.webLink}>www.bakefactory.in</p>
            </div>

          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsFooter}>
          <button 
            className={styles.btPrintBtn} 
            onClick={handleBluetoothPrint}
            disabled={printingBt}
          >
            <Bluetooth size={18} />
            <span>{printingBt ? 'Connecting Printer...' : 'Print Bluetooth (ESC/POS)'}</span>
          </button>

          <button 
            className={styles.systemPrintBtn} 
            onClick={handleSystemPrint}
          >
            <Printer size={18} />
            <span>Print Thermal Bill (58mm / 80mm)</span>
          </button>

          <button 
            className={styles.newSaleBtn} 
            onClick={onNewSale}
          >
            <Sparkles size={18} />
            <span>New Sale</span>
          </button>
        </div>

      </div>
    </div>
  );
};
