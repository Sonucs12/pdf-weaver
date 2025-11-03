'use client';

import { type DragEvent } from 'react';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { LiveImagePreview } from './components/LiveImagePreview';
import { UploadStep } from './components/upload-step';
import { SelectPageStep } from './components/select-page-step';
import { ProcessingStep } from './components/processing-step';
import dynamic from 'next/dynamic';
const EditStep = dynamic(() => import('./components/edit-step').then(m => m.EditStep), {
  ssr: false,
});

export default function CreateNewPage() {
  const {
    step,
    editedText,
    editedMarkdown,
    fileName,
    isDragging,
    pageCount,
    pageRange,
    progressMessage,
    isProcessing,
    fileInputRef,
    setEditedText,
    setPageRange,
    processPdf,
    handleFileSelect,
    handleDragEvents,
    handleReset,
    currentProcessingImage,
  currentProcessingPage,
  handleCancelProcessing,
  } = usePdfProcessor();

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleDragEvents(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleDragEvents(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleDragEvents(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <UploadStep
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onFileSelect={handleFileSelect}
            fileInputRef={fileInputRef}
          />
        );
      case 'select-page':
        return (
          <SelectPageStep
            pageCount={pageCount}
            pageRange={pageRange}
            onPageRangeChange={setPageRange}
            onProcess={() => processPdf(pageRange)}
          />
        );
      case 'processing':
        return (
          <div className="space-y-6">
            <ProcessingStep progressMessage={progressMessage} />
            {/* {currentProcessingImage && (
              <LiveImagePreview 
                currentImage={currentProcessingImage}
                currentPage={currentProcessingPage}
                progressMessage={progressMessage}
              />
            )} */}
          </div>
        );
      case 'edit':
        return (
          <EditStep
            fileName={fileName}
            editedText={editedText}
            editedMarkdown={editedMarkdown}
            onTextChange={setEditedText}
            onReset={handleReset}
            isProcessing={isProcessing}
            progressMessage={progressMessage}
            onCancel={handleCancelProcessing}
          />
        );
    }
  };

  return (
    <div className="flex-grow flex mb-8 items-center justify-center p-4 md:p-8 transition-opacity duration-500">
      <div className="w-full max-w-6xl">
        {renderContent()}
      </div>
      
      {/* Sticky Live Preview at bottom during edit step processing
      {isProcessing && step === 'edit' && currentProcessingImage && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg">
          <div className="max-w-6xl mx-auto">
            <LiveImagePreview 
              currentImage={currentProcessingImage}
              currentPage={currentProcessingPage}
              progressMessage={progressMessage}
            />
          </div>
        </div>
      )} */}
    </div>
  );
}

