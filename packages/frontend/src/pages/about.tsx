import Head from 'next/head'
import Layout from "@/components/layout"
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function IndexPage() {
    const router = useRouter()
 
  useEffect(() => {
    // Always do navigations after the first render
    router.push('/about')
  }, [])
 
  useEffect(() => {
    // The counter changed!
  }, [router.query.counter])
    return (
        <Layout>
            <Head>
                <title>About Page</title>
            </Head>
            
            <section className='text-center py-10'>
                <h1 className='text-2xl'>About Page</h1>
            </section>
        </Layout>
    )
}