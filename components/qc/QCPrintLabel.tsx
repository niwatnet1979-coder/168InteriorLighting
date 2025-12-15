import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QC } from '@/types/schema';

interface QCPrintLabelProps {
    data: QC;
}

export const QCPrintLabel = React.forwardRef<HTMLDivElement, QCPrintLabelProps>(({ data }, ref) => {
    return (
        <div ref={ref} className="p-4 bg-white" style={{ width: '100%', maxWidth: '300px' }}>
            {/* Print Styles */}
            <style type="text/css" media="print">
                {`
                    @page { size: auto; margin: 0mm; }
                    body { margin: 1cm; }
                `}
            </style>

            <div className="border border-black p-4 flex flex-col items-center justify-center text-center">
                <h1 className="text-xl font-bold mb-2 uppercase tracking-wider">
                    {data.QCPass === 'ผ่าน' ? 'QC PASS' : 'QC CHECK'}
                </h1>

                <div className="my-2">
                    <QRCodeSVG
                        value={data.SN}
                        size={128}
                        level="M"
                    />
                </div>

                <div className="space-y-1 mt-2 w-full text-left font-mono text-sm">
                    <p><span className="font-bold">SN:</span> {data.SN}</p>
                    <p><span className="font-bold">Model:</span> {data.ProductType}</p>
                    <p><span className="font-bold">Shop:</span> {data.ShopLabel}</p>
                    <p><span className="font-bold">Date:</span> {data.QCDATE ? new Date(data.QCDATE).toLocaleDateString('th-TH') : '-'}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-black w-full text-xs text-center">
                    168 Solution
                </div>
            </div>
        </div>
    );
});

QCPrintLabel.displayName = 'QCPrintLabel';
