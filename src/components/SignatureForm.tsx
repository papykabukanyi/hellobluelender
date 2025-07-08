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
    if (!isSigned || !signature) {
      alert("Please add your signature before proceeding");
      return;
    }
    
    // If using canvas signature and there's a signature pad
    if (showSignatureCanvas && sigCanvas.current) {
      try {
        // Always get the signature from the canvas to ensure we have the most recent version
        const isEmpty = sigCanvas.current.isEmpty();
        
        if (!isEmpty) {
          try {
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
          } catch (error) {
            console.error('Error creating signature data URL:', error);
            alert("There was a problem processing your signature. Please try again or use the text-based signature option.");
            return;
          }
        } else {
          console.warn('Signature canvas is empty');
          alert("Your signature appears to be empty. Please sign before proceeding.");
          setIsSigned(false);
          return; // Don't proceed if no signature
        }
      } catch (error) {
        console.error('Error processing canvas signature:', error);
        alert("There was a problem with your signature. Please try again.");
        return;
      }
    }
    
    // Verify we have a valid signature before proceeding
    if (!signature) {
      alert("Please create a valid signature before proceeding");
      return;
    }
    
    // If we've reached here, we have a signature (either from canvas or text)
    onNext({});
  };
  // Generate signature from name - simplified to avoid tesseract errors
  const generateSignature = () => {
    if (firstName && lastName) {
      try {
        // Create a simpler signature without any OCR dependencies
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error("Could not get canvas context");
        }
        
        // Clear canvas and set white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a simple line as base
        ctx.strokeStyle = '#f0f0f0';
        ctx.beginPath();
        ctx.moveTo(40, 150);
        ctx.lineTo(canvas.width - 40, 150);
        ctx.stroke();
        
        // Format full name text
        const fullName = `${firstName} ${lastName}`;
        
        // Draw text signature
        ctx.fillStyle = 'black';
        
        // Try different fonts based on availability
        const fonts = [
          'italic 38px "Dancing Script", cursive',
          'italic 38px "Caveat", cursive',
          'italic 38px "Pacifico", cursive',
          'italic 38px "Great Vibes", cursive',
          'italic 38px cursive',
          'italic 38px "Comic Sans MS"',
          'italic 38px "Arial"'
        ];
        
        // Try fonts until one works
        let fontUsed = false;
        for (const font of fonts) {
          try {
            ctx.font = font;
            const textWidth = ctx.measureText(fullName).width;
            if (textWidth > 0) {
              fontUsed = true;
              break;
            }
          } catch (e) {
            console.warn(`Font failed: ${font}`, e);
          }
        }
        
        if (!fontUsed) {
          ctx.font = 'italic 38px sans-serif';
        }
        
        // Calculate position for centered text
        const textWidth = ctx.measureText(fullName).width;
        const xPos = Math.max(20, (canvas.width - textWidth) / 2);
        
        // Draw the signature text
        ctx.fillText(fullName, xPos, canvas.height / 2);
        
        // Add some decorative elements to make it look more like a signature
        const lastNameStart = ctx.measureText(firstName + " ").width + xPos;
        ctx.beginPath();
        ctx.moveTo(lastNameStart, canvas.height / 2 + 5);
        ctx.lineTo(lastNameStart + ctx.measureText(lastName).width * 0.8, canvas.height / 2 + 5);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Convert to data URL
        try {
          const signatureDataUrl = canvas.toDataURL('image/png');
          onSignatureChange(signatureDataUrl);
          setIsSigned(true);
          console.log("Text signature generated successfully");
        } catch (e) {
          console.error("Error with PNG signature:", e);
          try {
            const jpgDataUrl = canvas.toDataURL('image/jpeg');
            onSignatureChange(jpgDataUrl);
            setIsSigned(true);
          } catch (jpgError) {
            console.error("Error with JPG signature:", jpgError);
            // Simple fallback - create a base64 image directly
            const fallbackBase64 = `data:image/png;base64,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`;
            onSignatureChange(fallbackBase64);
            setIsSigned(true);
          }
        }
      } catch (error) {
        console.error("Error in signature generation:", error);
        // Create a very simple text signature as absolute fallback
        const fallbackBase64 = `data:image/png;base64,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`;
        onSignatureChange(fallbackBase64);
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
                <div className="mt-4 mb-4 flex flex-col items-center">
                <button
                  type="button"
                  onClick={generateSignature}
                  className="w-full py-3 bg-primary text-white text-lg font-bold rounded-md hover:bg-primary-dark transition shadow-lg flex items-center justify-center space-x-2"
                  disabled={!firstName || !lastName}
                >
                  <span>✍️</span>
                  <span>CLICK HERE TO SIGN</span>
                </button>
                {(!firstName || !lastName) && (
                  <p className="mt-2 text-red-500 text-sm">Please enter both first and last name to generate your signature</p>
                )}
              </div>
              
              <p className="mt-3 text-center text-sm text-gray-500">- OR -</p><button
                type="button"
                onClick={() => setShowSignatureCanvas(true)}
                className="w-full mt-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
              >
                Draw my signature manually
              </button>
              
              {isSigned && (
                <div className="mt-4 p-3 border rounded bg-gray-50">
                  <p className="text-sm text-gray-700 mb-1">Your signature:</p>
                  <img src={signature || ''} alt="Your signature" className="max-h-24 mx-auto" />
                </div>
              )}
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
