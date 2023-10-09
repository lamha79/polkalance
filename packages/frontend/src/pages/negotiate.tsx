import React, { useState } from 'react';
import RespondContractLayout from '@/components/layout/RespondContractLayout';
import RequestContractLayout from '@/components/layout/RequestContractLayout';

export default function NegotiateContractPage() {
  const [jobId, setJobId] = useState('');
  const [reason, setReason] = useState('');
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [partnerResponse, setPartnerResponse] = useState('');
  const [isReceiver, setIsReceiver] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // TODO: Send the job ID, reason, and negotiated price to your backend server and handle the negotiation process.
    console.log('Negotiate contract:', { jobId, reason, negotiatedPrice });
  };

  const handlePartnerResponse = (response: string) => {
    setPartnerResponse(response);
  };

  // TODO: Determine if the user is the receiver of the negotiation request.
  // Checking the user's role, or by checking the negotiation request itself.

  return (
    isReceiver ? (
      <RespondContractLayout>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            Submit Response
          </button>
        </form>
        <div>
          <h2>Negotiation Status</h2>
          <p>{partnerResponse}</p>
        </div>
      </RespondContractLayout>
    ) : (
      <RequestContractLayout>
        <form onSubmit={handleSubmit} className="space-y-4">
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
        <div>
          <h2>Negotiation Status</h2>
          <p>{partnerResponse}</p>
        </div>
      </RequestContractLayout>
    )
  );
}
