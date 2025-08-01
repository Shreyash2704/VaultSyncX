import React from 'react';
import { X, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

export type TransactionStep = 'processing' | 'signed' | 'submitted' | 'placed' | 'confirmed' | 'error';

interface TransactionStatusProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: TransactionStep;
  transactionHash?: string;
  errorMessage?: string;
  fromToken?: string;
  toToken?: string;
  amount?: string;
}

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  isOpen,
  onClose,
  currentStep,
  transactionHash,
  errorMessage,
  fromToken = 'TOKEN',
  toToken = 'TOKEN',
  amount = '0'
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      id: 'processing',
      title: 'Processing',
      description: 'Preparing your transaction...',
      icon: <Loader2 className="w-6 h-6 animate-spin" />,
      color: 'text-blue-500'
    },
    {
      id: 'signed',
      title: 'Order Signed',
      description: 'Transaction signed in wallet',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-500'
    },
    {
      id: 'submitted',
      title: 'Order Submitted',
      description: 'Transaction submitted to network',
      icon: <Clock className="w-6 h-6 animate-pulse" />,
      color: 'text-yellow-500'
    },
    {
      id: 'placed',
      title: 'Order Placed',
      description: 'Order placed in the system',
      icon: <Clock className="w-6 h-6" />,
      color: 'text-blue-500'
    },
    {
      id: 'confirmed',
      title: 'Order Confirmed',
      description: 'Transaction completed successfully!',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'text-green-500'
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isError = currentStep === 'error';

  const getStepStatus = (index: number) => {
    if (isError && index === currentStepIndex) return 'error';
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  const LoadingSpinner = ({ className }: { className?: string }) => (
    <div className={`inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );

  const PulsingDot = ({ className }: { className?: string }) => (
    <div className={`w-2 h-2 rounded-full animate-pulse ${className}`}></div>
  );

  const getCurrentStepLoader = () => {
    switch (currentStep) {
      case 'processing':
        return (
          <div className="flex items-center justify-center space-x-1">
            <PulsingDot className="bg-blue-500" />
            <PulsingDot className="bg-blue-500 animation-delay-200" />
            <PulsingDot className="bg-blue-500 animation-delay-400" />
          </div>
        );
      case 'signed':
        return <LoadingSpinner className="w-5 h-5 text-green-500" />;
      case 'submitted':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      case 'placed':
        return (
          <div className="relative">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-6 h-6 border-2 border-blue-300 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        );
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500 animate-pulse" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6"
        style={{ background: 'var(--color-component)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-xl font-bold"
            style={{ color: 'var(--color-font)' }}
          >
            {isError ? 'Transaction Failed' : 'Transaction Status'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            style={{ color: 'var(--color-font)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Details */}
        <div 
          className="rounded-xl p-4 mb-6"
          style={{ background: 'var(--color-card-section)' }}
        >
          <div className="text-center">
            <div 
              className="text-sm opacity-70 mb-1"
              style={{ color: 'var(--color-font)' }}
            >
              Swapping
            </div>
            <div 
              className="text-lg font-semibold"
              style={{ color: 'var(--color-font)' }}
            >
              {amount} {fromToken} → {toToken}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {isError && errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-red-800 dark:text-red-200">Error</div>
                <div className="text-sm text-red-600 dark:text-red-300">{errorMessage}</div>
              </div>
            </div>
          </div>
        )}

        {/* Steps Progress */}
        {!isError && (
          <div className="space-y-4 mb-6">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isCurrentStep = index === currentStepIndex;
              
              return (
                <div key={step.id} className="flex items-center space-x-4">
                  {/* Step Icon */}
                  <div className="flex-shrink-0">
                    {status === 'completed' ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    ) : status === 'current' ? (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--color-highlight-bg)' }}
                      >
                        {getCurrentStepLoader()}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                      </div>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className={`font-medium ${
                        status === 'completed' ? 'text-green-600 dark:text-green-400' :
                        status === 'current' ? '' : 'opacity-60'
                      }`}
                      style={{ 
                        color: status === 'current' ? 'var(--color-font)' : undefined 
                      }}
                    >
                      {step.title}
                    </div>
                    <div 
                      className={`text-sm ${
                        status === 'completed' ? 'text-green-600 dark:text-green-400' :
                        status === 'current' ? 'opacity-70' : 'opacity-50'
                      }`}
                      style={{ 
                        color: status === 'current' ? 'var(--color-font)' : undefined 
                      }}
                    >
                      {step.description}
                    </div>
                  </div>

                  {/* Loading indicator for current step */}
                  {isCurrentStep && !isError && (
                    <div className="flex-shrink-0">
                      {getCurrentStepLoader()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Transaction Hash */}
        {transactionHash && (
          <div 
            className="rounded-xl p-3 mb-4"
            style={{ background: 'var(--color-card-section)' }}
          >
            <div 
              className="text-xs opacity-70 mb-1"
              style={{ color: 'var(--color-font)' }}
            >
              Transaction Hash
            </div>
            <div 
              className="font-mono text-sm break-all"
              style={{ color: 'var(--color-font)' }}
            >
              {transactionHash}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {currentStep === 'confirmed' && (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold transition-colors"
              style={{
                background: 'var(--color-primary-btn-bg)',
                color: 'var(--color-primary-btn-text)'
              }}
            >
              Done
            </button>
          )}
          
          {isError && (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-semibold border transition-colors"
                style={{
                  borderColor: 'var(--color-font)',
                  color: 'var(--color-font)'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Add retry logic here
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl font-semibold transition-colors"
                style={{
                  background: 'var(--color-primary-btn-bg)',
                  color: 'var(--color-primary-btn-text)'
                }}
              >
                Retry
              </button>
            </>
          )}
          
          {currentStep !== 'confirmed' && !isError && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold border transition-colors"
              style={{
                borderColor: 'var(--color-font)',
                color: 'var(--color-font)'
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;