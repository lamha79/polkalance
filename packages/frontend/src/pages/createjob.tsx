import Head from 'next/head';
import { useState } from 'react';
import Layout from '@/components/layout';
import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
  transferBalance
} from '@scio-labs/use-inkathon'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import toast from 'react-hot-toast'
import { ButtonGroup } from '@chakra-ui/react';
// import { useTransfer } from 'useink';

export default function CreateJobPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [budget, setBudget] = useState<number>(0);
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Freelankakot)
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const DECIMAL_NUMBER = 1000000000000;  

  const createJob = async (jobTitle: string, description: string, category: string, budget: number, duration: number) => {
    
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    // Send transaction
    setUpdateIsLoading(true)
    try {
      await contractTxWithToast(api, activeAccount.address, contract, 'create', {value: budget*DECIMAL_NUMBER}, [
        jobTitle, description, category, duration
      ])
      // await useTransfer()?.signAndSend(contract.address.toString(), budget)
    //   reset()
    } catch (e) {
      console.error(e)
    } finally {
    setUpdateIsLoading(false)
    //   fetchGreeting()
    }
  }

  const handleSubmit = (event: any) => {
    event.preventDefault();
    // TODO: Send the job details to your backend server and handle job creation and marketplace integration.
    console.log('Job details:', { jobTitle, description, category, duration});
  };

  return (
    <Layout>
      <Head>
        <title>Create Job Page</title>
      </Head>

      <section className="py-10">
        <div className="bg-white rounded-lg shadow p-6 mx-auto max-w-3xl">
          <h1 className="text-3xl text-gray-800 font-bold mb-6">Create a Job</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-700 font-semibold mb-2" htmlFor="jobTitle">
                Job Title
              </label>
              <input
                type="text"
                id="jobTitle"
                className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter the job title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter the job description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold mb-2" htmlFor="category">
                Category
              </label>
              <input
                type="string"
                id="category"
                className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter the category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold mb-2" htmlFor="budget">
                Budget
              </label>
              <input
                type="number"
                id="budget"
                className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter the budget (TZERO)"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-gray-700 font-semibold mb-2" htmlFor="duration">
                Duration
              </label>
              <input
                type="number"
                id="duration"
                className="border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:border-blue-500"
                placeholder="Enter duration"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded focus:outline-none focus:ring focus:border-blue-300"
              onClick={(e) => createJob(jobTitle, description, category, budget, duration)}
            >
              Post Job
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
}