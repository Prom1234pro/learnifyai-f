import { useState, useRef } from 'react';
import { Document, Page } from 'react-pdf';
import ActionButton from "../Buttons/ActionButton";
import FileViewer from 'react-file-viewer';
// import { CircleXIcon, Plus } from "lucide-react";
import { PDFDocument } from 'pdf-lib';
import { upload } from "../../api";
import { ChevronLeft, ChevronRight, Upload as UploadIcon, Plus, X as CircleXIcon, Minus } from "lucide-react";
import { useSwipeable } from "react-swipeable";

const Library = ({ selectedFiles, setSelectedFiles, togglePopup }) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [zoom, setZoom] = useState(80);
  const fileInputRef = useRef(null);

  const handleAddFileClick = () => fileInputRef.current?.click();
  const getFileType = (file) => file.name.split('.').pop().toLowerCase();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      file,
      type: getFileType(file),
      data: URL.createObjectURL(file),
      fileUri: "",
      progress: 0,
      uploading: false,
      name: file.name,
      selectedPages: getFileType(file) === 'pdf' ? [] : null,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setCurrentFileIndex(0);
  };

  const handleNext = () => setCurrentFileIndex((prev) => Math.min(prev + 1, selectedFiles.length - 1));
  const handlePrevious = () => setCurrentFileIndex((prev) => Math.max(prev - 1, 0));

  // Swipe handling
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNext, // Swipe left → next file
    onSwipedRight: handlePrevious, // Swipe right → previous file
    trackMouse: true, // Enables swipe detection via mouse
  });

  const handleUpload = async () => {
    togglePopup()
    for (const fileObj of selectedFiles) {
      if (fileObj.fileUri || fileObj.uploading) continue;
      
      setSelectedFiles((prev) =>
        prev.map((f) => (f.name === fileObj.name ? { ...f, uploading: true } : f))
      );
      
      let fileToUpload = fileObj.file;
      if (fileObj.type === 'pdf' && fileObj.selectedPages?.length > 0) {
        const pdfBytes = await createPdfWithSelectedPages(fileObj.file, fileObj.selectedPages);
        fileToUpload = new Blob([pdfBytes], { type: 'application/pdf' });
      }
      
      const formData = new FormData();
      formData.append('file', fileToUpload, fileObj.name);
      
      try {
        const fileUri = await upload(formData, (progress) => {
          setSelectedFiles((prev) =>
            prev.map((f) => (f.name === fileObj.name ? { ...f, progress } : f))
          );
        });

        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.name === fileObj.name ? { ...f, fileUri: fileUri.file_uri, uploading: false } : f
          )
        );
      } catch (error) {
        console.error('Upload failed:', error);
        setSelectedFiles((prev) =>
          prev.map((f) => (f.name === fileObj.name ? { ...f, uploading: false } : f))
        );
      }
    }
  };

  const createPdfWithSelectedPages = async (file, selectedPages) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFDocument.create();
    const pages = await newPdfDoc.copyPages(pdfDoc, selectedPages.map((p) => p - 1));
    pages.forEach((page) => newPdfDoc.addPage(page));
    return await newPdfDoc.save();
  };

  const currentFile = selectedFiles[currentFileIndex];

  return (
    <div className="fixed z-[9999999] h-screen inset-0 flex items-center justify-center bg-black bg-opacity-50" {...swipeHandlers}>
      <div className="bg-black bg-opacity-50 h-full w-full max-w-4xl shadow-md flex flex-col">
        {/* Navigation Bar */}
        <nav className="text-white p-4 flex justify-between items-center">
          {selectedFiles.length > 0 && (
            <div className="max-w-[6rem] sm:max-w-lg overflow-hidden whitespace-nowrap text-ellipsis">
              <h1 className="text-lg md:text-2xl font-semibold truncate">{currentFile?.name}</h1>
            </div>
          )}
          <div className="flex ml-auto items-center space-x-4">
            <ActionButton icon={Plus} active text="Add File" onClick={handleAddFileClick} className="py-[0.4rem]" />
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <CircleXIcon onClick={togglePopup} className="h-9 w-9 cursor-pointer" />
          </div>
        </nav>

        {/* Body Content */}
        {selectedFiles.length > 0 ? (
          <div className="flex-1 relative flex flex-col">
            {/* File Navigation Controls */}
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center space-x-2">
                {/* Left Arrow */}
                <button
                  onClick={handlePrevious}
                  disabled={currentFileIndex === 0}
                  className="p-2 absolute left-2 top-1/2 -translate-y-1/2 bg-gray-700 rounded-full text-white hover:bg-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                <span className="text-white ">File {currentFileIndex + 1} of {selectedFiles.length}</span>

                {/* Right Arrow */}
                <button
                  onClick={handleNext}
                  disabled={currentFileIndex === selectedFiles.length - 1}
                  className="p-2 absolute right-2 top-1/2 -translate-y-1/2 bg-gray-700 rounded-full text-white hover:bg-gray-600 disabled:opacity-50"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-2 pr-2">
                {/* Zoom Controls */}
                <span className="text-white mr-10">{zoom}%</span>
                <button onClick={() => setZoom((prev) => Math.max(prev - 10, 10))} className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500">
                  <Minus size={15}/>
                </button>
                <button onClick={() => setZoom((prev) => Math.min(prev + 10, 200))} className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500">
                  <Plus size={15}/>
                </button>

                {/* Upload Button */}
                <button onClick={handleUpload} className={`p-2 rounded-full text-white bg-gradient-to-r from-[#632366] to-[#44798E]`}>
                  <UploadIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* File Preview */}
            <div className="flex-1 overflow-hidden">
              {currentFile && (
                <Preview
                  file={currentFile.file}
                  type={currentFile.type}
                  selectedPages={currentFile.selectedPages}
                  setSelectedPages={(pages) =>
                    setSelectedFiles((prev) => {
                      const newFiles = [...prev];
                      newFiles[currentFileIndex].selectedPages = pages;
                      return newFiles;
                    })
                  }
                  zoom={zoom}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center italic text-white">
            No file found in your library
          </div>
        )}
      </div>
    </div>
  );
};


const Preview = ({ file, type, selectedPages, setSelectedPages, zoom }) => {
  if (type === 'pdf') {
    return (
      <PDFPreview
        file={file}
        selectedPages={selectedPages}
        setSelectedPages={setSelectedPages}
        zoom={zoom}
      />
    );
  } else if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
    return <ImagePreview file={file} zoom={zoom} />;
  } else {
    return <DocPreview file={file} type={type} zoom={zoom} />;
  }
};

const PDFPreview = ({ file, selectedPages, setSelectedPages, zoom }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handlePageClick = (page) => {
    setPageNumber(page);
    setSelectedPages(
      selectedPages.includes(page)
        ? selectedPages.filter((p) => p !== page)
        : [...selectedPages, page]
    );
  };

  return (
    <div className="w-full px-4 overflow-y-auto max-h-[calc(100vh-130px)]">
      <div className="w-full">
        <div className="relative">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (_, index) => {
            const page = index + 1;
            return (
              <div
                key={index}
                className={'mb-4 flex items-center justify-center space-x-2 cursor-pointer p-2 rounded-lg'}
              >
                <div className={` p-2 rounded-lg ${
                  selectedPages.includes(page) ? 'border-2 border-blue-500' : 'border-2 border-transparent'
                }`}>

                <Page pageNumber={page}
                onClick={() => handlePageClick(page)}
                scale={zoom / 200}
                renderTextLayer={false} 
                renderAnnotationLayer={false} 
                />
                </div>
              </div>
            );
          })}
        </Document>
        </div>
      </div>
    </div>
  );
};

const ImagePreview = ({ file, zoom }) => {
  return (
    <div className="w-full bg-white p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      <img
        src={URL.createObjectURL(file)}
        alt="Preview"
        style={{ width: `${zoom}%`, maxWidth: '100%' }}
        className="rounded-lg"
      />
    </div>
  );
};

const DocPreview = ({ file, type, zoom }) => {
  // If the type is "pdf", redirect to PDFPreview
  if (type === 'pdf') {
    return (
      <div className="w-full bg-white p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <p className="text-red-500">PDFs should be previewed using PDFPreview. This is a fallback message.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      <div style={{ width: `${zoom}%`, maxWidth: '100%' }}>
        <FileViewer fileType={type} filePath={URL.createObjectURL(file)} />
      </div>
    </div>
  );
};

export default Library;