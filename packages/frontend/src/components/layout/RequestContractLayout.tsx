import React, { useState } from 'react';

export default function RequestContractLayout(children: {children: React.ReactNode}) {
  const [jobId, setJobId] = useState('');
  const [reason, setReason] = useState('');
  const [negotiatedPrice, setNegotiatedPrice] = useState('');

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    // TODO: Send the job ID, reason, and negotiated price to your backend server and handle the negotiation process.
    console.log('Negotiate contract:', { jobId, reason, negotiatedPrice });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">
      <h1 className="text-3xl text-gray-800 font-bold mb-6">Negotiate Contract</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-gray-700 font-semibold mb-2" htmlFor="jobId">
            Job ID
          </label>
          <input
            type="text"
            id="jobId"
            className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter the job ID"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-gray-700 font-semibold mb-2" htmlFor="reason">
            Reason
          </label>
          <textarea
            id="reason"
            className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter the reason for negotiation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-gray-700 font-semibold mb-2" htmlFor="negotiatedPrice">
            Pay
          </label>
          <input
            type="number"
            id="negotiatedPrice"
            className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter the negotiated price"
            value={negotiatedPrice}
            onChange={(e) => setNegotiatedPrice(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded focus:outline-none focus:ring focus:border-blue-300"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
}
