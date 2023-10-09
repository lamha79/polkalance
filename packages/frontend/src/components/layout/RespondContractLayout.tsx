import React, { useState } from 'react';

export default function RespondContractLayout({children}: {children: React.ReactNode}) {
  const [negotiatedPrice, setNegotiatedPrice] = useState('');
  const [negotiationStatus, setNegotiationStatus] = useState('');

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    // TODO: Send the negotiated price to your backend server and handle the negotiation process.
    console.log('Negotiate contract:', { negotiatedPrice });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">
      <h1 className="text-3xl text-gray-800 font-bold mb-6">Respond to Contract</h1>
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
        <p>{negotiationStatus}</p>
      </div>
    </div>
  );
}
