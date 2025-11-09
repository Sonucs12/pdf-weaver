'use client';

import { type DragEvent } from 'react';
import { usePdfProcessor } from '@/hooks/use-pdf-processor';
import { UploadStep } from './upload-step';
import { SelectPageStep } from './select-page-step';
import { ProcessingStep } from './processing-step';
import dynamic from 'next/dynamic';
import type { StoredPdf } from './StoredPdfList';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion

const EditStep = dynamic(() => import('./edit-step').then(m => m.EditStep), {
  ssr: false,
});

// Define animation variants
const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function ClientCreateNewPage() {
  const {
    step,
    setStep,
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
    setEditedMarkdown,
    setPageRange,
    startProcessing,
    handleFileSelect,
    handleDragEvents,
    handleReset,
    currentProcessingImage,
    currentProcessingPage,
    handleCancelProcessing,
    handleCachedFileSelect,
  } = usePdfProcessor();

  const onSelectCachedPdf = (pdf: StoredPdf) => {
    if (pdf.pdfDataUri) {
      handleCachedFileSelect(pdf);
    }
  };

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'upload':
        return (
          <motion.div
            key="upload"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className='px-4 sm:px-6 md:px-8'
          >
            <UploadStep
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              onSelectCachedPdf={onSelectCachedPdf}
            />
          </motion.div>
        );
      case 'select-page':
        return (
          <motion.div
            key="select-page"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className='px-4 sm:px-6 md:px-8'
          >
            <SelectPageStep
              pageCount={pageCount}
              pageRange={pageRange}
              onPageRangeChange={setPageRange}
              onProcess={() => startProcessing(pageRange)}
            />
          </motion.div>
        );
      case 'processing':
        return (
          <motion.div
            key="processing"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6 px-4 sm:px-6 md:px-8"
          >
            <ProcessingStep progressMessage={progressMessage} />
          </motion.div>
        );
      case 'edit':
        return (
          <motion.div
            key="edit"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <EditStep
              fileName={fileName}
              editedMarkdown={editedMarkdown}
              editedText={editedText}
              onTextChange={setEditedMarkdown}
              onReset={handleReset}
              onBack={() => setStep('select-page')}
              isProcessing={isProcessing}
              progressMessage={progressMessage}
              onCancel={handleCancelProcessing}
            />
          </motion.div>
        );
    }
  };

  return (
    <div className="flex-grow flex mb-8 items-center justify-center py-4 sm:py-6 md:py-8 transition-opacity duration-500">
      <div className="w-full max-w-7xl">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
}