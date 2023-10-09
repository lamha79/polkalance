import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Layout from '@/components/layout'
import Head from 'next/head'

// type UpdateSignUp = { name: string, detail: String, stringRole: String };

export default function SignUpPage() {
    const { api, activeAccount, activeSigner } = useInkathon()
    const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Freelankakot)
    const [name, setName] = useState<string>('');
    const [detail, setDetail] = useState<string>('');
    const [stringRole, setStringrole] = useState<string>('');
    const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()

    
    const handleSubmit = (event) => {
        event.preventDefault();
        // TODO: Send the job details to your backend server and handle job creation and marketplace integration.
        console.log('Register details:', { name, detail, stringRole });
    };

    const updateRegister = async (name: string, detail: string, stringRole: string) => {
        
        if (!activeAccount || !contract || !activeSigner || !api) {
          toast.error('Wallet not connected. Try again…')
          return
        }
    
        // Send transaction
        setUpdateIsLoading(true)
        try {
          await contractTxWithToast(api, activeAccount.address, contract, 'register', {}, [
            name, detail, stringRole
          ])
        //   reset()
        } catch (e) {
          console.error(e)
        } finally {
        setUpdateIsLoading(false)
        //   fetchGreeting()
        }
      }

  return (
    <Layout>
      <Head>
        <title>Sign Up</title>
      </Head>

      <section className="text-left py-10">
        <h1 className="text-3xl text-center">Sign Up</h1>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-5">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Your name
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="detail">
              Your information
            </label>
            <textarea
              id="detail"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              You are 
            </label>
            <button
                className="bg-gray-300 hover:bg-gray-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                onClick={(e) => setStringrole("individual")}
                style={{ margin: '10px', fontSize: '11px' }}
                >
                Individual user
            </button>

            <button
                className="bg-gray-300 hover:bg-gray-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                onClick={(e) => setStringrole("teamlead")}
                style={{ margin: '10px', fontSize: '11px' }}
                >
                TeamLead
            </button>

            <button
                className="bg-gray-300 hover:bg-gray-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                onClick={(e) => setStringrole("accountant")}
                style={{ margin: '10px', fontSize: '11px' }}
                >
                Accountant
            </button>

            <button
                className="bg-gray-300 hover:bg-gray-700 text-black font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                onClick={(e) => setStringrole("accountant")}
                style={{ margin: '10px', fontSize: '11px' }}
                >
                Freelancer
            </button>
          
          </div>
            <div className='text-center'>
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={(e) => updateRegister(name, detail, stringRole)}
                    >
                    Sign Up
                </button>
            </div>        
        </form>
      </section>
    </Layout>
  );
}