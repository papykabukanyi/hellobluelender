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
}: SignatureFormProps) {
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const [isSigned, setIsSigned] = useState<boolean>(!!signature);
  const [canvasWidth, setCanvasWidth] = useState<number>(500);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  
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
    
    // Check if signature exists
    if (!isSigned) {
      alert("Please add your signature before proceeding");
      return;
    }
    
    // If using canvas signature and there's a signature pad
    if (showSignatureCanvas && sigCanvas.current) {
      // Always get the signature from the canvas to ensure we have the most recent version
      const isEmpty = sigCanvas.current.isEmpty();
      
      if (!isEmpty) {
        // If canvas is not empty, get the signature data
        const dataUrl = sigCanvas.current.toDataURL('image/png');
        
        // Verify the data URL looks valid
        if (dataUrl && dataUrl.startsWith('data:image/png;base64,')) {
          console.log('Signature captured successfully');
          onSignatureChange(dataUrl);
          setIsSigned(true);
        } else {
          console.error('Failed to generate valid signature data URL');
          // Try again with different format
          const jpgDataUrl = sigCanvas.current.toDataURL('image/jpeg');
          onSignatureChange(jpgDataUrl);
          setIsSigned(true);
        }
      } else {
        console.warn('Signature canvas is empty');
        setIsSigned(false);
        return; // Don't proceed if no signature
      }
    }
    
    // If we've reached here, we have a signature (either from canvas or text)
    onNext({});
  };
  
  // Generate signature from name
  const generateSignature = () => {
    if (firstName && lastName) {
      // Generate signature from name
      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set signature style
        ctx.font = 'italic 36px cursive';
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'middle';
        
        // Position in the middle of canvas
        const fullName = `${firstName} ${lastName}`;
        const textWidth = ctx.measureText(fullName).width;
        const xPos = (canvas.width - textWidth) / 2;
        
        // Draw the signature
        ctx.fillText(fullName, xPos, canvas.height / 2);
        
        // Convert to data URL and set as signature
        const signatureDataUrl = canvas.toDataURL('image/png');
        onSignatureChange(signatureDataUrl);
        setIsSigned(true);
      }
    } else {
      alert('Please enter both first name and last name to generate a signature');
    }
  };
  
  // Clear signature
  const clearSignature = () => {
    if (showSignatureCanvas && sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false);
      onSignatureChange(null);
    } else {
      setFirstName('');
      setLastName('');
      setIsSigned(false);
      onSignatureChange(null);
    }
  };
  
  // Load saved signature if available
  useEffect(() => {
    if (signature && sigCanvas.current && showSignatureCanvas) {
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
  }, [signature, showSignatureCanvas]);
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Agreement &amp; Signature</h2>
        
        <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Terms &amp; Agreement</h3>
          <p className="text-sm text-gray-600 mb-4">
            By signing below, I confirm that all information provided is accurate and complete.
            I authorize EMPIRE ENTREPRISE to verify any information provided on this application,
            including but not limited to credit history, bank references, and business information.
          </p>
          
          <p className="text-sm text-gray-600">
            I understand that submission of this application does not guarantee approval for financing.
            If approved, additional documentation and a formal agreement will be required
            that must be reviewed and accepted before funds are disbursed.
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="signature" className="block text-sm font-medium text-gray-700 mb-2">
            Sign Here *
          </label>
          
          {!showSignatureCanvas ? (
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={generateSignature}
                className="w-full py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition"
                disabled={!firstName || !lastName}
              >
                Click here to sign
              </button>
              
              <p className="mt-3 text-center text-sm text-gray-500">- OR -</p>
              <button 
                type="button" 
                onClick={() => setShowSignatureCanvas(true)}
                className="w-full mt-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Draw my signature manually
              </button>
            </div>
          ) : (
            <>
              <div className="border border-gray-300 rounded bg-white relative">
                {!isSigned && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                    <span className="text-gray-500">Draw your signature here</span>
                  </div>
                )}
                <SignatureCanvas
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
                  onClick={() => setShowSignatureCanvas(false)}
                  className="text-sm text-primary hover:underline"
                >
                  Back to text signature
                </button>
              </div>
            </>
          )}
          
          <div className="mt-2 flex justify-end">
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
