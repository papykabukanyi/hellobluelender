'use client';

import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

type SignatureFormProps = {
  onNext: (data: any) => void;
  onBack: () => void;
  onSignatureChange: (dataUrl: string | null) => void;
  signature: string | null;
};

export default function SignatureForm({ 
  onNext, 
  onBack, 
  onSignatureChange, 
  signature 
}: SignatureFormProps) {  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isSigned, setIsSigned] = useState<boolean>(!!signature);
  const [canvasWidth, setCanvasWidth] = useState<number>(500);
  
  // Set canvas width based on screen size
  useEffect(() => {
    const handleResize = () => {
      setCanvasWidth(window.innerWidth > 768 ? 500 : Math.min(300, window.innerWidth - 40));
    };
    
    // Set initial width
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSigned && sigCanvas.current) {
      // If we don't have a saved signature, get it from the canvas
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      onSignatureChange(dataUrl);
    }
    
    onNext({});
  };
  
  // Clear signature
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false);
      onSignatureChange(null);
    }
  };
  
  // Load saved signature if available
  useEffect(() => {
    if (signature && sigCanvas.current) {
      // This is a bit hacky, but we need to load the signature image into the canvas
      // Creating a temporary image and using the canvas context to draw it
      const image = new Image();
      image.onload = () => {
        if (sigCanvas.current) {
          const ctx = sigCanvas.current.getCanvas().getContext('2d');
          if (ctx) {
            sigCanvas.current.clear();
            ctx.drawImage(image, 0, 0);
            setIsSigned(true);
          }
        }
      };
      image.src = signature;
    }
  }, [signature]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Please read and sign the application agreement below:
        </p>
        
        <div className="mb-6 p-4 border border-gray-300 rounded bg-gray-50 text-sm leading-relaxed">
          <h4 className="font-bold mb-2">Application Agreement and Authorization</h4>
          <p className="mb-2">
            By signing below, I/we certify that all information provided in this application is true, correct, and complete.
          </p>
          <p className="mb-2">
            I/we authorize Hempire Enterprise to investigate all information provided, including obtaining credit reports, 
            contacting references, and verifying any information provided with this application.
          </p>
          <p className="mb-2">
            I/we understand that submission of this application does not guarantee approval for financing
            and that additional information may be requested.
          </p>
          <p>
            I/we acknowledge that if approved, the final terms of any financing will be provided in a separate agreement
            that must be reviewed and accepted before funds are disbursed.
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
            Sign Here *
          </label>          <div className="border border-gray-300 rounded bg-white relative">
            {!isSigned && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                <span className="text-gray-500">Draw your signature here</span>
              </div>
            )}            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: canvasWidth,
                height: 200,
                className: 'w-full h-48 touch-none'
              }}
              dotSize={2}
              minWidth={1.5}
              maxWidth={4}
              penColor="black"
              backgroundColor="rgba(0,0,0,0)"
              onEnd={() => setIsSigned(true)}
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-sm text-gray-500">
              <span className="hidden sm:inline">Use your mouse or </span>
              <span>Touch the area to sign</span>
            </p>
            <button
              type="button"
              onClick={clearSignature}
              className="text-primary text-sm underline"
            >
              Clear Signature
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="btn-outline"
        >
          Back
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={!isSigned}
        >
          Next
        </button>
      </div>
    </form>
  );
}
