import { useState } from 'react';
import { Document, Page } from 'react-pdf';
import FileViewer from 'react-file-viewer';
import { PDFDocument } from 'pdf-lib';
import { upload } from "../../api";

const FileUploader = ({ selectedFiles, setSelectedFiles }) => {
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [zoom, setZoom] = useState(80);

  const getFileType = (file) => {
    return file.name.split('.').pop().toLowerCase();
  };

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

  const handleUpload = async () => {
    for (const fileObj of selectedFiles) {
      if (fileObj.fileUri || fileObj.uploading) continue;

      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.name === fileObj.name ? { ...f, uploading: true } : f
        )
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
            prev.map((f) =>
              f.name === fileObj.name ? { ...f, progress } : f
            )
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
          prev.map((f) =>
            f.name === fileObj.name ? { ...f, uploading: false } : f
          )
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
    <div className="min-h-[50vh] bg-gray-900 flex flex-col items-center p-4">
      <h1 className="text-2xl font-semibold text-white mb-4">File Previewer</h1>
      <div className="flex items-center space-x-4 mb-4">
        <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          Choose Files
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {selectedFiles.length > 0 && (
          <span className="text-white">{selectedFiles[currentFileIndex]?.name}</span>
        )}
      </div>
      {selectedFiles.length > 0 && (
        <div className="w-full max-w-5xl bg-gray-800 rounded-lg shadow-lg">
          <div className="flex items-center justify-between p-2 bg-gray-700 border-b border-gray-600 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentFileIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentFileIndex === 0}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:bg-gray-500"
              >
                Previous File
              </button>
              <span className="text-white">
                File {currentFileIndex + 1} of {selectedFiles.length}
              </span>
              <button
                onClick={() =>
                  setCurrentFileIndex((prev) => Math.min(prev + 1, selectedFiles.length - 1))
                }
                disabled={currentFileIndex === selectedFiles.length - 1}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:bg-gray-500"
              >
                Next File
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom((prev) => Math.max(prev - 10, 10))}
                className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                −
              </button>
              <span className="text-white">{zoom}%</span>
              <button
                onClick={() => setZoom((prev) => Math.min(prev + 10, 200))}
                className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                +
              </button>
              <button
                onClick={handleUpload}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500"
              >
                Upload
              </button>
            </div>
          </div>
          <div className="flex">
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
      )}
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
    <div className="flex w-full">
      <div className="w-1/4 bg-gray-800 border-r border-gray-600 p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <h3 className="text-lg font-semibold text-white mb-4">Pages</h3>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          {Array.from(new Array(numPages), (_, index) => {
            const page = index + 1;
            return (
              <div
                key={index}
                className={`mb-4 flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${
                  pageNumber === page ? 'border-2 border-blue-500' : 'border-2 border-transparent'
                }`}
                onClick={() => handlePageClick(page)}
              >
                <input
                  type="checkbox"
                  checked={selectedPages.includes(page)}
                  onChange={() => {
                    setSelectedPages(
                      selectedPages.includes(page)
                        ? selectedPages.filter((p) => p !== page)
                        : [...selectedPages, page]
                    );
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 text-blue-500"
                />
                <Page pageNumber={page} width={150} />
              </div>
            );
          })}
        </Document>
      </div>
      <div className="w-3/4 bg-white p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="relative">
          <Document file={file}>
            <Page
              pageNumber={pageNumber}
              width={(500 * zoom) / 100}
            />
          </Document>
          <div className="absolute top-0 left-0 w-full flex justify-between p-2 bg-gray-700 bg-opacity-75 text-white">
            <span>
              {pageNumber} / {numPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                disabled={pageNumber === 1}
                className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:bg-gray-500"
              >
                Previous
              </button>
              <button
                onClick={() => setPageNumber((prev) => Math.min(prev + 1, numPages))}
                disabled={pageNumber === numPages}
                className="px-2 py-1 bg-gray-600 rounded hover:bg-gray-500 disabled:bg-gray-500"
              >
                Next
              </button>
            </div>
          </div>
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

export default FileUploader;