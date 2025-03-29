import { useCallback, useEffect, useRef, useState } from "react";
import { useResizeObserver } from "@wojtekmaj/react-hooks";
import { PDFDocument } from "pdf-lib";
import { pdfjs, Document, Page } from "react-pdf";
import { FaUpload } from "react-icons/fa";
import { upload } from "../api";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "../../node_modules/pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

const resizeObserverOptions = {};
const maxWidth = 800;

// eslint-disable-next-line react/prop-types
export default function Sample({onSend}) {
  const [file, setFile] = useState("./sample.pdf");
  const [numPages, setNumPages] = useState();
  const [containerRef, setContainerRef] = useState(null);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [containerWidth, setContainerWidth] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [uploadProgress, setUploadProgress] = useState(null);
  const viewerRef = useRef(null);
  const pageRefs = useRef([]);

  const onResize = useCallback((entries) => {
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  useEffect(() => {
    pageRefs.current = new Array(numPages).fill(null);
  }, [numPages]);

  function onFileChange(event) {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
    }
  }

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  function togglePageSelection(pageNumber) {
    setSelectedPages((prev) => {
      const newSelection = new Set(prev);
      newSelection.has(pageNumber)
        ? newSelection.delete(pageNumber)
        : newSelection.add(pageNumber);
      return newSelection;
    });
  }

  function handleScroll() {
    if (!viewerRef.current) return;

    const visiblePage = pageRefs.current.findIndex((pageRef) => {
      if (!pageRef) return false;
      const rect = pageRef.getBoundingClientRect();
      return rect.top >= 0 && rect.top < window.innerHeight / 2;
    });

    if (visiblePage !== -1 && visiblePage + 1 !== currentPage) {
      setCurrentPage(visiblePage + 1);
    }
  }

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener("scroll", handleScroll);
      return () => viewer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  async function handleDownload() {
    if (!file || selectedPages.size === 0) {
      alert("Please select pages before downloading.");
      return;
    }

    // Read the original PDF file
    const pdfBytes = await file.arrayBuffer();
    const existingPdf = await PDFDocument.load(pdfBytes);

    // Create a new PDF document
    const newPdf = await PDFDocument.create();

    const selectedArray = Array.from(selectedPages).sort((a, b) => a - b);

    // Copy selected pages to new PDF
    for (const pageNum of selectedArray) {
      const [copiedPage] = await newPdf.copyPages(existingPdf, [pageNum - 1]); // Page index is zero-based
      newPdf.addPage(copiedPage);
    }

    // Save new PDF and download
    const newPdfBytes = await newPdf.save();
    const blob = new Blob([newPdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "selected-pages.pdf";
    link.click();
  }

  const handleSend = async (uri) => {
    const messageData = {
      message: "Analyse this ",
      file_uris: [uri]
    };
    console.log(messageData)
    onSend(messageData)
  };

  async function uploadSelectedPages() {
    if (!file || selectedPages.size === 0) {
      alert("Please select pages before uploading.");
      return;
    }

    setUploadProgress(0); // Reset progress

    try {
      // Read the original PDF file
      const pdfBytes = await file.arrayBuffer();
      const existingPdf = await PDFDocument.load(pdfBytes);

      // Create a new PDF document
      const newPdf = await PDFDocument.create();
      const selectedArray = Array.from(selectedPages).sort((a, b) => a - b);

      // Copy selected pages to new PDF
      for (const pageNum of selectedArray) {
        const [copiedPage] = await newPdf.copyPages(existingPdf, [pageNum - 1]); // Zero-based index
        newPdf.addPage(copiedPage);
      }

      // Convert to Blob
      const newPdfBytes = await newPdf.save();
      const pdfBlob = new Blob([newPdfBytes], { type: "application/pdf" });

      // Prepare FormData
      const formData = new FormData();
      formData.append("file", pdfBlob, "selected_pages.pdf");

      // Upload with Progress Tracking
      const response = await upload(formData, (progress) => {
        setUploadProgress(progress); // Update progress state
      });
      console.log(response)
      await handleSend(response.file_uri)
      alert(`Upload successful: ${response.file_uri}`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploadProgress(null); // Hide progress after upload
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-lg font-bold">PDF Viewer</h1>
        <button
          className="bg-blue-600 px-4 py-2 rounded flex items-center"
          onClick={uploadSelectedPages}
        >
          <FaUpload className="mr-2" />
          Upload Selected Pages
        </button>
        <button
          className="bg-blue-600 px-4 py-2 rounded flex items-center"
          onClick={handleDownload}
        >
          <FaUpload className="mr-2" />
          Download
        </button>
      </nav>

      {/* Upload Progress Bar */}
      {uploadProgress !== null && (
        <div className="w-full bg-gray-300 rounded-full h-4 mt-4 mx-auto max-w-md">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-center text-sm mt-1">{uploadProgress}%</p>
        </div>
      )}

      {/* PDF Viewer */}
      <div ref={viewerRef} className="flex-1 p-4 overflow-auto h-full">
        <div className="mb-4">
          <label className="block font-semibold">Load from file:</label>
          <input
            type="file"
            onChange={onFileChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div
          className="border bg-white shadow-lg rounded overflow-hidden flex flex-col items-center"
          ref={setContainerRef}
        >
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
            {Array.from(new Array(numPages), (_, index) => (
              <div key={index} ref={(el) => (pageRefs.current[index] = el)} className="mb-4">
                <Page
                  pageNumber={index + 1}
                  className={`mx-auto box-border border-2 ${
                    selectedPages.has(index + 1) ? "border-blue-500" : ""
                  }`}
                  onClick={() => togglePageSelection(index + 1)}
                  width={containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}
