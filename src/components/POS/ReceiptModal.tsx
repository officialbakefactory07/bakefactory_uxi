"use client";

import React, { useState } from 'react';
import { Bluetooth, Printer, CheckCircle, X, Download, Share2, Sparkles } from 'lucide-react';
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

        {/* Thermal Receipt Visual Preview (58mm Paper Roll Look) */}
        <div className={styles.receiptContainer}>
          <div className={styles.thermalReceipt} id="printable-thermal-receipt">
            
            {/* Header */}
            <div className={styles.receiptHeader}>
              <h2 className={styles.brandTitle}>BAKE FACTORY</h2>
              <p className={styles.brandTagline}>Cakes & Gourmet Desserts</p>
              <p className={styles.brandAddress}>Catholic Church Area, Tadepalle, Vijayawada</p>
              <p className={styles.brandPhone}>Ph: +91 79894 99446</p>
            </div>

            <div className={styles.dashedDivider} />

            {/* Meta Info */}
            <div className={styles.receiptMeta}>
              <div className={styles.metaRow}>
                <span>Invoice: #{data.invoiceNumber}</span>
                <span>Type: {data.orderType}</span>
              </div>
              <div className={styles.metaRow}>
                <span>Date: {dateStr}</span>
                <span>Time: {timeStr}</span>
              </div>
              {data.customerName && (
                <div className={styles.metaRow}>
                  <span>Customer: {data.customerName}</span>
                  {data.customerPhone && <span>{data.customerPhone}</span>}
                </div>
              )}
              {data.cashierName && (
                <div className={styles.metaRow}>
                  <span>Cashier: {data.cashierName}</span>
                </div>
              )}
            </div>

            <div className={styles.dashedDivider} />

            {/* Items Table */}
            <div className={styles.itemsTable}>
              <div className={styles.tableHeader}>
                <span className={styles.colItem}>ITEM</span>
                <span className={styles.colQty}>QTY</span>
                <span className={styles.colTotal}>TOTAL</span>
              </div>
              <div className={styles.solidDivider} />
              
              {data.items.map((item, idx) => (
                <div key={idx} className={styles.itemRowWrapper}>
                  <div className={styles.tableRow}>
                    <span className={styles.colItem}>{item.name}</span>
                    <span className={styles.colQty}>{item.quantity}x</span>
                    <span className={styles.colTotal}>₹{(item.quantity * item.price).toFixed(0)}</span>
                  </div>
                  {item.note && (
                    <span className={styles.itemNote}>* Note: {item.note}</span>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.dashedDivider} />

            {/* Bill Summary */}
            <div className={styles.totalsSection}>
              <div className={styles.totalRow}>
                <span>Subtotal:</span>
                <span>₹{data.subtotal.toFixed(0)}</span>
              </div>
              
              {data.discount > 0 && (
                <div className={styles.totalRow}>
                  <span>Discount:</span>
                  <span>-₹{data.discount.toFixed(0)}</span>
                </div>
              )}

              {data.deliveryFee && data.deliveryFee > 0 ? (
                <div className={styles.totalRow}>
                  <span>Delivery Fee:</span>
                  <span>₹{data.deliveryFee.toFixed(0)}</span>
                </div>
              ) : null}

              <div className={styles.solidDivider} />

              <div className={`${styles.totalRow} ${styles.grandTotalRow}`}>
                <span>NET TOTAL:</span>
                <span>₹{data.total.toFixed(0)}</span>
              </div>

              <div className={styles.solidDivider} />

              <div className={styles.totalRow}>
                <span>Payment Mode:</span>
                <strong>{data.paymentMethod}</strong>
              </div>

              {data.paymentMethod === 'Cash' && data.cashReceived !== undefined && (
                <>
                  <div className={styles.totalRow}>
                    <span>Cash Received:</span>
                    <span>₹{data.cashReceived.toFixed(0)}</span>
                  </div>
                  {data.changeDue !== undefined && (
                    <div className={styles.totalRow}>
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
              <p className={styles.thankYou}>THANK YOU! VISIT AGAIN</p>
              <p>FSSAI Lic. Certified Quality</p>
              <p>www.bakefactory.in</p>
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
            <span>{printingBt ? 'Connecting...' : 'Print Bluetooth (ESC/POS)'}</span>
          </button>

          <button 
            className={styles.systemPrintBtn} 
            onClick={handleSystemPrint}
          >
            <Printer size={18} />
            <span>System Thermal Print</span>
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
