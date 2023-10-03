import React, { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable from "react-draggable";
import { Resizable } from "react-resizable";
import { PDFDocument } from "pdf-lib";
import Canvas from "./component/Canvas";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [signatureImage, setSignatureImage] = useState(null);
  const [updatedPdfFile, setUpdatedPdfFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfUpdated, setIsPdfUpdated] = useState(false);
  const [updatedPdfUrl, setUpdatedPdfUrl] = useState(null);  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isResizable, setIsResizable] = useState(false);
  const [signatureSize, setSignatureSize] = useState({
    width: 100,
    height: 50,
  });

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setPdfFile(selectedFile);
  };

  const customRenderOptions = {
    renderMode: "pdf",
    scale: 1.7,
  };

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };
  // console.log('Positioning',position.x,position.y)

  const handleResize = (e, { size }) => {
    setSignatureSize(size);
  };
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const sigCanvas = useRef();

  const handleClear = () => {
    sigCanvas.current.clear();
    closeModal();
  };
  const handleSave = async () => {
    if (sigCanvas.current) {
      const signatureData = sigCanvas.current.toDataURL();
      setSignatureImage(signatureData);
      setIsPdfUpdated(true);
      console.log("Signature Data:", signatureData);
  
      setUpdatedPdfFile(true);
      console.log("Updated PDF File:", true);
  
      try {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const [page] = pdfDoc.getPages();
  
        // Embed the PNG image
        const pngImage = await pdfDoc.embedPng(signatureData);
        if (pngImage) {
          const { width, height } = pngImage.scale(0.6);
          let x = position.x;
          let y = position.y;
  
          console.log("Positioning Changes:", x, y);
  
          page.drawImage(pngImage, {
            x,
            y,
            width,
            height,
          });
  
          const modifiedPdfBytes = await pdfDoc.save();
          console.log("Modified PDF Bytes:", modifiedPdfBytes);
  
          const modifiedBlob = new Blob([modifiedPdfBytes], {
            type: "application/pdf",
          });
  
          const url = URL.createObjectURL(modifiedBlob);
          console.log("Modified PDF URL:", url);
  
          setUpdatedPdfFile(url);
        } else {
          console.error("Failed to embed PNG image into the PDF.");
        }
      } catch (error) {
        console.error("Error processing the PDF:", error);
      }
    }
    closeModal();
  };

  const Save=async()=>{
  
    await handleSave();
  }

  const handleDownloadPdfWithSignature = async () => {
    const newPosition = { x: position.x, y: position.y };
  setPosition(newPosition);
  await handleSave();

  console.log("Inside Download pdf", newPosition.x, newPosition.y);
   
    if (updatedPdfFile) {
      try {
        const response = await fetch(updatedPdfFile);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        console.log("Inside Try block Download pdf", position.x, position.y);

        // Create an anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = "signed-pdf.pdf";
        a.style.display = "none";

        // Append the anchor element to the document and trigger the click event
        document.body.appendChild(a);
        a.click();

        // Clean up by removing the anchor element and revoking the URL
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading the PDF:", error);
      }
    }
  };

  console.log("X-axis", position.x, "Y-axis", position.y);

  return (
    <div className="flex flex-col justify-center items-center bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">PDF Viewer with Signature</h1>
      <div className="w-[1100px] h-[800px] p-4 bg-white rounded-lg shadow-md">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="mb-4"
        />

        {pdfFile && (
          <div className="overflow-y-scroll h-[600px]">
            <Document file={pdfFile}>
              <Page
                pageNumber={1}
                renderTextLayer={false}
                {...customRenderOptions}
              />
            </Document>
          </div>
        )}

        {pdfFile && (
          <button
            onClick={openModal}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow-md"
          >
            Create Signature
          </button>
        )}
        <Canvas
          closeModal={closeModal}
          handleClear={handleClear}
          sigCanvas={sigCanvas}
          handleSave={handleSave}
          isModalOpen={isModalOpen}
        />
        {updatedPdfFile && (
          <div>
            <button
              onClick={Save}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow-md mt-4 inline-block"
            >
              Save
            </button>
            <button
              onClick={handleDownloadPdfWithSignature}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded shadow-md mt-4 inline-block"
            >
              Download PDF with Signature
            </button>
          </div>
        )}

        {signatureImage && (
          <Draggable
            position={position}
            onDrag={handleDrag}
            onStart={() => setIsResizable(false)}
            onStop={() => setIsResizable(true)}
          >
            <Resizable
              width={signatureSize.width}
              height={signatureSize.height}
              onResize={handleResize}
              draggableOpts={{ enabled: isResizable }}
            >
              <div>
                <img
                  src={signatureImage}
                  alt="Signature"
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              </div>
            </Resizable>
          </Draggable>
        )}
      </div>
    </div>
  );
}

export default App;
