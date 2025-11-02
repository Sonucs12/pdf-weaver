'use client';

import { type DragEvent } from 'react';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { UploadStep } from '@/components/pdf-weaver/upload-step';
import { SelectPageStep } from '@/components/pdf-weaver/select-page-step';
import { ProcessingStep } from '@/components/pdf-weaver/processing-step';
import dynamic from 'next/dynamic';
const EditStep = dynamic(() => import('@/components/pdf-weaver/edit-step').then(m => m.EditStep), {
  ssr: false,
});

export default function ExtractTextPage() {
  const {
    step,
    editedText,
    fileName,
    isDragging,
    pageCount,
    pageRange,
    progressMessage,
    fileInputRef,
    setEditedText,
    setPageRange,
    processPdf,
    handleFileSelect,
    handleDragEvents,
    handleDownload,
    handleReset,
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
        return <ProcessingStep progressMessage={progressMessage} />;
      case 'edit':
        return (
          <EditStep
            fileName={fileName}
            editedText={editedText}
            onTextChange={setEditedText}
            onDownload={handleDownload}
            onReset={handleReset}
          />
        );
    }
  };

  return (
    <div className="flex-grow flex mb-8 items-center justify-center p-4 md:p-8 transition-opacity duration-500">
      {renderContent()}
    </div>
  );
}
