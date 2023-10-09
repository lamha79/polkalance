import { FaCode } from 'react-icons/fa';
import Head from 'next/head';
import { JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import Layout from '@/components/layout';
import toast from 'react-hot-toast'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { ContractIds } from '@/deployments/deployments'
import { Option } from '@polkadot/types';
import { border } from '@chakra-ui/react';


export default function SearchJobPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const { api, activeAccount, activeSigner } = useInkathon()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>();
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Freelankakot)
  const [searchJobsResult, setSearchJobsResult] = useState<any[]>([]);
  const handleSearch = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log('Search query:', searchQuery);
  };

  const searchJobs = async (searchQuery: string, categoryQuery: string) => {
    if (!contract || !api) return;
    setFetchIsLoading(true);
    try {
      const result = await contractQuery(api, '', contract, 'get_all_open_jobs', {}, [searchQuery, categoryQuery]);
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_all_open_jobs');
      if (isError) throw new Error(decodedOutput);
      setSearchJobsResult(output);
    } catch (e) {
      console.error(e);
      toast.error('Error while fetching greeting. Try again...');
      setSearchJobsResult([]);
    } finally {
      setFetchIsLoading(false);
    }
  };

  const json = JSON.stringify(searchJobsResult, null, 2);
  const list_jobs = JSON.parse(json);
  const data = list_jobs.Ok;
  console.log(data)


  return (
    <Layout>
      <Head>
        <title>Search Job Page</title>
      </Head>

      <section className="py-10">
        <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">


          <h1 className="text-3xl text-gray-800 font-bold mb-6">
            <FaCode className="inline-block align-middle text-blue-500 mr-2" /> Find Jobs
          </h1>
          <form onSubmit={handleSearch} className="flex items-center">
            <input
              type="text"
              className="border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500 flex-grow"
              placeholder="Enter job keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input
              type="text"
              className="border border-gray-300 rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500 flex-grow"
              placeholder="Enter job category"
              value={categoryQuery}
              onChange={(e) => setCategoryQuery(e.target.value)}
            />

            <button
              onClick={(e) => searchJobs(searchQuery, categoryQuery)}
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded ml-4 focus:outline-none focus:ring focus:border-blue-300"
            >
              Search
            </button>
          </form>

          {fetchIsLoading && <p>Loading...</p>}

          {data && data.length > 0 ? (
            <table style={{ textAlign: 'center', border: '1px solid black' }}>
              <thead>
                <tr>
                  <th>Job Name</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Pay</th>
                  <th>End Time</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {data.map((item: { id: string, name: string, description: string, category: string, pay: string, endTime: string, status: string, personCreate: string }) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>{item.pay}</td>
                    <td>{item.endTime}</td>
                    <td>{item.status}</td>
                    <button
                      className="bg-gray-300 hover:bg-gray-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                      style={{ margin: '10px', fontSize: '11px' }}
                    >
                      Obtain
                    </button>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No data available.</p>
          )}

        </div>
      </section>
    </Layout >
  );
}
