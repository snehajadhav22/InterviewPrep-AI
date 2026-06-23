import React, { useRef } from 'react';
import { Award, Printer, Download, ArrowLeft } from 'lucide-react';
import Card from './Card';

const Certificate = ({ userName, jobRole, score, date, onBack }) => {
  const certificateRef = useRef();

  const handlePrint = () => {
    const printContent = certificateRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    // Simple custom print template for certificate
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>InterviewPrep AI Certificate</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              font-family: 'Inter', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .certificate-container {
              width: 100%;
              max-width: 900px;
              border: 10px double #3B82F6;
              padding: 40px;
              background: radial-gradient(circle, #f8fafc 0%, #ffffff 100%);
              text-align: center;
              position: relative;
              box-sizing: border-box;
            }
            .title {
              font-size: 36px;
              font-weight: 800;
              color: #1e293b;
              text-transform: uppercase;
              letter-spacing: 2px;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              letter-spacing: 4px;
              text-transform: uppercase;
              margin-bottom: 30px;
            }
            .presented-to {
              font-size: 16px;
              font-style: italic;
              color: #64748b;
              margin-bottom: 10px;
            }
            .name {
              font-size: 40px;
              font-weight: 700;
              color: #3b82f6;
              border-bottom: 2px solid #e2e8f0;
              display: inline-block;
              padding-bottom: 10px;
              margin-bottom: 20px;
              min-width: 300px;
            }
            .description {
              font-size: 18px;
              color: #475569;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto 35px;
            }
            .score-badge {
              font-size: 24px;
              font-weight: 700;
              color: #10b981;
              margin-bottom: 40px;
            }
            .footer-info {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              padding: 0 40px;
            }
            .seal {
              width: 90px;
              height: 90px;
              background-color: #3b82f6;
              border-radius: 50%;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
              font-size: 10px;
              font-weight: bold;
              border: 4px solid #fff;
              box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
            }
            .sig-line {
              border-top: 1px solid #cbd5e1;
              width: 150px;
              margin-top: 40px;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {onBack && (
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Report
        </button>
      )}

      <Card hover={false} className="max-w-4xl mx-auto overflow-hidden">
        {/* Certificate Render Wrapper */}
        <div ref={certificateRef} className="border-4 border-dashed border-blue-500/20 p-8 md:p-12 bg-slate-900/40 rounded-xl text-center relative">
          {/* Decorative Background Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

          <div className="relative space-y-6">
            <Award className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
            
            <div>
              <h2 className="text-3xl font-extrabold text-white uppercase tracking-wider font-sans">
                Certificate of Competency
              </h2>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-[0.25em] mt-1">
                InterviewPrep AI Platform
              </p>
            </div>

            <p className="text-slate-400 italic text-sm mt-8">
              This certificate is proudly awarded to
            </p>

            <h3 className="text-4xl font-extrabold text-white underline decoration-blue-500 decoration-2 underline-offset-8 py-2 font-sans">
              {userName}
            </h3>

            <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed mt-6">
              for successfully completing the AI-evaluated mock interview simulations for the role of{' '}
              <strong className="text-blue-400 font-semibold">{jobRole}</strong>, demonstrating proficient domain competency and answering technical, practical, and situational questions.
            </p>

            <div className="text-emerald-400 font-bold text-xl py-2 tracking-wide">
              Evaluation Performance Score: {score} / 10
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between mt-12 px-6 gap-6">
              <div className="text-left">
                <div className="h-10 flex items-end">
                  <p className="font-serif text-slate-300 italic text-lg select-none">AI Assessor</p>
                </div>
                <div className="border-t border-slate-700 w-44 pt-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Authorized By</p>
                </div>
              </div>

              {/* Digital Seal */}
              <div className="w-24 h-24 rounded-full bg-blue-600/10 border-2 border-blue-500/30 flex flex-col items-center justify-center text-blue-400 shadow-lg shadow-blue-500/5 relative">
                <div className="absolute inset-1 rounded-full border border-dashed border-blue-500/20"></div>
                <Award className="w-6 h-6" />
                <span className="text-[9px] font-bold uppercase tracking-wider mt-1">VERIFIED</span>
                <span className="text-[7px] text-slate-400 uppercase mt-0.5">{formattedDate}</span>
              </div>

              <div className="text-right">
                <div className="h-10 flex items-end justify-end">
                  <p className="font-semibold text-slate-300 text-sm">{formattedDate}</p>
                </div>
                <div className="border-t border-slate-700 w-44 pt-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Date of Issuance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Actions */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
          >
            <Printer className="w-4 h-4" /> Print Certificate
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Certificate;
