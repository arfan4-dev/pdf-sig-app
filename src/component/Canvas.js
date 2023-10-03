import React, { useRef, useState } from 'react'
import Modal from 'react-modal';
import SignatureCanvas from 'react-signature-canvas';

const Canvas = ({handleClear,sigCanvas,handleSave,isModalOpen,closeModal}) => {



  return (
    <div>
       <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          contentLabel="Signature Modal"
        >
          <h2 className="text-xl font-semibold mb-2">Write Your Signature</h2>
          <div className="mb-4">
            <SignatureCanvas ref={sigCanvas} canvasProps={{ width: 300, height: 150 }} className="border border-gray-300" />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-red-200"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring focus:ring-green-200"
            >
              Save Signature
            </button>
          </div>
        </Modal>

    </div>
  )
}

export default Canvas